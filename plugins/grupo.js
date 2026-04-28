// plugins/grupo.js
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
            text: txt,
            mentions,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid,
                    serverMessageId: -1,
                    newsletterName:  global.newsletterName
                },
                externalAdReply: {
                    title:                 global.botName || 'Hiruka Celestial MD',
                    body:                  '👥 Grupos Hiruka',
                    mediaType:             1,
                    thumbnail:             thumb,
                    renderLargerThumbnail: false,
                    sourceUrl:             global.rcanal || ''
                }
            }
        }, { quoted: m })
    } catch { await m.reply(txt) }
}

let handler = async (m, { conn, command, text, isGroup, isAdmin, isBotAdmin, isOwner }) => {
    const cmd = command.toLowerCase()

    if (!isGroup) return sendReply(conn, m,
        `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
        `       「 𝖲𝖮𝖫𝖮 𝖤𝖭 𝖦𝖱𝖴𝖯𝖮𝖲 」\n` +
        `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
        `┣ 🪷 este comando solo funciona en *grupos*\n` +
        `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
    )

    if (!database.data.groups) database.data.groups = {}
    if (!database.data.groups[m.chat]) database.data.groups[m.chat] = {}
    const group = database.data.groups[m.chat]

    // ── #grupinfo ─────────────────────────────────────────────────────────────
    if (cmd === 'grupinfo' || cmd === 'groupinfo') {
        let meta, admins = [], total = 0
        try {
            meta   = await conn.groupMetadata(m.chat)
            total  = meta.participants.length
            admins = meta.participants.filter(p => p.admin).map(p => `@${(p.id || p.jid).split('@')[0]}`)
        } catch {}

        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 👥 ✧ ⩾═══════╗\n` +
            `        「 𝖦𝖱𝖴𝖯𝖮 𝖨𝖭𝖥𝖮 」\n` +
            `╚═══════⩽ ✧ 👥 ✧ ⩾═══════╝\n` +
            `┣ 🪷 nombre: *${meta?.subject || 'desconocido'}*\n` +
            `┣ 🪷 miembros: *${total}*\n` +
            `┣ 🪷 admins: *${admins.length}*\n` +
            `┣ 🪷 creado: *${meta?.creation ? new Date(meta.creation * 1000).toLocaleDateString('es-CO') : 'desconocido'}*\n` +
            (meta?.desc ? `┣ 🪷 desc: ${meta.desc.slice(0, 100)}\n` : '') +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
    }

    // ── #tagall ───────────────────────────────────────────────────────────────
    if (cmd === 'tagall' || cmd === 'todos') {
        if (!isAdmin && !isOwner) return sendReply(conn, m,
            `┣ 🪷 solo *admins* pueden usar esto (￣ヘ￣)`
        )
        let meta, participants = []
        try {
            meta         = await conn.groupMetadata(m.chat)
            participants = meta.participants.map(p => p.id || p.jid)
        } catch {}

        const mentions = participants
        const lista    = participants.map(jid => `@${jid.split('@')[0]}`).join(' ')
        const msg      = text ? `*${text}*\n\n${lista}` : `📢 *atención grupo*\n\n${lista}`

        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 📢 ✧ ⩾═══════╗\n` +
            `          「 𝖳𝖠𝖦𝖠𝖫𝖫 」\n` +
            `╚═══════⩽ ✧ 📢 ✧ ⩾═══════╝\n` +
            `${msg}\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`,
            mentions
        )
    }

    // ── #antilink ─────────────────────────────────────────────────────────────
    if (cmd === 'antilink') {
        if (!isAdmin && !isOwner) return sendReply(conn, m,
            `┣ 🪷 solo *admins* pueden usar esto`
        )
        const arg = (text || '').trim().toLowerCase()
        if (!arg || !['on', 'off'].includes(arg)) return sendReply(conn, m,
            `╔═══════⩽ ✧ 🔗 ✧ ⩾═══════╗\n` +
            `         「 𝖠𝖭𝖳𝖨𝖫𝖨𝖭𝖪 」\n` +
            `╚═══════⩽ ✧ 🔗 ✧ ⩾═══════╝\n` +
            `┣ 🪷 estado: *${group.antilink ? 'activado ✅' : 'desactivado ❌'}*\n` +
            `┣ 🪷 uso: *#antilink on* o *#antilink off*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
        group.antilink = arg === 'on'
        return sendReply(conn, m,
            `╔═══════⩽ ✧ 🔗 ✧ ⩾═══════╗\n` +
            `         「 𝖠𝖭𝖳𝖨𝖫𝖨𝖭𝖪 」\n` +
            `╚═══════⩽ ✧ 🔗 ✧ ⩾═══════╝\n` +
            `┣ 🪷 antilink: *${arg === 'on' ? 'activado ✅' : 'desactivado ❌'}*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
    }

    // ── #warn ─────────────────────────────────────────────────────────────────
    if (cmd === 'warn') {
        if (!isAdmin && !isOwner) return sendReply(conn, m,
            `┣ 🪷 solo *admins* pueden advertir`
        )
        const target = m.mentionedJid?.[0] || m.quoted?.sender
        if (!target) return sendReply(conn, m,
            `╔═══════⩽ ✧ ⚠️ ✧ ⩾═══════╗\n` +
            `           「 𝖶𝖠𝖱𝖭 」\n` +
            `╚═══════⩽ ✧ ⚠️ ✧ ⩾═══════╝\n` +
            `┣ 🪷 menciona o responde a alguien\n` +
            `┣ 🪷 uso: *#warn @usuario*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
        if (!database.data.users) database.data.users = {}
        if (!database.data.users[target]) database.data.users[target] = { warning: 0 }
        database.data.users[target].warning = (database.data.users[target].warning || 0) + 1
        const warns    = database.data.users[target].warning
        const targetNum = target.split('@')[0]

        if (warns >= 3 && isBotAdmin) {
            await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
            database.data.users[target].warning = 0
            return sendReply(conn, m,
                `╔═══════⩽ ✧ 🚫 ✧ ⩾═══════╗\n` +
                `      「 𝖤𝖷𝖯𝖴𝖫𝖲𝖠𝖣𝖮 」\n` +
                `╚═══════⩽ ✧ 🚫 ✧ ⩾═══════╝\n` +
                `┣ 🪷 @${targetNum} llegó a 3 warns y fue expulsado\n` +
                `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`,
                [target]
            )
        }

        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ ⚠️ ✧ ⩾═══════╗\n` +
            `           「 𝖶𝖠𝖱𝖭 」\n` +
            `╚═══════⩽ ✧ ⚠️ ✧ ⩾═══════╝\n` +
            `┣ 🪷 usuario: *@${targetNum}*\n` +
            `┣ 🪷 advertencias: *${warns}/3*\n` +
            `┣ 🪷 ${warns >= 2 ? '⚠️ una más y será expulsado' : 'cuídese (⁠¬⁠_⁠¬⁠)'}\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`,
            [target]
        )
    }

    // ── #resetwarn ────────────────────────────────────────────────────────────
    if (cmd === 'resetwarn' || cmd === 'unwarn') {
        if (!isAdmin && !isOwner) return sendReply(conn, m, `┣ 🪷 solo *admins*`)
        const target = m.mentionedJid?.[0] || m.quoted?.sender
        if (!target) return sendReply(conn, m, `┣ 🪷 menciona a alguien`)
        if (!database.data.users?.[target]) return sendReply(conn, m, `┣ 🪷 ese usuario no tiene warns`)
        database.data.users[target].warning = 0
        return sendReply(conn, m,
            `╔═══════⩽ ✧ ✅ ✧ ⩾═══════╗\n` +
            `        「 𝖶𝖠𝖱𝖭𝖲 𝖱𝖤𝖲𝖤𝖳 」\n` +
            `╚═══════⩽ ✧ ✅ ✧ ⩾═══════╝\n` +
            `┣ 🪷 warns de @${target.split('@')[0]} reseteados ✅\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`,
            [target]
        )
    }

    // ── #hidemensaje ──────────────────────────────────────────────────────────
    if (cmd === 'hidemensaje' || cmd === 'delete' || cmd === 'del') {
        if (!isAdmin && !isOwner && !isBotAdmin) return sendReply(conn, m,
            `┣ 🪷 necesito ser *admin* para borrar mensajes`
        )
        if (!m.quoted) return sendReply(conn, m,
            `┣ 🪷 responde al mensaje que quieres borrar`
        )
        try {
            await conn.sendMessage(m.chat, { delete: m.quoted.key })
            await m.react('🗑️')
        } catch {
            await sendReply(conn, m, `┣ 🪷 no pude borrar ese mensaje`)
        }
    }
}

// ── Antilink before hook ──────────────────────────────────────────────────────
handler.before = async (m, { conn, isAdmin, isOwner }) => {
    if (!m.isGroup) return
    const group = database.data?.groups?.[m.chat]
    if (!group?.antilink) return
    if (isAdmin || isOwner) return

    const body = m.body || ''
    const tieneLink = /https?:\/\/|wa\.me\/|chat\.whatsapp\.com\//i.test(body)
    if (!tieneLink) return

    try {
        await conn.sendMessage(m.chat, { delete: m.key })
        if (!database.data.users) database.data.users = {}
        if (!database.data.users[m.sender]) database.data.users[m.sender] = { warning: 0 }
        database.data.users[m.sender].warning = (database.data.users[m.sender].warning || 0) + 1
        const warns = database.data.users[m.sender].warning
        await conn.sendMessage(m.chat, {
            text: `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
                  `╔═══════⩽ ✧ 🔗 ✧ ⩾═══════╗\n` +
                  `         「 𝖠𝖭𝖳𝖨𝖫𝖨𝖭𝖪 」\n` +
                  `╚═══════⩽ ✧ 🔗 ✧ ⩾═══════╝\n` +
                  `┣ 🪷 @${m.sender.split('@')[0]} envió un link\n` +
                  `┣ 🪷 mensaje eliminado\n` +
                  `┣ 🪷 warns: *${warns}/3*\n` +
                  `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`,
            mentions: [m.sender]
        })
    } catch {}
    return true
}

handler.command = ['grupinfo', 'groupinfo', 'tagall', 'todos', 'antilink', 'warn', 'resetwarn', 'unwarn', 'hidemensaje', 'delete', 'del']
export default handler
