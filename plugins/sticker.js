import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { sticker, writeExif } from '../lib/sticker.js'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs-extra'
import { tmpdir } from 'os'
import { join } from 'path'
import Crypto from 'crypto'
import { Jimp } from 'jimp'

const tmpFile = (ext) => join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`)

const ffRun = (inputPath, outputPath, configurator) =>
    new Promise((resolve, reject) => {
        const cmd = ffmpeg(inputPath)
        configurator(cmd)
        cmd.output(outputPath)
            .on('end', resolve)
            .on('error', reject)
            .run()
    })

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
                    body:                  '˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ',
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

async function webpToPng(buffer) {
    const img = await Jimp.read(buffer)
    return img.getBuffer('image/png')
}

async function webpToGif(buffer) {
    const png    = await webpToPng(buffer)
    const tmpIn  = tmpFile('png')
    const tmpOut = tmpFile('gif')
    await fs.writeFile(tmpIn, png)
    await ffRun(tmpIn, tmpOut, cmd =>
        cmd.videoFilters('fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse')
    )
    const result = await fs.readFile(tmpOut)
    await fs.remove(tmpIn)
    await fs.remove(tmpOut)
    return result
}

async function addWatermarkImg(buffer, texto) {
    const tmpIn  = tmpFile('jpg')
    const tmpOut = tmpFile('jpg')
    await fs.writeFile(tmpIn, buffer)
    const safe = texto.replace(/'/g, "\\'").replace(/:/g, '\\:')
    await ffRun(tmpIn, tmpOut, cmd =>
        cmd.videoFilters(`drawtext=text='${safe}':fontsize=28:fontcolor=white:borderw=2:bordercolor=black:x=w-tw-18:y=h-th-18`)
            .outputOptions(['-q:v', '2'])
    )
    const result = await fs.readFile(tmpOut)
    await fs.remove(tmpIn)
    await fs.remove(tmpOut)
    return result
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
                try {
                    const gif = await webpToGif(buf)
                    await conn.sendMessage(m.chat, { video: gif, caption: '> ✎ 「✿𝐇𝐢𝐲𝐮𝐤𝐢 এ 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 𝐩𝐚𝐭𝐫𝐨𝐧✿」', gifPlayback: true }, { quoted: m })
                } catch {
                    const png = await webpToPng(buf)
                    await conn.sendMessage(m.chat, { image: png, caption: '> ✎ 「✿𝐇𝐢𝐲𝐮𝐤𝐢 এ 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 𝐩𝐚𝐭𝐫𝐨𝐧✿」' }, { quoted: m })
                }
            } else {
                const png = await webpToPng(buf)
                await conn.sendMessage(m.chat, { image: png, caption: '> ✎ 「✿𝐇𝐢𝐲𝐮𝐤𝐢 এ 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 𝐩𝐚𝐭𝐫𝐨𝐧✿」' }, { quoted: m })
            }
            return await m.react('✅')
        }

        if (isWm) {
            const buf = await downloadMediaMessage(q, 'buffer', {}, { logger: console, reuploadRequest: conn.updateMediaMessage })
            if (!buf) throw new Error('No se pudo extraer el buffer.')

            if (/webp/.test(mime)) {
                await m.react('🕒')
                const texto = args.join(' ').trim()
                let packname, author

                if (texto) {
                    packname = texto
                    author   = global.botName || 'Hiyuki Celestial MD'
                } else {
                    const now     = new Date()
                    const fecha   = now.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: 'numeric' })
                    const hora    = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                    const usuario = m.pushName || m.sender.split('@')[0]
                    const grupo   = m.isGroup ? (await conn.groupMetadata(m.chat).catch(() => ({}))).subject || m.chat : 'MD'
                    packname = `✿ Usuario: ${usuario}\n✿ Bot: ${global.botName || 'Hiyuki Celestial MD'}\n✿ Fecha: ${fecha}`
                    author   = `${hora} • ${grupo}`
                }

                const result = await writeExif(buf, packname, author)
                await conn.sendMessage(m.chat, { sticker: result }, { quoted: m })
                return await m.react('✅')
            }

            if (!/image/.test(mime)) return sendStyled(conn, m,
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ WATERMARK ]\n  ⟡ Cita una *imagen* o *sticker* con *${usedPrefix + command}*`
            )

            await m.react('🕒')
            const texto = args.join(' ').trim() || global.botName || 'Hiyuki Celestial MD'
            const out   = await addWatermarkImg(buf, texto)
            await conn.sendMessage(m.chat, { image: out, caption: '> ✎ 「✿𝐇𝐢𝐲𝐮𝐤𝐢 এ 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 𝐩𝐚𝐭𝐫𝐨𝐧✿」' }, { quoted: m })
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

handler.help    = ['s', 'wm', 'toimagen']
handler.command = ['s', 'sticker', 'stiker', 'wm', 'watermark', 'marca', 'toimagen', 'toimg', 's2img']
handler.tags    = ['tools']

export default handler
                        
