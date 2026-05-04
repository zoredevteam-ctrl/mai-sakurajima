import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'
import Crypto from 'crypto'
import { spawn } from 'child_process'
import webp from 'node-webpmux'
import { fileTypeFromBuffer } from 'file-type'

const tmpFile = (ext) => path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`)

function ffRun(args) {
    return new Promise((resolve, reject) => {
        const p = spawn('ffmpeg', args)
        let err = ''
        p.stderr.on('data', d => err += d)
        p.on('close', code => code === 0 ? resolve() : reject(new Error(err.slice(-400))))
    })
}

async function imageToWebp(buffer) {
    const tmpIn  = tmpFile('jpg')
    const tmpOut = tmpFile('webp')
    fs.writeFileSync(tmpIn, buffer)
    await ffRun([
        '-y', '-i', tmpIn,
        '-vf', "scale='if(gt(iw,ih),512,-1)':'if(gt(ih,iw),512,-1)',pad=512:512:(512-iw)/2:(512-ih)/2:white@0",
        '-c:v', 'libwebp',
        '-quality', '80',
        '-preset', 'picture',
        tmpOut
    ])
    const buf = fs.readFileSync(tmpOut)
    fs.unlinkSync(tmpIn)
    fs.unlinkSync(tmpOut)
    return buf
}

async function videoToWebp(buffer) {
    const tmpIn  = tmpFile('mp4')
    const tmpOut = tmpFile('webp')
    fs.writeFileSync(tmpIn, buffer)
    await ffRun([
        '-y', '-i', tmpIn,
        '-vf', "scale='if(gt(iw,ih),512,-1)':'if(gt(ih,iw),512,-1)',pad=512:512:(512-iw)/2:(512-ih)/2:white@0,fps=15",
        '-c:v', 'libwebp',
        '-quality', '70',
        '-preset', 'picture',
        '-loop', '0',
        '-t', '00:00:05',
        '-an',
        tmpOut
    ])
    const buf = fs.readFileSync(tmpOut)
    fs.unlinkSync(tmpIn)
    fs.unlinkSync(tmpOut)
    return buf
}

async function writeExif(webpBuffer, packname, author) {
    const tmpIn  = tmpFile('webp')
    const tmpOut = tmpFile('webp')
    fs.writeFileSync(tmpIn, webpBuffer)

    const img     = new webp.Image()
    const json    = {
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
    const jsonBuf = Buffer.from(JSON.stringify(json), 'utf-8')
    const exif    = Buffer.concat([exifAttr, jsonBuf])
    exif.writeUIntLE(jsonBuf.length, 14, 4)

    await img.load(tmpIn)
    fs.unlinkSync(tmpIn)
    img.exif = exif
    await img.save(tmpOut)

    const result = fs.readFileSync(tmpOut)
    fs.unlinkSync(tmpOut)
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
