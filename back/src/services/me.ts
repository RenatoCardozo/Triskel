import { loadProfile } from './profile'
import { prisma } from '../db'

export async function meDto(userId: string) {
  const p = await loadProfile(userId)
  const u = p.user
  // `listed` = aparece em buscas (perfil completo + e-mail validado + preferência). Recalculado a cada leitura/mutação.
  if (u.listed !== p.visible) await prisma.user.update({ where: { id: u.id }, data: { listed: p.visible } })
  return {
    id: u.id, publicId: u.publicId, role: u.role, name: u.name, email: u.email, phone: u.phone,
    verified: p.verified, complete: p.complete, visible: p.visible, visiblePref: u.visible, missing: p.missing,
    avatarUrl: u.avatarFileId ? `/files/${u.avatarFileId}` : null, coverUrl: u.coverFileId ? `/files/${u.coverFileId}` : null,
    prefs: { push: u.prefPush, email: u.prefEmail, weekly: u.prefWeekly },
    profile: p.api,
  }
}
