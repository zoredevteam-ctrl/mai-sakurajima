import { exec } from 'child_process'
import { promisify } from 'util'
import { tmpdir } from 'os'
import { join } from 'path'
import { writeFile, readFile, unlink } from 'fs/promises'
import { randomBytes } from 'crypto'
import webp from 'node-webpmux'

const execAsync = promisify(exec)
const tmp = (ext) => join(tmpdir(), randomBytes(6).toString('hex') + ext)

async function addExif(webpBuf, packname, author) {
    const img = new webp.Image()
    const json = {
        'sticker-pack-name': packname || 'Hiyuki Celestial MD',
        'sticker-pack-publisher': author || '˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ',
        'android-app-store-link': '',
        'ios-app-store-link': ''
    }
    const exifAttr = Buffer.from([
        0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ])
    const jsonBuf = Buffer.from(JSON.stringify(json), 'utf8')
    const exif = Buffer.concat([exifAttr, jsonBuf])
    exif.writeUIntLE(jsonBuf.length, 14, 4)
    await img.load(webpBuf)
    img.exif = exif
    return await img.save(null)
}

function detectType(buf) {
    const hex = buf.slice(0, 12).toString('hex')
    const isRiff  = hex.startsWith('52494646')
    const isWebP  = isRiff && buf.slice(8, 12).toString('ascii') === 'WEBP'
    const isVideo = !isWebP && (
        hex.startsWith('00000020') ||
        hex.startsWith('00000018') ||
        hex.startsWith('66747970') ||
        isRiff
    )
    return { isVideo, isWebP }
}

export async function sticker(imgBuffer, url, packname, author) {
    let buf = imgBuffer

    if (!buf && url) {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`fetch error ${res.status}`)
        buf = Buffer.from(await res.arrayBuffer())
    }

    if (!buf) throw new Error('sticker: sin buffer ni url')

    const { isVideo, isWebP } = detectType(buf)

    const inputExt  = isVideo ? '.mp4' : isWebP ? '.webp' : '.jpg'
    const inputPath = tmp(inputExt)
    const outputPath = tmp('.webp')

    await writeFile(inputPath, buf)

    try {
        if (isVideo) {
            await execAsync(
                `ffmpeg -y -i "${inputPath}" ` +
                `-vf "format=rgba,` +
                `scale=512:512:force_original_aspect_ratio=decrease,` +
                `pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,` +
                `fps=15" ` +
                `-vcodec libwebp_anim -lossless 0 -quality 80 ` +
                `-loop 0 -an -vsync 0 -t 8 "${outputPath}"`
            )
        } else {
            await execAsync(
                `ffmpeg -y -i "${inputPath}" ` +
                `-vf "format=rgba,` +
                `scale=512:512:force_original_aspect_ratio=decrease,` +
                `pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" ` +
                `-vcodec libwebp -lossless 0 -quality 80 "${outputPath}"`
            )
        }

        let result = await readFile(outputPath)
        result = await addExif(result, packname, author)
        return result

    } finally {
        unlink(inputPath).catch(() => {})
        unlink(outputPath).catch(() => {})
    }
}
