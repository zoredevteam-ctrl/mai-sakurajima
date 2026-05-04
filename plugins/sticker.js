import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { sticker } from '../lib/sticker.js'
import Jimp from 'jimp'
import FormData from 'form-data'
import * as cheerio from 'cheerio'

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

async function addWatermark(buffer, texto) {
    const img   = await Jimp.read(buffer)
    const w     = img.getWidth()
    const h     = img.getHeight()
    const font  = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
    const textW = Jimp.measureText(font, texto)
    const textH = Jimp.measureTextHeight(font, texto, textW)
    img.print(font, w - textW - 18, h - textH - 18, texto)
    return img.getBufferAsync(Jimp.MIME_PNG)
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const isWm      = /^(wm|watermark|marca)$/.test(command)
    const isToImg   = /^(toimagen|toimg|s2img)$/.test(command)
    let stiker = false

    try {
        let q    = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''

        if (isToImg) {
            if (!m.quoted) return conn.sendMessage(m.chat, {
                text: `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ STICKER → IMAGEN ]\n  ⟡ Cita un sticker para convertirlo.`
            }, { quoted: m })

            if (!/webp/.test(mime)) return m.reply('❌ Solo funciona con stickers (webp).')

            await m.react('🕒')
            const buf = await downloadMediaMessage(q, 'buffer', {}, { logger: console, reuploadRequest: conn.updateMediaMessage })
            if (!buf) throw new Error('No se pudo descargar el sticker.')

            const isAnimated = q.msg?.isAnimated || false

            if (isAnimated) {
                const mp4 = await webp2mp4(buf)
                await conn.sendMessage(m.chat, { video: mp4, caption: '> ✎ 「✿𝐇𝐢𝐲𝐮𝐤𝐢 এ 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 𝐩𝐚𝐭𝐫𝐨𝐧✿」', gifPlayback: true }, { quoted: m })
            } else {
                const png = await webp2png(buf)
                await conn.sendMessage(m.chat, { image: png, caption: '> ✎ 「✿𝐇𝐢𝐲𝐮𝐤𝐢 এ 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 𝐩𝐚𝐭𝐫𝐨𝐧✿」' }, { quoted: m })
            }

            return await m.react('✅')
        }

        if (isWm) {
            if (!/image/.test(mime)) return conn.sendMessage(m.chat, {
                text: `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ WATERMARK ]\n  ⟡ Cita o envía una imagen con *${usedPrefix + command} <texto>*\n  ⟡ Si no pones texto se usará el nombre del bot.`
            }, { quoted: m })

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

            let img = await downloadMediaMessage(
                q, 'buffer', {},
                { logger: console, reuploadRequest: conn.updateMediaMessage }
            )

            if (!img) throw new Error('No se pudo extraer el buffer de la señal.')

            stiker = await sticker(img, false, global.packname || 'Hiyuki System', global.author || 'Adrien | XLR4')
        } else if (args[0] && /https?:\/\//.test(args[0])) {
            stiker = await sticker(false, args[0], global.packname, global.author)
        } else {
            return conn.sendMessage(m.chat, {
                text: `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR DE MUESTRA ]\n  ⟡ Responde a una imagen o video con *${usedPrefix + command}*`
            }, { quoted: m })
        }

        if (stiker) {
            await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
            await m.react('✅')
        }

    } catch (e) {
        console.error(e)
        await m.react('❌')
        conn.sendMessage(m.chat, {
            text: `❄︎ [ FALLO DE RENDERIZADO ]\n⟡ Detalle: ${e.message}`
        }, { quoted: m })
    }
}

handler.help    = ['s', 'wm <texto>', 'toimagen']
handler.command = ['s', 'sticker', 'stiker', 'wm', 'watermark', 'marca', 'toimagen', 'toimg', 's2img']
handler.tags    = ['tools']

export default handler
        
