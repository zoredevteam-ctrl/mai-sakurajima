// plugins/jadibot-manage.js
// ── Gestión de sub-bots: token, lista, eliminar, pausar, primario ─────────────

import fs from 'fs'
import path from 'path'
import * as ws from 'ws'

const SUBBOT_DIR = './SubBots'

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
                    body:                  '🤖 Sub-Bot System',
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

    // ── #token — obtener token de sesión ──────────────────────────────────────
    if (cmd === 'token') {
        const credsPath = path.join(SUBBOT_DIR, num, 'creds.json')
        if (!fs.existsSync(credsPath)) return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🔑 ✧ ⩾═══════╗\n` +
            `           「 𝖳𝖮𝖪𝖤𝖭 」\n` +
            `╚═══════⩽ ✧ 🔑 ✧ ⩾═══════╝\n` +
            `┣ 🪷 no tienes sesión activa\n` +
            `┣ 🪷 usa *#jadibot* para conectarte\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
        const token = Buffer.from(fs.readFileSync(credsPath, 'utf-8')).toString('base64')
        await sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🔑 ✧ ⩾═══════╗\n` +
            `           「 𝖳𝖮𝖪𝖤𝖭 」\n` +
            `╚═══════⩽ ✧ 🔑 ✧ ⩾═══════╝\n` +
            `┣ 🪷 no compartas esto con nadie (⁠¬⁠_⁠¬⁠)\n` +
            `┣ 🪷 tu token está en el siguiente mensaje\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
        await conn.sendMessage(m.chat, { text: token }, { quoted: m })
    }

    // ── #bots — ver sub-bots activos ──────────────────────────────────────────
    if (cmd === 'bots' || cmd === 'subbots') {
        const activos = (global.conns || []).filter(c => c.user && c.ws?.socket?.readyState !== ws.CLOSED)
        if (!activos.length) return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🤖 ✧ ⩾═══════╗\n` +
            `       「 𝖲𝖴𝖡-𝖡𝖮𝖳𝖲 」\n` +
            `╚═══════⩽ ✧ 🤖 ✧ ⩾═══════╝\n` +
            `┣ 🪷 no hay sub-bots conectados\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
        const lista = activos.map((c, i) =>
            `┣ 🤖 *${i + 1}.* ${c.user.name || 'Sin nombre'} — +${c.user.id?.split('@')[0]}`
        ).join('\n')
        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🤖 ✧ ⩾═══════╗\n` +
            `       「 𝖲𝖴𝖡-𝖡𝖮𝖳𝖲 」\n` +
            `╚═══════⩽ ✧ 🤖 ✧ ⩾═══════╝\n` +
            `┣ 🪷 activos: *${activos.length}*\n` +
            `┣\n` +
            `${lista}\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
    }

    // ── #deletesub — eliminar sesión ──────────────────────────────────────────
    if (cmd === 'deletesub' || cmd === 'delsub') {
        const botDir = path.join(SUBBOT_DIR, num)
        if (!fs.existsSync(botDir)) return sendReply(conn, m,
            `┣ 🪷 no tienes sesión activa para eliminar`
        )
        try {
            fs.rmSync(botDir, { recursive: true, force: true })
            await m.react('🗑️')
            return sendReply(conn, m,
                `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
                `╔═══════⩽ ✧ 🗑️ ✧ ⩾═══════╗\n` +
                `      「 𝖲𝖤𝖲𝖨𝖮𝖭 𝖤𝖫𝖨𝖬𝖨𝖭𝖠𝖣𝖠 」\n` +
                `╚═══════⩽ ✧ 🗑️ ✧ ⩾═══════╝\n` +
                `┣ 🪷 tu sesión fue eliminada correctamente ✅\n` +
                `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
            )
        } catch (e) {
            return sendReply(conn, m, `┣ 🪷 error al eliminar sesión: ${e.message}`)
        }
    }

    // ── #pausesub — pausar sub-bot ────────────────────────────────────────────
    if (cmd === 'pausesub' || cmd === 'stopsub') {
        if (global.conn?.user?.jid === conn.user?.jid) return sendReply(conn, m,
            `┣ 🪷 no puedes pausar el bot principal (⁠¬⁠_⁠¬⁠)`
        )
        await sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🔕 ✧ ⩾═══════╗\n` +
            `     「 𝖲𝖴𝖡-𝖡𝖮𝖳 𝖯𝖠𝖴𝖲𝖠𝖣𝖮 」\n` +
            `╚═══════⩽ ✧ 🔕 ✧ ⩾═══════╝\n` +
            `┣ 🪷 *${conn.user?.name || 'Sub-Bot'}* fue pausado\n` +
            `┣ 🪷 hasta luego (⁠˘⁠︶⁠˘⁠)⁠.⁠｡⁠*⁠♡\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
        try { conn.ws.close() } catch {}
    }

    // ── #setprimary — establecer bot primario ─────────────────────────────────
    if (cmd === 'setprimary' || cmd === 'setbot') {
        if (!m.isGroup) return sendReply(conn, m,
            `┣ 🪷 este comando solo funciona en *grupos*`
        )
        const target = m.mentionedJid?.[0] || m.quoted?.sender
            || (text ? text.replace(/\D/g, '') + '@s.whatsapp.net' : null)
        if (!target) return sendReply(conn, m,
            `┣ 🪷 menciona o responde al bot que quieres establecer como primario`
        )
        if (!global.db?.data?.groups) global.db.data.groups = {}
        if (!global.db.data.groups[m.chat]) global.db.data.groups[m.chat] = {}

        if (global.db.data.groups[m.chat].primaryBot === target) return sendReply(conn, m,
            `┣ 🪷 @${target.split('@')[0]} ya es el bot primario`,
            [target]
        )
        global.db.data.groups[m.chat].primaryBot = target
        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🤖 ✧ ⩾═══════╗\n` +
            `     「 𝖡𝖮𝖳 𝖯𝖱𝖨𝖬𝖠𝖱𝖨𝖮 」\n` +
            `╚═══════⩽ ✧ 🤖 ✧ ⩾═══════╝\n` +
            `┣ 🪷 bot primario: *@${target.split('@')[0]}*\n` +
            `┣ 🪷 solo él responderá en este grupo\n` +
            `┣ 🪷 usa *resetbot* para revertir\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`,
            [target]
        )
    }
}

// ── resetbot sin prefijo ──────────────────────────────────────────────────────
handler.before = async (m, { conn }) => {
    if (!m.isGroup) return
    const body = (m.body || '').trim().toLowerCase()
    if (!['resetbot', 'resetprimario'].includes(body)) return

    const thumb = await getThumb()
    if (!global.db?.data?.groups?.[m.chat]) return
    global.db.data.groups[m.chat].primaryBot = null
    try {
        await conn.sendMessage(m.chat, {
            text:
                `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
                `╔═══════⩽ ✧ ✅ ✧ ⩾═══════╗\n` +
                `        「 𝖱𝖤𝖲𝖤𝖳 𝖡𝖮𝖳 」\n` +
                `╚═══════⩽ ✧ ✅ ✧ ⩾═══════╝\n` +
                `┣ 🪷 todos los bots responden nuevamente ✅\n` +
                `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`,
            contextInfo: { isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.newsletterJid, serverMessageId: -1, newsletterName: global.newsletterName
                },
                externalAdReply: {
                    title: global.botName || 'Hiruka', body: '🤖 Sub-Bot System',
                    mediaType: 1, thumbnail: thumb, renderLargerThumbnail: false, sourceUrl: global.rcanal || ''
                }
            }
        }, { quoted: m })
    } catch {}
    return true
}

handler.command = ['token', 'bots', 'subbots', 'deletesub', 'delsub', 'pausesub', 'stopsub', 'setprimary', 'setbot']
handler.tags    = ['serbot']
export default handler
