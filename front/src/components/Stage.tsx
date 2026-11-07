import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'

/**
 * "Palco" do Figma: um quadro de 412 px de largura cujas medidas (x, y, largura, altura, fonte) são
 * proporcionais à largura real (container query units). No celular fica idêntico ao protótipo; em telas
 * maiores o quadro cresce até um limite e é centralizado.
 */
export const cq = (n: number) => `${((n / 412) * 100).toFixed(3)}cqw`

export function Stage({ h, className = '', style, children }: { h: number; className?: string; style?: CSSProperties; children: ReactNode }) {
  return <div className={`tk-stage ${className}`} style={{ height: cq(h), ...style }}>{children}</div>
}

interface AbsProps { x: number; y: number; w: number; h?: number; className?: string; style?: CSSProperties; children?: ReactNode }
/** Caixa posicionada (medidas do Figma). */
export function Abs({ x, y, w, h, className = '', style, children }: AbsProps) {
  return <div className={className} style={{ position: 'absolute', left: cq(x), top: cq(y), width: cq(w), height: h == null ? undefined : cq(h), ...style }}>{children}</div>
}

/** Texto em caixa do Figma: fonte em cq, centralizado verticalmente como no protótipo. */
export function Txt({ x, y, w, h, size, weight, color, align = 'l', as: Tag = 'p', className = '', style, children }: AbsProps & { size: number; weight: number; color: string; align?: 'l' | 'c'; as?: 'p' | 'h2' | 'h3' }) {
  return (
    <div className={className} style={{ position: 'absolute', left: cq(x), top: cq(y), width: cq(w), height: cq(h ?? 20), display: 'flex', alignItems: 'center', justifyContent: align === 'c' ? 'center' : 'flex-start', textAlign: align === 'c' ? 'center' : 'left', fontSize: cq(size), fontWeight: weight, color, ...style }}>
      <Tag style={{ width: '100%', margin: 0, font: 'inherit', letterSpacing: 0 }}>{children}</Tag>
    </div>
  )
}

/** Botão/cartão clicável posicionado (link do Next, ou âncora para #ids). */
export function AbsLink({ x, y, w, h, href, className = '', style, label, children }: AbsProps & { href: string; label?: string }) {
  const st: CSSProperties = { position: 'absolute', left: cq(x), top: cq(y), width: cq(w), height: h == null ? undefined : cq(h), display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', ...style }
  return href.startsWith('#') ? <a href={href} aria-label={label} className={className} style={st}>{children}</a> : <Link href={href} aria-label={label} className={className} style={st}>{children}</Link>
}
