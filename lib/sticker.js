import { exec } from 'child_process'
import { promisify } from 'util'
import { tmpdir } from 'os'
import { join } from 'path'
import { writeFile, readFile, unlink } from 'fs/promises'
import { randomBytes } from 'crypto'

const execAsync = promisify(exec)
const tmp = (ext) => join(tmpdir(), randomBytes(6).toString('hex') + ext)

function buildExifBuffer(packname, author) {
    const json = JSON.stringify({
        'sticker-pack-name': packname,
        'sticker-pack-publisher': author,
        'android-app-store-link': '',
        'ios-app-store-link': ''
    })

    const jsonBuf = Buffer.from(json, 'utf-8')
    const exifBuf = Buffer.alloc(jsonBuf.length + 22)

    exifBuf.write('Exif\x00\x00', 0, 'binary')
    exifBuf.write('II', 6, 'binary')
    exifBuf.writeUInt16LE(0x002A, 8)
    exifBuf.writeUInt32LE(8, 10)
    exifBuf.writeUInt16LE(1, 14)
    exifBuf.writeUInt16LE(0x9286, 16)
    exifBuf.writeUInt16LE(2, 18)
    exifBuf.writeUInt32LE(jsonBuf.length, 20)
    exifBuf.writeUInt32LE(0, 24)
    jsonBuf.copy(exifBuf, 22)

    const chunkName = Buffer.from('EXIF')
    const chunkSize = Buffer.alloc(4)
    chunkSize.writeUInt32LE(exifBuf.length, 0)

    return Buffer.concat([chunkName, chunkSize, exifBuf])
}

function injectExifIntoWebP(webpBuf, packname, author) {
    if (webpBuf.slice(0, 4).toString() !== 'RIFF') return webpBuf
    if (webpBuf.slice(8, 12).toString() !== 'WEBP') return webpBuf

    const exifChunk = buildExifBuffer(packname, author)
    const newBuf = Buffer.concat([webpBuf, exifChunk])
    newBuf.writeUInt32LE(newBuf.length - 8, 4)
    return newBuf
}

export async function sticker(imgBuffer, url, packname = 'Hiyuki System', author = 'Adrien | XLR4', extra = {}) {
    let inputBuf = imgBuffer

    if (!inputBuf && url) {
        const res = await fetch(url)
        inputBuf = Buffer.from(await res.arrayBuffer())
    }

    if (!inputBuf) throw new Error('sticker: no hay buffer ni url')

    const { username, botName, groupName } = extra

    const now = new Date()
    const fecha = now.toLocaleDateString('es-CO', { timeZone: 'America/Bogota', day: '2-digit', month: 'numeric', year: 'numeric' })
    const hora = now.toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour12: false })

    const lines = []
    if (username) lines.push(`❅ Usuario: ${username}`)
    if (botName) lines.push(`❅ Bot: ${botName}`)
    lines.push(`☀ Fecha: ${fecha}`)
    lines.push(`☀ ${hora}`)
    if (groupName) lines.push(`「 ${groupName} 」`)

    const finalPack = lines.length ? lines.join('\n') : packname
    const finalAuthor = botName || author

    const head = inputBuf.slice(0, 12).toString('hex')
    const isVid = head.startsWith('00000020') ||
                  head.startsWith('00000018') ||
                  head.startsWith('52494646')

    const inputPath = tmp(isVid ? '.mp4' : '.png')
    const outputPath = tmp('.webp')

    await writeFile(inputPath, inputBuf)

    try {
        if (isVid) {
            await execAsync(
                `ffmpeg -y -i "${inputPath}" ` +
                `-vf "scale=512:512:force_original_aspect_ratio=decrease,` +
                `pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,fps=15" ` +
                `-loop 0 -preset default -an -vsync 0 -t 8 "${outputPath}"`
            )
        } else {
            await execAsync(
                `ffmpeg -y -i "${inputPath}" ` +
                `-vf "scale=512:512:force_original_aspect_ratio=decrease,` +
                `pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000" ` +
                `"${outputPath}"`
            )
        }

        let webpBuf = await readFile(outputPath)
        webpBuf = injectExifIntoWebP(webpBuf, finalPack, finalAuthor)
        return webpBuf

    } finally {
        unlink(inputPath).catch(() => {})
        unlink(outputPath).catch(() => {})
    }
          }
