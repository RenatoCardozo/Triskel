import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import '@fontsource-variable/inter'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: { default: 'Triskel · Plataforma de criadores', template: '%s · Triskel' },
  description: 'A Triskel conecta criadores de conteúdo, nano e micro influenciadores a comércios e agências, do primeiro contato ao pagamento.',
  robots: { index: true, follow: true },
}
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#f6fbfa' }

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined // CSP com nonce: muda a cada resposta
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* aplica o tema salvo antes da primeira pintura (evita piscar) */}
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('triskel-theme');if(t==='dark')document.documentElement.dataset.theme='dark'}catch(e){}" }} />
      </head>
      <body>
        <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:font-bold">Pular para o conteúdo</a>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
