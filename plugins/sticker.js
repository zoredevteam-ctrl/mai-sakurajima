// plugins/sticker.js
import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import webp from 'node-webpmux'
import { tmpdir } from 'os'
import { Readable } from 'stream'

const tempFolder = tmpdir()
const randomFileName = (ext) => `${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`

// ── Sticker (imagen/video → sticker con metadatos) ────────────────────────────
let handler = async (m, { conn }) => {
    try {
        const quoted = m.quoted || m
        const msg    = quoted.msg || quoted

        const mime     = msg?.mimetype || ''
        const hasMedia = msg?.url || msg?.directPath

        if (!hasMedia || !/image|video|webp/.test(mime)) {
            return conn.sendMessage(m.chat, {
                text:
                    `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                    `✦ [ USO ]\n` +
                    `  ⟡ Responde a una imagen, video o GIF con *#sticker*\n` +
                    `  ⟡ Máximo 10 segundos para videos`
            }, { quoted: m })
        }

        const isVideo = /video/.test(mime) || msg.gifPlayback

        if (isVideo && (msg.seconds || 0) > 10) {
            return conn.sendMessage(m.chat, {
                text: `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ RESTRICCIÓN ]\n  ⟡ Máximo 10 segundos para videos.`
            }, { quoted: m })
        }

        await m.react('❄︎')

        // FIX: conn.downloadMediaMessage en lugar de quoted.download()
        const buffer = await conn.downloadMediaMessage(quoted)
        if (!buffer || buffer.length < 100) throw new Error('No se pudo descargar el archivo.')

        let groupName = 'Privado'
        if (m.isGroup) {
            try { groupName = (await conn.groupMetadata(m.chat)).subject } catch {}
        }

        const metadata = {
            packname: `Hiyuki System | ${groupName}`,
            author:   `Creado por: ${global.ownerName || 'Adrien'}`
        }

        const stickerPath = isVideo
            ? await writeExifVid(buffer, metadata)
            : await writeExifImg(buffer, metadata)

        const finalSticker = fs.readFileSync(stickerPath)
        await conn.sendMessage(m.chat, { sticker: finalSticker }, { quoted: m })
        await m.react('✓')

        try { if (fs.existsSync(stickerPath)) fs.unlinkSync(stickerPath) } catch {}

    } catch (e) {
        console.error('[STICKER ERROR]', e.message)
        await m.react('✗')
        await conn.sendMessage(m.chat, {
            text:
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                `✦ [ ERROR ]\n  ⟡ ${e.message.slice(0, 200)}`
        }, { quoted: m })
    }
}

handler.command = ['sticker', 's', 'stk']
handler.tags    = ['utilidades']
export default handler

// ── toimg (sticker → imagen) ──────────────────────────────────────────────────
let toImgHandler = async (m, { conn }) => {
    try {
        const quoted = m.quoted || m
        const msg    = quoted.msg || quoted
        const mime   = msg?.mimetype || ''

        if (!/webp/.test(mime)) {
            return conn.sendMessage(m.chat, {
                text:
                    `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                    `✦ [ USO ]\n  ⟡ Responde a un sticker con *#toimg*`
            }, { quoted: m })
        }

        await m.react('❄︎')

        const buffer = await conn.downloadMediaMessage(quoted)
        if (!buffer || buffer.length < 100) throw new Error('No se pudo descargar el sticker.')

        const pngBuffer = await webpToPng(buffer)

        await conn.sendMessage(m.chat, {
            image:   pngBuffer,
            caption: `❄︎ Sticker convertido a imagen.`
        }, { quoted: m })

        await m.react('✓')

    } catch (e) {
        console.error('[TOIMG ERROR]', e.message)
        await m.react('✗')
        await conn.sendMessage(m.chat, {
            text: `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR ]\n  ⟡ ${e.message.slice(0, 200)}`
        }, { quoted: m })
    }
}

toImgHandler.command = ['toimg', 'stickertoimg', 'toimage']
toImgHandler.tags    = ['utilidades']
export { toImgHandler }

// ─────────────────────────────────────────────────────────────────────────────

function bufferToStream(buffer) {
    return new Readable({ read() { this.push(buffer); this.push(null) } })
}

// FIX: escuchar 'end' en el stream del pipe, no en el objeto ffmpeg
async function imageToWebp(buffer) {
    return new Promise((resolve, reject) => {
        const chunks = []
        const stream = ffmpeg(bufferToStream(buffer))
            .addOutputOptions([
                '-vcodec', 'libwebp',
                '-vf', 'scale=320:320:force_original_aspect_ratio=increase,crop=320:320,fps=15,format=rgba'
            ])
            .format('webp')
            .on('error', reject)
            .pipe()
        stream.on('data',  chunk => chunks.push(chunk))
        stream.on('end',   ()    => resolve(Buffer.concat(chunks)))
        stream.on('error', reject)
    })
}

async function videoToWebp(buffer) {
    return new Promise((resolve, reject) => {
        const chunks = []
        const stream = ffmpeg(bufferToStream(buffer))
            .addOutputOptions([
                '-vcodec', 'libwebp',
                '-vf', 'scale=320:320:force_original_aspect_ratio=increase,crop=320:320,fps=15,format=rgba',
                '-loop',   '0',
                '-ss',     '00:00:00',
                '-t',      '00:00:07',
                '-preset', 'default',
                '-an',
                '-vsync',  '0'
            ])
            .format('webp')
            .on('error', reject)
            .pipe()
        stream.on('data',  chunk => chunks.push(chunk))
        stream.on('end',   ()    => resolve(Buffer.concat(chunks)))
        stream.on('error', reject)
    })
}

async function webpToPng(buffer) {
    return new Promise((resolve, reject) => {
        const chunks = []
        const stream = ffmpeg(bufferToStream(buffer))
            .addOutputOptions(['-vframes', '1', '-f', 'image2pipe'])
            .format('png')
            .on('error', reject)
            .pipe()
        stream.on('data',  chunk => chunks.push(chunk))
        stream.on('end',   ()    => resolve(Buffer.concat(chunks)))
        stream.on('error', reject)
    })
}

async function writeExifImg(media, metadata) {
    return await addExif(await imageToWebp(media), metadata)
}

async function writeExifVid(media, metadata) {
    return await addExif(await videoToWebp(media), metadata)
}

async function addExif(webpBuffer, metadata) {
    const tmpIn  = path.join(tempFolder, randomFileName('webp'))
    const tmpOut = path.join(tempFolder, randomFileName('webp'))
    fs.writeFileSync(tmpIn, webpBuffer)

    const json = {
        'sticker-pack-id':        'hiyuki-protocol',
        'sticker-pack-name':      metadata.packname,
        'sticker-pack-publisher': metadata.author,
        'emojis':                 ['❄']
    }

    const exifAttr = Buffer.from([
        0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ])
    const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8')
    const exif     = Buffer.concat([exifAttr, jsonBuff])
    exif.writeUIntLE(jsonBuff.length, 14, 4)

    const img = new webp.Image()
    await img.load(tmpIn)
    img.exif = exif
    await img.save(tmpOut)

    try { fs.unlinkSync(tmpIn) } catch {}
    return tmpOut
}
