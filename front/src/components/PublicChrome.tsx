import Link from 'next/link'
import { cookies } from 'next/headers'
import { Logo } from './Logo'

export async function PublicHeader() {
  const logged = !!(await cookies()).get('tk_session')
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
        <Logo h={46} />
        <nav aria-label="Conta" className="flex items-center gap-2">
          {logged ? <Link href="/painel" className="btn btn-primary btn-sm">Ir para o painel</Link> : (
            <>
              <Link href="/login" className="btn btn-ghost btn-sm">Entrar</Link>
              <Link href="/cadastro" className="btn btn-primary btn-sm">Cadastrar-se</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export function PublicFooter() {
  const l = 'text-[15px] font-medium text-[#1b76a3] no-underline hover:underline'
  return (
    <footer className="mt-10 border-t border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex justify-center"><Logo h={60} /></div>
        <div className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-6 text-center">
          <div><h2 className="mb-2 text-lg font-light text-ink">Recursos</h2><ul className="space-y-1.5"><li><Link className={l} href="/empresa">Informações da empresa</Link></li><li><Link className={l} href="/fale-conosco">Fale Conosco</Link></li></ul></div>
          <div><h2 className="mb-2 text-lg font-light text-ink">Legal</h2><ul className="space-y-1.5"><li><Link className={l} href="/privacidade">Politica de privacidade</Link></li><li><Link className={l} href="/termos">Termos &amp; condições</Link></li></ul></div>
        </div>
        <p className="mt-6 text-center text-sm font-medium text-teal">© 2026 Triskel. Todos os direitos reservados.</p>
      </div>
    </footer>
  )
}
