// plugins/jadibot.js
import fs from 'fs'
import path from 'path'
import pino from 'pino'
import chalk from 'chalk'
import qrcode from 'qrcode'
import * as ws from 'ws'
import { fileURLToPath } from 'url'
import {
    makeWASocket,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion,
    Browsers
} from '@whiskeysockets/baileys'
import { smsg } from '../lib/simple.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname  = path.dirname(__filename)

const SUBBOT_DIR   = './SubBots'
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
                    body:                  '✦ Sub-Bot System',
                    mediaType:             1,
                    thumbnail:             thumb,
                    renderLargerThumbnail: false,
                    sourceUrl:             global.rcanal || ''
                }
            }
        }, { quoted: m })
    } catch { await m.reply(txt) }
}

// ── Texto de vinculación QR ───────────────────────────────────────────────────
const txtQR = `
⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️

╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗
    「 𝖢𝖮𝖭𝖤𝖷𝖨𝖮𝖭 𝖲𝖴𝖡-𝖡𝖮𝖳 𝖰𝖱 」
╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝
┣ 🪷 escanea el QR con otro celular
┣ 🪷 o en la PC para ser Sub-Bot
┣
┣ ✦ 1 » tres puntos arriba a la derecha
┣ ✦ 2 » toca *dispositivos vinculados*
┣ ✦ 3 » escanea el QR para iniciar sesión
┣
┣ 🪷 expira en *45 segundos*
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`.trim()

let handler = async (m, { conn, command, args }) => {
    const cmd = command.toLowerCase()

    // ── Cooldown ──────────────────────────────────────────────────────────────
    if (!global.db?.data?.users) global.db = { data: { users: {}, groups: {} } }
    const userData = global.db.data.users[m.sender] || {}
    const lastSub  = userData.lastSubBot || 0
    const cooldown = 2 * 60 * 1000

    if (Date.now() - lastSub < cooldown) return sendReply(conn, m,
        `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
        `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
        `        「 𝖲𝖴𝖡-𝖡𝖮𝖳 」\n` +
        `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
        `┣ 🪷 espera *${msToTime(cooldown - (Date.now() - lastSub))}* para volver a conectar\n` +
        `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
    )

    // ── Límite ────────────────────────────────────────────────────────────────
    const activos = (global.conns || []).filter(c =>
        c.user && c.ws?.socket?.readyState !== ws.CLOSED
    )
    if (activos.length >= SUBBOT_LIMIT) return sendReply(conn, m,
        `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
        `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
        `        「 𝖲𝖴𝖡-𝖡𝖮𝖳 」\n` +
        `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
        `┣ 🪷 límite alcanzado: *${activos.length}/${SUBBOT_LIMIT}*\n` +
        `┣ 🪷 espera que alguien se desconecte\n` +
        `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
    )

    const num      = m.sender.split('@')[0]
    const botDir   = path.join(SUBBOT_DIR, num)
    const usarCode = cmd === 'code'

    if (!fs.existsSync(botDir)) fs.mkdirSync(botDir, { recursive: true })

    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
    global.db.data.users[m.sender].lastSubBot = Date.now()

    await sendReply(conn, m,
        `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
        `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
        `        「 𝖲𝖴𝖡-𝖡𝖮𝖳 」\n` +
        `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
        `┣ 🪷 iniciando conexión...\n` +
        `┣ 🪷 método: *${usarCode ? 'código de 8 dígitos' : 'código QR'}*\n` +
        `┣ 🪷 espera un momento (⁠✿⁠◡⁠‿⁠◡⁠)\n` +
        `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
    )

    await conectarSubBot({ botDir, m, conn, usarCode })
}

// ── Conectar sub-bot ──────────────────────────────────────────────────────────
async function conectarSubBot({ botDir, m, conn, usarCode }) {
    const { state, saveCreds } = await useMultiFileAuthState(botDir)
    const { version }          = await fetchLatestBaileysVersion()

    let sock = makeWASocket({
        version,
        logger:            pino({ level: 'silent' }),
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys:  makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
        },
        browser:                        usarCode ? Browsers.ubuntu('Chrome') : ['Hiruka Sub-Bot', 'Chrome', '2.0.0'],
        generateHighQualityLinkPreview: true,
        getMessage:                     async () => ({ conversation: 'Hiruka Celestial MD.' })
    })

    const onConnection = async (update) => {
        const { connection, lastDisconnect, qr } = update

        // ── QR ────────────────────────────────────────────────────────────────
        if (qr && !usarCode) {
            const imgBuf = await qrcode.toBuffer(qr, { scale: 8 })
            const sent   = await conn.sendMessage(m.chat, {
                image:   imgBuf,
                caption: txtQR
            }, { quoted: m })
            setTimeout(() => conn.sendMessage(m.chat, { delete: sent.key }).catch(() => {}), 45000)
        }

        // ── Código de vinculación — solo el código limpio ─────────────────────
        if (qr && usarCode) {
            try {
                const code      = await sock.requestPairingCode(m.sender.split('@')[0])
                const formatted = code?.match(/.{1,4}/g)?.join('-') || code

                // Primero manda el aviso
                await sendReply(conn, m,
                    `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
                    `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
                    `     「 𝖢𝖮𝖣𝖨𝖦𝖮 𝖲𝖴𝖡-𝖡𝖮𝖳 」\n` +
                    `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
                    `┣ 🪷 tu código está en el siguiente mensaje\n` +
                    `┣ 🪷 *Ajustes → Dispositivos vinculados*\n` +
                    `┣ 🪷 expira en *45 segundos*\n` +
                    `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
                )

                // Luego manda el código solo, sin nada más
                const sent = await conn.sendMessage(m.chat, {
                    text: formatted
                }, { quoted: m })

                setTimeout(() => conn.sendMessage(m.chat, { delete: sent.key }).catch(() => {}), 45000)
            } catch (e) {
                console.error('[SUBBOT CODE ERROR]', e.message)
            }
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
                    `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
                    `  「 𝖲𝖴𝖡-𝖡𝖮𝖳 𝖢𝖮𝖭𝖤𝖢𝖳𝖠𝖣𝖮 」\n` +
                    `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
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
            console.log(chalk.yellow(`✦ [SUB-BOT] +${path.basename(botDir)} desconectado. código: ${code}`))

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
                        `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
                        `    「 𝖲𝖤𝖲𝖨𝖮𝖭 𝖢𝖤𝖱𝖱𝖠𝖣𝖠 」\n` +
                        `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
                        `┣ 🪷 tu sesión fue cerrada\n` +
                        `┣ 🪷 vuelve a conectarte con *#jadibot*\n` +
                        `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
                }).catch(() => {})
            } else {
                quitarDeConns()
            }
        }
    }

    sock.ev.on('connection.update', onConnection)
    sock.ev.on('creds.update', saveCreds)

    // ── Redirigir mensajes al handler principal ───────────────────────────────
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return
        const raw = messages[0]
        if (!raw?.message) return
        if (raw.key?.remoteJid === 'status@broadcast') return
        if (raw.key?.remoteJid?.endsWith('@newsletter')) return
        try {
            const m2 = smsg(sock, raw)
            const { handler: mainHandler } = await import('../handler.js')
            await mainHandler(m2, sock, global.plugins)
        } catch {}
    })

    // ── Limpiar si no conecta ─────────────────────────────────────────────────
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
