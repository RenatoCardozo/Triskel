'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const pill = 'inline-flex h-[29px] items-center justify-center rounded-[30px] bg-gradient-to-r from-teal-2 to-mint font-bold text-white no-underline'

/** Atalhos do cabeçalho público, como no Figma: home (Entrar + Cadastrar-se), login (Criar conta grátis), cadastro (Login). */
export function PublicNav({ logged }: { logged: boolean }) {
  const path = usePathname()
  if (logged) return <Link href="/painel" className={`${pill} w-[125px] text-[12px]`}>Ir para o painel</Link>
  if (path === '/login') return <Link href="/cadastro" className={`${pill} w-[125px] text-[12px]`}>Criar conta grátis</Link>
  if (path === '/cadastro') return <Link href="/login" className={`${pill} w-[125px] text-[12px]`}>Login</Link>
  return (
    <nav aria-label="Conta" className="flex items-center gap-[13px]">
      <Link href="/login" className="w-[90px] text-center text-[14px] font-light text-[#515ece] no-underline hover:underline">Entrar</Link>
      <Link href="/cadastro" className={`${pill} w-[90px] text-[12px]`}>Cadastrar-se</Link>
    </nav>
  )
}
