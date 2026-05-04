import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { sticker } from '../lib/sticker.js'
import { spawn } from 'child_process'
import { tmpdir } from 'os'
import { writeFileSync, readFileSync, unlinkSync, existsSync } from 'fs'
import { join } from 'path'
import Crypto from 'crypto'
import FormData from 'form-data'
import * as cheerio from 'cheerio'

const tmpFile = (ext) => join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`)

const sendStyled = async (conn, m, text) => {
    try {
        const r     = await fetch(global.icono || global.banner || '')
        const thumb = r.ok ? Buffer.from(await r.arrayBuffer()) : null
        return conn.sendMessage(m.chat, {
            text,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid,
                    serverMessageId: -1,
                    newsletterName:  global.newsletterName
                },
                externalAdReply: {
                    title:                 global.botName || 'Hiyuki Celestial MD',
                    body:                  global.botName || 'Hiyuki Celestial MD',
                    mediaType:             1,
                    thumbnail:             thumb,
                    renderLargerThumbnail: false,
                    sourceUrl:             global.rcanal || ''
                }
            }
        }, { quoted: m })
    } catch {
        return conn.sendMessage(m.chat, { text }, { quoted: m })
    }
}

async function addWatermark(buffer, texto) {
    const tmpIn  = tmpFile('jpg')
    const tmpOut = tmpFile('jpg')
    writeFileSync(tmpIn, buffer)

    const safeText = texto.replace(/'/g, "\\'").replace(/:/g, '\\:')

    await new Promise((resolve, reject) => {
        const p = spawn('ffmpeg', [
            '-y', '-i', tmpIn,
            '-vf', `drawtext=text='${safeText}':fontsize=28:fontcolor=white:borderw=2:bordercolor=black:x=w-tw-18:y=h-th-18`,
            '-q:v', '2',
            tmpOut
        ])
        let err = ''
        p.stderr.on('data', d => err += d)
        p.on('close', code => code === 0 ? resolve() : reject(new Error(err)))
    })

    const result = readFileSync(tmpOut)
    unlinkSync(tmpIn)
    unlinkSync(tmpOut)
    return result
}

async function webp2mp4(buffer) {
    const form = new FormData()
    form.append('new-image-url', '')
    form.append('new-image', buffer, 'image.webp')
    const res   = await fetch('https://ezgif.com/webp-to-mp4', { method: 'POST', body: form })
    const $     = cheerio.load(await res.text())
    const form2 = new FormData()
    const obj   = {}
    $('form input[name]').each((_, el) => { obj[$(el).attr('name')] = $(el).val(); form2.append($(el).attr('name'), $(el).val()) })
    const res2  = await fetch('https://ezgif.com/webp-to-mp4/' + obj.file, { method: 'POST', body: form2 })
    const $2    = cheerio.load(await res2.text())
    const url   = new URL($2('div#output > p.outfile > video > source').attr('src'), res2.url).toString()
    return Buffer.from(await (await fetch(url)).arrayBuffer())
}

async function webp2png(buffer) {
    const form = new FormData()
    form.append('new-image-url', '')
    form.append('new-image', buffer, 'image.webp')
    const res   = await fetch('https://ezgif.com/webp-to-png', { method: 'POST', body: form })
    const $     = cheerio.load(await res.text())
    const form2 = new FormData()
    const obj   = {}
    $('form input[name]').each((_, el) => { obj[$(el).attr('name')] = $(el).val(); form2.append($(el).attr('name'), $(el).val()) })
    const res2  = await fetch('https://ezgif.com/webp-to-png/' + obj.file, { method: 'POST', body: form2 })
    const $2    = cheerio.load(await res2.text())
    const url   = new URL($2('div#output > p.outfile > img').attr('src'), res2.url).toString()
    return Buffer.from(await (await fetch(url)).arrayBuffer())
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const isWm    = /^(wm|watermark|marca)$/.test(command)
    const isToImg = /^(toimagen|toimg|s2img)$/.test(command)
    let stiker = false

    try {
        let q    = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''

        if (isToImg) {
            if (!m.quoted) return sendStyled(conn, m,
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ STICKER → IMAGEN ]\n  ⟡ Cita un *sticker* para convertirlo.`
            )
            if (!/webp/.test(mime)) return sendStyled(conn, m,
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ STICKER → IMAGEN ]\n  ⟡ Solo funciona con *stickers* (webp).`
            )

            await m.react('🕒')
            const buf = await downloadMediaMessage(q, 'buffer', {}, { logger: console, reuploadRequest: conn.updateMediaMessage })
            if (!buf) throw new Error('No se pudo descargar el sticker.')

            if (q.msg?.isAnimated) {
                const mp4 = await webp2mp4(buf)
                await conn.sendMessage(m.chat, { video: mp4, caption: '> ✎ 「✿𝐇𝐢𝐲𝐮𝐤𝐢 এ 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 𝐩𝐚𝐭𝐫𝐨𝐧✿」', gifPlayback: true }, { quoted: m })
            } else {
                const png = await webp2png(buf)
                await conn.sendMessage(m.chat, { image: png, caption: '> ✎ 「✿𝐇𝐢𝐲𝐮𝐤𝐢 এ 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 𝐩𝐚𝐭𝐫𝐨𝐧✿」' }, { quoted: m })
            }
            return await m.react('✅')
        }

        if (isWm) {
            if (!/image/.test(mime)) return sendStyled(conn, m,
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ WATERMARK ]\n  ⟡ Cita o envía una *imagen* con *${usedPrefix + command} <texto>*\n  ⟡ Si no pones texto se usará el nombre del bot.`
            )

            await m.react('🕒')
            const buf = await downloadMediaMessage(q, 'buffer', {}, { logger: console, reuploadRequest: conn.updateMediaMessage })
            if (!buf) throw new Error('No se pudo extraer el buffer.')

            const texto = args.join(' ').trim() || global.botName || 'Hiyuki Celestial MD'
            const out   = await addWatermark(buf, texto)

            await conn.sendMessage(m.chat, {
                image:   out,
                caption: '> ✎ 「✿𝐇𝐢𝐲𝐮𝐤𝐢 এ 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 𝐩𝐚𝐭𝐫𝐨𝐧✿」'
            }, { quoted: m })
            return await m.react('✅')
        }

        if (/webp|image|video/g.test(mime)) {
            await m.react('🪄')
            const img = await downloadMediaMessage(q, 'buffer', {}, { logger: console, reuploadRequest: conn.updateMediaMessage })
            if (!img) throw new Error('No se pudo extraer el buffer de la señal.')
            stiker = await sticker(img, false, global.packname || 'Hiyuki System', global.author || 'Adrien | XLR4')
        } else if (args[0] && /https?:\/\//.test(args[0])) {
            stiker = await sticker(false, args[0], global.packname, global.author)
        } else {
            return sendStyled(conn, m,
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR DE MUESTRA ]\n  ⟡ Responde a una *imagen* o *video* con *${usedPrefix + command}*\n  ⟡ También puedes pasar una *URL* directamente.`
            )
        }

        if (stiker) {
            await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
            await m.react('✅')
        }

    } catch (e) {
        console.error(e)
        await m.react('❌')
        sendStyled(conn, m, `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ FALLO DE RENDERIZADO ]\n  ⟡ Detalle: ${e.message}`)
    }
}

handler.help    = ['s', 'wm <texto>', 'toimagen']
handler.command = ['s', 'sticker', 'stiker', 'wm', 'watermark', 'marca', 'toimagen', 'toimg', 's2img']
handler.tags    = ['tools']

export default handler
            
