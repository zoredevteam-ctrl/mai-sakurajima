// plugins/sticker.js
import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import webp from 'node-webpmux'
import { tmpdir } from 'os'
import { Readable } from 'stream'

const tempFolder = tmpdir()
const randomFileName = (ext) => `${Date.now()}-${Math.floor(Math.random() * 10000)}.${ext}`

let handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        const quoted = m.quoted || m
        const msg = quoted.msg || quoted
        const mime = msg.mimetype || ''
        const hasMedia = msg.url || msg.directPath

        if (!hasMedia || !/image|video|webp/.test(mime)) {
            return conn.sendMessage(m.chat, { text: `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR ]\n  ⟡ Responde a una imagen o video para crear el sticker.` }, { quoted: m })
        }

        await m.react('❄︎')

        let buffer = await quoted.download()
        const isVideo = /video/.test(mime) || msg.gifPlayback
        if (isVideo && msg.seconds > 10) {
            return m.reply(`✦ [ RESTRICCIÓN ] Máximo 10 segundos para videos.`)
        }

        // ── Configuración de Metadatos ──────────────────────────────────────────
        let groupName = m.isGroup ? (await conn.groupMetadata(m.chat)).subject : 'Privado'
        
        // Info: Nombre Bot | Nombre Grupo | Creador
        const pack = `Hiyuki System | ${groupName}`
        const author = `Creado por: Adrien`

        const metadata = {
            packname: pack,
            author: author,
            categories: ['❄︎']
        }

        let stickerPath = isVideo
            ? await writeExifVid(buffer, metadata)
            : await writeExifImg(buffer, metadata)

        const finalSticker = fs.readFileSync(stickerPath)

        await conn.sendMessage(m.chat, { sticker: finalSticker }, { quoted: m })

        if (fs.existsSync(stickerPath)) fs.unlinkSync(stickerPath)

    } catch (e) {
        console.error(e)
        await conn.sendMessage(m.chat, { text: `✦ [ ERROR CRÍTICO ]\n  ⟡ ${e.message}` }, { quoted: m })
    }
}

handler.command = ['sticker', 's', 'stk']
export default handler

// ── Funciones de Procesamiento Externas ──────────────────────────────────────

function bufferToStream(buffer) {
    return new Readable({ read() { this.push(buffer); this.push(null); } })
}

async function imageToWebp(buffer) {
    return new Promise((resolve, reject) => {
        const chunks = []
        ffmpeg(bufferToStream(buffer))
            .addOutputOptions(["-vcodec", "libwebp", "-vf", "scale=320:320:force_original_aspect_ratio=increase,crop=320:320,fps=15,format=rgba"])
            .format('webp').on('error', reject).on('end', () => resolve(Buffer.concat(chunks)))
            .pipe().on('data', c => chunks.push(c))
    })
}

async function videoToWebp(buffer) {
    return new Promise((resolve, reject) => {
        const chunks = []
        ffmpeg(bufferToStream(buffer))
            .addOutputOptions(["-vcodec", "libwebp", "-vf", "scale=320:320:force_original_aspect_ratio=increase,crop=320:320,fps=15,format=rgba", "-loop", "0", "-ss", "00:00:00", "-t", "00:00:07", "-preset", "default", "-an", "-vsync", "0"])
            .format('webp').on('error', reject).on('end', () => resolve(Buffer.concat(chunks)))
            .pipe().on('data', c => chunks.push(c))
    })
}

async function writeExifImg(media, metadata) {
    const wMedia = await imageToWebp(media)
    return await addExif(wMedia, metadata)
}

async function writeExifVid(media, metadata) {
    const wMedia = await videoToWebp(media)
    return await addExif(wMedia, metadata)
}

async function addExif(webpBuffer, metadata) {
    const tmpIn = path.join(tempFolder, randomFileName("webp"))
    const tmpOut = path.join(tempFolder, randomFileName("webp"))
    fs.writeFileSync(tmpIn, webpBuffer)

    const json = {
        "sticker-pack-id": "hiyuki-protocol",
        "sticker-pack-name": metadata.packname,
        "sticker-pack-publisher": metadata.author,
        "emojis": ["❄︎"]
    }

    const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
    const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8")
    const exif = Buffer.concat([exifAttr, jsonBuff])
    exif.writeUIntLE(jsonBuff.length, 14, 4)

    const img = new webp.Image()
    await img.load(tmpIn)
    img.exif = exif
    await img.save(tmpOut)
    fs.unlinkSync(tmpIn)
    return tmpOut
}
