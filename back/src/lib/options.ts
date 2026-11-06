/** Listas de opções (extraídas do protótipo, OPT). Servidas em GET /meta e usadas na validação. */
export const OPT = {
  nichos: ['Gastronomia', 'Lifestyle', 'Beleza', 'Moda', 'Humor', 'Fitness', 'Saúde e bem-estar', 'Viagem', 'Tecnologia', 'Games', 'Educação', 'Maternidade e família', 'Pets', 'Casa e decoração', 'Finanças', 'Automotivo', 'Esportes', 'Música', 'Arte e design', 'Sustentabilidade'],
  idades: ['18–24', '25–34', '35–44', '45–59', '60+'],
  gen: ['Mulheres', 'Homens', 'Todos os gêneros'],
  reg: ['Pelotas e região', 'Rio Grande do Sul', 'Sul do Brasil', 'Brasil todo'],
  fmt: ['Reels 9:16', 'Stories', 'TikTok', 'YouTube Shorts', 'Foto ou carrossel', 'Vídeo para anúncio (UGC)'],
  idi: ['Português', 'Inglês', 'Espanhol'],
  segE: ['Alimentação', 'Beleza', 'Moda', 'Saúde', 'Serviços', 'Casa e decoração', 'Pets', 'Educação', 'Esportes', 'Tecnologia', 'Outros'],
  canais: ['Loja física', 'Delivery', 'E-commerce', 'Sob encomenda', 'Marketplace'],
  serv: ['Campanhas com creators', 'Gestão de redes sociais', 'Produção de conteúdo', 'Tráfego pago', 'Branding', 'Assessoria de imprensa'],
  porteCr: ['Nano (até 10 mil)', 'Micro (10 a 100 mil)', 'Médio (mais de 100 mil)'],
  generoCriador: ['Mulher', 'Homem', 'Não-binário', 'Prefiro não informar'],
  seguidores: ['Até 10 mil (nano)', '10 a 50 mil (micro)', '50 a 100 mil (micro)', 'Mais de 100 mil'],
  prazo: ['Até 3 dias', 'Até 5 dias', 'Até 7 dias', 'Até 10 dias'],
  porteEmp: ['MEI', 'Microempresa', 'Pequena empresa'],
  orcE: ['Até R$ 200', 'R$ 200 a 500', 'R$ 500 a 1.000', 'Acima de R$ 1.000'],
  orcA: ['Até R$ 1.000', 'R$ 1.000 a 3.000', 'R$ 3.000 a 10.000', 'Acima de R$ 10.000'],
  equipe: ['1 a 5 pessoas', '6 a 15 pessoas', '16 a 50 pessoas', 'Mais de 50 pessoas'],
  nCli: ['1 a 5', '6 a 15', '16 a 30', 'Mais de 30'],
  imgUso: ['Incluso por 90 dias', '+20% por 180 dias', '+40% por 12 meses'],
  objetivos: ['Divulgar lançamento', 'Gerar visitas à loja', 'Aumentar vendas', 'Ganhar seguidores', 'Reconhecimento de marca', 'Gerar conteúdo para anúncios'],
  plataformas: ['Instagram', 'TikTok', 'YouTube'],
  duracoes: ['Até 15 s', 'Até 30 s', 'Até 60 s', 'Até 90 s'],
  tons: ['Descontraído', 'Profissional', 'Humorístico', 'Educativo', 'Inspirador', 'Emocional'],
  genCr: ['Sem preferência', 'Mulher', 'Homem', 'Não-binário'],
  idCr: ['Sem preferência', '18–24', '25–34', '35–44', '45 ou mais'],
  nota: ['Sem mínimo', '4,0 ou mais', '4,5 ou mais'],
  rev: ['1 rodada', '2 rodadas', '3 rodadas'],
  uso: ['60 dias', '90 dias', '180 dias', '12 meses'],
  excl: ['Nenhuma', '30 dias', '60 dias'],
  envio: ['Não precisa enviar', 'Envio pelo contratante', 'Retirada na loja'],
  tags: { c: ['Briefing claro', 'Pagamento em dia', 'Boa comunicação', 'Respeito ao prazo'], k: ['Qualidade', 'Entrega no prazo', 'Boa comunicação', 'Profissionalismo'] },
}
/** Ramo de cada marca de exemplo (protótipo: SEGOF). */
export const REGIAO_PELOTAS = ['pelotas', 'cangucu', 'rio grande', 'capao do leao', 'morro redondo', 'sao lourenco do sul', 'arroio grande', 'turucu', 'pedro osorio', 'cerrito', 'jaguarao']
export function sizeBandOf(followers?: string | null): string {
  if (!followers) return 'Nano'
  if (followers.startsWith('Até 10')) return 'Nano'
  if (followers.startsWith('Mais de 100')) return 'Médio'
  return 'Micro'
}
