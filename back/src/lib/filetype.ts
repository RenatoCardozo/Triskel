/** Detecta o tipo real pelos bytes iniciais (não confia em extensão nem Content-Type). */
export type Sniffed = { mime: string; ext: string; kind: 'image' | 'video' }
export function sniff(b: Buffer): Sniffed | null {
  if (b.length < 12) return null
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { mime: 'image/jpeg', ext: '.jpg', kind: 'image' }
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { mime: 'image/png', ext: '.png', kind: 'image' }
  if (b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP') return { mime: 'image/webp', ext: '.webp', kind: 'image' }
  if (b.subarray(4, 8).toString('latin1') === 'ftyp') {
    const brand = b.subarray(8, 12).toString('latin1')
    if (brand.startsWith('qt')) return { mime: 'video/quicktime', ext: '.mov', kind: 'video' }
    if (/^(isom|iso2|mp41|mp42|avc1|M4V |dash|MSNV|3gp|f4v)/.test(brand)) return { mime: 'video/mp4', ext: '.mp4', kind: 'video' }
    return null
  }
  if (b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return { mime: 'video/webm', ext: '.webm', kind: 'video' }
  return null
}
