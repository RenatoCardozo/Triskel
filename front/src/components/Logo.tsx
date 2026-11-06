import Link from 'next/link'

export function Petals({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ display: 'block' }} aria-hidden="true">
      <defs><path id={`pt${size}`} d="M20 20C20 9 10 4 3 9c3 9 10 12 17 11z" /></defs>
      <use href={`#pt${size}`} fill="#3cd4c7" />
      <use href={`#pt${size}`} fill="#5fe0a1" transform="rotate(120 20 20)" />
      <use href={`#pt${size}`} fill="#4d9fe0" transform="rotate(240 20 20)" />
    </svg>
  )
}

/** Logo do protótipo: três pétalas + "Triskel" + "PLATAFORMA DE CRIADORES". */
export function Logo({ href = '/', h = 52 }: { href?: string; h?: number }) {
  return (
    <Link href={href} aria-label="Triskel, ir para o início" className="inline-flex items-center gap-1.5 no-underline">
      <Petals size={Math.round(h * 0.8)} />
      <span style={{ lineHeight: 1 }}>
        <b style={{ fontSize: Math.round(h * 0.52), color: '#2a9fb5', fontWeight: 700, letterSpacing: '-.5px', display: 'block' }}>Triskel</b>
        <small style={{ whiteSpace: 'nowrap', fontSize: Math.max(6.5, h * 0.125), fontWeight: 700, letterSpacing: '1.4px', color: '#4d8fd0', display: 'block', marginTop: 2 }}>PLATAFORMA DE CRIADORES</small>
      </span>
    </Link>
  )
}
