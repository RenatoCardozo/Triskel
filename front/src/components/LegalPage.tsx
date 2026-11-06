import Link from 'next/link'
import legal from '@/content/legal.json'

type Key = 'f_priv' | 'f_termos'
export function LegalPage({ k }: { k: Key }) {
  const d = legal[k]
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="h-title">{d.title}</h1>
      <p className="h-sub mt-1">{d.updated}</p>
      <section className="card mt-6" aria-labelledby="resumo">
        <h2 id="resumo" className="h-sec">Em resumo</h2>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[15px]">{d.summary.map((s) => <li key={s}>{s}</li>)}</ul>
      </section>
      <div className="mt-4 space-y-2">
        {d.sections.map((s, i) => (
          <details key={s.t} className="card group !p-0" open={i === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-extrabold text-ink"><h2 className="text-[16px]">{s.t}</h2><span aria-hidden="true" className="text-tealtext transition-transform group-open:rotate-180">⌄</span></summary>
            <div className="space-y-2 px-4 pb-4 text-[15px] leading-relaxed text-[#3b4476]">
              {s.blocks.map((b, j) => b.tag === 'UL' && b.items
                ? <ul key={j} className="list-disc space-y-1 pl-5">{b.items.map((it) => <li key={it}>{it}</li>)}</ul>
                : b.text ? <p key={j}>{b.text}</p> : null)}
            </div>
          </details>
        ))}
      </div>
      <p className="np mt-6">{d.note}</p>
      <div className="mt-6 text-center"><Link href="/" className="btn btn-outline">Voltar ao início</Link></div>
    </div>
  )
}
