/** Regras do gateway simulado: bandeiras, Luhn, cartões de teste, recusas e BR Code do Pix. */
export const luhn = (n: string) => {
  let s = 0
  ;[...n].reverse().forEach((c, i) => { let d = +c; if (i % 2) { d *= 2; if (d > 9) d -= 9 } s += d })
  return n.length >= 13 && n.length <= 19 && s % 10 === 0
}
export const brandOf = (n: string) =>
  /^(636368|438935|504175|451416|509|5067|4576|4011)/.test(n) ? 'Elo'
  : /^606282/.test(n) ? 'Hipercard'
  : /^3[47]/.test(n) ? 'Amex'
  : /^4/.test(n) ? 'Visa'
  : /^(5[1-5]|2(2[2-9]|[3-6]|7[01]|720))/.test(n) ? 'Mastercard'
  : n ? 'Cartão' : ''

export type Rule = 'ok' | '3ds' | 'dec' | 'fund' | 'exp' | 'cvc'
const RULE: Record<string, Rule> = { '0002': 'dec', '9995': 'fund', '0069': 'exp', '0127': 'cvc', '3220': '3ds' }
/** O último bloco do número de teste define o resultado (como no protótipo). */
export const ruleOf = (n: string): Rule => RULE[n.slice(-4)] ?? 'ok'
export const DECL: Record<'dec' | 'fund' | 'exp' | 'cvc' | 'tds', [string, string]> = {
  dec: ['05', 'Transação não autorizada pelo banco emissor. Tente outro cartão ou fale com o seu banco.'],
  fund: ['51', 'Saldo ou limite insuficiente no cartão. Tente outro cartão ou use Pix.'],
  exp: ['54', 'Cartão vencido. Use outro cartão.'],
  cvc: ['N7', 'Código de segurança (CVV) incorreto. Confira o verso do cartão.'],
  tds: ['57', 'Autenticação não concluída. O banco bloqueou a tentativa.'],
}
export const TDS_CODE = '123456'
export const TDS_MAX_TRIES = 3

export function validExp(v: string, now = new Date()) {
  const m = /^(\d{2})\/(\d{2})$/.exec(v)
  if (!m) return false
  const mm = +m[1], yy = 2000 + +m[2], cy = now.getFullYear(), cm = now.getMonth() + 1
  return mm >= 1 && mm <= 12 && (yy > cy || (yy === cy && mm >= cm)) && yy <= cy + 20
}
export function cpfOk(v: string) {
  const d = v.replace(/\D/g, '')
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false
  const dv = (n: number) => { let s = 0; for (let i = 0; i < n; i++) s += +d[i] * (n + 1 - i); const r = (s * 10) % 11; return r === 10 ? 0 : r }
  return dv(9) === +d[9] && dv(10) === +d[10]
}
export function cnpjOk(v: string) {
  const d = v.replace(/\D/g, '')
  if (d.length !== 14 || /^(\d)\1+$/.test(d)) return false
  const dv = (n: number) => { const w = n === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]; let s = 0; for (let i = 0; i < n; i++) s += +d[i] * w[i]; const r = s % 11; return r < 2 ? 0 : 11 - r }
  return dv(12) === +d[12] && dv(13) === +d[13]
}

// ---- Pix: BR Code (copia e cola) com CRC16/CCITT ----
export const crc16 = (s: string) => {
  let c = 0xffff
  for (let i = 0; i < s.length; i++) { c ^= s.charCodeAt(i) << 8; for (let j = 0; j < 8; j++) c = c & 0x8000 ? ((c << 1) ^ 0x1021) & 0xffff : (c << 1) & 0xffff }
  return c.toString(16).toUpperCase().padStart(4, '0')
}
const tlv = (id: string, v: string) => id + String(v.length).padStart(2, '0') + v
export function brCode(amountCents: number, txid: string, pixKey: string) {
  const p = tlv('00', '01') + tlv('26', tlv('00', 'BR.GOV.BCB.PIX') + tlv('01', pixKey)) + tlv('52', '0000') + tlv('53', '986') + tlv('54', (amountCents / 100).toFixed(2)) + tlv('58', 'BR') + tlv('59', 'TRISKEL SIMULADO') + tlv('60', 'PELOTAS') + tlv('62', tlv('05', txid)) + '6304'
  return p + crc16(p)
}
