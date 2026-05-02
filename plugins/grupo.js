// plugins/grupo.js
import { database } from '../lib/database.js'

const getThumb = async () => {
    try {
        const res = await fetch(global.icono || global.banner || '')
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

const send = async (conn, m, txt, mentions = []) => {
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
                    title:                 global.botName || 'Hiyuki',
                    body:                  global.newsletterName || '',
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

    if (!isGroup) return send(conn, m, `⟪❀⟫ este comando solo funciona en grupos「👑」`)

    if (!database.data.groups) database.data.groups = {}
    if (!database.data.groups[m.chat]) database.data.groups[m.chat] = {}
    const group = database.data.groups[m.chat]

    // ── #grupinfo ─────────────────────────────────────────────────────────────
    if (cmd === 'grupinfo' || cmd === 'groupinfo') {
        let meta
        try { meta = await conn.groupMetadata(m.chat) } catch {}
        const admins = meta?.participants?.filter(p => p.admin)?.length || 0
        const total  = meta?.participants?.length || 0
        const fecha  = meta?.creation ? new Date(meta.creation * 1000).toLocaleDateString('es-CO') : 'desconocido'

        return send(conn, m,
            `⟪❀⟫ *${meta?.subject || 'Grupo'}*\n` +
            `✎ miembros: ${total}\n` +
            `✎ admins: ${admins}\n` +
            `✎ creado: ${fecha}\n` +
            (meta?.desc ? `✎ desc: ${meta.desc.slice(0, 100)}` : '')
        )
    }

    // ── #link ─────────────────────────────────────────────────────────────────
    if (cmd === 'link') {
        if (!isAdmin && !isOwner) return send(conn, m, `⟪❀⟫ solo admins pueden obtener el link「👑」`)
        if (!isBotAdmin) return send(conn, m, `⟪❀⟫ necesito ser admin para obtener el link「👑」`)
        try {
            const code = await conn.groupInviteCode(m.chat)
            return send(conn, m, `⟪❀⟫ link del grupo\n✎ https://chat.whatsapp.com/${code}「👑」`)
        } catch {
            return send(conn, m, `⟪❀⟫ no pude obtener el link「👑」`)
        }
    }

    // ── #tagall ───────────────────────────────────────────────────────────────
    if (cmd === 'tagall' || cmd === 'todos') {
        if (!isAdmin && !isOwner) return send(conn, m, `⟪❀⟫ solo admins pueden usar esto「👑」`)
        let participants = []
        try {
            const meta = await conn.groupMetadata(m.chat)
            participants = meta.participants.map(p => p.id || p.jid)
        } catch {}
        const lista    = participants.map(jid => `@${jid.split('@')[0]}`).join(' ')
        const mentions = participants
        return send(conn, m,
            `⟪❀⟫ ${text ? `*${text}*\n` : ''}${lista}「👑」`,
            mentions
        )
    }

    // ── #promote ──────────────────────────────────────────────────────────────
    if (cmd === 'promote' || cmd === 'admin') {
        if (!isAdmin && !isOwner) return send(conn, m, `⟪❀⟫ solo admins pueden usar esto「👑」`)
        if (!isBotAdmin) return send(conn, m, `⟪❀⟫ necesito ser admin para esto「👑」`)
        const target = m.mentionedJid?.[0] || m.quoted?.sender
        if (!target) return send(conn, m, `⟪❀⟫ menciona a alguien「👑」`)
        try {
            await conn.groupParticipantsUpdate(m.chat, [target], 'promote')
            return send(conn, m, `⟪❀⟫ @${target.split('@')[0]} ahora es admin「👑」`, [target])
        } catch {
            return send(conn, m, `⟪❀⟫ no pude dar admin「👑」`)
        }
    }

    // ── #demote ───────────────────────────────────────────────────────────────
    if (cmd === 'demote' || cmd === 'unadmin') {
        if (!isAdmin && !isOwner) return send(conn, m, `⟪❀⟫ solo admins pueden usar esto「👑」`)
        if (!isBotAdmin) return send(conn, m, `⟪❀⟫ necesito ser admin para esto「👑」`)
        const target = m.mentionedJid?.[0] || m.quoted?.sender
        if (!target) return send(conn, m, `⟪❀⟫ menciona a alguien「👑」`)
        try {
            await conn.groupParticipantsUpdate(m.chat, [target], 'demote')
            return send(conn, m, `⟪❀⟫ @${target.split('@')[0]} ya no es admin「👑」`, [target])
        } catch {
            return send(conn, m, `⟪❀⟫ no pude quitar admin「👑」`)
        }
    }

    // ── #cerrar ───────────────────────────────────────────────────────────────
    if (cmd === 'cerrar' || cmd === 'close') {
        if (!isAdmin && !isOwner) return send(conn, m, `⟪❀⟫ solo admins pueden usar esto「👑」`)
        if (!isBotAdmin) return send(conn, m, `⟪❀⟫ necesito ser admin para esto「👑」`)
        try {
            await conn.groupSettingUpdate(m.chat, 'announcement')
            return send(conn, m, `⟪❀⟫ grupo cerrado, solo admins pueden escribir「👑」`)
        } catch {
            return send(conn, m, `⟪❀⟫ no pude cerrar el grupo「👑」`)
        }
    }

    // ── #abrir ────────────────────────────────────────────────────────────────
    if (cmd === 'abrir' || cmd === 'open') {
        if (!isAdmin && !isOwner) return send(conn, m, `⟪❀⟫ solo admins pueden usar esto「👑」`)
        if (!isBotAdmin) return send(conn, m, `⟪❀⟫ necesito ser admin para esto「👑」`)
        try {
            await conn.groupSettingUpdate(m.chat, 'not_announcement')
            return send(conn, m, `⟪❀⟫ grupo abierto, todos pueden escribir「👑」`)
        } catch {
            return send(conn, m, `⟪❀⟫ no pude abrir el grupo「👑」`)
        }
    }

    // ── #antilink ─────────────────────────────────────────────────────────────
    if (cmd === 'antilink') {
        if (!isAdmin && !isOwner) return send(conn, m, `⟪❀⟫ solo admins pueden usar esto「👑」`)
        const arg = (text || '').trim().toLowerCase()
        if (!['on', 'off'].includes(arg)) return send(conn, m,
            `⟪❀⟫ antilink: *${group.antilink ? 'activado' : 'desactivado'}*\n✎ uso: *#antilink on/off*「👑」`
        )
        group.antilink = arg === 'on'
        return send(conn, m, `⟪❀⟫ antilink *${arg === 'on' ? 'activado' : 'desactivado'}*「👑」`)
    }

    // ── #warn ─────────────────────────────────────────────────────────────────
    if (cmd === 'warn') {
        if (!isAdmin && !isOwner) return send(conn, m, `⟪❀⟫ solo admins pueden advertir「👑」`)
        const target = m.mentionedJid?.[0] || m.quoted?.sender
        if (!target) return send(conn, m, `⟪❀⟫ menciona a alguien「👑」`)
        if (!database.data.users) database.data.users = {}
        if (!database.data.users[target]) database.data.users[target] = { warning: 0 }
        database.data.users[target].warning = (database.data.users[target].warning || 0) + 1
        const warns = database.data.users[target].warning

        if (warns >= 3 && isBotAdmin) {
            await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
            database.data.users[target].warning = 0
            return send(conn, m, `⟪❀⟫ @${target.split('@')[0]} fue expulsado por 3 warns「👑」`, [target])
        }
        return send(conn, m, `⟪❀⟫ @${target.split('@')[0]} tiene *${warns}/3* warns「👑」`, [target])
    }

    // ── #resetwarn ────────────────────────────────────────────────────────────
    if (cmd === 'resetwarn' || cmd === 'unwarn') {
        if (!isAdmin && !isOwner) return send(conn, m, `⟪❀⟫ solo admins「👑」`)
        const target = m.mentionedJid?.[0] || m.quoted?.sender
        if (!target) return send(conn, m, `⟪❀⟫ menciona a alguien「👑」`)
        if (database.data.users?.[target]) database.data.users[target].warning = 0
        return send(conn, m, `⟪❀⟫ warns de @${target.split('@')[0]} reseteados「👑」`, [target])
    }

    // ── #hidemensaje ──────────────────────────────────────────────────────────
    if (cmd === 'hidemensaje' || cmd === 'delete' || cmd === 'del') {
        if (!isAdmin && !isOwner) return send(conn, m, `⟪❀⟫ solo admins「👑」`)
        if (!m.quoted) return send(conn, m, `⟪❀⟫ responde al mensaje que quieres borrar「👑」`)
        try {
            await conn.sendMessage(m.chat, { delete: m.quoted.key })
            await m.react('🗑️')
        } catch {
            return send(conn, m, `⟪❀⟫ no pude borrar ese mensaje「👑」`)
        }
    }

    // ── #welcome on/off ───────────────────────────────────────────────────────
    if (cmd === 'welcome' || cmd === 'bienvenida') {
        if (!isAdmin && !isOwner) return send(conn, m, `⟪❀⟫ solo admins「👑」`)
        const arg = (text || '').trim().toLowerCase()
        if (!['on', 'off'].includes(arg)) return send(conn, m,
            `⟪❀⟫ welcome: *${group.welcome ? 'activado' : 'desactivado'}*\n✎ uso: *#welcome on/off*「👑」`
        )
        group.welcome = arg === 'on'
        return send(conn, m, `⟪❀⟫ bienvenida *${arg === 'on' ? 'activada' : 'desactivada'}*「👑」`)
    }

    // ── #goodbye on/off ───────────────────────────────────────────────────────
    if (cmd === 'goodbye' || cmd === 'despedida') {
        if (!isAdmin && !isOwner) return send(conn, m, `⟪❀⟫ solo admins「👑」`)
        const arg = (text || '').trim().toLowerCase()
        if (!['on', 'off'].includes(arg)) return send(conn, m,
            `⟪❀⟫ goodbye: *${group.goodbye ? 'activado' : 'desactivado'}*\n✎ uso: *#goodbye on/off*「👑」`
        )
        group.goodbye = arg === 'on'
        return send(conn, m, `⟪❀⟫ despedida *${arg === 'on' ? 'activada' : 'desactivada'}*「👑」`)
    }
}

// ── Antilink before hook ──────────────────────────────────────────────────────
handler.before = async (m, { conn, isAdmin, isOwner }) => {
    if (!m.isGroup) return
    const group = database.data?.groups?.[m.chat]
    if (!group?.antilink) return
    if (isAdmin || isOwner) return

    const body      = m.body || ''
    const tieneLink = /https?:\/\/|wa\.me\/|chat\.whatsapp\.com\//i.test(body)
    if (!tieneLink) return

    try {
        await conn.sendMessage(m.chat, { delete: m.key })
        if (!database.data.users) database.data.users = {}
        if (!database.data.users[m.sender]) database.data.users[m.sender] = { warning: 0 }
        database.data.users[m.sender].warning = (database.data.users[m.sender].warning || 0) + 1
        const warns = database.data.users[m.sender].warning

        const thumb = await getThumb()
        await conn.sendMessage(m.chat, {
            text: `⟪❀⟫ @${m.sender.split('@')[0]} envió un link — eliminado. warns: *${warns}/3*「👑」`,
            mentions: [m.sender],
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid,
                    serverMessageId: -1,
                    newsletterName:  global.newsletterName
                },
                externalAdReply: {
                    title: global.botName || 'Hiyuki', body: global.newsletterName || '',
                    mediaType: 1, thumbnail: thumb, renderLargerThumbnail: false, sourceUrl: global.rcanal || ''
                }
            }
        })
    } catch {}
    return true
}

handler.command = [
    'grupinfo', 'groupinfo',
    'link',
    'tagall', 'todos',
    'promote', 'admin',
    'demote', 'unadmin',
    'cerrar', 'close',
    'abrir', 'open',
    'antilink',
    'warn', 'resetwarn', 'unwarn',
    'hidemensaje', 'delete', 'del',
    'welcome', 'bienvenida',
    'goodbye', 'despedida'
]
export default handler
