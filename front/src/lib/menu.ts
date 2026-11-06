import type { IconName } from '@/components/Icon'
import type { Role } from './types'

export interface MenuItem { href: string; label: string; icon: IconName; children?: Array<{ href: string; label: string }> }

/** Itens e ordem do menu do protótipo (mkMenu), por papel. */
export function menuFor(role: Role): MenuItem[] {
  const c = role === 'CREATOR'
  const perfil: MenuItem = { href: '/perfil', label: 'Perfil', icon: 'user', children: [
    { href: '/perfil', label: 'Visualizar perfil' }, { href: '/perfil/editar', label: 'Editar perfil' },
    ...(c ? [{ href: '/perfil/valores', label: 'Editar valores' }] : []),
    { href: '/perfil/telefone', label: 'Trocar número' }, { href: '/perfil/email', label: 'Trocar email' }, { href: '/perfil/senha', label: 'Trocar senha' },
  ] }
  const mid: MenuItem[] = c
    ? [{ href: '/oportunidades', label: 'Buscar oportunidades', icon: 'search' }, { href: '/portfolio', label: 'Meu portfólio', icon: 'port' }]
    : role === 'BUSINESS'
      ? [{ href: '/criadores', label: 'Buscar criadores', icon: 'search' }, { href: '/campanhas', label: 'Minhas campanhas', icon: 'camp' }]
      : [{ href: '/criadores', label: 'Buscar criadores', icon: 'search' }, { href: '/clientes', label: 'Meus clientes', icon: 'users' }, { href: '/campanhas', label: 'Campanhas', icon: 'camp' }]
  return [
    { href: '/painel', label: 'Painel', icon: 'grid' }, perfil, ...mid,
    { href: '/contatos', label: 'Contatos', icon: 'chat' }, { href: '/entregas', label: 'Entregas', icon: 'check' },
    { href: '/pagamentos', label: 'Pagamentos', icon: 'wallet' }, { href: '/avaliacoes', label: 'Avaliações', icon: 'star' },
    { href: '/ajuda', label: 'Ajuda e suporte', icon: 'help' }, { href: '/configuracoes', label: 'Configurações', icon: 'gear' },
  ]
}
export const roleLabel = (r: Role) => (r === 'CREATOR' ? 'Criador' : r === 'BUSINESS' ? 'Comércio' : 'Agência')
