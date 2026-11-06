'use client'
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main id="conteudo" className="mx-auto grid min-h-[70vh] max-w-md place-items-center px-4 text-center">
      <div role="alert">
        <h1 className="text-3xl font-extrabold">Algo deu errado</h1>
        <p className="cap mt-2">Tivemos um problema ao abrir esta página. Tente de novo.</p>
        <button className="btn btn-primary mt-6" onClick={reset}>Tentar de novo</button>
      </div>
    </main>
  )
}
