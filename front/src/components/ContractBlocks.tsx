import type { ContractBlock } from '@/lib/types'

/** Texto do contrato (11 cláusulas) vindo do back; é texto puro, renderizado sem HTML. */
export function ContractBlocks({ blocks }: { blocks: ContractBlock[] }) {
  return (
    <div className="space-y-2 text-[14.5px] leading-relaxed text-[#3b4476]">
      {blocks.map((b, i) => b.t === 'h' ? <h4 key={i} className="pt-2 font-extrabold text-ink">{b.x}</h4>
        : b.t === 'p' ? <p key={i}>{b.x}</p>
        : <div key={i}><h4 className="font-extrabold text-ink">{b.h}</h4><dl className="mt-1 grid gap-x-4 gap-y-1 sm:grid-cols-[180px_1fr]">{b.rows.map(([k, v], j) => <div key={j} className="contents"><dt className="lbl pt-0.5">{k}</dt><dd className="font-semibold text-ink">{v}</dd></div>)}</dl></div>)}
    </div>
  )
}
