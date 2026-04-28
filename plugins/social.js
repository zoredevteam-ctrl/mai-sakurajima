// plugins/social.js
import { database } from '../lib/database.js'

const getThumb = async () => {
    try {
        const res = await fetch(global.icono || global.banner || '')
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

const sendReply = async (conn, m, txt, mentions = []) => {
    const thumb = await getThumb()
    try {
        await conn.sendMessage(m.chat, {
            text: txt, mentions,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid,
                    serverMessageId: -1,
                    newsletterName:  global.newsletterName
                },
                externalAdReply: {
                    title:                 global.botName || 'Hiruka Celestial MD',
                    body:                  '💞 Social Hiruka',
                    mediaType:             1,
                    thumbnail:             thumb,
                    renderLargerThumbnail: false,
                    sourceUrl:             global.rcanal || ''
                }
            }
        }, { quoted: m })
    } catch { await m.reply(txt) }
}

const getUser = (jid) => {
    if (!database.data.users) database.data.users = {}
    if (!database.data.users[jid]) database.data.users[jid] = {}
    return database.data.users[jid]
}

const normJid = jid => (jid || '').split('@')[0].split(':')[0] + '@s.whatsapp.net'

let handler = async (m, { conn, command, text }) => {
    const cmd    = command.toLowerCase()
    const sender = normJid(m.sender)
    const user   = getUser(sender)

    // ── #casar ────────────────────────────────────────────────────────────────
    if (cmd === 'casar' || cmd === 'marry') {
        const target = m.mentionedJid?.[0] ? normJid(m.mentionedJid[0]) : m.quoted?.sender ? normJid(m.quoted.sender) : null

        if (!target) return sendReply(conn, m,
            `╔═══════⩽ ✧ 💍 ✧ ⩾═══════╗\n` +
            `           「 𝖢𝖠𝖲𝖠𝖱 」\n` +
            `╚═══════⩽ ✧ 💍 ✧ ⩾═══════╝\n` +
            `┣ 🪷 menciona a quien quieres casar\n` +
            `┣ 🪷 uso: *#casar @usuario*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
        if (target === sender) return sendReply(conn, m,
            `┣ 🪷 no puedes casarte contigo mismo... qué soledad (⁠¬⁠_⁠¬⁠)`
        )
        if (user.casadoCon) return sendReply(conn, m,
            `┣ 🪷 ya estás casado/a con @${user.casadoCon.split('@')[0]} 💍\n` +
            `┣ 🪷 divórciate primero con *#divorcio*`,
            [user.casadoCon]
        )
        const targetUser = getUser(target)
        if (targetUser.casadoCon) return sendReply(conn, m,
            `┣ 🪷 @${target.split('@')[0]} ya está casado/a 💍`,
            [target]
        )

        user.casadoCon       = target
        targetUser.casadoCon = sender

        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 💍 ✧ ⩾═══════╗\n` +
            `           「 𝖢𝖠𝖲𝖠𝖣𝖮𝖲 」\n` +
            `╚═══════⩽ ✧ 💍 ✧ ⩾═══════╝\n` +
            `┣ 🪷 @${sender.split('@')[0]} 💍 @${target.split('@')[0]}\n` +
            `┣ 🪷 ¡ya son una pareja oficial!\n` +
            `┣ 🪷 Hiruka los bendice... a regañadientes (⁠¬⁠_⁠¬⁠)\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`,
            [sender, target]
        )
    }

    // ── #divorcio ─────────────────────────────────────────────────────────────
    if (cmd === 'divorcio' || cmd === 'divorce') {
        if (!user.casadoCon) return sendReply(conn, m,
            `┣ 🪷 no estás casado/a con nadie. qué vida tan tranquila (⁠¬⁠_⁠¬⁠)`
        )
        const exJid    = user.casadoCon
        const exUser   = getUser(exJid)
        exUser.casadoCon = null
        user.casadoCon   = null

        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 💔 ✧ ⩾═══════╗\n` +
            `          「 𝖣𝖨𝖵𝖮𝖱𝖢𝖨𝖮 」\n` +
            `╚═══════⩽ ✧ 💔 ✧ ⩾═══════╝\n` +
            `┣ 🪷 @${sender.split('@')[0]} se divorció de @${exJid.split('@')[0]}\n` +
            `┣ 🪷 qué dramático. ni Hiruka se esperaba esto 💔\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`,
            [sender, exJid]
        )
    }

    // ── #adoptar ──────────────────────────────────────────────────────────────
    if (cmd === 'adoptar' || cmd === 'adopt') {
        const target = m.mentionedJid?.[0] ? normJid(m.mentionedJid[0]) : m.quoted?.sender ? normJid(m.quoted.sender) : null

        if (!target) return sendReply(conn, m,
            `╔═══════⩽ ✧ 👨‍👦 ✧ ⩾═══════╗\n` +
            `          「 𝖠𝖣𝖮𝖯𝖳𝖠𝖱 」\n` +
            `╚═══════⩽ ✧ 👨‍👦 ✧ ⩾═══════╝\n` +
            `┣ 🪷 menciona a quien quieres adoptar\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
        if (target === sender) return sendReply(conn, m,
            `┣ 🪷 no puedes adoptarte a ti mismo... eso no funciona así (⁠¬⁠_⁠¬⁠)`
        )
        if (!user.hijos) user.hijos = []
        if (user.hijos.includes(target)) return sendReply(conn, m,
            `┣ 🪷 @${target.split('@')[0]} ya es tu hij@`,
            [target]
        )
        if (user.hijos.length >= 5) return sendReply(conn, m,
            `┣ 🪷 ya tienes 5 hijos. con eso es suficiente (⁠¬⁠_⁠¬⁠)`
        )

        user.hijos.push(target)
        const targetUser = getUser(target)
        targetUser.padreOmadre = sender

        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 👨‍👦 ✧ ⩾═══════╗\n` +
            `          「 𝖠𝖣𝖮𝖯𝖢𝖨𝖮𝖭 」\n` +
            `╚═══════⩽ ✧ 👨‍👦 ✧ ⩾═══════╝\n` +
            `┣ 🪷 @${sender.split('@')[0]} adoptó a @${target.split('@')[0]} 🎊\n` +
            `┣ 🪷 hijos: *${user.hijos.length}/5*\n` +
            `┣ 🪷 Hiruka espera que seas buen padre/madre (⁠¬⁠_⁠¬⁠)\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`,
            [sender, target]
        )
    }

    // ── #userinfo ─────────────────────────────────────────────────────────────
    if (cmd === 'userinfo' || cmd === 'info') {
        const target     = m.mentionedJid?.[0] ? normJid(m.mentionedJid[0]) : m.quoted?.sender ? normJid(m.quoted.sender) : sender
        const targetUser = getUser(target)
        const targetNum  = target.split('@')[0]
        const nombre     = targetUser.name || m.pushName || targetNum
        const casado     = targetUser.casadoCon ? `@${targetUser.casadoCon.split('@')[0]}` : 'soltero/a'
        const hijos      = targetUser.hijos?.length || 0
        const warns      = targetUser.warning || 0
        const premium    = targetUser.premium ? '✅' : '❌'
        const money      = (targetUser.money || 0).toLocaleString()
        const level      = targetUser.level || 1

        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 👤 ✧ ⩾═══════╗\n` +
            `        「 𝖴𝖲𝖤𝖱 𝖨𝖭𝖥𝖮 」\n` +
            `╚═══════⩽ ✧ 👤 ✧ ⩾═══════╝\n` +
            `┣ 🪷 nombre: *${nombre}*\n` +
            `┣ 🪷 número: *+${targetNum}*\n` +
            `┣ 🪷 nivel: *${level}*\n` +
            `┣ 🪷 coins: *$${money}*\n` +
            `┣ 🪷 premium: ${premium}\n` +
            `┣ 🪷 warns: *${warns}/3*\n` +
            `┣ 🪷 estado: *${casado}*\n` +
            `┣ 🪷 hijos: *${hijos}*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`,
            [target]
        )
    }
}

handler.command = ['casar', 'marry', 'divorcio', 'divorce', 'adoptar', 'adopt', 'userinfo', 'info']
export default handler
