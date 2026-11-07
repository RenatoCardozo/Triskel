import { PublicHeader } from '@/components/PublicChrome'
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <><PublicHeader /><main id="conteudo" tabIndex={-1} className="outline-none">{children}</main></>
}
