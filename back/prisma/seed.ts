/**
 * Seed de demonstração: reproduz os dados de exemplo do protótipo (reference/triskel_prototipo.html).
 * Roda só em banco vazio (o ledger é imutável por trigger, então não há "limpar e refazer"; para recomeçar, recrie o banco).
 * Todos os usuários usam a senha de demonstração (SEED_PASSWORD, padrão `Triskel@2026`). Não use em produção.
 */
import bcrypt from 'bcryptjs'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import crypto from 'node:crypto'
import { Prisma } from '../src/generated/prisma/client'
import { prisma } from '../src/db'
import { env } from '../src/env'
import { generate, CampaignData } from '../src/services/campaignGen'
import { loadParties, modelFor } from '../src/services/contracts'
import { loadMine } from '../src/services/proposals'
import { brandKey } from '../src/services/exclusivity'
import { makeSignature } from '../src/lib/contractModel'
import { buildContractPdf } from '../src/lib/contractPdf'
import { newStorageKey, storage } from '../src/lib/storage'
import { breakdown } from '../src/lib/money'
import { cnpjOk, cpfOk, fmtCNPJ, fmtCPF } from '../src/lib/validators'

const PASSWORD = process.env.SEED_PASSWORD || 'Triskel@2026'

// ---------- utilitários ----------
/** Data/hora de Brasília (UTC-3, sem horário de verão desde 2019). */
const sp = (y: number, m: number, d: number, h = 0, mi = 0) => new Date(Date.UTC(y, m - 1, d, h + 3, mi))
const day = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d))
const dBR = (s: string) => { const [d, m, y] = s.split('/').map(Number); return day(y, m, d) }
const cents = (reais: number) => Math.round(reais * 100)
const cpfFrom = (base: string) => {
  const d = base.split('').map(Number)
  const dv = (n: number) => { let s = 0; for (let i = 0; i < n; i++) s += d[i] * (n + 1 - i); return ((s * 10) % 11) % 10 }
  d.push(dv(9)); d.push(dv(10))
  const out = fmtCPF(d.join(''))
  if (!cpfOk(out)) throw new Error('CPF inválido: ' + out)
  return out
}
const cnpjFrom = (base: string) => {
  const d = base.split('').map(Number)
  const dv = (n: number) => {
    const w = n === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    let s = 0; for (let i = 0; i < n; i++) s += d[i] * w[i]
    const r = s % 11; return r < 2 ? 0 : 11 - r
  }
  d.push(dv(12)); d.push(dv(13))
  const out = fmtCNPJ(d.join(''))
  if (!cnpjOk(out)) throw new Error('CNPJ inválido: ' + out)
  return out
}
const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '')

/** PNG de degradê nas cores da marca (índigo -> verde-água), gerado sem dependências. Serve de foto de perfil/capa de demonstração. */
function gradientPng(w: number, h: number, a: [number, number, number], b: [number, number, number], art: 'none' | 'person' | 'wave' = 'none'): Buffer {
  const raw = Buffer.alloc((w * 3 + 1) * h)
  for (let y = 0; y < h; y++) {
    raw[y * (w * 3 + 1)] = 0
    for (let x = 0; x < w; x++) {
      const t = (x / (w - 1) + y / (h - 1)) / 2, o = y * (w * 3 + 1) + 1 + x * 3
      // desenho opcional por cima do degradê (silhueta de pessoa no avatar; ondas e bolhas na capa), como no protótipo
      let white = 0
      if (art === 'person') {
        const dx = x - w / 2, hy = y - h * 0.39, by = y - h * 1.06
        if (dx * dx + hy * hy < (h * 0.2) ** 2 || (dx / (w * 0.4)) ** 2 + (by / (h * 0.46)) ** 2 < 1) white = 1
      } else if (art === 'wave') {
        if (y > h * (0.7 + 0.08 * Math.sin((x / w) * Math.PI * 2.4 + 1))) white = 0.28
        for (const [cx, cy, r] of [[w * 0.2, h * 0.1, h * 0.12], [w * 0.8, h * 0.14, h * 0.26]]) if ((x - cx) ** 2 + (y - cy) ** 2 < r * r) white = Math.max(white, 0.18)
      }
      for (let i = 0; i < 3; i++) { const v = a[i] + (b[i] - a[i]) * t; raw[o + i] = Math.round(v + (255 - v) * white) }
    }
  }
  const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0 })
  const crc = (buf: Buffer) => { let c = 0xffffffff; for (const x of buf) c = crcT[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0 }
  const chunk = (type: string, data: Buffer) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]) }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}
const INDIGO: [number, number, number] = [76, 92, 202], TEAL: [number, number, number] = [45, 212, 191]
const MINT: [number, number, number] = [95, 224, 161], TEAL2: [number, number, number] = [60, 212, 199]

// ---------- criadores (CRD do protótipo) ----------
interface Cr {
  key: string; name: string; email: string; niches: string[]; city: string; near: boolean; size: 'Nano' | 'Micro'; followers: string; rating: number; jobs: number
  vmin: number; vmax: number; prazo: string; about: string; nets: Record<string, string>; port: Array<[string, string, string]>; band: string; birth: Date; cpfBase: string; gender: string
}
const CREATORS: Cr[] = [
  { key: 'mm', name: 'Marjorie Moreira', email: 'marjorie@email.com', niches: ['Gastronomia', 'Lifestyle'], city: 'Pelotas', near: true, size: 'Micro', followers: '12,4 mil', rating: 4.9, jobs: 12, vmin: 200, vmax: 420, prazo: 'Até 5 dias', about: 'Criadora de conteúdo gastronômico em Pelotas. Gosto de vídeos curtos, com bastidores e receitas.', nets: { Instagram: '12,4 mil', TikTok: '8,1 mil' }, port: [['Receita de bolo de rolo', 'Doce Vale Confeitaria · Reels', '12,4 mil visualizações'], ['Tour pelo Mercado Central', 'Mercado Central de Pelotas · TikTok', '8,1 mil visualizações']], band: '10 a 50 mil (micro)', birth: day(1996, 3, 14), cpfBase: '529982247', gender: 'Mulher' },
  { key: 'la', name: 'Lucas Amaral', email: 'lucas.amaral@email.com', niches: ['Gastronomia', 'Humor'], city: 'Pelotas', near: true, size: 'Micro', followers: '31 mil', rating: 4.7, jobs: 9, vmin: 180, vmax: 350, prazo: 'Até 7 dias', about: 'Humor e comida: receitas rápidas, testes de restaurantes e bastidores de cozinha.', nets: { Instagram: '31 mil', TikTok: '22 mil' }, port: [['Teste de pizzas da cidade', 'Pizzaria da Praça · Reels', '18 mil visualizações']], band: '10 a 50 mil (micro)', birth: day(1994, 8, 22), cpfBase: '111444777', gender: 'Homem' },
  { key: 'bt', name: 'Bianca Teixeira', email: 'bianca.teixeira@email.com', niches: ['Lifestyle', 'Beleza'], city: 'Pelotas', near: true, size: 'Nano', followers: '8,7 mil', rating: 4.8, jobs: 7, vmin: 150, vmax: 300, prazo: 'Até 4 dias', about: 'Rotina, autocuidado e dia a dia de uma jovem empreendedora do Sul.', nets: { Instagram: '8,7 mil' }, port: [['Rotina de skincare', 'Studio Bela Pele · Reels', '9,2 mil visualizações']], band: 'Até 10 mil (nano)', birth: day(1999, 11, 2), cpfBase: '390533447', gender: 'Mulher' },
  { key: 'js', name: 'Juliana Souza', email: 'juliana.souza@email.com', niches: ['Maternidade e família', 'Casa e decoração', 'Gastronomia'], city: 'Canguçu', near: true, size: 'Nano', followers: '9,3 mil', rating: 4.8, jobs: 11, vmin: 160, vmax: 320, prazo: 'Até 6 dias', about: 'Vida em família, casa e receitas simples para o dia a dia.', nets: { Instagram: '9,3 mil', TikTok: '4,1 mil' }, port: [['Lanche da tarde em família', 'Padaria Dona Rosa · Reels', '7,6 mil visualizações']], band: 'Até 10 mil (nano)', birth: day(1991, 5, 30), cpfBase: '123456789', gender: 'Mulher' },
  { key: 'rf', name: 'Rafael Gomes', email: 'rafael.gomes@email.com', niches: ['Fitness', 'Saúde e bem-estar'], city: 'Rio Grande', near: true, size: 'Micro', followers: '46 mil', rating: 4.6, jobs: 15, vmin: 300, vmax: 600, prazo: 'Até 7 dias', about: 'Treino, alimentação e rotina saudável. Vídeos objetivos e motivadores.', nets: { Instagram: '46 mil', YouTube: '12 mil' }, port: [['Treino em 20 minutos', 'Academia Vital · Reels', '31 mil visualizações']], band: '10 a 50 mil (micro)', birth: day(1992, 1, 17), cpfBase: '987654321', gender: 'Homem' },
  { key: 'ca', name: 'Camila Duarte', email: 'camila.duarte@email.com', niches: ['Gastronomia', 'Viagem'], city: 'Porto Alegre', near: false, size: 'Micro', followers: '62 mil', rating: 4.9, jobs: 21, vmin: 450, vmax: 900, prazo: 'Até 10 dias', about: 'Roteiros gastronômicos pelo Sul. Produção cuidadosa e boa edição.', nets: { Instagram: '62 mil', YouTube: '38 mil' }, port: [['Rota dos cafés coloniais', 'Serra Gaúcha · Reels', '54 mil visualizações']], band: '50 a 100 mil (micro)', birth: day(1989, 9, 9), cpfBase: '246813579', gender: 'Mulher' },
  { key: 'tb', name: 'Thiago Brandão', email: 'thiago.brandao@email.com', niches: ['Tecnologia', 'Games'], city: 'Pelotas', near: true, size: 'Nano', followers: '6,2 mil', rating: 4.4, jobs: 4, vmin: 120, vmax: 250, prazo: 'Até 5 dias', about: 'Análises rápidas de gadgets e jogos.', nets: { TikTok: '6,2 mil', YouTube: '3,5 mil' }, port: [['Review de fone sem fio', 'Loja Conecta · Shorts', '4,4 mil visualizações']], band: 'Até 10 mil (nano)', birth: day(2001, 12, 4), cpfBase: '135792468', gender: 'Homem' },
  { key: 'pm', name: 'Pedro Matos', email: 'pedro.matos@email.com', niches: ['Moda', 'Lifestyle'], city: 'Santa Maria', near: false, size: 'Micro', followers: '27 mil', rating: 4.5, jobs: 8, vmin: 250, vmax: 500, prazo: 'Até 7 dias', about: 'Moda masculina acessível e looks para o dia a dia.', nets: { Instagram: '27 mil' }, port: [['Looks de outono', 'Brechó Centro · Reels', '15 mil visualizações']], band: '10 a 50 mil (micro)', birth: day(1997, 6, 25), cpfBase: '314159265', gender: 'Homem' },
]

// ---------- contratantes ----------
interface Co {
  key: string; role: 'BUSINESS' | 'AGENCY'; name: string; email: string; tel: string; segment: string; city: string; uf: string; resp: string; cnpjBase: string; founded: Date
  about?: string; insta?: string; site?: string; size?: string; publicId?: string; extra?: Prisma.CompanyProfileCreateWithoutUserInput | Record<string, unknown>
}
const COMPANIES: Co[] = [
  { key: 'dv', role: 'BUSINESS', name: 'Doce Vale Confeitaria', email: 'contato@docevale.com.br', tel: '(53) 3222-4410', segment: 'Alimentação', city: 'Pelotas', uf: 'RS', resp: 'Helena Vale', cnpjBase: '112223330001', founded: day(2018, 5, 10), about: 'Confeitaria artesanal com receitas coloniais, vendas na loja e por encomenda.', insta: '@docevale', site: 'docevale.com.br', size: 'Microempresa', publicId: '23456789',
    extra: { channels: ['Loja física', 'Sob encomenda', 'Delivery'], audAges: ['25–34', '35–44'], audGender: 'Mulheres', audRegion: 'Pelotas e região', audInterests: ['Gastronomia', 'Maternidade e família'], desiredFormats: ['Reels 9:16', 'Stories'], budget: 'R$ 200 a 500', creatorSizes: ['Nano (até 10 mil)', 'Micro (10 a 100 mil)'], creatorNiches: ['Gastronomia', 'Lifestyle'] } },
  { key: 'md', role: 'AGENCY', name: 'Maré Digital', email: 'oi@maredigital.com.br', tel: '(53) 99871-2200', segment: 'Serviços', city: 'Pelotas', uf: 'RS', resp: 'Ricardo Soares', cnpjBase: '123456780001', founded: day(2019, 2, 2), about: 'Agência de marketing digital focada em pequenos negócios do Sul do país, com campanhas de creators.', insta: '@maredigital', site: 'maredigital.com.br', publicId: '34567890',
    extra: { services: ['Campanhas com creators', 'Gestão de redes sociais', 'Produção de conteúdo'], teamSize: '6 a 15 pessoas', clientSegments: ['Saúde', 'Beleza', 'Alimentação'], clientsRange: '1 a 5', audAges: ['25–34', '35–44'], audRegion: 'Rio Grande do Sul', budget: 'R$ 1.000 a 3.000', desiredFormats: ['Reels 9:16', 'Vídeo para anúncio (UGC)'], creatorSizes: ['Nano (até 10 mil)', 'Micro (10 a 100 mil)'] } },
  // contratantes de apoio (usados nas campanhas abertas e nos contratos já assinados do protótipo). Responsável e CNPJ são fictícios.
  { key: 'fl', role: 'BUSINESS', name: 'Pizzaria Forno a Lenha', email: 'contato@pizzariafornoalenha.com.br', tel: '(53) 3225-1100', segment: 'Alimentação', city: 'Pelotas', uf: 'RS', resp: 'Giovani Ferreira', cnpjBase: '450000010001', founded: day(2015, 3, 12) },
  { key: 'cl', role: 'BUSINESS', name: 'Café Lume', email: 'contato@cafelume.com.br', tel: '(53) 3227-2200', segment: 'Alimentação', city: 'Pelotas', uf: 'RS', resp: 'Paulo Rezende', cnpjBase: '450000020001', founded: day(2020, 7, 1) },
  { key: 'ea', role: 'BUSINESS', name: 'Estética Aurora', email: 'contato@esteticaaurora.com.br', tel: '(53) 3228-3300', segment: 'Beleza', city: 'Pelotas', uf: 'RS', resp: 'Carla Menezes', cnpjBase: '450000030001', founded: day(2017, 9, 18) },
  { key: 'cc', role: 'BUSINESS', name: 'Café Colonial da Serra', email: 'contato@cafecolonialdaserra.com.br', tel: '(53) 3252-4400', segment: 'Alimentação', city: 'Canguçu', uf: 'RS', resp: 'Dirce Hartwig', cnpjBase: '450000040001', founded: day(2012, 4, 5) },
  { key: 'av', role: 'BUSINESS', name: 'Academia Vital', email: 'contato@academiavital.com.br', tel: '(53) 3231-5500', segment: 'Esportes', city: 'Rio Grande', uf: 'RS', resp: 'Marcos Vital', cnpjBase: '450000050001', founded: day(2016, 1, 20) },
  { key: 'pf', role: 'BUSINESS', name: 'PetShop Amigo Fiel', email: 'contato@petshopamigofiel.com.br', tel: '(53) 3226-6600', segment: 'Pets', city: 'Pelotas', uf: 'RS', resp: 'Sandra Lopes', cnpjBase: '450000060001', founded: day(2019, 10, 8) },
  { key: 'lm', role: 'BUSINESS', name: 'Loja Maré Moda', email: 'contato@lojamaremoda.com.br', tel: '(51) 3333-7700', segment: 'Moda', city: 'Porto Alegre', uf: 'RS', resp: 'Beatriz Maré', cnpjBase: '450000070001', founded: day(2014, 11, 3) },
  { key: 'cs', role: 'BUSINESS', name: 'Clínica Sorriso Sul', email: 'contato@clinicasorrisosul.com.br', tel: '(53) 3229-8800', segment: 'Saúde', city: 'Pelotas', uf: 'RS', resp: 'Dr. André Nunes', cnpjBase: '450000080001', founded: day(2013, 6, 14) },
  { key: 'bp', role: 'BUSINESS', name: 'Studio Bela Pele', email: 'contato@studiobelapele.com.br', tel: '(53) 3224-9900', segment: 'Beleza', city: 'Pelotas', uf: 'RS', resp: 'Fernanda Pele', cnpjBase: '450000090001', founded: day(2021, 2, 27) },
]

// ---------- campanhas ----------
interface Camp {
  key: string; owner: string; client?: string; name: string; obj: string; desc: string; niches: string[]; near: boolean; videos: number; perVideo: number
  delivery: string; uso: string; excl: string; open: boolean
}
// As 8 campanhas abertas do protótipo (CMP): valor = total que o criador recebe; valor por vídeo = total / vídeos.
const CAMPS: Camp[] = [
  { key: 'cv', owner: 'dv', name: 'Cardápio de verão', obj: 'Gerar visitas à loja', desc: 'Mostrar as novas sobremesas geladas do verão, com clima leve e close nos detalhes.', niches: ['Gastronomia', 'Lifestyle'], near: true, videos: 2, perVideo: 300, delivery: '2026-12-15', uso: '90 dias', excl: 'Nenhuma', open: true },
  { key: 'ci', owner: 'fl', name: 'Cardápio de inverno', obj: 'Aumentar vendas', desc: 'Mostrar as pizzas de inverno saindo do forno, com foco no queijo e na massa.', niches: ['Gastronomia'], near: true, videos: 1, perVideo: 250, delivery: '2026-11-20', uso: '60 dias', excl: 'Nenhuma', open: true },
  { key: 'cs', owner: 'bp', name: 'Rotina de skincare', obj: 'Divulgar serviços', desc: 'Uma rotina de cuidados simples, mostrando os produtos usados no estúdio.', niches: ['Beleza', 'Lifestyle'], near: true, videos: 1, perVideo: 300, delivery: '2026-11-30', uso: '90 dias', excl: '30 dias', open: true },
  { key: 'cc', owner: 'cs', name: 'Check-up em família', obj: 'Gerar consultas', desc: 'Uma família passando pelo check-up e contando como foi a experiência.', niches: ['Saúde e bem-estar', 'Maternidade e família'], near: true, videos: 1, perVideo: 450, delivery: '2026-12-10', uso: '90 dias', excl: 'Nenhuma', open: true },
  { key: 'ct', owner: 'cc', name: 'Café da manhã colonial', obj: 'Gerar visitas à loja', desc: 'Mostrar a mesa de café colonial e o clima do lugar.', niches: ['Gastronomia', 'Viagem'], near: true, videos: 1, perVideo: 500, delivery: '2026-12-05', uso: '90 dias', excl: '60 dias', open: true },
  { key: 'cf', owner: 'av', name: 'Treino em casa', obj: 'Captar alunos', desc: 'Um treino de 15 minutos para fazer em casa, com a assinatura da academia.', niches: ['Fitness', 'Saúde e bem-estar'], near: true, videos: 1, perVideo: 380, delivery: '2026-12-12', uso: '90 dias', excl: '30 dias', open: true },
  { key: 'cp', owner: 'pf', name: 'Dia de banho e tosa', obj: 'Aumentar agendamentos', desc: 'O dia de um pet no banho e tosa, do começo ao fim.', niches: ['Pets'], near: true, videos: 1, perVideo: 220, delivery: '2026-11-28', uso: '60 dias', excl: 'Nenhuma', open: true },
  { key: 'cm', owner: 'lm', name: 'Coleção primavera', obj: 'Divulgar coleção', desc: 'Looks da nova coleção, em 2 vídeos curtos.', niches: ['Moda', 'Lifestyle'], near: false, videos: 2, perVideo: 350, delivery: '2026-12-18', uso: '180 dias', excl: 'Nenhuma', open: true },
  // Campanhas por trás das propostas PR-1..PR-9 que não estão entre as 8 abertas. Ficam como rascunho para não aparecerem na lista de oportunidades.
  { key: 'doces', owner: 'dv', name: 'Linha de doces coloniais', obj: 'Divulgar lançamento', desc: 'Mostrar a linha de doces coloniais sendo preparada e provada.', niches: ['Gastronomia', 'Lifestyle'], near: true, videos: 1, perVideo: 350, delivery: '2026-11-25', uso: '90 dias', excl: 'Nenhuma', open: false },
  { key: 'docesAg', owner: 'md', client: 'Doce Vale Confeitaria', name: 'Linha de doces coloniais', obj: 'Divulgar lançamento', desc: 'Campanha do cliente Doce Vale: a linha de doces coloniais sendo preparada e provada.', niches: ['Gastronomia', 'Lifestyle'], near: true, videos: 1, perVideo: 350, delivery: '2026-11-25', uso: '90 dias', excl: 'Nenhuma', open: false },
  { key: 'checkAg', owner: 'md', client: 'Clínica Sorriso Sul', name: 'Check-up em família', obj: 'Gerar consultas', desc: 'Campanha de check-up em família para a Clínica Sorriso Sul.', niches: ['Saúde e bem-estar', 'Maternidade e família'], near: true, videos: 1, perVideo: 450, delivery: '2026-12-10', uso: '90 dias', excl: 'Nenhuma', open: false },
  { key: 'belaAg', owner: 'md', client: 'Studio Bela Pele', name: 'Cuidados de verão', obj: 'Divulgar serviços', desc: 'Campanha Cuidados de verão para o Studio Bela Pele.', niches: ['Beleza', 'Lifestyle'], near: true, videos: 1, perVideo: 400, delivery: '2026-12-20', uso: '90 dias', excl: 'Nenhuma', open: false },
  { key: 'lume', owner: 'cl', name: 'Brunch de fim de ano', obj: 'Gerar visitas à loja', desc: 'Brunch de fim de ano com exclusividade de 60 dias no ramo de alimentação.', niches: ['Gastronomia', 'Humor'], near: true, videos: 1, perVideo: 380, delivery: '2026-11-20', uso: '90 dias', excl: '60 dias', open: false },
  { key: 'aurora', owner: 'ea', name: 'Pele de verão', obj: 'Divulgar serviços', desc: 'Pele de verão com exclusividade de 30 dias no ramo de beleza.', niches: ['Beleza', 'Lifestyle'], near: true, videos: 1, perVideo: 320, delivery: '2026-11-25', uso: '90 dias', excl: '30 dias', open: false },
]

// ---------- propostas PR-1..PR-9 ----------
type R = ['K' | 'C', number, string, string, string, [number, number, number, number]]
interface Prop {
  n: number; camp: string; contractor: string; creator: string; client?: string; status: 'OPEN' | 'ACCEPTED' | 'CONTRACT'; unreadC: boolean; unreadK: boolean
  rounds: R[]; msgs: Array<['S' | 'C' | 'K', string, [number, number, number, number]]>; acceptedAt?: [number, number, number, number]
  paid?: [number, number, number, number]; signedC?: [number, number, number, number]; trx?: string
}
const PROPS: Prop[] = [
  { n: 1, camp: 'doces', contractor: 'dv', creator: 'mm', status: 'CONTRACT', unreadC: false, unreadK: false, trx: 'TRX-7K3M9QX2', acceptedAt: [10, 30, 8, 5], paid: [11, 2, 14, 32], signedC: [11, 2, 16, 5],
    rounds: [['K', 350, '25/11/2026', '90 dias', 'Oi, Marjorie! Adorei os seus vídeos de receita. Queremos mostrar a nossa linha de doces coloniais sendo preparada e provada.', [10, 29, 9, 12]], ['C', 420, '30/11/2026', '90 dias', 'Posso incluir 2 stories extras? Com isso o valor fica em R$ 420.', [10, 29, 10, 40]]],
    msgs: [['S', 'Proposta aceita por Doce Vale Confeitaria em R$ 420,00.', [10, 30, 8, 5]], ['C', 'Obrigada! Vou começar a gravar amanhã.', [10, 30, 8, 30]], ['S', 'Contrato confirmado por Doce Vale Confeitaria. R$ 420,00 ficam em custódia até a aprovação da entrega e a confirmação da publicação.', [11, 2, 14, 32]]] },
  { n: 2, camp: 'cv', contractor: 'dv', creator: 'la', status: 'OPEN', unreadC: false, unreadK: true,
    rounds: [['K', 600, '15/12/2026', '90 dias', 'Oi, Lucas! Queremos você no cardápio de verão: 2 vídeos mostrando as sobremesas geladas.', [11, 3, 10, 15]], ['C', 700, '15/12/2026', '90 dias', 'Consigo entregar os 2 vídeos com edição completa por R$ 700.', [11, 4, 9, 40]]], msgs: [] },
  { n: 3, camp: 'cv', contractor: 'dv', creator: 'bt', status: 'ACCEPTED', unreadC: false, unreadK: true, acceptedAt: [11, 4, 16, 20],
    rounds: [['K', 600, '15/12/2026', '90 dias', 'Oi, Bianca! Queremos você no cardápio de verão: 2 vídeos mostrando as sobremesas geladas.', [11, 3, 10, 16]]], msgs: [['S', 'Proposta aceita por Bianca Teixeira em R$ 600,00.', [11, 4, 16, 20]]] },
  { n: 4, camp: 'ci', contractor: 'fl', creator: 'mm', status: 'OPEN', unreadC: true, unreadK: false,
    rounds: [['K', 250, '20/11/2026', '60 dias', 'Oi, Marjorie! Vimos o seu trabalho e queremos você no nosso cardápio de inverno.', [11, 4, 14, 32]]], msgs: [] },
  { n: 5, camp: 'docesAg', contractor: 'md', creator: 'mm', client: 'Doce Vale Confeitaria', status: 'ACCEPTED', unreadC: false, unreadK: true, acceptedAt: [10, 29, 9, 5],
    rounds: [['K', 350, '25/11/2026', '90 dias', 'Olá, Marjorie! Somos a Maré Digital e vamos conduzir a campanha do nosso cliente Doce Vale.', [10, 28, 11, 0]]], msgs: [['S', 'Proposta aceita por Marjorie Moreira em R$ 350,00.', [10, 29, 9, 5]]] },
  { n: 6, camp: 'checkAg', contractor: 'md', creator: 'la', client: 'Clínica Sorriso Sul', status: 'OPEN', unreadC: false, unreadK: true,
    rounds: [['K', 450, '10/12/2026', '90 dias', 'Olá, Lucas! Campanha de check-up em família para a Clínica Sorriso Sul.', [11, 2, 10, 0]], ['C', 500, '10/12/2026', '90 dias', 'Consigo fechar em R$ 500, com roteiro incluso.', [11, 3, 11, 20]]], msgs: [] },
  { n: 7, camp: 'belaAg', contractor: 'md', creator: 'bt', client: 'Studio Bela Pele', status: 'OPEN', unreadC: false, unreadK: false,
    rounds: [['K', 400, '20/12/2026', '90 dias', 'Olá, Bianca! Campanha Cuidados de verão para o Studio Bela Pele.', [11, 4, 15, 0]]], msgs: [] },
  { n: 8, camp: 'lume', contractor: 'cl', creator: 'la', status: 'CONTRACT', unreadC: false, unreadK: false, trx: 'TRX-L8U2M5AA', acceptedAt: [10, 20, 17, 0], paid: [10, 21, 11, 0], signedC: [10, 27, 10, 0],
    rounds: [['K', 380, '20/11/2026', '90 dias', 'Oi, Lucas! Brunch de fim de ano com exclusividade de 60 dias no ramo de alimentação.', [10, 20, 9, 0]]], msgs: [['S', 'Contrato assinado por Lucas Amaral. Exclusividade de 60 dias a partir de 20/11/2026.', [10, 27, 10, 0]]] },
  { n: 9, camp: 'aurora', contractor: 'ea', creator: 'bt', status: 'CONTRACT', unreadC: false, unreadK: false, trx: 'TRX-A9R3O7BB', acceptedAt: [10, 22, 18, 0], paid: [10, 23, 9, 40], signedC: [10, 28, 15, 0],
    rounds: [['K', 320, '25/11/2026', '90 dias', 'Oi, Bianca! Pele de verão com exclusividade de 30 dias no ramo de beleza.', [10, 22, 9, 30]]], msgs: [['S', 'Contrato assinado por Bianca Teixeira. Exclusividade de 30 dias a partir de 25/11/2026.', [10, 28, 15, 0]]] },
]
const at = (a: [number, number, number, number]) => sp(2026, a[0], a[1], a[2], a[3])

// ---------- movimentações (TXS do protótipo + os pagamentos dos contratos de apoio) ----------
interface Tx { id: string; user: string; kind: 'RECHARGE' | 'CONTRACT' | 'WITHDRAWAL'; status: 'CONCLUIDO' | 'LIBERADO' | 'CUSTODIA'; desc: string; cp?: string; value: number; fee: number; method: string; detail: string; dt: Date; contract?: number }
const SALDO = 'Saldo da carteira'
const TXS: Tx[] = [
  { id: 'TRX-1A9QXM3P', user: 'dv', kind: 'RECHARGE', status: 'CONCLUIDO', desc: 'Adição de saldo', value: 1000, fee: 0, method: 'pix', detail: 'Pix', dt: sp(2026, 10, 10, 9, 15) },
  { id: 'TRX-2PD6ZV8R', user: 'dv', kind: 'CONTRACT', status: 'LIBERADO', desc: 'Reels · Cardápio de verão', cp: 'Marjorie Moreira', value: 280, fee: 28, method: 'saldo', detail: SALDO, dt: sp(2026, 10, 12, 9, 20) },
  { id: 'TRX-5NB3JF7Y', user: 'mm', kind: 'WITHDRAWAL', status: 'CONCLUIDO', desc: 'Saque via Pix', value: 280, fee: 0, method: 'pix', detail: 'Pix · CPF', dt: sp(2026, 10, 14, 11, 2) },
  { id: 'TRX-9HX2LC5B', user: 'dv', kind: 'CONTRACT', status: 'LIBERADO', desc: 'Vídeos Dia das Mães', cp: 'Lucas Amaral e Bianca Teixeira', value: 270, fee: 27, method: 'saldo', detail: SALDO, dt: sp(2026, 10, 20, 16, 48) },
  { id: 'TRX-3NQ7DW5H', user: 'md', kind: 'RECHARGE', status: 'CONCLUIDO', desc: 'Adição de saldo', value: 2500, fee: 0, method: 'pix', detail: 'Pix', dt: sp(2026, 10, 20, 8, 30) },
  { id: 'TRX-3ZK5HT9D', user: 'md', kind: 'CONTRACT', status: 'LIBERADO', desc: 'Campanha Bela Pele · 2 criadores', cp: '2 criadores', value: 600, fee: 60, method: 'saldo', detail: SALDO, dt: sp(2026, 10, 22, 13, 40) },
  { id: 'TRX-6RC4TV2K', user: 'dv', kind: 'RECHARGE', status: 'CONCLUIDO', desc: 'Adição de saldo', value: 500, fee: 0, method: 'credito', detail: 'Visa •••• 4242 · crédito', dt: sp(2026, 10, 28, 9, 58) },
  { id: 'TRX-4TQ8WD6N', user: 'dv', kind: 'CONTRACT', status: 'LIBERADO', desc: 'Reels · Bolo de pote', cp: 'Marjorie Moreira', value: 150, fee: 15, method: 'saldo', detail: SALDO, dt: sp(2026, 10, 28, 10, 5) },
  { id: 'TRX-8WQ1MR4C', user: 'md', kind: 'CONTRACT', status: 'CUSTODIA', desc: 'Campanha Sorriso Sul · 3 criadores', cp: '3 criadores', value: 900, fee: 90, method: 'saldo', detail: SALDO, dt: sp(2026, 11, 3, 15, 10) },
  // saldo inicial dos contratantes de apoio (necessário para o pagamento dos contratos PR-8 e PR-9 ter origem no ledger)
  { id: 'TRX-L1M3R0AA', user: 'cl', kind: 'RECHARGE', status: 'CONCLUIDO', desc: 'Adição de saldo', value: 1000, fee: 0, method: 'pix', detail: 'Pix', dt: sp(2026, 10, 15, 10, 0) },
  { id: 'TRX-A1U0R0BB', user: 'ea', kind: 'RECHARGE', status: 'CONCLUIDO', desc: 'Adição de saldo', value: 500, fee: 0, method: 'pix', detail: 'Pix', dt: sp(2026, 10, 18, 10, 0) },
]

async function main() {
  if ((await prisma.user.count()) > 0) {
    console.log('Banco já tem usuários: seed ignorado. Para recomeçar, recrie o banco (o ledger é imutável).')
    return
  }
  const hash = await bcrypt.hash(PASSWORD, env.BCRYPT_COST)
  const verified = sp(2026, 9, 1, 10, 0)
  const ids: Record<string, string> = {}
  let pub = 45_000_000

  // usuários + perfis + carteira
  for (const c of CREATORS) {
    const u = await prisma.user.create({
      data: {
        email: c.email, passwordHash: hash, role: 'CREATOR', name: c.name, publicId: c.key === 'mm' ? '12345678' : String(pub++), phone: '(53) 99912-3456',
        emailVerifiedAt: verified, listed: true, wallet: { create: {} },
        creator: {
          create: {
            cpf: cpfFrom(c.cpfBase), birthDate: c.birth, gender: c.gender, city: c.city, uf: 'RS', languages: c.key === 'mm' ? ['Português', 'Inglês'] : ['Português'], about: c.about,
            instagram: '@' + (c.key === 'mm' ? 'marjorie.cria' : slug(c.name)), tiktok: c.nets.TikTok ? '@' + (c.key === 'mm' ? 'marjorie.cria' : slug(c.name)) : null, youtube: c.nets.YouTube ? '@' + slug(c.name) : null,
            followersBand: c.band, networkStats: c.nets, sizeBand: c.size, niches: c.niches, formats: c.key === 'mm' ? ['Reels 9:16', 'Stories', 'TikTok'] : ['Reels 9:16'], avgDelivery: c.prazo,
            priceReels: cents(c.vmin), priceStories: c.key === 'mm' ? cents(120) : null, priceTiktok: c.key === 'mm' ? cents(180) : null, vminCents: cents(c.vmin), vmaxCents: cents(c.vmax),
            imageUse: 'Incluso por 90 dias', audAges: c.key === 'mm' ? ['25–34', '35–44'] : ['18–24', '25–34'], audGender: c.key === 'mm' ? 'Mulheres' : 'Todos os gêneros', audRegion: c.key === 'mm' || c.near ? 'Pelotas e região' : 'Rio Grande do Sul',
            audInterests: c.key === 'mm' ? ['Gastronomia', 'Casa e decoração', 'Maternidade e família'] : c.niches, nearPelotas: c.near, ratingAvg: c.rating, jobsCount: c.jobs,
          },
        },
        portfolio: { create: c.port.map(([title, description, views]) => ({ title, description, views })) },
      },
    })
    ids[c.key] = u.id
  }
  for (const c of COMPANIES) {
    const x = (c.extra ?? {}) as Record<string, unknown>
    const u = await prisma.user.create({
      data: {
        email: c.email, passwordHash: hash, role: c.role, name: c.name, publicId: c.publicId ?? String(pub++), phone: c.tel, emailVerifiedAt: verified, wallet: { create: {} },
        company: {
          create: {
            tradeName: c.name, cnpj: cnpjFrom(c.cnpjBase), responsible: c.resp, foundedAt: c.founded, segment: c.segment, size: c.size ?? null, city: c.city, uf: c.uf, about: c.about ?? null,
            instagram: c.insta ?? null, site: c.site ?? null,
            channels: [], audAges: [], audInterests: [], desiredFormats: [], creatorSizes: [], creatorNiches: [], services: [], clientSegments: [],
            ...x,
          } as Prisma.CompanyProfileCreateWithoutUserInput,
        },
      },
    })
    ids[c.key] = u.id
  }

  // fotos de perfil e capa de demonstração (necessárias para o perfil contar como completo e continuar aparecendo nas buscas)
  const avatar = gradientPng(256, 256, MINT, TEAL2, 'person'), cover = gradientPng(960, 320, MINT, TEAL2, 'wave')
  for (const key of [...CREATORS.map((c) => c.key), 'dv', 'md']) {
    const link: Record<string, string> = {}
    for (const [kind, buf] of [['avatar', avatar], ['cover', cover]] as const) {
      const k = crypto.randomBytes(24).toString('hex') + '.png'
      await storage.put(k, buf)
      link[kind] = (await prisma.storedFile.create({ data: { ownerId: ids[key], kind, storageKey: k, mime: 'image/png', size: buf.length, sha256: crypto.createHash('sha256').update(buf).digest('hex') } })).id
    }
    await prisma.user.update({ where: { id: ids[key] }, data: { avatarFileId: link.avatar, coverFileId: link.cover } })
  }

  // clientes da agência (Maré Digital atende Doce Vale, Clínica Sorriso Sul e Studio Bela Pele)
  const clients: Record<string, string> = {}
  for (const [name, segment] of [['Doce Vale Confeitaria', 'Alimentação'], ['Clínica Sorriso Sul', 'Saúde'], ['Studio Bela Pele', 'Beleza']]) {
    clients[name] = (await prisma.agencyClient.create({ data: { agencyId: ids.md, name, segment } })).id
  }

  // campanhas
  const campIds: Record<string, string> = {}
  const co = (k: string) => COMPANIES.find((x) => x.key === k)!
  for (const k of CAMPS) {
    const brand = k.client ?? co(k.owner).name
    const segment = k.client ? (k.client === 'Clínica Sorriso Sul' ? 'Saúde' : k.client === 'Studio Bela Pele' ? 'Beleza' : 'Alimentação') : co(k.owner).segment
    const data: CampaignData & Record<string, unknown> = {
      nome: k.name, produto: k.name, obj: k.obj, desc: k.desc, msg: k.desc.split('.')[0].slice(0, 160), cta: '',
      pIdade: ['25–34', '35–44'], pGen: 'Todos os gêneros', pReg: k.near ? 'Pelotas e região' : 'Rio Grande do Sul', pInt: [],
      nichosCr: k.niches, porteCr: ['Nano (até 10 mil)', 'Micro (10 a 100 mil)'], genCr: 'Sem preferência', idCr: 'Sem preferência', regCr: k.near ? 'Pelotas e região' : 'Rio Grande do Sul', nota: 'Sem mínimo', qCr: 1,
      fmt: ['Reels 9:16'], plat: ['Instagram'], qVid: k.videos, dur: 'Até 60 s', tom: ['Descontraído'], mencoes: '', refs: '', nao: '',
      rev: '2 rodadas', uso: k.uso, excl: k.excl, envio: 'Não precisa enviar', inicio: '2026-11-06', entrega: k.delivery, publi: '',
    }
    const g = generate(data, brand)
    const row = await prisma.campaign.create({
      data: {
        ownerId: ids[k.owner], clientId: k.client ? clients[k.client] : null, brandName: brand, segment, name: k.name, product: k.name, objective: k.obj, description: k.desc, message: data.msg, cta: null,
        data: data as unknown as Prisma.InputJsonValue, generated: { headline: g.headline, creators: g.creators, content: g.content } as Prisma.InputJsonValue, requirements: g.defaultRequirements as Prisma.InputJsonValue,
        valueCents: cents(k.perVideo), videos: k.videos, creatorsQty: 1, deliveryDate: new Date(k.delivery + 'T00:00:00Z'), exclusiveDays: k.excl === '30 dias' ? 30 : k.excl === '60 dias' ? 60 : 0, imageUse: k.uso,
        status: k.open ? 'OPEN' : 'DRAFT', createdAt: sp(2026, 10, 15, 9, 0),
      },
    })
    campIds[k.key] = row.id
  }

  // propostas (rodadas, mensagens)
  const propIds: Record<number, string> = {}
  for (const p of PROPS) {
    const camp = CAMPS.find((c) => c.key === p.camp)!
    const last = p.rounds[p.rounds.length - 1]
    const segment = (await prisma.campaign.findUniqueOrThrow({ where: { id: campIds[p.camp] } })).segment
    const row = await prisma.proposal.create({
      data: {
        number: p.n, campaignId: campIds[p.camp], contractorId: ids[p.contractor], creatorId: ids[p.creator], status: p.status, origin: 'INVITE',
        brandName: co(p.contractor).name, clientName: p.client ?? null, segment, exclusiveDays: camp.excl === '30 dias' ? 30 : camp.excl === '60 dias' ? 60 : 0,
        videos: camp.videos, campaignName: camp.name, objective: camp.obj, format: 'Reels 9:16', unreadCreator: p.unreadC, unreadContractor: p.unreadK,
        acceptedBy: p.acceptedAt ? (last[0] === 'K' ? 'C' : 'K') : null, acceptedAt: p.acceptedAt ? at(p.acceptedAt) : null,
        createdAt: at(p.rounds[0][5]), updatedAt: at([...p.rounds.map((r) => r[5]), ...p.msgs.map((m) => m[2])].sort((a, b) => +at(b) - +at(a))[0]),
        rounds: { create: p.rounds.map((r, i) => ({ seq: i + 1, by: r[0], valueCents: cents(r[1]), deliveryDate: dBR(r[2]), imageUse: r[3], message: r[4], createdAt: at(r[5]) })) },
        messages: { create: p.msgs.map((m) => ({ by: m[0], text: m[1], createdAt: at(m[2]) })) },
      },
    })
    propIds[p.n] = row.id
  }

  // movimentações + carteiras (ledger com saldo após cada lançamento, em ordem cronológica)
  const events: Array<{ user: string; dt: Date; txId: string; kind: string; amount: number }> = []
  const txRows: Array<Tx & { contractIdx?: number }> = [...TXS]
  for (const p of PROPS.filter((x) => x.status === 'CONTRACT')) {
    const v = cents(p.rounds[p.rounds.length - 1][1])
    const bd = breakdown(v)
    txRows.push({ id: p.trx!, user: p.contractor, kind: 'CONTRACT', status: 'CUSTODIA', desc: CAMPS.find((c) => c.key === p.camp)!.name, cp: CREATORS.find((c) => c.key === p.creator)!.name, value: bd.valueCents / 100, fee: bd.feeCents / 100, method: 'saldo', detail: SALDO, dt: at(p.paid!), contract: p.n })
  }
  const contractIds: Record<number, string> = {}
  // contratos assinados pelas duas partes (PR-1, PR-8, PR-9): modelo, hash, assinaturas, PDF final, custódia e entrega em produção
  for (const p of PROPS.filter((x) => x.status === 'CONTRACT')) {
    const pr = await loadMine(propIds[p.n], ids[p.creator])
    const parties = await loadParties(pr)
    const model = modelFor(pr, parties)
    const bd = breakdown(cents(p.rounds[p.rounds.length - 1][1]))
    const paidAt = at(p.paid!), signedAt = at(p.signedC!)
    const kSig = makeSignature(model, 'k', paidAt), cSig = makeSignature(model, 'c', signedAt)
    const pdf = await buildContractPdf({ model, sigs: { k: kSig, c: cSig }, final: true, doneAt: signedAt })
    const key = newStorageKey('.pdf')
    await storage.put(key, Buffer.from(pdf))
    const c = await prisma.contract.create({
      data: {
        number: model.num, proposalId: pr.id, contractorId: pr.contractorId, creatorId: pr.creatorId, ...bd, deliveryDate: pr.rounds[pr.rounds.length - 1].deliveryDate, imageUse: pr.rounds[pr.rounds.length - 1].imageUse,
        exclusiveDays: pr.exclusiveDays, segment: pr.segment, brandName: brandKey(pr), contractorPaidAt: paidAt, snapshot: model as unknown as Prisma.InputJsonValue, sha256: model.hash,
        contractorSig: kSig as unknown as Prisma.InputJsonValue, creatorSig: cSig as unknown as Prisma.InputJsonValue, signedAt, pdfKey: key, createdAt: paidAt,
        escrow: { create: { payerId: pr.contractorId, creatorId: pr.creatorId, amountCents: bd.valueCents, createdAt: paidAt } },
        delivery: { create: { createdAt: paidAt } },
      },
    })
    contractIds[p.n] = c.id
  }
  for (const t of txRows) {
    await prisma.moneyTx.create({
      data: {
        id: t.id, userId: ids[t.user], kind: t.kind, status: t.status, description: t.desc, counterparty: t.cp ?? null, valueCents: cents(t.value), feeCents: cents(t.fee), totalCents: cents(t.value + t.fee),
        method: t.method, detail: t.detail, idempotencyKey: `seed:${t.id}`, contractId: t.contract ? contractIds[t.contract] : null, createdAt: t.dt,
      },
    })
    if (t.kind === 'RECHARGE') events.push({ user: t.user, dt: t.dt, txId: t.id, kind: 'RECHARGE', amount: cents(t.value) })
    else if (t.kind === 'CONTRACT') {
      events.push({ user: t.user, dt: t.dt, txId: t.id, kind: 'CONTRACT_PAYMENT', amount: -cents(t.value + t.fee) })
      // contratos históricos já liberados ao criador (Marjorie): crédito de liberação na carteira dela
      if (t.status === 'LIBERADO' && t.cp === 'Marjorie Moreira') events.push({ user: 'mm', dt: new Date(t.dt.getTime() + 86_400_000), txId: t.id, kind: 'ESCROW_RELEASE', amount: cents(t.value) })
    } else events.push({ user: t.user, dt: t.dt, txId: t.id, kind: 'WITHDRAWAL', amount: -cents(t.value) })
  }
  const byUser = new Map<string, typeof events>()
  for (const e of events) byUser.set(e.user, [...(byUser.get(e.user) ?? []), e])
  for (const [user, list] of byUser) {
    list.sort((a, b) => +a.dt - +b.dt)
    let bal = 0
    const entries = list.map((e) => { bal += e.amount; if (bal < 0) throw new Error(`saldo negativo no seed (${user})`); return { walletUserId: ids[user], txId: e.txId, kind: e.kind, amountCents: e.amount, balanceAfterCents: bal, createdAt: e.dt } })
    await prisma.ledgerEntry.createMany({ data: entries })
    await prisma.wallet.update({ where: { userId: ids[user] }, data: { balanceCents: bal } })
  }

  // notícias do protótipo (news.js)
  const news = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-data', 'news.json'), 'utf8')) as Array<{ slug: string; category: string; publishedAt: string; readMins: number; title: string; summary: string; paragraphs: string[] }>
  for (const n of news) await prisma.newsArticle.create({ data: { slug: n.slug, category: n.category, publishedAt: new Date(n.publishedAt), readMins: n.readMins, title: n.title, summary: n.summary, paragraphs: n.paragraphs } })

  // comentários recebidos que o protótipo mostra na tela de avaliações (autores que existem no seed)
  const reviews: Array<[string, string, number, string, Date]> = [
    ['dv', 'mm', 5, 'Entrega no prazo, vídeo caprichado e ótima comunicação.', sp(2026, 10, 28, 12, 0)],
    ['fl', 'mm', 5, 'Roteiro criativo e respeitou todo o briefing.', sp(2026, 9, 20, 12, 0)],
    ['la', 'dv', 5, 'Equipe atenciosa e fácil de negociar.', sp(2026, 9, 25, 12, 0)],
    ['bt', 'md', 5, 'Agência organizada, briefing completo e retorno rápido.', sp(2026, 10, 30, 12, 0)],
  ]
  for (const [a, t, stars, comment, createdAt] of reviews) await prisma.review.create({ data: { authorId: ids[a], targetUserId: ids[t], stars, tags: [], comment, createdAt } })

  const w = await prisma.wallet.findMany({ include: { user: { select: { name: true } } } })
  console.log(`Seed ok: ${CREATORS.length + COMPANIES.length} usuários, ${CAMPS.length} campanhas, ${PROPS.length} propostas, ${Object.keys(contractIds).length} contratos assinados, ${news.length} notícias.`)
  for (const x of w.filter((x) => x.balanceCents)) console.log(`  carteira ${x.user.name}: R$ ${(x.balanceCents / 100).toFixed(2).replace('.', ',')}`)
  console.log(`Senha de demonstração de todos os usuários: ${PASSWORD}`)
}
main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
