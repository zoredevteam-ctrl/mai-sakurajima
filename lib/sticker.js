import fs from 'fs-extra'
import path from 'path'
import { tmpdir } from 'os'
import Crypto from 'crypto'
import ffmpeg from 'fluent-ffmpeg'
import webp from 'node-webpmux'
import { fileTypeFromBuffer } from 'file-type'
import { Jimp } from 'jimp'

const tmpFile = (ext) => path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`)

const ffRun = (inputPath, outputPath, configurator) =>
    new Promise((resolve, reject) => {
        const cmd = ffmpeg(inputPath)
        configurator(cmd)
        cmd.output(outputPath)
            .on('end', resolve)
            .on('error', reject)
            .run()
    })

async function imageToWebp(buffer) {
    const type = await fileTypeFromBuffer(buffer)
    if (type?.mime === 'image/webp') {
        const img = await Jimp.read(buffer)
        buffer = await img.getBuffer('image/png')
    }

    const tmpIn  = tmpFile('png')
    const tmpOut = tmpFile('webp')
    await fs.writeFile(tmpIn, buffer)
    await ffRun(tmpIn, tmpOut, cmd =>
        cmd.videoFilters("scale='if(gt(iw,ih),512,-1)':'if(gt(ih,iw),512,-1)',pad=512:512:(512-iw)/2:(512-ih)/2:white@0")
            .videoCodec('libwebp')
            .outputOptions(['-quality', '80', '-preset', 'picture'])
    )
    const buf = await fs.readFile(tmpOut)
    await fs.remove(tmpIn)
    await fs.remove(tmpOut)
    return buf
}

async function videoToWebp(buffer) {
    const tmpIn  = tmpFile('mp4')
    const tmpOut = tmpFile('webp')
    await fs.writeFile(tmpIn, buffer)
    await ffRun(tmpIn, tmpOut, cmd =>
        cmd.videoFilters("scale='if(gt(iw,ih),512,-1)':'if(gt(ih,iw),512,-1)',pad=512:512:(512-iw)/2:(512-ih)/2:white@0,fps=15")
            .videoCodec('libwebp')
            .outputOptions(['-quality', '70', '-preset', 'picture', '-loop', '0', '-t', '00:00:05', '-an'])
    )
    const buf = await fs.readFile(tmpOut)
    await fs.remove(tmpIn)
    await fs.remove(tmpOut)
    return buf
}

async function writeExif(webpBuffer, packname, author) {
    const tmpIn  = tmpFile('webp')
    const tmpOut = tmpFile('webp')
    await fs.writeFile(tmpIn, webpBuffer)

    const img      = new webp.Image()
    const json     = {
        'sticker-pack-id'        : `hiyuki.${Date.now()}`,
        'sticker-pack-name'      : packname,
        'sticker-pack-publisher' : author,
        'emojis'                 : ['🌟']
    }
    const exifAttr = Buffer.from([
        0x49,0x49,0x2a,0x00,0x08,0x00,0x00,0x00,
        0x01,0x00,0x41,0x57,0x07,0x00,0x00,0x00,
        0x00,0x00,0x16,0x00,0x00,0x00
    ])
    const jsonBuf  = Buffer.from(JSON.stringify(json), 'utf-8')
    const exif     = Buffer.concat([exifAttr, jsonBuf])
    exif.writeUIntLE(jsonBuf.length, 14, 4)

    await img.load(tmpIn)
    await fs.remove(tmpIn)
    img.exif = exif
    await img.save(tmpOut)

    const result = await fs.readFile(tmpOut)
    await fs.remove(tmpOut)
    return result
}

export async function sticker(buffer, url, packname = 'Hiyuki System', author = 'Adrien | XLR4') {
    if (url && !buffer) {
        const res = await fetch(url)
        if (!res.ok) throw new Error('No se pudo descargar desde la URL.')
        buffer = Buffer.from(await res.arrayBuffer())
    }

    if (!buffer) throw new Error('No se proporcionó buffer ni URL.')

    const type = await fileTypeFromBuffer(buffer)
    const mime = type?.mime || ''

    if (!/image|video/.test(mime)) throw new Error(`Formato no soportado: ${mime || 'desconocido'}`)

    const webpBuf = /video/.test(mime)
        ? await videoToWebp(buffer)
        : await imageToWebp(buffer)

    return writeExif(webpBuf, packname, author)
}

export { writeExif }
            
