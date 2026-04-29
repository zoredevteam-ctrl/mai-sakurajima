// plugins/antiprivate.js

const getThumb = async () => {
    try {
        const res = await fetch(global.icono || global.banner || '')
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

const sendReply = async (conn, m, txt) => {
    const thumb = await getThumb()
    try {
        await conn.sendMessage(m.chat, {
            text: txt,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid,
                    serverMessageId: -1,
                    newsletterName:  global.newsletterName
                },
                externalAdReply: {
                    title:                 global.botName || 'Hiruka Celestial MD',
                    body:                  '✦ Sistema',
                    mediaType:             1,
                    thumbnail:             thumb,
                    renderLargerThumbnail: false,
                    sourceUrl:             global.rcanal || ''
                }
            }
        }, { quoted: m })
    } catch { await m.reply(txt) }
}

let handler = async (m, { conn, text, isOwner }) => {
    if (!isOwner) return sendReply(conn, m,
        `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
        `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
        `    「 𝖠𝖢𝖢𝖤𝖲𝖮 𝖱𝖤𝖲𝖳𝖱𝖨𝖭𝖦𝖨𝖣𝖮 」\n` +
        `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
        `┣ 🪷 solo el *owner* puede usar esto\n` +
        `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
    )

    if (!global.db) global.db = { data: {} }
    if (!global.db.data) global.db.data = {}
    if (!global.db.data.settings) global.db.data.settings = {}
    if (!global.db.data.settings[conn.user.jid]) global.db.data.settings[conn.user.jid] = {}

    const settings = global.db.data.settings[conn.user.jid]
    const arg      = (text || '').trim().toLowerCase()

    if (!arg || !['on', 'off'].includes(arg)) return sendReply(conn, m,
        `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
        `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
        `     「 𝖠𝖭𝖳𝖨-𝖯𝖱𝖨𝖵𝖠𝖣𝖮 」\n` +
        `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
        `┣ 🪷 estado: *${settings.antiPrivate ? 'activado ✅' : 'desactivado ❌'}*\n` +
        `┣ 🪷 uso: *#antiprivate on* o *#antiprivate off*\n` +
        `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
    )

    settings.antiPrivate = arg === 'on'

    return sendReply(conn, m,
        `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
        `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
        `     「 𝖠𝖭𝖳𝖨-𝖯𝖱𝖨𝖵𝖠𝖣𝖮 」\n` +
        `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
        `┣ 🪷 anti-privado: *${arg === 'on' ? 'activado ✅' : 'desactivado ❌'}*\n` +
        `┣ 🪷 ${arg === 'on' ? 'los chats privados serán bloqueados' : 'los chats privados están permitidos'}\n` +
        `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
    )
}

handler.command = ['antiprivate', 'antiprivado']
handler.owner   = true
export default handler
