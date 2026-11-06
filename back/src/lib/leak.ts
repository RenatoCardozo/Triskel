/**
 * Bloqueio de contato fora da plataforma. Mesma lógica do protótipo (`leak`):
 * valores em R$ e datas são removidos antes de testar os padrões.
 */
const LKS: Array<[RegExp, string]> = [
  [/[\w.+-]+\s*(@|\(\s*at\s*\)|\[\s*at\s*\]|\barroba\b)\s*[\w-]+(\s*(\.|\bponto\b|\bdot\b)\s*\w{2,})/i, 'e-mails'],
  [/\b(https?:\/\/|www\.)\S+|\b[\w-]+\.(com|net|org|io|app|me|link|br|co|ly|bio)\b/i, 'links'],
  [/(?:\d[\s().+\-_]*){8,}/, 'telefones ou outros números de contato'],
  [/\b(whats\s*app|whats|zap|zapzap|wpp|telegram|signal|messenger|discord|skype|direct|dm|inbox)\b/i, 'aplicativos de conversa ou redes sociais'],
  [/\b(meu|me\s+(chama|segue|manda|add|adiciona)|no\s+meu)\s+(insta|instagram|tiktok|face|facebook|perfil)\b/i, 'perfis de redes sociais'],
  [/(^|\s)@\w{3,}/, 'perfis de redes sociais'],
  [/\b(fora\s+(da|do)\s+(plataforma|app|aplicativo|triskel|sistema)|por\s+fora|me\s+chama|chama\s+no|nos\s+falamos\s+em)\b/i, 'combinados fora da plataforma'],
]

export function leak(text: unknown): string {
  const t = String(text ?? '')
    .replace(/R\$\s*[\d.,]+/gi, ' ')
    .replace(/\b\d{1,2}[/.-]\d{1,2}(?:[/.-]\d{2,4})?\b/g, ' ')
  for (const [r, label] of LKS) if (r.test(t)) return label
  return ''
}
export const leakMessage = (label: string) =>
  `Por segurança, não compartilhe ${label} nas mensagens. Toda a negociação acontece dentro da Triskel, com pagamento protegido.`
