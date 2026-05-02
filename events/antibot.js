// events/antibot.js
// ── Expulsa bots externos, respeta sub-bots de Hiyuki ────────────────────────

export const event = 'messages.upsert'

export const run = async (conn, { messages, type }) => {
    if (type !== 'notify') return

    const m = messages[0]
    if (!m) return
    if (!m.key?.remoteJid?.endsWith('@g.us')) return
    if (m.key?.fromMe) return

    const msgId = m.key?.id || ''
    if (!(msgId.startsWith('3EB0') && msgId.length === 22)) return

    const sender = m.key?.participant || ''

    // ── Ignorar si es un sub-bot registrado de Hiyuki ────────────────────────
    const subbots = (global.conns || []).filter(c => c.user)
    const esSubBot = subbots.some(c => {
        const subJid = (c.user?.id || '').split(':')[0] + '@s.whatsapp.net'
        return subJid === sender || subJid.split('@')[0] === sender.split('@')[0]
    })
    if (esSubBot) return

    // ── Verificar si el bot es admin ──────────────────────────────────────────
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
        await conn.sendMessage(m.key.remoteJid, {
            delete: {
                remoteJid:   m.key.remoteJid,
                fromMe:      false,
                id:          msgId,
                participant: sender
            }
        })
        await conn.groupParticipantsUpdate(m.key.remoteJid, [sender], 'remove')
        console.log(`✦ [ANTIBOT] Bot externo expulsado: ${sender}`)
    } catch (e) {
        console.error('[ANTIBOT ERROR]', e.message)
    }
}
