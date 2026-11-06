import type { Role } from './types'

export type FKind = 'text' | 'area' | 'select' | 'chips' | 'handle' | 'uf' | 'cnpj' | 'money'
export interface PField { k: string; label: string; kind: FKind; opt?: string; max?: number; hint?: string; placeholder?: string }
export interface PSection { title: string; fields: PField[] }

/** Seções e campos do perfil (rótulos e ordem do protótipo). As chaves casam com PATCH /me/profile do back. */
export const SECTIONS: Record<Role, PSection[]> = {
  CREATOR: [
    { title: 'Sobre você', fields: [
      { k: 'nome', label: 'Nome completo', kind: 'text', max: 60 }, { k: 'genero', label: 'Gênero', kind: 'select', opt: 'generoCriador' },
      { k: 'cidade', label: 'Cidade', kind: 'text', max: 40 }, { k: 'uf', label: 'Estado', kind: 'uf' },
      { k: 'idiomas', label: 'Idiomas', kind: 'chips', opt: 'idi' }, { k: 'sobre', label: 'Sobre você', kind: 'area', max: 600 }] },
    { title: 'Redes e alcance', fields: [
      { k: 'insta', label: 'Instagram', kind: 'handle', placeholder: '@seuusuario' }, { k: 'tiktok', label: 'TikTok', kind: 'handle', placeholder: '@seuusuario' },
      { k: 'yt', label: 'YouTube', kind: 'text', max: 60 }, { k: 'seg', label: 'Seguidores da sua maior rede', kind: 'select', opt: 'seguidores' }] },
    { title: 'O que você cria', fields: [
      { k: 'nichos', label: 'Nichos de atuação', kind: 'chips', opt: 'nichos' }, { k: 'fmt', label: 'Formatos de vídeo', kind: 'chips', opt: 'fmt' },
      { k: 'prazo', label: 'Prazo médio de entrega', kind: 'select', opt: 'prazo' }, { k: '_valor', label: 'Valor mínimo por vídeo (R$)', kind: 'money' }] },
    { title: 'Público que você alcança', fields: [
      { k: 'pIdade', label: 'Faixa etária', kind: 'chips', opt: 'idades' }, { k: 'pGen', label: 'Gênero predominante', kind: 'select', opt: 'gen' },
      { k: 'pReg', label: 'Região do público', kind: 'select', opt: 'reg' }, { k: 'pInt', label: 'Interesses do público', kind: 'chips', opt: 'nichos' }] },
  ],
  BUSINESS: [
    { title: 'Sobre o negócio', fields: [
      { k: 'nome', label: 'Nome do comércio', kind: 'text', max: 60 }, { k: 'cnpj', label: 'CNPJ', kind: 'cnpj' }, { k: 'resp', label: 'Nome do responsável', kind: 'text', max: 60 },
      { k: 'seg', label: 'Segmento', kind: 'select', opt: 'segE' }, { k: 'porte', label: 'Porte', kind: 'select', opt: 'porteEmp' },
      { k: 'cidade', label: 'Cidade', kind: 'text', max: 40 }, { k: 'uf', label: 'Estado', kind: 'uf' }, { k: 'sobre', label: 'Sobre o negócio', kind: 'area', max: 600 }] },
    { title: 'Presença e vendas', fields: [
      { k: 'insta', label: 'Instagram', kind: 'handle', placeholder: '@seunegocio' }, { k: 'site', label: 'Site ou cardápio online', kind: 'text', max: 100 }, { k: 'canais', label: 'Canais de venda', kind: 'chips', opt: 'canais' }] },
    { title: 'Público-alvo', fields: [
      { k: 'pIdade', label: 'Faixa etária', kind: 'chips', opt: 'idades' }, { k: 'pGen', label: 'Gênero predominante', kind: 'select', opt: 'gen' },
      { k: 'pReg', label: 'Região dos clientes', kind: 'select', opt: 'reg' }, { k: 'pInt', label: 'Interesses do público', kind: 'chips', opt: 'nichos' }] },
    { title: 'Campanhas que você quer fazer', fields: [
      { k: 'fmt', label: 'Formatos desejados', kind: 'chips', opt: 'fmt' }, { k: 'orc', label: 'Orçamento médio por vídeo', kind: 'select', opt: 'orcE' },
      { k: 'porteCr', label: 'Porte de criador buscado', kind: 'chips', opt: 'porteCr' }, { k: 'nichosCr', label: 'Nichos de criadores preferidos', kind: 'chips', opt: 'nichos' }] },
  ],
  AGENCY: [
    { title: 'Sobre a agência', fields: [
      { k: 'nome', label: 'Nome da agência', kind: 'text', max: 60 }, { k: 'cnpj', label: 'CNPJ', kind: 'cnpj' }, { k: 'resp', label: 'Nome do responsável', kind: 'text', max: 60 },
      { k: 'servicos', label: 'Serviços oferecidos', kind: 'chips', opt: 'serv' }, { k: 'equipe', label: 'Tamanho da equipe', kind: 'select', opt: 'equipe' },
      { k: 'cidade', label: 'Cidade', kind: 'text', max: 40 }, { k: 'uf', label: 'Estado', kind: 'uf' }, { k: 'sobre', label: 'Sobre a agência', kind: 'area', max: 600 }] },
    { title: 'Presença', fields: [{ k: 'insta', label: 'Instagram', kind: 'handle', placeholder: '@suaagencia' }, { k: 'site', label: 'Site', kind: 'text', max: 100 }] },
    { title: 'Clientes atendidos', fields: [
      { k: 'segs', label: 'Segmentos atendidos', kind: 'chips', opt: 'segE' }, { k: 'nCli', label: 'Clientes ativos', kind: 'select', opt: 'nCli' },
      { k: 'pIdade', label: 'Faixa etária dos públicos', kind: 'chips', opt: 'idades' }, { k: 'reg', label: 'Regiões atendidas', kind: 'select', opt: 'reg' }] },
    { title: 'Campanhas', fields: [
      { k: 'orc', label: 'Orçamento médio por campanha', kind: 'select', opt: 'orcA' }, { k: 'fmt', label: 'Formatos mais produzidos', kind: 'chips', opt: 'fmt' },
      { k: 'porteCr', label: 'Porte de criador buscado', kind: 'chips', opt: 'porteCr' }] },
  ],
}
export const profileKeys = (role: Role) => SECTIONS[role].flatMap((s) => s.fields).map((f) => f.k).filter((k) => !k.startsWith('_'))

export const maskMail = (s: string) => s.replace(/^(.)[^@]*/, '$1•••••')
export const maskTel = (s: string | null) => (s ? s.replace(/^\((\d{2})\)\s?(\d{4,5})-(\d{4})$/, '(••) •••••-$3') : 'não informado')
export function yearsSince(iso?: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); if (!m) return null
  const d = new Date(+m[1], +m[2] - 1, +m[3]), n = new Date()
  let y = n.getFullYear() - d.getFullYear(); if (n < new Date(n.getFullYear(), d.getMonth(), d.getDate())) y--
  return Math.max(0, y)
}
