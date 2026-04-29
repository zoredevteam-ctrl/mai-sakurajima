// plugins/jadibot.js
import { promises as fsPromises, existsSync } from 'fs'
import path from 'path'
import fs from 'fs'
import pino from 'pino'
import chalk from 'chalk'
import NodeCache from 'node-cache'
import qrcode from 'qrcode'
import * as ws from 'ws'

const {
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion
} = (await import('@whiskeysockets/baileys')).default || await import('@whiskeysockets/baileys')

import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const SUBBOT_DIR = './SubBots'
const SUBBOT_LIMIT = global.subbotlimit || 20

if (!fs.existsSync(SUBBOT_DIR)) fs.mkdirSync(SUBBOT_DIR, { recursive: true })

const msToTime = (ms) => {
    const m = Math.floor((ms / (1000 * 60)) % 60)
    const s = Math.floor((ms / 1000) % 60)
    return `${m}m ${s}s`
}

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

// ── Opciones temporales de conexión ──────────────────────────────────────────
const pendingOpts = {}

// ── Handler principal ─────────────────────────────────────────────────────────
let handler = async (m, { conn, command, args, usedPrefix, isOwner }) => {
    const cmd = command.toLowerCase()

    // ── #jadibot (qr o code) ──────────────────────────────────────────────────
    if (cmd === 'jadibot' || cmd === 'subbot' || cmd === 'qr' || cmd === 'code') {
        const cooldownKey = `subbot_cd_${m.sender}`
        if (!global.db) global.db = { data: { users: {} } }
        const userData = global.db.data.users?.[m.sender] || {}
        const lastSub  = userData.lastSubBot || 0
        const cooldown = 2 * 60 * 1000

        if (Date.now() - lastSub < cooldown) {
            return sendReply(conn, m,
                `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
                `╔═══════⩽ ✧ 🤖 ✧ ⩾═══════╗\n` +
                `        「 𝖲𝖴𝖡-𝖡𝖮𝖳 」\n` +
                `╚═══════⩽ ✧ 🤖 ✧ ⩾═══════╝\n` +
                `┣ 🪷 espera *${msToTime(cooldown - (Date.now() - lastSub))}* para volver a conectar\n` +
                `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
            )
        }

        const activos = global.conns?.filter(c => c.user && c.ws?.socket?.readyState !== ws.CLOSED) || []
        if (activos.length >= SUBBOT_LIMIT) return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🤖 ✧ ⩾═══════╗\n` +
            `        「 𝖲𝖴𝖡-𝖡𝖮𝖳 」\n` +
            `╚═══════⩽ ✧ 🤖 ✧ ⩾═══════╝\n` +
            `┣ 🪷 límite alcanzado: *${activos.length}/${SUBBOT_LIMIT}*\n` +
            `┣ 🪷 espera que alguien se desconecte\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )

        const num    = m.sender.split('@')[0]
        const botDir = path.join(SUBBOT_DIR, num)
        if (!fs.existsSync(botDir)) fs.mkdirSync(botDir, { recursive: true })

        const usarCode = cmd === 'code' || (args[0] && /code/.test(args[0]))

        if (global.db.data.users) global.db.data.users[m.sender] = { ...userData, lastSubBot: Date.now() }

        await sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🤖 ✧ ⩾═══════╗\n` +
            `        「 𝖲𝖴𝖡-𝖡𝖮𝖳 」\n` +
            `╚═══════⩽ ✧ 🤖 ✧ ⩾═══════╝\n` +
            `┣ 🪷 conectando tu número como sub-bot...\n` +
            `┣ 🪷 método: *${usarCode ? 'código de 8 dígitos' : 'código QR'}*\n` +
            `┣ 🪷 espera un momento (⁠✿⁠◡⁠‿⁠◡⁠)\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )

        await conectarSubBot({ botDir, m, conn, usarCode })
    }
}

// ── Conectar sub-bot ──────────────────────────────────────────────────────────
async function conectarSubBot({ botDir, m, conn, usarCode }) {
    const { state, saveCreds } = await useMultiFileAuthState(botDir)
    const { version }          = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        logger:              pino({ level: 'silent' }),
        printQRInTerminal:   false,
        auth: {
            creds: state.creds,
            keys:  makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        browser:             usarCode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Hiruka Sub-Bot', 'Chrome', '2.0.0'],
        generateHighQualityLinkPreview: true
    })

    let isInit = true

    const onConnection = async (update) => {
        const { connection, lastDisconnect, qr } = update

        // ── QR ────────────────────────────────────────────────────────────────
        if (qr && !usarCode) {
            const imgBuf = await qrcode.toBuffer(qr, { scale: 8 })
            const sent   = await conn.sendMessage(m.chat, {
                image:   imgBuf,
                caption:
                    `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
                    `╔═══════⩽ ✧ 📷 ✧ ⩾═══════╗\n` +
                    `         「 𝖢𝖮𝖣𝖨𝖦𝖮 𝖰𝖱 」\n` +
                    `╚═══════⩽ ✧ 📷 ✧ ⩾═══════╝\n` +
                    `┣ 🪷 escanea este QR para conectarte\n` +
                    `┣ 🪷 *Ajustes → Dispositivos vinculados*\n` +
                    `┣ 🪷 expira en *45 segundos* ⏱️\n` +
                    `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
            }, { quoted: m })
            setTimeout(() => conn.sendMessage(m.chat, { delete: sent.key }).catch(() => {}), 45000)
        }

        // ── Código de vinculación ─────────────────────────────────────────────
        if (qr && usarCode) {
            const code      = await sock.requestPairingCode(m.sender.split('@')[0])
            const formatted = code?.match(/.{1,4}/g)?.join('-') || code
            const sent      = await conn.sendMessage(m.chat, {
                text:
                    `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
                    `╔═══════⩽ ✧ 🔑 ✧ ⩾═══════╗\n` +
                    `       「 𝖢𝖮𝖣𝖨𝖦𝖮 𝖲𝖴𝖡-𝖡𝖮𝖳 」\n` +
                    `╚═══════⩽ ✧ 🔑 ✧ ⩾═══════╝\n` +
                    `┣ 🪷 tu código: *${formatted}*\n` +
                    `┣ 🪷 *Ajustes → Dispositivos vinculados*\n` +
                    `┣ 🪷 expira en *45 segundos* ⏱️\n` +
                    `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
            }, { quoted: m })
            setTimeout(() => conn.sendMessage(m.chat, { delete: sent.key }).catch(() => {}), 45000)
        }

        // ── Conectado ─────────────────────────────────────────────────────────
        if (connection === 'open') {
            sock.isInit = true
            if (!Array.isArray(global.conns)) global.conns = []
            global.conns.push(sock)
            const nombre = sock.user?.name || 'Sub-Bot'
            console.log(chalk.cyanBright(`✦ [SUB-BOT] ${nombre} (+${path.basename(botDir)}) conectado ✓`))
            await conn.sendMessage(m.chat, {
                text:
                    `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
                    `╔═══════⩽ ✧ ✅ ✧ ⩾═══════╗\n` +
                    `     「 𝖲𝖴𝖡-𝖡𝖮𝖳 𝖢𝖮𝖭𝖤𝖢𝖳𝖠𝖣𝖮 」\n` +
                    `╚═══════⩽ ✧ ✅ ✧ ⩾═══════╝\n` +
                    `┣ 🪷 nombre: *${nombre}*\n` +
                    `┣ 🪷 ya eres parte de Hiruka ✅\n` +
                    `┣ 🪷 bienvenid@ a la familia (⁠✿⁠◡⁠‿⁠◡⁠)\n` +
                    `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`,
                mentions: [m.sender]
            }, { quoted: m })
        }

        // ── Desconectado ──────────────────────────────────────────────────────
        if (connection === 'close') {
            const code = lastDisconnect?.error?.output?.statusCode
            const num  = path.basename(botDir)
            console.log(chalk.yellow(`✦ [SUB-BOT] +${num} desconectado. código: ${code}`))

            const quitarDeConns = () => {
                if (!Array.isArray(global.conns)) return
                const i = global.conns.indexOf(sock)
                if (i >= 0) global.conns.splice(i, 1)
            }

            if ([428, 408, 500, 515].includes(code)) {
                sock.ev.removeAllListeners()
                quitarDeConns()
                await conectarSubBot({ botDir, m, conn, usarCode })
            } else if ([401, 405, 403].includes(code)) {
                sock.ev.removeAllListeners()
                quitarDeConns()
                try { fs.rmSync(botDir, { recursive: true, force: true }) } catch {}
                await conn.sendMessage(m.sender, {
                    text:
                        `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
                        `╔═══════⩽ ✧ ❌ ✧ ⩾═══════╗\n` +
                        `      「 𝖲𝖤𝖲𝖨𝖮𝖭 𝖢𝖤𝖱𝖱𝖠𝖣𝖠 」\n` +
                        `╚═══════⩽ ✧ ❌ ✧ ⩾═══════╝\n` +
                        `┣ 🪷 tu sesión fue cerrada\n` +
                        `┣ 🪷 vuelve a conectarte con *#jadibot*\n` +
                        `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
                })
            } else {
                quitarDeConns()
            }
        }
    }

    sock.ev.on('connection.update', onConnection)
    sock.ev.on('creds.update', saveCreds)

    // Redirigir mensajes al handler principal
    const { handler: mainHandler } = await import('../handler.js')
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return
        const m2 = messages[0]
        if (!m2?.message) return
        if (m2.key?.remoteJid === 'status@broadcast') return
        try { await mainHandler(m2, sock, global.plugins) } catch {}
    })

    // Limpiar si no conecta
    setInterval(() => {
        if (!sock.user) {
            try { sock.ws.close() } catch {}
            sock.ev.removeAllListeners()
            if (Array.isArray(global.conns)) {
                const i = global.conns.indexOf(sock)
                if (i >= 0) global.conns.splice(i, 1)
            }
        }
    }, 60000)
}

handler.command = ['jadibot', 'subbot', 'qr', 'code']
handler.tags    = ['serbot']
export default handler
