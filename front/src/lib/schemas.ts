import { z } from 'zod'
import { brDateToISO, cnpjOk, cpfOk, digits, phoneOk, passwordRules, UFS } from './masks'

const req = (m = 'Campo obrigatório.') => z.string().trim().min(1, m)
const email = z.string().trim().min(1, 'Informe o e-mail.').max(120).email('E-mail inválido.')

export const loginSchema = z.object({ email, senha: z.string().min(1, 'Informe a senha.'), remember: z.boolean() })
export type LoginForm = z.infer<typeof loginSchema>

export const passwordSchema = z.string().min(8, 'A senha precisa ter 8 ou mais caracteres.').max(72, 'A senha pode ter no máximo 72 caracteres.')
  .refine((p) => { const r = passwordRules(p); return r.lower && r.upper && r.num }, 'Use letras maiúsculas, minúsculas e números.')

export const registerSchema = z.object({
  role: z.enum(['CREATOR', 'BUSINESS', 'AGENCY']),
  nome: z.string().trim().min(3, 'Informe o nome.').max(60),
  resp: z.string().trim().max(60),
  doc: z.string(),
  data: z.string(),
  cidade: z.string().trim().min(2, 'Informe a cidade.').max(40),
  uf: z.string().refine((u) => UFS.includes(u), 'Escolha o estado.'),
  email,
  tel: z.string().refine(phoneOk, 'Informe DDD e número. Ex.: (53) 99999-9999.'),
  senha: passwordSchema,
  senha2: z.string(),
  aceite: z.boolean(),
}).superRefine((v, ctx) => {
  const add = (path: string, message: string) => ctx.addIssue({ code: 'custom', path: [path], message })
  const creator = v.role === 'CREATOR'
  if (creator ? !cpfOk(v.doc) : !cnpjOk(v.doc)) add('doc', creator ? 'CPF inválido.' : 'CNPJ inválido.')
  const iso = brDateToISO(v.data)
  if (!iso) add('data', 'Use uma data válida (dd/mm/aaaa).')
  else {
    if (new Date(iso) > new Date()) add('data', 'A data não pode ser futura.')
    else if (creator && Date.now() - new Date(iso).getTime() < 18 * 365.25 * 86_400_000) add('data', 'A Triskel é voltada a maiores de 18 anos.')
  }
  if (!creator && v.resp.trim().length < 3) add('resp', 'Informe o nome do responsável.')
  if (v.senha2 !== v.senha) add('senha2', 'As senhas não conferem.')
  if (!v.aceite) add('aceite', 'Aceite os Termos de uso e a Política de privacidade.')
})
export type RegisterForm = z.infer<typeof registerSchema>
export function registerPayload(v: RegisterForm) {
  return { role: v.role, nome: v.nome.trim(), ...(v.role === 'CREATOR' ? {} : { resp: v.resp.trim() }), doc: digits(v.doc), data: brDateToISO(v.data)!, cidade: v.cidade.trim(), uf: v.uf, email: v.email.trim().toLowerCase(), tel: digits(v.tel), senha: v.senha, aceite: true as const }
}

export const contactSchema = z.object({
  name: z.string().trim().min(3, 'Informe o seu nome.').max(80),
  email,
  profile: z.string().min(1, 'Escolha uma opção.'),
  subject: z.string().min(1, 'Escolha o assunto.'),
  message: z.string().trim().min(10, 'Escreva pelo menos 10 caracteres.').max(2000),
})
export type ContactForm = z.infer<typeof contactSchema>

export const phoneSchema = z.object({ tel: z.string().refine(phoneOk, 'Informe DDD e número. Ex.: (53) 99999-9999.') })
export const emailChangeSchema = z.object({ email })
export const codeSchema = z.object({ code: z.string().regex(/^\d{6}$/, 'O código tem 6 dígitos.') })
export const passwordChangeSchema = z.object({ atual: z.string().min(1, 'Informe a senha atual.'), nova: passwordSchema, nova2: z.string() })
  .refine((v) => v.nova === v.nova2, { path: ['nova2'], message: 'As senhas não conferem.' })
  .refine((v) => v.nova !== v.atual, { path: ['nova'], message: 'A nova senha precisa ser diferente da atual.' })
