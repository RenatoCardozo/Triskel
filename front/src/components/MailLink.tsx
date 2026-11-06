'use client'
/** Atalho para a caixa de entrada do email-sim (só no ambiente de demonstração; em produção, deixe NEXT_PUBLIC_EMAILSIM_URL vazio). */
export function MailLink() {
  const url = process.env.NEXT_PUBLIC_EMAILSIM_URL
  if (!url) return null
  return <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-block">Abrir meu e-mail (caixa de demonstração)</a>
}
