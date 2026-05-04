import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'
import Crypto from 'crypto'
import ff from 'fluent-ffmpeg'
import webp from 'node-webpmux'
import { fileTypeFromBuffer } from 'file-type'

function tmpFile(ext) {
  return path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`)
}

async function imageToWebp(buffer) {
  const tmpIn  = tmpFile('jpg')
  const tmpOut = tmpFile('webp')
  fs.writeFileSync(tmpIn, buffer)
  await new Promise((resolve, reject) => {
    ff(tmpIn)
      .on('error', reject)
      .on('end', () => resolve(true))
      .addOutputOptions([
        '-vcodec', 'libwebp',
        '-vf', "scale='min(512,iw)':'min(512,ih)':force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse"
      ])
      .toFormat('webp')
      .save(tmpOut)
  })
  const buf = fs.readFileSync(tmpOut)
  fs.unlinkSync(tmpIn)
  fs.unlinkSync(tmpOut)
  return buf
}

async function videoToWebp(buffer) {
  const tmpIn  = tmpFile('mp4')
  const tmpOut = tmpFile('webp')
  fs.writeFileSync(tmpIn, buffer)
  await new Promise((resolve, reject) => {
    ff(tmpIn)
      .on('error', reject)
      .on('end', () => resolve(true))
      .addOutputOptions([
        '-vcodec', 'libwebp',
        '-vf', "scale='min(512,iw)':'min(512,ih)':force_original_aspect_ratio=decrease,fps=15,pad=512:512:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse",
        '-loop', '0',
        '-ss', '00:00:00',
        '-t', '00:00:05',
        '-preset', 'default',
        '-an',
        '-vsync', '0'
      ])
      .toFormat('webp')
      .save(tmpOut)
  })
  const buf = fs.readFileSync(tmpOut)
  fs.unlinkSync(tmpIn)
  fs.unlinkSync(tmpOut)
  return buf
}

async function writeExif(webpBuffer, packname, author) {
  const tmpIn  = tmpFile('webp')
  const tmpOut = tmpFile('webp')
  fs.writeFileSync(tmpIn, webpBuffer)

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
      
