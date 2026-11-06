import { describe, expect, it } from 'vitest'
import { breakdown, feeOf } from '../../src/lib/money'
import { leak } from '../../src/lib/leak'
import { cnpjOk, cpfOk, passwordOk, telOk } from '../../src/lib/validators'
import { exCheck, exMk, exPair, exTxt, segRel } from '../../src/lib/exclusivity'
import { sign, verify } from '../../src/lib/webhook'
import { sniff } from '../../src/lib/filetype'
import { compat, nearReg } from '../../src/lib/compat'
import { buildContractModel, makeSignature } from '../../src/lib/contractModel'
import { buildContractPdf } from '../../src/lib/contractPdf'
import { turnOf } from '../../src/services/proposals'

describe('taxa e dinheiro em centavos', () => {
  it('10% por cima, pago pelo contratante; criador recebe o valor cheio', () => {
    expect(breakdown(42000)).toEqual({ valueCents: 42000, feeCents: 4200, totalCents: 46200 })
    expect(breakdown(30000)).toEqual({ valueCents: 30000, feeCents: 3000, totalCents: 33000 })
  })
  it('arredonda a taxa em centavos inteiros', () => {
    expect(feeOf(1005)).toBe(101) // 100,5 -> 101
    expect(feeOf(1004)).toBe(100)
    expect(Number.isInteger(feeOf(33333))).toBe(true)
  })
  it('recusa valor não inteiro ou negativo', () => {
    expect(() => feeOf(10.5)).toThrow()
    expect(() => feeOf(-1)).toThrow()
  })
})

describe('bloqueio de contato fora da plataforma', () => {
  it.each([
    ['me chama no zap 53 99999 1234', 'telefones'], ['fala comigo no whatsapp', 'aplicativos'], ['joao@gmail.com', 'e-mails'], ['joao arroba gmail ponto com', 'e-mails'],
    ['olha www.minhaloja.com.br', 'links'], ['https://instagram.com/x', 'links'], ['me add no meu insta', 'perfis'], ['é @marjorie.cria', 'perfis'], ['vamos combinar por fora', 'combinados'],
    ['(53) 9 9912-3456', 'telefones'],
  ])('bloqueia %s', (t, kind) => expect(leak(t)).toContain(kind))
  it('não bloqueia valores, datas e texto normal', () => {
    expect(leak('Posso incluir 2 stories extras? Com isso o valor fica em R$ 420,00.')).toBe('')
    expect(leak('Entrego até 25/11/2026, tudo bem?')).toBe('')
    expect(leak('Oi! Adorei o briefing, vou gravar amanhã.')).toBe('')
  })
})

describe('validadores', () => {
  it('CPF', () => { expect(cpfOk('529.982.247-25')).toBe(true); expect(cpfOk('111.111.111-11')).toBe(false); expect(cpfOk('529.982.247-24')).toBe(false) })
  it('CNPJ', () => { expect(cnpjOk('11.222.333/0001-81')).toBe(true); expect(cnpjOk('11.222.333/0001-82')).toBe(false); expect(cnpjOk('00000000000000')).toBe(false) })
  it('telefone com DDD', () => { expect(telOk('(53) 99912-3456')).toBe(true); expect(telOk('(53) 3222-4410')).toBe(true); expect(telOk('99912-3456')).toBe(false); expect(telOk('(00) 99912-3456')).toBe(false) })
  it('senha', () => { expect(passwordOk('curta')).toBeTruthy(); expect(passwordOk('Triskel@2026')).toBeNull() })
})

describe('exclusividade', () => {
  const d = (s: string) => new Date(s + 'T00:00:00Z')
  const lume = exMk('Café Lume', 'Alimentação', 60, d('2026-11-20'))
  it('mesmo ramo, outra empresa, dentro da janela [entrega, entrega+dias]: conflito', () => {
    const nova = exMk('Pizzaria Forno a Lenha', 'Alimentação', 0, d('2026-12-10'))
    expect(exPair(lume, nova)).toBe('a')
  })
  it('limites inclusivos', () => {
    expect(exPair(lume, exMk('Outra', 'Alimentação', 0, d('2026-11-20')))).toBe('a')
    expect(exPair(lume, exMk('Outra', 'Alimentação', 0, d('2027-01-19')))).toBe('a') // 20/11 + 60 dias
    expect(exPair(lume, exMk('Outra', 'Alimentação', 0, d('2027-01-20')))).toBeNull()
  })
  it('mesma empresa (mesmo normalizando acento e caixa) não conflita', () => {
    expect(exPair(lume, exMk('CAFE LUME', 'Alimentação', 0, d('2026-12-01')))).toBeNull()
  })
  it('ramos relacionados (Saúde/Beleza/Esportes) conflitam; ramos distintos não', () => {
    expect(segRel('Saúde', 'Beleza')).toBe(true)
    expect(segRel('Alimentação', 'Beleza')).toBe(false)
    expect(segRel('Outros', 'Outros')).toBe(false)
    const aurora = exMk('Estética Aurora', 'Beleza', 30, d('2026-11-25'))
    expect(exPair(aurora, exMk('Academia Vital', 'Esportes', 0, d('2026-12-10')))).toBe('a')
    expect(exPair(aurora, exMk('Pizzaria', 'Alimentação', 0, d('2026-12-10')))).toBeNull()
  })
  it('bidirecional: a nova campanha também pode exigir exclusividade sobre contrato existente', () => {
    const existente = exMk('Pizzaria', 'Alimentação', 0, d('2026-12-05'))
    const nova = exMk('Café Colonial da Serra', 'Alimentação', 60, d('2026-12-01'))
    expect(exPair(existente, nova)).toBe('b')
  })
  it('o texto para o contratante nunca revela a marca concorrente', () => {
    const cf = exCheck([lume], exMk('Pizzaria Forno a Lenha', 'Alimentação', 0, d('2026-12-10')))!
    expect(exTxt(cf, 'k')).not.toMatch(/Caf[eé] Lume/i)
    expect(exTxt(cf, 'c')).toMatch(/Caf[eé] Lume/i) // o criador pode saber com quem assinou
  })
})

describe('turno da negociação', () => {
  it('alterna entre contratante e criador conforme a última rodada', () => {
    expect(turnOf({ status: 'OPEN', rounds: [{ by: 'K' }] })).toBe('C')
    expect(turnOf({ status: 'OPEN', rounds: [{ by: 'K' }, { by: 'C' }] })).toBe('K')
    expect(turnOf({ status: 'ACCEPTED', rounds: [{ by: 'K' }] })).toBeNull()
    expect(turnOf({ status: 'DECLINED', rounds: [{ by: 'K' }] })).toBeNull()
  })
})

describe('compatibilidade', () => {
  it('nichos em comum + região + orçamento', () => {
    const cr = { niches: ['Gastronomia', 'Lifestyle'], near: true, rating: 4.9, sizeBand: 'Micro', vminCents: 20000 }
    const r = compat(cr, { nichosCr: ['Gastronomia', 'Lifestyle'], regCr: 'Pelotas e região', nota: 'Sem mínimo', porteCr: ['Micro (10 a 100 mil)'], valueCents: 35000 })
    expect(r.pct).toBe(97)
    expect(r.why).toContain('Nichos compatíveis')
  })
  it('região', () => { expect(nearReg(false, 'Pelotas e região')).toBe(false); expect(nearReg(false, 'Rio Grande do Sul')).toBe(true) })
})

describe('webhook HMAC + timestamp', () => {
  const secret = 'segredo-de-teste-0123456789'
  const body = '{"id":"evt_1","type":"charge.paid","data":{}}'
  const now = 1_800_000_000
  it('aceita assinatura válida dentro da janela', () => {
    expect(verify({ secret, timestamp: String(now), signature: sign(secret, now, body), rawBody: body, nowS: now + 10 }).ok).toBe(true)
  })
  it('rejeita corpo adulterado, segredo errado, timestamp velho/futuro e cabeçalhos ausentes', () => {
    const sig = sign(secret, now, body)
    expect(verify({ secret, timestamp: String(now), signature: sig, rawBody: body + ' ', nowS: now }).ok).toBe(false)
    expect(verify({ secret: 'outro-segredo-0123456789', timestamp: String(now), signature: sig, rawBody: body, nowS: now }).ok).toBe(false)
    expect(verify({ secret, timestamp: String(now), signature: sig, rawBody: body, nowS: now + 301 }).ok).toBe(false)
    expect(verify({ secret, timestamp: String(now), signature: sig, rawBody: body, nowS: now - 301 }).ok).toBe(false)
    expect(verify({ secret, rawBody: body }).ok).toBe(false)
  })
})

describe('tipo real do arquivo (magic bytes)', () => {
  const pad = (b: number[]) => Buffer.from([...b, ...new Array(16).fill(0)])
  it('reconhece JPEG, PNG, MP4 e WebM', () => {
    expect(sniff(pad([0xff, 0xd8, 0xff, 0xe0]))?.mime).toBe('image/jpeg')
    expect(sniff(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))?.mime).toBe('image/png')
    expect(sniff(Buffer.concat([Buffer.from([0, 0, 0, 0x18]), Buffer.from('ftypmp42'), Buffer.alloc(8)]))?.mime).toBe('video/mp4')
    expect(sniff(pad([0x1a, 0x45, 0xdf, 0xa3]))?.mime).toBe('video/webm')
  })
  it('recusa executável, HTML e arquivo renomeado', () => {
    expect(sniff(Buffer.from('MZ\x90\x00'.padEnd(32, '\0'), 'latin1'))).toBeNull()
    expect(sniff(Buffer.from('<html><script>alert(1)</script></html>'))).toBeNull()
    expect(sniff(Buffer.from('%PDF-1.7 ........'))).toBeNull()
  })
})

describe('contrato: modelo, hash e PDF', () => {
  const input = {
    num: 'TRK-2026-0001', dt: new Date('2026-11-02T17:32:00Z'),
    k: { nome: 'Doce Vale Confeitaria', doc: '11.222.333/0001-81', resp: 'Helena Vale', cidade: 'Pelotas', uf: 'RS', ag: false, cli: '', seg: 'Alimentação' },
    c: { nome: 'Marjorie Moreira', doc: '529.982.247-25', nasc: '14/03/1996', cidade: 'Pelotas', uf: 'RS' },
    videos: 1, format: 'Reels 9:16', campaignName: 'Linha de doces coloniais', objective: 'Divulgar lançamento', delivery: new Date('2026-11-30T00:00:00Z'), imageUse: '90 dias', exclusiveDays: 0,
    valueCents: 42000, feeCents: 4200, totalCents: 46200,
  }
  it('hash SHA-256 é determinístico e muda quando uma condição muda', () => {
    const a = buildContractModel(input), b = buildContractModel(input), c = buildContractModel({ ...input, valueCents: 43000, feeCents: 4300, totalCents: 47300 })
    expect(a.hash).toMatch(/^[0-9a-f]{64}$/)
    expect(a.hash).toBe(b.hash)
    expect(c.hash).not.toBe(a.hash)
  })
  it('assinatura carrega código derivado do hash e das partes', () => {
    const m = buildContractModel(input)
    const k = makeSignature(m, 'k', new Date('2026-11-02T17:32:00Z')), c = makeSignature(m, 'c', new Date('2026-11-02T19:05:00Z'))
    expect(k.cod).not.toBe(c.cod)
    expect(makeSignature(m, 'k', new Date('2026-11-02T17:32:00Z')).cod).toBe(k.cod)
  })
  it('gera um PDF válido', async () => {
    const m = buildContractModel(input)
    const pdf = await buildContractPdf({ model: m, sigs: { k: makeSignature(m, 'k', new Date()), c: makeSignature(m, 'c', new Date()) }, final: true, doneAt: new Date() })
    expect(Buffer.from(pdf.slice(0, 5)).toString()).toBe('%PDF-')
    expect(pdf.length).toBeGreaterThan(2000)
  })
})
