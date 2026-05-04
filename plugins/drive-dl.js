import fs from 'fs'
import path from 'path'
import os from 'os'
import { pipeline } from 'stream/promises'
import { Transform } from 'stream'
import { gdriveDl } from '../lib/gdrive.js'

function fmtBytes(b) {
  if (b >= 1073741824) return (b / 1073741824).toFixed(2) + ' GB'
  if (b >= 1048576)    return (b / 1048576).toFixed(2) + ' MB'
  return (b / 1024).toFixed(2) + ' KB'
}

const getThumb = async () => {
  try {
    const r = await fetch(global.icono || global.banner || '')
    if (!r.ok) return null
    return Buffer.from(await r.arrayBuffer())
  } catch { return null }
}

const sendStyled = async (conn, m, text) => {
  const thumb = await getThumb()
  try {
    return await conn.sendMessage(m.chat, {
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
          body:                  '📁 Google Drive Downloader',
          mediaType:             1,
          thumbnail:             thumb,
          renderLargerThumbnail: false,
          sourceUrl:             global.rcanal || ''
        }
      }
    }, { quoted: m })
  } catch {
    return await conn.sendMessage(m.chat, { text }, { quoted: m })
  }
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return sendStyled(conn, m,
      `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
      `✦ [ GOOGLE DRIVE DOWNLOADER ]\n` +
      `  ⟡ Uso: *${usedPrefix + command} <enlace>*\n` +
      `  ⟡ Ejemplo: ${usedPrefix + command} https://drive.google.com/file/d/XXXXX/view`
    )
  }

  const LIMIT_BYTES = 2 * 1024 * 1024 * 1024
  let tempPath

  try {
    const info = await gdriveDl(args[0])

    if (info.sizeBytes > LIMIT_BYTES) {
      return sendStyled(conn, m,
        `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
        `✦ [ ARCHIVO DEMASIADO GRANDE ]\n` +
        `  ⟡ Tamaño: ${fmtBytes(info.sizeBytes)}\n` +
        `  ⟡ Límite máximo: 2 GB`
      )
    }

    const infoText =
      `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
      `📁 *${info.fileName}*\n` +
      `✦ Tamaño: ${fmtBytes(info.sizeBytes)}\n` +
      `✦ Fuente: Google Drive\n\n` +
      `⏳ _Descargando archivo, espere..._\n` +
      `❄︎ _Enviado por ${global.botName || 'Hiyuki Celestial MD'}_`

    await sendStyled(conn, m, infoText)

    tempPath = path.join(os.tmpdir(), `gdrive_${Date.now()}_${info.fileName.replace(/[/\\:*?"<>|]/g, '_')}`)

    const fileRes = await fetch(info.downloadUrl)
    if (!fileRes.ok) throw `❌ Error al descargar: ${fileRes.statusText}`

    let dlBytes = 0
    const dlStart = Date.now()

    const dlStream = new Transform({
      transform(chunk, _, cb) {
        dlBytes += chunk.length
        const secs  = (Date.now() - dlStart) / 1000 || 0.001
        const speed = dlBytes / secs
        const pct   = (dlBytes / info.sizeBytes) * 100
        process.stdout.write(
          `\r[GDrive] 📥 ${pct.toFixed(1)}% | ${fmtBytes(dlBytes)}/${fmtBytes(info.sizeBytes)} | ${fmtBytes(speed)}/s`
        )
        cb(null, chunk)
      }
    })

    await pipeline(fileRes.body, dlStream, fs.createWriteStream(tempPath))
    console.log(`\n[GDrive] ✅ Descarga completa: ${info.fileName}`)

    const realSize = fs.statSync(tempPath).size
    let upBytes = 0
    const upStart = Date.now()

    const upStream = new Transform({
      transform(chunk, _, cb) {
        upBytes += chunk.length
        const secs  = (Date.now() - upStart) / 1000 || 0.001
        const speed = upBytes / secs
        const pct   = (upBytes / realSize) * 100
        process.stdout.write(
          `\r[GDrive] 📤 ${pct.toFixed(1)}% | ${fmtBytes(upBytes)}/${fmtBytes(realSize)} | ${fmtBytes(speed)}/s`
        )
        cb(null, chunk)
      }
    })

    const readStream = fs.createReadStream(tempPath).pipe(upStream)

    await conn.sendMessage(m.chat, {
      document: { stream: readStream },
      fileName: info.fileName,
      mimetype: info.mimetype
    }, { quoted: m })

    console.log(`\n[GDrive] 🚀 Enviado a ${m.sender}`)

  } catch (e) {
    const msg = typeof e === 'string' ? e : `❌ *Error:* ${e.message}`
    await sendStyled(conn, m,
      `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
      `✦ [ ERROR ]\n  ⟡ ${msg}`
    )
    console.error('\n[GDrive ERROR]', e)
  } finally {
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
  }
}

handler.help    = ['gdrive <enlace>']
handler.tags    = ['downloader']
handler.command = ['gdrive', 'gd', 'drive']

export default handler
      
