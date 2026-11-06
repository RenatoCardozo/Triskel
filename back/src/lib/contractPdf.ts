import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb, degrees } from 'pdf-lib'
import { ContractModel, Signature } from './contractModel'
import { fdhSP, fdtSP } from './dates'

const W = 595.28, H = 841.89, ML = 56, CW = W - ML * 2, TOP = H - 92, BOT = 64
const hex = (h: string) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255)
// pdf-lib (WinAnsi) não codifica alguns caracteres (ex.: espaços especiais); normaliza o que a fonte padrão não tem.
const safe = (s: string) => s.replace(/[^\x20-\x7E\xA0-\xFF“”‘’–—•…€]/g, '?')

export interface PdfInput { model: ContractModel; sigs: { k?: Signature | null; c?: Signature | null }; final: boolean; doneAt?: Date | null }

/** PDF do contrato (A4). Minuta: marca d'água. Final: duas assinaturas digitais + registro de autenticidade. */
export async function buildContractPdf(input: PdfInput): Promise<Uint8Array> {
  const { model: m, sigs, final } = input
  const doc = await PDFDocument.create()
  doc.setTitle(`Contrato ${m.num}${final ? ' (assinado)' : ' (minuta)'}`)
  doc.setAuthor('Triskel'); doc.setSubject('Contrato de prestação de serviços de criação de conteúdo')
  doc.setProducer('Triskel'); doc.setCreator('Triskel'); doc.setCreationDate(new Date(m.dt))
  const F1 = await doc.embedFont(StandardFonts.Helvetica)
  const F2 = await doc.embedFont(StandardFonts.HelveticaBold)
  const F3 = await doc.embedFont(StandardFonts.TimesRomanBoldItalic)
  const F4 = await doc.embedFont(StandardFonts.CourierBold)
  const pages: PDFPage[] = []
  let page!: PDFPage
  let y = 0
  const np = () => { page = doc.addPage([W, H]); pages.push(page); y = TOP }
  const tx = (s: string, x: number, yy: number, f: PDFFont, sz: number, col = '#1f2937', p = page) => p.drawText(safe(s), { x, y: yy, size: sz, font: f, color: hex(col) })
  const wrap = (s: string, f: PDFFont, sz: number, mw: number): string[] => {
    const out: string[] = []
    s.split('\n').forEach((par) => {
      let line = ''
      par.split(/\s+/).filter(Boolean).forEach((w) => {
        const t = line ? line + ' ' + w : w
        if (f.widthOfTextAtSize(safe(t), sz) <= mw || !line) line = t
        else { out.push(line); line = w }
      })
      out.push(line)
    })
    return out
  }
  const ens = (h: number) => { if (y - h < BOT) np() }
  const para = (s: string, o: { f?: PDFFont; sz?: number; ld?: number; ind?: number; col?: string; gap?: number; center?: boolean } = {}) => {
    const f = o.f || F1, sz = o.sz || 10, ld = o.ld || sz * 1.45, ind = o.ind || 0
    wrap(s, f, sz, CW - ind).forEach((ln) => {
      ens(ld); y -= ld
      const w = f.widthOfTextAtSize(safe(ln), sz)
      tx(ln, o.center ? ML + (CW - w) / 2 : ML + ind, y, f, sz, o.col)
    })
    y -= o.gap == null ? 4 : o.gap
  }
  const head = (s: string) => { ens(34); y -= 8; para(s, { f: F2, sz: 11, col: '#0f6f62', gap: 3 }) }
  const line = (x1: number, y1: number, x2: number, y2: number, col = '#d5dbe3', w = 0.6) =>
    page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: w, color: hex(col) })

  np()
  y -= 4
  para('INSTRUMENTO PARTICULAR DE CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CRIAÇÃO DE CONTEÚDO', { f: F2, sz: 13.5, center: true, col: '#1f3a8a', ld: 18, gap: 6 })
  para(`Contrato nº ${m.num} · emitido em ${fdtSP(new Date(m.dt))} · intermediado pela plataforma Triskel`, { sz: 9, center: true, col: '#6b7280', gap: 8 })
  for (const b of m.B) {
    if (b.t === 'h') head(b.x)
    else if (b.t === 'p') para(b.x, { sz: 9.8, gap: 3.5 })
    else {
      head(b.h.toUpperCase())
      for (const [l, v] of b.rows) {
        const lw = 118, L = wrap(v, F1, 9.8, CW - lw), hh = L.length * 13.5 + 3
        ens(hh)
        const big = /^(CONTRATANTE|CONTRATADO\(A\)|INTERVENIENTE)$/.test(l)
        if (big) { y -= 4; line(ML, y + 2, ML + CW, y + 2, '#e5e9ef') }
        L.forEach((ln, i) => { y -= 13.5; if (!i) tx(l, ML, y, F2, big ? 9.6 : 9, big ? '#0f6f62' : '#6b7280'); tx(ln, ML + lw, y, big && !i ? F2 : F1, 9.8) })
        y -= 3
      }
    }
  }
  ens(235); y -= 10; head('ASSINATURAS ELETRÔNICAS')
  para(final ? 'As duas partes assinaram eletronicamente este contrato. Cada assinatura foi registrada pela Triskel depois de acesso autenticado e aceite expresso dos termos.'
    : 'Esta é uma minuta. O contrato final, com as assinaturas digitais das duas partes, é gerado automaticamente quando as duas assinarem.', { sz: 9, col: '#4b5563', gap: 8 })
  const bw = (CW - 16) / 2, bh = 158
  ens(bh + 10)
  const top = y
  const roles: Array<['k' | 'c', string]> = [['k', 'CONTRATANTE'], ['c', 'CONTRATADO(A)']]
  roles.forEach(([r, lab], i) => {
    const x0 = ML + i * (bw + 16), s = sigs[r]
    const col = s ? '#0f8f7d' : '#9ca3af'
    page.drawRectangle({ x: x0, y: top - bh, width: bw, height: bh, color: s ? rgb(0.925, 0.984, 0.969) : rgb(0.973, 0.976, 0.98), borderColor: hex(col), borderWidth: s ? 1.1 : 0.8, borderDashArray: s ? undefined : [3, 3] })
    tx(lab, x0 + 12, top - 18, F2, 8.5, '#0f6f62')
    if (s) {
      const cx = x0 + bw - 22, cy = top - 17
      page.drawCircle({ x: cx, y: cy, size: 7, color: hex('#0f8f7d') })
      page.drawLine({ start: { x: cx - 3.2, y: cy - 0.2 }, end: { x: cx - 1, y: cy - 2.6 }, thickness: 1.6, color: rgb(1, 1, 1) })
      page.drawLine({ start: { x: cx - 1, y: cy - 2.6 }, end: { x: cx + 3.4, y: cy + 2.4 }, thickness: 1.6, color: rgb(1, 1, 1) })
      let fs = 21
      while (F3.widthOfTextAtSize(safe(s.nome), fs) > bw - 24 && fs > 11) fs--
      tx(s.nome, x0 + 12, top - 52, F3, fs, '#1e3a8a')
      line(x0 + 12, top - 60, x0 + bw - 12, top - 60, '#1e3a8a', 0.7)
      tx('Assinado digitalmente por', x0 + 12, top - 74, F1, 7.5, '#6b7280')
      const who = wrap(s.nome + (s.org ? ' · ' + s.org : ''), F2, 8.6, bw - 24).slice(0, 2)
      who.forEach((ln, j) => tx(ln, x0 + 12, top - 85 - j * 10.5, F2, 8.6))
      let yy = top - 85 - who.length * 10.5 - 1
      tx((r === 'k' ? 'CNPJ ' : 'CPF ') + (s.doc || '—'), x0 + 12, yy, F1, 8.4, '#374151'); yy -= 11
      tx(fdhSP(new Date(s.dt)) + ' (Brasília)', x0 + 12, yy, F1, 8.4, '#374151'); yy -= 14
      tx('Código de autenticação', x0 + 12, yy, F1, 7.2, '#6b7280'); yy -= 11
      tx(s.cod, x0 + 12, yy, F4, 9.6, '#0f6f62')
    } else {
      tx('Aguardando assinatura', x0 + 12, top - 74, F1, 10, '#6b7280')
      wrap('A assinatura de ' + (r === 'k' ? m.k.nome : m.c.nome) + ' aparece aqui depois do aceite na plataforma.', F1, 8.4, bw - 24)
        .forEach((ln, j) => tx(ln, x0 + 12, top - 92 - j * 11, F1, 8.4, '#9ca3af'))
    }
  })
  y = top - bh - 14
  if (final) {
    ens(104)
    const bh2 = 92, t2 = y
    page.drawRectangle({ x: ML, y: t2 - bh2, width: CW, height: bh2, color: rgb(0.965, 0.969, 0.98), borderColor: hex('#d5dbe3'), borderWidth: 0.6 })
    tx('REGISTRO DE AUTENTICIDADE', ML + 12, t2 - 17, F2, 8.5, '#0f6f62')
    tx('Hash SHA-256 do conteúdo do contrato:', ML + 12, t2 - 32, F1, 8.2, '#4b5563')
    tx(m.hash.slice(0, 32), ML + 12, t2 - 45, F4, 9.2); tx(m.hash.slice(32), ML + 12, t2 - 57, F4, 9.2)
    wrap('Para conferir, calcule o SHA-256 do texto do contrato e compare com o hash acima. Qualquer alteração no conteúdo muda o hash. Assinaturas concluídas em ' + fdhSP(input.doneAt || new Date()) + ' (horário de Brasília).', F1, 7.8, CW - 24)
      .forEach((ln, j) => tx(ln, ML + 12, t2 - 71 - j * 9.5, F1, 7.8, '#6b7280'))
  }
  const n = pages.length
  pages.forEach((pg, i) => {
    // fundo do cabeçalho
    pg.drawRectangle({ x: 0, y: H - 48, width: W, height: 48, color: hex('#2dd4bf') })
    pg.drawRectangle({ x: 0, y: H - 48, width: 130, height: 48, color: hex('#4b5dca') })
    tx('Triskel', ML, H - 30, F2, 19, '#ffffff', pg)
    const rt = 'Contrato ' + m.num
    tx(rt, W - ML - F2.widthOfTextAtSize(rt, 10), H - 29, F2, 10, '#0b3d38', pg)
    pg.drawLine({ start: { x: ML, y: 46 }, end: { x: W - ML, y: 46 }, thickness: 0.6, color: hex('#d5dbe3') })
    tx(`${m.num} · gerado pela plataforma Triskel · SHA-256 ${m.hash.slice(0, 16)}…`, ML, 32, F1, 7.5, '#6b7280', pg)
    const pn = `Página ${i + 1} de ${n}`
    tx(pn, W - ML - F1.widthOfTextAtSize(pn, 7.5), 32, F1, 7.5, '#6b7280', pg)
    if (!final) {
      pg.drawText('MINUTA', { x: 140, y: 250, size: 66, font: F2, color: rgb(0.93, 0.94, 0.95), rotate: degrees(45) })
      pg.drawText('AGUARDANDO ASSINATURAS', { x: 150, y: 215, size: 22, font: F2, color: rgb(0.93, 0.94, 0.95), rotate: degrees(45) })
    }
  })
  return doc.save()
}
