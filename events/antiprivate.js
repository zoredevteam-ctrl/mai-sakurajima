// events/antiprivate.js

export const event = 'messages.upsert'

export const run = async (conn, { messages, type }) => {
    if (type !== 'notify') return

    const m = messages[0]
    if (!m?.message) return

    const jid = m.key?.remoteJid || ''

    // Solo chats privados
    if (jid.endsWith('@g.us')) return
    if (jid === 'status@broadcast') return
    if (jid.endsWith('@newsletter')) return
    if (m.key?.fromMe) return

    // Ignorar ciertos textos
    const body = m.message?.conversation || m.message?.extendedTextMessage?.text || ''
    const ignorar = ['PIEDRA', 'PAPEL', 'TIJERA', 'serbot', 'jadibot']
    if (ignorar.some(p => body.includes(p))) return

    // Verificar antiprivado en settings
    const settings = global.db?.data?.settings?.[conn.user?.jid] || {}
    if (!settings.antiPrivate) return

    // Verificar si es owner
    const owners  = Array.isArray(global.owner) ? global.owner : [global.owner]
    const senderNum = (m.key?.remoteJid || '').split('@')[0]
    const esOwner = owners.some(o => {
        const v = Array.isArray(o) ? o[0] : o
        return String(v).replace(/\D/g, '') === senderNum
    })
    if (esOwner) return

    try {
        const getThumb = async () => {
            try {
                const res = await fetch(global.icono || global.banner || '')
                if (!res.ok) return null
                return Buffer.from(await res.arrayBuffer())
            } catch { return null }
        }

        const thumb = await getThumb()

        await conn.sendMessage(jid, {
            text:
                `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
                `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
                `     「 𝖠𝖭𝖳𝖨-𝖯𝖱𝖨𝖵𝖠𝖣𝖮 」\n` +
                `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
                `┣ 🪷 hola @${senderNum}\n` +
                `┣ 🪷 los comandos en privado están *desactivados*\n` +
                `┣ 🪷 serás bloqueado automáticamente\n` +
                `┣ 🪷 únete al grupo para usar el bot\n` +
                `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`,
            mentions: [m.key.remoteJid],
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid,
                    serverMessageId: -1,
                    newsletterName:  global.newsletterName
                },
                externalAdReply: {
                    title:                 global.botName || 'Hiruka Celestial MD',
                    body:                  '✦ Sistema de Protección',
                    mediaType:             1,
                    thumbnail:             thumb,
                    renderLargerThumbnail: false,
                    sourceUrl:             global.rcanal || ''
                }
            }
        })

        await conn.updateBlockStatus(jid, 'block')
    } catch (e) {
        console.error('[ANTIPRIVATE ERROR]', e.message)
    }
}
