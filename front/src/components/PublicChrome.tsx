import Link from 'next/link'
import { cookies } from 'next/headers'
import { Logo } from './Logo'
import { PublicNav } from './PublicNav'

/** Cabeçalho do Figma (412x120): logo à esquerda e, à direita, os atalhos de conta (variam por tela). */
export async function PublicHeader() {
  const logged = !!(await cookies()).get('tk_session')
  return (
    <header className="bg-white">
      <div className="mx-auto flex h-[120px] max-w-6xl items-center justify-between pl-[11px] pr-[10px]">
        <Logo h={64} />
        <PublicNav logged={logged} />
      </div>
    </header>
  )
}

export function PublicFooter() {
  const l = 'text-[14px] font-light text-[#1b76a3] no-underline hover:underline'
  return (
    <footer className="mt-0 border-t border-line bg-white pb-6 pt-8">
      <div className="mx-auto max-w-[412px] px-4">
        <div className="flex justify-center pt-2"><Logo h={88} /></div>
        <div className="mt-10 grid grid-cols-2 gap-4 text-center">
          <div><h2 className="mb-2 text-[18px] font-light text-ink">Recursos</h2><ul className="space-y-2"><li><Link className={l} href="/empresa">Informações da empresa</Link></li><li><Link className={l} href="/fale-conosco">Fale Conosco</Link></li></ul></div>
          <div><h2 className="mb-2 text-[18px] font-light text-ink">Legal</h2><ul className="space-y-2"><li><Link className={l} href="/privacidade">Politica de privacidade</Link></li><li><Link className={l} href="/termos">Termos &amp; condições</Link></li></ul></div>
        </div>
        <p className="mt-6 text-center text-[14px] font-medium text-teal">© 2026 Triskel. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
