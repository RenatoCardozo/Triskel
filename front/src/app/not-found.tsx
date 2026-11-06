import Link from 'next/link'
export default function NotFound() {
  return (
    <main id="conteudo" className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 text-center">
      <div>
        <h1 className="text-4xl font-extrabold">Página não encontrada</h1>
        <p className="cap mt-2">O endereço não existe ou foi movido.</p>
        <Link href="/" className="btn btn-primary mt-6">Voltar ao início</Link>
      </div>
    </main>
  )
}
