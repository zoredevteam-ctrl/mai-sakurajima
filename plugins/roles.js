import { database } from '../lib/database.js'

const normJid = jid => (jid || '').split('@')[0].split(':')[0] + '@s.whatsapp.net'

const getIconThumb = async () => {
    try {
        const res = await fetch(global.icono || global.banner || '')
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

const sendReply = async (conn, m, txt) => {
    const iconThumb = await getIconThumb()
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
                    body:                  'Sistema de Roles',
                    mediaType:             1,
                    thumbnail:             iconThumb,
                    renderLargerThumbnail: false,
                    sourceUrl:             global.rcanal || ''
                }
            }
        }, { quoted: m })
    } catch {
        await m.reply(txt)
    }
}

const isOwner = (sender) => {
    const owners = Array.isArray(global.owner) ? global.owner : [global.owner]
    const clean  = sender.split('@')[0].split(':')[0]
    return owners.some(o => String(o).replace(/\D/g, '') === clean)
}

let handler = async (m, { conn, command, text }) => {
    const cmd    = command.toLowerCase()
    const sender = normJid(m.sender)

    // ── Solo el owner puede usar estos comandos ───────────────────────────────
    if (!isOwner(sender)) return sendReply(conn, m,
        `╭─「 🚫 *SIN PERMISO* 」\n` +
        `│ ✿ solo el *owner* puede usar esto\n` +
        `╰────────────────────`
    )

    // ── Obtener objetivo ──────────────────────────────────────────────────────
    const target = m.mentionedJid?.[0]
        ? normJid(m.mentionedJid[0])
        : m.quoted?.sender
        ? normJid(m.quoted.sender)
        : null

    const targetNum = target ? target.split('@')[0] : null

    // ── ADDPREMIUM ────────────────────────────────────────────────────────────
    if (cmd === 'addpremium' || cmd === 'setpremium') {
        if (!target) return sendReply(conn, m,
            `╭─「 💎 *ADD PREMIUM* 」\n` +
            `│ ✿ menciona o responde a alguien\n` +
            `│ ✿ uso: *#addpremium @usuario*\n` +
            `╰────────────────────`
        )

        const user = database.getUser(target)
        if (user.premium) return sendReply(conn, m,
            `╭─「 ⚠️ *YA ES PREMIUM* 」\n` +
            `│ ✿ @${targetNum} ya tiene premium\n` +
            `╰────────────────────`
        )

        user.premium      = true
        user.premiumSince = Date.now()

        return sendReply(conn, m,
            `╭─「 💎 *PREMIUM ACTIVADO* 」\n` +
            `│ ✿ usuario: *@${targetNum}*\n` +
            `│ ✿ ahora tiene acceso *premium* ✅\n` +
            `╰────────────────────`
        )
    }

    // ── DELPREMIUM ────────────────────────────────────────────────────────────
    if (cmd === 'delpremium' || cmd === 'removepremium') {
        if (!target) return sendReply(conn, m,
            `╭─「 💎 *DEL PREMIUM* 」\n` +
            `│ ✿ menciona o responde a alguien\n` +
            `│ ✿ uso: *#delpremium @usuario*\n` +
            `╰────────────────────`
        )

        const user = database.getUser(target)
        if (!user.premium) return sendReply(conn, m,
            `╭─「 ⚠️ *NO ES PREMIUM* 」\n` +
            `│ ✿ @${targetNum} no tiene premium\n` +
            `╰────────────────────`
        )

        user.premium      = false
        user.premiumSince = null

        return sendReply(conn, m,
            `╭─「 💎 *PREMIUM REMOVIDO* 」\n` +
            `│ ✿ usuario: *@${targetNum}*\n` +
            `│ ✿ ya no tiene acceso premium ❌\n` +
            `╰────────────────────`
        )
    }

    // ── ADDOWNER ──────────────────────────────────────────────────────────────
    if (cmd === 'addowner' || cmd === 'setowner') {
        if (!target) return sendReply(conn, m,
            `╭─「 👑 *ADD OWNER* 」\n` +
            `│ ✿ menciona o responde a alguien\n` +
            `│ ✿ uso: *#addowner @usuario*\n` +
            `╰────────────────────`
        )

        if (!Array.isArray(global.owner)) global.owner = [global.owner]
        if (global.owner.includes(targetNum)) return sendReply(conn, m,
            `╭─「 ⚠️ *YA ES OWNER* 」\n` +
            `│ ✿ @${targetNum} ya es owner\n` +
            `╰────────────────────`
        )

        global.owner.push(targetNum)

        // Guardar en base de datos
        const user = database.getUser(target)
        user.isOwner = true

        return sendReply(conn, m,
            `╭─「 👑 *OWNER AÑADIDO* 」\n` +
            `│ ✿ usuario: *@${targetNum}*\n` +
            `│ ✿ ahora es *owner* del bot ✅\n` +
            `╰────────────────────`
        )
    }

    // ── DELOWNER ──────────────────────────────────────────────────────────────
    if (cmd === 'delowner' || cmd === 'removeowner') {
        if (!target) return sendReply(conn, m,
            `╭─「 👑 *DEL OWNER* 」\n` +
            `│ ✿ menciona o responde a alguien\n` +
            `│ ✿ uso: *#delowner @usuario*\n` +
            `╰────────────────────`
        )

        if (!Array.isArray(global.owner)) global.owner = [global.owner]
        if (!global.owner.includes(targetNum)) return sendReply(conn, m,
            `╭─「 ⚠️ *NO ES OWNER* 」\n` +
            `│ ✿ @${targetNum} no es owner\n` +
            `╰────────────────────`
        )

        global.owner = global.owner.filter(o => o !== targetNum)

        const user = database.getUser(target)
        user.isOwner = false

        return sendReply(conn, m,
            `╭─「 👑 *OWNER REMOVIDO* 」\n` +
            `│ ✿ usuario: *@${targetNum}*\n` +
            `│ ✿ ya no es owner del bot ❌\n` +
            `╰────────────────────`
        )
    }

    // ── LISTPREMIUM — ver todos los premium ───────────────────────────────────
    if (cmd === 'listpremium' || cmd === 'premiumlist') {
        const users   = database.data?.users || {}
        const premiums = Object.entries(users).filter(([, u]) => u.premium)

        if (!premiums.length) return sendReply(conn, m,
            `╭─「 💎 *PREMIUM LIST* 」\n` +
            `│ ✿ no hay usuarios premium\n` +
            `╰────────────────────`
        )

        const lista = premiums.map(([jid], i) =>
            `│ ✿ ${i + 1}. *@${jid.split('@')[0]}*`
        ).join('\n')

        return sendReply(conn, m,
            `╭─「 💎 *PREMIUM LIST* 」\n` +
            `│ ✿ total: *${premiums.length}*\n` +
            `│\n` +
            `${lista}\n` +
            `╰────────────────────`
        )
    }

    // ── LISTOWNER — ver todos los owners ─────────────────────────────────────
    if (cmd === 'listowner' || cmd === 'ownerlist') {
        const owners = Array.isArray(global.owner) ? global.owner : [global.owner]

        const lista = owners.map((o, i) =>
            `│ ✿ ${i + 1}. *+${o}*`
        ).join('\n')

        return sendReply(conn, m,
            `╭─「 👑 *OWNER LIST* 」\n` +
            `│ ✿ total: *${owners.length}*\n` +
            `│\n` +
            `${lista}\n` +
            `╰────────────────────`
        )
    }
}

handler.command = [
    'addpremium', 'setpremium', 'delpremium', 'removepremium',
    'addowner',   'setowner',   'delowner',   'removeowner',
    'listpremium', 'premiumlist',
    'listowner',   'ownerlist'
]

export default handler
