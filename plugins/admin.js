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
                    body:                  'Admin Tools',
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

let handler = async (m, { conn, command, text, args, isGroup, isAdmin, isBotAdmin }) => {
    const cmd = command.toLowerCase()

    // ── Verificaciones generales ──────────────────────────────────────────────
    if (!isGroup) return sendReply(conn, m,
        `╭─「 ⚠️ *ERROR* 」\n` +
        `│ ✿ este comando solo funciona en grupos\n` +
        `╰────────────────────`
    )

    if (!isAdmin) return sendReply(conn, m,
        `╭─「 🚫 *SIN PERMISO* 」\n` +
        `│ ✿ solo los *administradores* pueden usar esto\n` +
        `╰────────────────────`
    )

    if (!isBotAdmin) return sendReply(conn, m,
        `╭─「 🤖 *BOT SIN PERMISOS* 」\n` +
        `│ ✿ necesito ser *administrador* del grupo\n` +
        `╰────────────────────`
    )

    // ── Obtener objetivo ──────────────────────────────────────────────────────
    const target = m.mentionedJid?.[0]
        ? normJid(m.mentionedJid[0])
        : m.quoted?.sender
        ? normJid(m.quoted.sender)
        : null

    // ── KICK — expulsar ───────────────────────────────────────────────────────
    if (cmd === 'kick' || cmd === 'expulsar') {
        if (!target) return sendReply(conn, m,
            `╭─「 👢 *KICK* 」\n` +
            `│ ✿ menciona o responde a alguien\n` +
            `│ ✿ uso: *#kick @usuario*\n` +
            `╰────────────────────`
        )

        const targetNum = target.split('@')[0]
        try {
            await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
            await sendReply(conn, m,
                `╭─「 👢 *KICK* 」\n` +
                `│ ✿ usuario: *@${targetNum}*\n` +
                `│ ✿ fue *expulsado* del grupo\n` +
                `╰────────────────────`,
            )
        } catch (e) {
            await sendReply(conn, m,
                `╭─「 ❌ *ERROR* 」\n` +
                `│ ✿ no se pudo expulsar a @${targetNum}\n` +
                `│ ✿ ${e.message}\n` +
                `╰────────────────────`
            )
        }
    }

    // ── BAN — expulsar + bloquear ─────────────────────────────────────────────
    else if (cmd === 'ban') {
        if (!target) return sendReply(conn, m,
            `╭─「 🔨 *BAN* 」\n` +
            `│ ✿ menciona o responde a alguien\n` +
            `│ ✿ uso: *#ban @usuario*\n` +
            `╰────────────────────`
        )

        const targetNum = target.split('@')[0]
        try {
            await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
            await conn.updateBlockStatus(target, 'block')
            await sendReply(conn, m,
                `╭─「 🔨 *BAN* 」\n` +
                `│ ✿ usuario: *@${targetNum}*\n` +
                `│ ✿ fue *expulsado y bloqueado*\n` +
                `╰────────────────────`
            )
        } catch (e) {
            await sendReply(conn, m,
                `╭─「 ❌ *ERROR* 」\n` +
                `│ ✿ no se pudo banear a @${targetNum}\n` +
                `│ ✿ ${e.message}\n` +
                `╰────────────────────`
            )
        }
    }

    // ── ADD — agregar al grupo ─────────────────────────────────────────────────
    else if (cmd === 'add' || cmd === 'agregar') {
        const numero = (text || '').replace(/\D/g, '').trim()
        if (!numero) return sendReply(conn, m,
            `╭─「 ➕ *ADD* 」\n` +
            `│ ✿ uso: *#add <número>*\n` +
            `│ ✿ ejemplo: *#add 573001234567*\n` +
            `│ ✿ incluye código de país\n` +
            `╰────────────────────`
        )

        const addJid = `${numero}@s.whatsapp.net`
        try {
            const res = await conn.groupParticipantsUpdate(m.chat, [addJid], 'add')
            const status = res?.[0]?.status

            // 408 = invitación enviada (privacidad del usuario)
            if (status === 408) {
                await sendReply(conn, m,
                    `╭─「 📨 *INVITACIÓN ENVIADA* 」\n` +
                    `│ ✿ número: *+${numero}*\n` +
                    `│ ✿ tiene privacidad activada\n` +
                    `│ ✿ se le envió una *invitación*\n` +
                    `╰────────────────────`
                )
            } else if (status === 403) {
                await sendReply(conn, m,
                    `╭─「 🚫 *BLOQUEADO* 」\n` +
                    `│ ✿ número: *+${numero}*\n` +
                    `│ ✿ no permite ser agregado\n` +
                    `╰────────────────────`
                )
            } else {
                await sendReply(conn, m,
                    `╭─「 ➕ *AGREGADO* 」\n` +
                    `│ ✿ número: *+${numero}*\n` +
                    `│ ✿ fue *agregado* al grupo ✅\n` +
                    `╰────────────────────`
                )
            }
        } catch (e) {
            await sendReply(conn, m,
                `╭─「 ❌ *ERROR* 」\n` +
                `│ ✿ no se pudo agregar *+${numero}*\n` +
                `│ ✿ ${e.message}\n` +
                `╰────────────────────`
            )
        }
    }
}

handler.command  = ['kick', 'expulsar', 'ban', 'add', 'agregar']
handler.group    = true
handler.admin    = true
handler.botAdmin = true

export default handler
