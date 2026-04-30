// events/antibot.js
// ── Siempre activo — expulsa bots externos automáticamente ────────────────────

export const event = 'messages.upsert'

export const run = async (conn, { messages, type }) => {
    if (type !== 'notify') return

    const m = messages[0]
    if (!m) return
    if (!m.key?.remoteJid?.endsWith('@g.us')) return
    if (m.key?.fromMe) return

    const msgId = m.key?.id || ''
    if (!(msgId.startsWith('3EB0') && msgId.length === 22)) return

    // Verificar si el bot es admin
    let isBotAdmin = false
    try {
        const meta   = await conn.groupMetadata(m.key.remoteJid)
        const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net'
        isBotAdmin   = meta.participants.some(p =>
            (p.id === botJid || p.jid === botJid) && (p.admin || p.isAdmin || p.isSuperAdmin)
        )
    } catch {}

    if (!isBotAdmin) return

    try {
        // Borrar mensaje del bot externo
        await conn.sendMessage(m.key.remoteJid, {
            delete: {
                remoteJid:   m.key.remoteJid,
                fromMe:      false,
                id:          msgId,
                participant: m.key.participant
            }
        })

        // Expulsar al bot externo
        await conn.groupParticipantsUpdate(m.key.remoteJid, [m.key.participant], 'remove')

        console.log(`✦ [ANTIBOT] Bot externo expulsado: ${m.key.participant}`)
    } catch (e) {
        console.error('[ANTIBOT ERROR]', e.message)
    }
}
