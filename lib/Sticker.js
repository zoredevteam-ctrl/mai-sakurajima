import https from 'https'
import http from 'http'
import ffmpeg from 'fluent-ffmpeg'
import { Readable } from 'stream'

const toStream = (buf) =>
    new Readable({ read() { this.push(buf); this.push(null) } })

const fetchUrl = (url) => new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http
    const chunks = []
    lib.get(url, res => {
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`))
        res.on('data', c => chunks.push(c))
        res.on('end',  () => resolve(Buffer.concat(chunks)))
        res.on('error', reject)
    }).on('error', reject)
})

const imageToWebp = (input) => new Promise((resolve, reject) => {
    const chunks = []
    const stream = ffmpeg(Buffer.isBuffer(input) ? toStream(input) : input)
        .inputFormat('image2pipe')
        .addOutputOptions([
            '-vcodec', 'libwebp',
            '-vf',     'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:white@0,format=rgba',
            '-quality', '80',
            '-compression_level', '6',
            '-loop', '0'
        ])
        .format('webp')
        .on('error', reject)
        .pipe()

    stream.on('data',  c  => chunks.push(c))
    stream.on('end',   () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
})

const videoToWebp = (input) => new Promise((resolve, reject) => {
    const chunks = []
    const stream = ffmpeg(Buffer.isBuffer(input) ? toStream(input) : input)
        .addOutputOptions([
            '-vcodec', 'libwebp',
            '-vf',     'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:white@0,fps=15,format=rgba',
            '-loop',   '0',
            '-ss',     '00:00:00',
            '-t',      '00:00:07',
            '-preset', 'default',
            '-an',
            '-vsync',  '0',
            '-quality', '75'
        ])
        .format('webp')
        .on('error', reject)
        .pipe()

    stream.on('data',  c  => chunks.push(c))
    stream.on('end',   () => resolve(Buffer.concat(chunks)))
    stream.on('error', reject)
})

const injectExif = (webpBuffer, packname, author) => {
    const json = JSON.stringify({
        'sticker-pack-id':        'hiyuki-celestial-md',
        'sticker-pack-name':      packname,
        'sticker-pack-publisher': author,
        'emojis':                 ['❄️']
    })

    const exifHeader = Buffer.from([
        0x49, 0x49, 0x2A, 0x00,
        0x08, 0x00, 0x00, 0x00,
        0x01, 0x00,
        0x41, 0x57,
        0x07, 0x00,
        0x00, 0x00, 0x00, 0x00,
        0x16, 0x00, 0x00, 0x00
    ])

    const jsonBuf = Buffer.from(json, 'utf-8')
    const exif    = Buffer.concat([exifHeader, jsonBuf])
    exif.writeUInt32LE(jsonBuf.length, 14)

    const chunkId   = Buffer.from('EXIF')
    const chunkSize = Buffer.alloc(4)
    chunkSize.writeUInt32LE(exif.length, 0)
    const exifChunk = Buffer.concat([chunkId, chunkSize, exif])

    const pad = exif.length % 2 !== 0 ? Buffer.alloc(1) : Buffer.alloc(0)

    const out = Buffer.concat([
        webpBuffer.slice(0, 12),
        exifChunk,
        pad,
        webpBuffer.slice(12)
    ])

    out.writeUInt32LE(out.length - 8, 4)
    return out
}

export const sticker = async (buffer, url = false, packname, author) => {
    if (url) buffer = await fetchUrl(url)

    if (!buffer || buffer.length < 50)
        throw new Error('el buffer está vacío o no sirve')

    const magic   = buffer.slice(0, 12).toString('hex')
    const isVideo = magic.startsWith('000000') ||
                    magic.includes('667479')   ||
                    magic.startsWith('1a45dfa3')

    const webpRaw = isVideo
        ? await videoToWebp(buffer)
        : await imageToWebp(buffer)

    if (!webpRaw || webpRaw.length < 10)
        throw new Error('ffmpeg no convirtió el archivo, revisa que esté instalado')

    return injectExif(webpRaw, packname, author)
}

export default sticker
  
