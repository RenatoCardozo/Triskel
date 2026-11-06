import type { SVGProps } from 'react'

/** Ícones do protótipo (traço 24x24, currentColor). */
const P: Record<string, string> = {
  grid: "<rect x=\"3\" y=\"3\" width=\"7\" height=\"18\" rx=\"1.6\"/><rect x=\"13\" y=\"3\" width=\"8\" height=\"8\" rx=\"1.6\"/><rect x=\"13\" y=\"14\" width=\"8\" height=\"7\" rx=\"1.6\"/>",
  user: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/><path d=\"M6.2 18.3c1.5-2.6 3.4-3.6 5.8-3.6s4.3 1 5.8 3.6\"/>",
  search: "<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"M16.2 16.2 21 21\"/>",
  port: "<rect x=\"3\" y=\"3\" width=\"8\" height=\"10\" rx=\"1.6\"/><rect x=\"13\" y=\"3\" width=\"8\" height=\"6\" rx=\"1.6\"/><rect x=\"3\" y=\"15\" width=\"8\" height=\"6\" rx=\"1.6\"/><rect x=\"13\" y=\"11\" width=\"8\" height=\"10\" rx=\"1.6\"/>",
  star: "<path d=\"M12 3l2.8 5.9 6.2.8-4.6 4.3 1.2 6.4L12 17.3 6.4 20.4l1.2-6.4L3 9.7l6.2-.8z\"/>",
  help: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M9.4 9.6a2.6 2.6 0 1 1 3.7 2.3c-.8.4-1.1 1-1.1 1.8\"/><circle cx=\"12\" cy=\"17.2\" r=\".7\" fill=\"currentColor\"/>",
  gear: "<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z\"/>",
  out: "<path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"/><path d=\"M16 17l5-5-5-5\"/><path d=\"M21 12H9\"/>",
  users: "<circle cx=\"9\" cy=\"8\" r=\"3.4\"/><path d=\"M2.6 20c.5-3.5 3-5 6.4-5s5.9 1.5 6.4 5\"/><circle cx=\"17\" cy=\"9\" r=\"2.5\"/><path d=\"M17 14.4c2.5 0 4 1.2 4.4 4\"/>",
  camp: "<path d=\"M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z\"/><path d=\"M15 9a4 4 0 0 1 0 6\"/><path d=\"M18 6.5a8 8 0 0 1 0 11\"/>",
  up: "<path d=\"M6 15l6-6 6 6\"/>",
  back: "<path d=\"M15 18l-6-6 6-6\"/>",
  camera: "<path d=\"M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z\"/><circle cx=\"12\" cy=\"13\" r=\"3.5\"/>",
  lock: "<rect x=\"5\" y=\"11\" width=\"14\" height=\"10\" rx=\"2\"/><path d=\"M8 11V8a4 4 0 0 1 8 0v3\"/>",
  check: "<path d=\"M5 12.5l4.5 4.5L19 7.5\"/>",
  eye: "<path d=\"M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>",
  eyeoff: "<path d=\"M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M4 4l16 16\"/>",
  copy: "<rect x=\"9\" y=\"9\" width=\"11\" height=\"11\" rx=\"2\"/><path d=\"M5 15V6a2 2 0 0 1 2-2h8\"/>",
  chat: "<path d=\"M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12z\"/><path d=\"M8.5 11h7M8.5 14h4\"/>",
  wallet: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"14\" rx=\"2.5\"/><path d=\"M3 10V7.5A2.5 2.5 0 0 1 5.5 5H17\"/><circle cx=\"16.5\" cy=\"13\" r=\"1.2\"/>",
  pix: "<path d=\"M12 3l9 9-9 9-9-9z\"/><path d=\"M9 12l3-3 3 3-3 3z\"/>",
  card: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2.5\"/><path d=\"M3 10h18M7 15h4\"/>",
  xx: "<path d=\"M6 6l12 12M18 6L6 18\"/>",
  clock: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/>",
  plus: "<path d=\"M12 5v14M5 12h14\"/>",
}
export type IconName = keyof typeof P
export function Icon({ n, size = 22, strokeWidth = 2, ...rest }: { n: IconName; size?: number; strokeWidth?: number } & Omit<SVGProps<SVGSVGElement>, 'children'>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...rest}
      dangerouslySetInnerHTML={{ __html: P[n].replace(/strokeWidth/g, 'stroke-width') }} />
  )
}
