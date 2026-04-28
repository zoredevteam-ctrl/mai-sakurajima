import { database } from '../lib/database.js'

const getIconThumb = async () => {
    try {
        const res = await fetch(global.icono || global.banner || '')
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

const sendReply = async (conn, m, txt) => {
    const thumb = await getIconThumb()
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
                    body:                  global.newsletterName || '',
                    mediaType:             1,
                    thumbnail:             thumb,
                    renderLargerThumbnail: false,
                    sourceUrl:             global.rcanal || ''
                }
            }
        }, { quoted: m })
    } catch {
        await m.reply(txt)
    }
}

let handler = async (m, { conn, command, text, isGroup, isAdmin, isOwner }) => {
    if (!isGroup) return sendReply(conn, m,
        `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
        `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
        `       「 𝖲𝖮𝖫𝖮 𝖤𝖭 𝖦𝖱𝖴𝖯𝖮𝖲 」\n` +
        `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
        `┣ 🪷 este comando solo funciona en *grupos*\n` +
        `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
    )

    if (!isAdmin && !isOwner) return sendReply(conn, m,
        `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
        `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
        `   「 𝖲𝖮𝖫𝖮 𝖠𝖣𝖬𝖨𝖭𝖨𝖲𝖳𝖱𝖠𝖣𝖮𝖱𝖤𝖲 」\n` +
        `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
        `┣ 🪷 necesitas ser *admin* para esto\n` +
        `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
    )

    if (!database.data.groups) database.data.groups = {}
    if (!database.data.groups[m.chat]) database.data.groups[m.chat] = {}

    const group   = database.data.groups[m.chat]
    const arg     = (text || '').trim().toLowerCase()
    const cmd     = command.toLowerCase()

    // ── #welcome on/off ───────────────────────────────────────────────────────
    if (cmd === 'welcome' || cmd === 'bienvenida') {
        if (!arg || (arg !== 'on' && arg !== 'off')) return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🪷 ✧ ⩾═══════╗\n` +
            `         「 𝖶𝖤𝖫𝖢𝖮𝖬𝖤 」\n` +
            `╚═══════⩽ ✧ 🪷 ✧ ⩾═══════╝\n` +
            `┣ 🪷 estado: *${group.welcome ? 'activado ✅' : 'desactivado ❌'}*\n` +
            `┣ 🪷 uso: *#welcome on* o *#welcome off*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )

        group.welcome = arg === 'on'

        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🪷 ✧ ⩾═══════╗\n` +
            `         「 𝖶𝖤𝖫𝖢𝖮𝖬𝖤 」\n` +
            `╚═══════⩽ ✧ 🪷 ✧ ⩾═══════╝\n` +
            `┣ 🪷 bienvenida: *${arg === 'on' ? 'activada ✅' : 'desactivada ❌'}*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
    }

    // ── #goodbye on/off ───────────────────────────────────────────────────────
    if (cmd === 'goodbye' || cmd === 'despedida') {
        if (!arg || (arg !== 'on' && arg !== 'off')) return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
            `        「 𝖦𝖮𝖮𝖣𝖡𝖸𝖤 」\n` +
            `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
            `┣ 🪷 estado: *${group.goodbye ? 'activado ✅' : 'desactivado ❌'}*\n` +
            `┣ 🪷 uso: *#goodbye on* o *#goodbye off*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )

        group.goodbye = arg === 'on'

        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
            `        「 𝖦𝖮𝖮𝖣𝖡𝖸𝖤 」\n` +
            `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
            `┣ 🪷 despedida: *${arg === 'on' ? 'activada ✅' : 'desactivada ❌'}*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
    }
}

handler.command = ['welcome', 'bienvenida', 'goodbye', 'despedida']
export default handler
