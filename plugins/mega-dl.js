import { File as MegaFile } from 'megajs'
import { lookup as mimeLookup } from 'mime-types'
import fs        from 'fs'
import path      from 'path'
import { tmpdir } from 'os'
import { pipeline } from 'stream/promises'
import { Transform } from 'stream'

global.megaActiveDownloads = global.megaActiveDownloads || new Map()

function fmtBytes(b) {
  if (b >= 1073741824) return (b / 1073741824).toFixed(2) + ' GB'
  if (b >= 1048576)    return (b / 1048576).toFixed(2) + ' MB'
  return (b / 1024).toFixed(2) + ' KB'
}

function parseMegaError(err) {
  const msg = err?.message || String(err)
  if (msg.includes('EOVERQUOTA') || msg.includes('-18')) return '❌ Cuota de Mega excedida. Intenta más tarde.'
  if (msg.includes('ENOENT')     || msg.includes('-9'))  return '❌ Archivo no encontrado en Mega.'
  if (msg.includes('EACCESS')    || msg.includes('-11')) return '❌ Sin acceso al archivo (puede ser privado).'
  return `❌ Error de Mega: ${msg}`
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
          body:                  '☁️ Mega Downloader',
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
  if (/^(cancelar|stop)$/i.test(command)) {
    const quotedId = m.quoted?.id
    if (!quotedId) return m.reply('❌ Responde al mensaje de progreso de la descarga.')
    const dl = global.megaActiveDownloads.get(quotedId)
    if (!dl) return m.reply('❌ No hay descarga activa para ese mensaje.')
    dl.controller.abort()
    global.megaActiveDownloads.delete(quotedId)
    return m.reply('🚫 *Descarga cancelada.*')
  }

  const url = args[0]
  if (!url || !/mega\.nz/i.test(url)) {
    return sendStyled(conn, m,
      `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
      `✦ [ MEGA DOWNLOADER ]\n` +
      `  ⟡ Uso: *${usedPrefix + command} <enlace>*\n` +
      `  ⟡ Ejemplo: ${usedPrefix + command} https://mega.nz/file/XXXXX#YYYYY\n` +
      `  ⟡ Para cancelar responde al progreso con *.cancelar*`
    )
  }

  const controller = new AbortController()
  const { signal } = controller
  let tempPath

  try {
    let file
    try {
      file = MegaFile.fromURL(url)
      await file.loadAttributes()
    } catch (err) {
      throw parseMegaError(err)
    }

    const name      = file.name || 'archivo_mega'
    const sizeBytes = file.size
    const safeName  = name.replace(/[/\\:*?"<>|]/g, '_')

    const infoText =
      `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
      `☁️ *${name}*\n` +
      `✦ Tamaño: ${fmtBytes(sizeBytes)}\n` +
      `✦ Fuente: Mega\n\n` +
      `⏳ _Descargando archivo, espere..._\n` +
      `❄︎ _Enviado por ${global.botName || 'Hiyuki Celestial MD'}_`

    const { key: statusKey } = await sendStyled(conn, m, infoText)
    global.megaActiveDownloads.set(statusKey.id, { controller })

    tempPath = path.join(tmpdir(), `mega_${Date.now()}_${safeName}`)

    const fileStream = file.download({ signal })
    let dlBytes = 0
    const dlStart = Date.now()

    fileStream.on('data', chunk => {
      dlBytes += chunk.length
      const secs  = (Date.now() - dlStart) / 1000 || 0.001
      const speed = dlBytes / secs
      const pct   = (dlBytes / sizeBytes) * 100
      process.stdout.write(
        `\r[Mega] 📥 ${pct.toFixed(1)}% | ${fmtBytes(dlBytes)}/${fmtBytes(sizeBytes)} | ${fmtBytes(speed)}/s`
      )
    })

    try {
      await pipeline(fileStream, fs.createWriteStream(tempPath), { signal })
    } catch (err) {
      throw parseMegaError(err)
    }

    console.log(`\n[Mega] ✅ Descarga completa: ${name}`)

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
          `\r[Mega] 📤 ${pct.toFixed(1)}% | ${fmtBytes(upBytes)}/${fmtBytes(realSize)} | ${fmtBytes(speed)}/s`
        )
        cb(null, chunk)
      }
    })

    const readStream = fs.createReadStream(tempPath).pipe(upStream)

    await conn.sendMessage(m.chat, {
      document: { stream: readStream },
      fileName: name,
      mimetype: mimeLookup(name) || 'application/octet-stream'
    }, { quoted: m })

    console.log(`\n[Mega] 🚀 Enviado a ${m.sender}`)
    global.megaActiveDownloads.delete(statusKey.id)

  } catch (e) {
    if (e.name === 'AbortError' || e.code === 'ERR_CANCELED') {
      console.log('\n[Mega] 🛑 Descarga cancelada.')
      m.reply('🛑 _Descarga cancelada._')
    } else {
      const msg = typeof e === 'string' ? e : `❌ *Error:* ${e.message}`
      m.reply(msg)
      console.error('\n[Mega ERROR]', e)
    }
    global.megaActiveDownloads.delete(statusKey?.id)
  } finally {
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
  }
}

handler.help    = ['mega <enlace>', 'mg <enlace>']
handler.tags    = ['downloader']
handler.command = /^(mega|mg|cancelar|stop)$/i

export default handler
                                  
