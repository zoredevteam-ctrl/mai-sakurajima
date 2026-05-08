import { database } from '../lib/database.js'

const normJid = jid => (jid || '').split('@')[0].split(':')[0] + '@s.whatsapp.net'

const getIconThumb = async () => {
    try {
        const res = await fetch(global.icono || global.banner || '')
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

// Función de respuesta optimizada para manejar menciones
const sendReply = async (conn, m, txt, mentions = []) => {
    const iconThumb = await getIconThumb()
    try {
        await conn.sendMessage(m.chat, {
            text: txt,
            mentions: mentions,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid || '120363408182996815@newsletter',
                    serverMessageId: -1,
                    newsletterName:  '❄︎ 𝐇𝐢𝐲𝐮𝐤𝐢 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 ❄︎'
                },
                externalAdReply: {
                    title:                 '⚠️ 𝐗𝐋𝐑𝟒 - 𝐒𝐞𝐜𝐮𝐫𝐢𝐭𝐲 𝐀𝐥𝐞𝐫𝐭',
                    body:                  '𝐙𝟎𝐑𝐓 𝐒𝐲𝐬𝐭𝐞𝐦𝐬 𝐀𝐝𝐦𝐢𝐧 𝐓𝐨𝐨𝐥𝐬',
                    mediaType:             1,
                    thumbnail:             iconThumb,
                    renderLargerThumbnail: false,
                    sourceUrl:             global.rcanal || ''
                }
            }
        }, { quoted: m })
    } catch {
        await conn.sendMessage(m.chat, { text: txt, mentions }, { quoted: m })
    }
}

let handler = async (m, { conn, command, text, isGroup, isAdmin, isBotAdmin }) => {
    const cmd = command.toLowerCase()

    // ── PROTOCOLOS DE SEGURIDAD (Filtros) ─────────────────────────────────────
    if (!isGroup) return sendReply(conn, m,
        `╭─── ❄︎ 𝐀𝐂𝐂𝐄𝐒𝐎 𝐃𝐄𝐍𝐄𝐆𝐀𝐃𝐎 ❄︎ ───╮\n` +
        `  ✦ Comando de uso exclusivo en grupos.\n` +
        `╰────────────────────────╯`
    )

    if (!isAdmin) return sendReply(conn, m,
        `╭─── 🚫 𝐈𝐍𝐅𝐑𝐀𝐂𝐂𝐈𝐎́𝐍 𝐗𝐋𝐑𝟒 🚫 ───╮\n` +
        `  ✦ Permisos insuficientes.\n` +
        `  ✦ Solo los administradores pueden\n` +
        `  ordenarme ejecutar esta acción.\n` +
        `╰────────────────────────╯`
    )

    if (!isBotAdmin) return sendReply(conn, m,
        `╭─── ⚠️ 𝐄𝐑𝐑𝐎𝐑 𝐃𝐄 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ⚠️ ───╮\n` +
        `  ✦ Hiyuki requiere privilegios de\n` +
        `  administrador para imponer orden.\n` +
        `╰────────────────────────╯`
    )

    // ── OBTENER OBJETIVO ──────────────────────────────────────────────────────
    const target = m.mentionedJid?.[0]
        ? normJid(m.mentionedJid[0])
        : m.quoted?.sender
        ? normJid(m.quoted.sender)
        : null

    // ── KICK — PROTOCOLO DE EXPULSIÓN ─────────────────────────────────────────
    if (cmd === 'kick' || cmd === 'expulsar') {
        if (!target) return sendReply(conn, m,
            `╭─── 👢 𝐏𝐑𝐎𝐓𝐎𝐂𝐎𝐋𝐎 𝐊𝐈𝐂𝐊 👢 ───╮\n` +
            `  ✦ Se requiere un objetivo válido.\n` +
            `  ✦ Etiqueta o responde al mensaje\n` +
            `  de la basura que deseas eliminar.\n` +
            `╰────────────────────────╯`
        )

        try {
            await m.react('⏱️')
            await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
            await m.react('❄️')
            await sendReply(conn, m,
                `╭─── 👢 𝐎𝐁𝐉𝐄𝐓𝐈𝐕𝐎 𝐄𝐋𝐈𝐌𝐈𝐍𝐀𝐃𝐎 ───╮\n` +
                `  ✦ Usuario: @${target.split('@')[0]}\n` +
                `  ✦ Estado: Erradicado del grupo.\n` +
                `  ✦ "No vuelvas a pisar mi territorio."\n` +
                `╰────────────────────────╯`,
                [target]
            )
        } catch (e) {
            await sendReply(conn, m, `> ❌ _Fallo crítico al intentar expulsar:_ ${e.message}`)
        }
    }

    // ── BAN — EXPULSIÓN Y BLOQUEO ABSOLUTO ────────────────────────────────────
    else if (cmd === 'ban') {
        if (!target) return sendReply(conn, m,
            `╭─── 🔨 𝐏𝐑𝐎𝐓𝐎𝐂𝐎𝐋𝐎 𝐁𝐀𝐍 🔨 ───╮\n` +
            `  ✦ Etiqueta al usuario que será\n` +
            `  borrado de la base de datos.\n` +
            `╰────────────────────────╯`
        )

        try {
            await m.react('⚠️')
            await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
            await conn.updateBlockStatus(target, 'block')
            await m.react('❄️')
            await sendReply(conn, m,
                `╭─── 🔨 𝐄𝐗𝐓𝐄𝐑𝐌𝐈𝐍𝐈𝐎 𝐓𝐎𝐓𝐀𝐋 ───╮\n` +
                `  ✦ Usuario: @${target.split('@')[0]}\n` +
                `  ✦ Sanción: Expulsión + Bloqueo.\n` +
                `  ✦ Hiyuki no perdona traiciones.\n` +
                `╰────────────────────────╯`,
                [target]
            )
        } catch (e) {
            await sendReply(conn, m, `> ❌ _Fallo en protocolo BAN:_ ${e.message}`)
        }
    }

    // ── ADD — INSERCIÓN AL SISTEMA ────────────────────────────────────────────
    else if (cmd === 'add' || cmd === 'agregar') {
        const numero = (text || '').replace(/\D/g, '').trim()
        if (!numero) return sendReply(conn, m,
            `╭─── ➕ 𝐏𝐑𝐎𝐓𝐎𝐂𝐎𝐋𝐎 𝐀𝐃𝐃 ➕ ───╮\n` +
            `  ✦ Especifica el código de país y número.\n` +
            `  ✦ Ej: *#add 573001234567*\n` +
            `╰────────────────────────╯`
        )

        const addJid = `${numero}@s.whatsapp.net`
        try {
            await m.react('⏳')
            const res = await conn.groupParticipantsUpdate(m.chat, [addJid], 'add')
            const status = res?.[0]?.status

            if (status === 408) {
                await m.react('📨')
                await sendReply(conn, m,
                    `╭─── 📨 𝐀𝐋𝐄𝐑𝐓𝐀 𝐃𝐄 𝐏𝐑𝐈𝐕𝐀𝐂𝐈𝐃𝐀𝐃 ───╮\n` +
                    `  ✦ El objetivo *+${numero}* tiene\n` +
                    `  alta seguridad en su cuenta.\n` +
                    `  ✦ Se ha enviado una invitación por DM.\n` +
                    `╰────────────────────────╯`,
                    [addJid]
                )
            } else if (status === 403) {
                await m.react('🚫')
                await sendReply(conn, m, `> 🚫 _El usuario +${numero} bloqueó las invitaciones._`)
            } else {
                await m.react('❄️')
                await sendReply(conn, m,
                    `╭─── ➕ 𝐍𝐔𝐄𝐕𝐎 𝐈𝐍𝐆𝐑𝐄𝐒𝐎 ➕ ───╮\n` +
                    `  ✦ Usuario *+${numero}* forzado\n` +
                    `  con éxito a ingresar al sistema.\n` +
                    `  ✦ Bienvenido al área de control.\n` +
                    `╰────────────────────────╯`,
                    [addJid]
                )
            }
        } catch (e) {
            await sendReply(conn, m, `> ❌ _Fallo al inyectar usuario:_ ${e.message}`)
        }
    }
}

handler.command  = ['kick', 'expulsar', 'ban', 'add', 'agregar']
handler.group    = true
handler.admin    = true
handler.botAdmin = true

export default handler
