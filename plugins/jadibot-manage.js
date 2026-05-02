// plugins/jadibot-manage.js
import fs from 'fs'
import path from 'path'
import * as ws from 'ws'
import { database } from '../lib/database.js'

const SUBBOT_DIR = './SubBots'

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

let handler = async (m, { conn, command, text, isOwner }) => {
    const cmd = command.toLowerCase()
    const num = m.sender.split('@')[0]

    // ── #token ────────────────────────────────────────────────────────────────
    if (cmd === 'token') {
        const credsPath = path.join(SUBBOT_DIR, num, 'creds.json')
        if (!fs.existsSync(credsPath)) return send(conn, m,
            `⟪❄︎⟫ no tienes sesión activa\n✎ usa *#jadibot* para conectarte❄︎`
        )
        const token = Buffer.from(fs.readFileSync(credsPath, 'utf-8')).toString('base64')
        await send(conn, m, `⟪❄︎⟫ no compartas tu token con nadie❄︎`)
        await conn.sendMessage(m.chat, { text: token }, { quoted: m })
    }

    // ── #bots ─────────────────────────────────────────────────────────────────
    if (cmd === 'bots' || cmd === 'subbots') {
        const activos = (global.conns || []).filter(c => c.user && c.ws?.socket?.readyState !== ws.CLOSED)
        if (!activos.length) return send(conn, m, `⟪❄︎⟫ no hay sub-bots conectados❄︎`)
        const lista = activos.map((c, i) =>
            `✎ ${i + 1}. *${c.user.name || 'Sin nombre'}* — +${c.user.id?.split('@')[0]}`
        ).join('\n')
        return send(conn, m, `⟪❄︎⟫ sub-bots activos: *${activos.length}*\n${lista}❄︎`)
    }

    // ── #deletesub ────────────────────────────────────────────────────────────
    if (cmd === 'deletesub' || cmd === 'delsub') {
        const botDir = path.join(SUBBOT_DIR, num)
        if (!fs.existsSync(botDir)) return send(conn, m, `⟪❄︎⟫ no tienes sesión activa❄︎`)
        try {
            fs.rmSync(botDir, { recursive: true, force: true })
            await m.react('🗑️')
            return send(conn, m, `⟪❄︎⟫ sesión eliminada correctamente❄︎`)
        } catch (e) {
            return send(conn, m, `⟪❄︎⟫ error al eliminar: ${e.message}❄︎`)
        }
    }

    // ── #pausesub ─────────────────────────────────────────────────────────────
    if (cmd === 'pausesub' || cmd === 'stopsub') {
        if (global.conn?.user?.jid === conn.user?.jid) return send(conn, m,
            `⟪❄︎⟫ no puedes pausar el bot principal❄︎`
        )
        await send(conn, m, `⟪❄︎⟫ *${conn.user?.name || 'Sub-Bot'}* pausado. hasta luego❄︎`)
        try { conn.ws.close() } catch {}
    }

    // ── #setprimary ───────────────────────────────────────────────────────────
    if (cmd === 'setprimary' || cmd === 'setbot') {
        if (!m.isGroup) return send(conn, m, `⟪❄︎⟫ solo funciona en grupos❄︎`)

        const target = m.mentionedJid?.[0] || m.quoted?.sender
            || (text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : null)

        if (!target) return send(conn, m,
            `⟪❄︎⟫ menciona o responde al bot que quieres como primario❄︎`
        )

        // Usar database en vez de global.db para consistencia
        if (!database.data.groups) database.data.groups = {}
        if (!database.data.groups[m.chat]) database.data.groups[m.chat] = {}

        const targetNum = target.split('@')[0]

        if (database.data.groups[m.chat].primaryBot?.split('@')[0] === targetNum) return send(conn, m,
            `⟪❄︎⟫ @${targetNum} ya es el bot primario❄︎`, [target]
        )

        database.data.groups[m.chat].primaryBot = target

        return send(conn, m,
            `⟪❄︎⟫ bot primario establecido: *@${targetNum}*\n✎ usa *resetbot* para revertir❄︎`,
            [target]
        )
    }
}

// ── resetbot sin prefijo ──────────────────────────────────────────────────────
handler.before = async (m, { conn }) => {
    if (!m.isGroup) return
    const body = (m.body || '').trim().toLowerCase()
    if (!['resetbot', 'resetprimario'].includes(body)) return

    if (!database.data.groups) database.data.groups = {}
    if (!database.data.groups[m.chat]) return

    database.data.groups[m.chat].primaryBot = null

    const thumb = await getThumb()
    try {
        await conn.sendMessage(m.chat, {
            text: `⟪❄︎⟫ bot primario eliminado. todos los bots responden nuevamente❄︎`,
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
    } catch {}
    return true
}

handler.command = ['token', 'bots', 'subbots', 'deletesub', 'delsub', 'pausesub', 'stopsub', 'setprimary', 'setbot']
handler.tags    = ['serbot']
export default handler
