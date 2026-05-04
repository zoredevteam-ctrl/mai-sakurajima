import axios from 'axios'
import * as cheerio from 'cheerio'
import { lookup as mimeLookup } from 'mime-types'
import fs from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { pipeline } from 'stream/promises'
import { Transform } from 'stream'
import https from 'https'

const httpsAgent = new https.Agent({ keepAlive: true, maxFreeSockets: 10 })

global.mfActiveDownloads = global.mfActiveDownloads || new Map()

const fmtBytes = (b) => {
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
                    body:                  '🔥 MediaFire Downloader',
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

const mediafireDl = async (url) => {
    const res = await axios.get(url, {
        headers:    { 'User-Agent': 'Mozilla/5.0' },
        httpsAgent,
        timeout:    15000
    })
    const $ = cheerio.load(res.data)
    const link =
        $('#downloadButton').attr('href') ||
        res.data.match(/href="(https:\/\/download\d+\.mediafire\.com[^"]+)"/)?.[1]

    if (!link) throw '❌ No se pudo obtener el enlace de descarga.'

    const name =
        $('.promoDownloadName').first().attr('title') ||
        $('.filename').first().text().trim() ||
        link.split('/').pop().split('?')[0] ||
        'archivo'

    return { name: name.replace(/\s+/g, ' ').trim(), link }
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (command === 'cancelarmf') {
        const quotedId = m.quoted?.id
        if (!quotedId) return m.reply('❌ Responde al mensaje de progreso.')
        const dl = global.mfActiveDownloads.get(quotedId)
        if (!dl)   return m.reply('❌ No hay descarga activa para ese mensaje.')
        dl.controller.abort()
        global.mfActiveDownloads.delete(quotedId)
        return m.reply('🚫 *Descarga cancelada.*')
    }

    const url = args[0]
    if (!url || !/mediafire\.com/i.test(url)) {
        return sendStyled(conn, m,
            `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
            `✦ [ MEDIAFIRE DOWNLOADER ]\n` +
            `  ⟡ Uso: *${usedPrefix + command} <enlace>*\n` +
            `  ⟡ Ejemplo: ${usedPrefix + command} https://www.mediafire.com/file/XXXXX\n` +
            `  ⟡ Para cancelar responde al progreso con *.cancelar*`
        )
    }

    const controller = new AbortController()
    const { signal } = controller
    let tempPath

    try {
        // 1. Obtener los datos y el peso ANTES de enviar el mensaje
        const mfData = await mediafireDl(url)
        
        const head = await axios.head(mfData.link, {
            headers:    { 'User-Agent': 'Mozilla/5.0' },
            httpsAgent,
            signal,
            timeout:    10000
        })
        const sizeBytes = parseInt(head.headers['content-length'] || '0')
        const sizeFormatted = fmtBytes(sizeBytes)

        // 2. Enviar el mensaje inicial con TODA la información (sin editar después)
        const infoText = 
            `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
            `🔥 *${mfData.name}*\n` +
            `✦ Tamaño: ${sizeFormatted}\n` +
            `✦ Fuente: MediaFire\n\n` +
            `⏳ _Descargando archivo, espere..._\n` +
            `❄︎ _Enviado por ${global.botName || 'Hiyuki Celestial MD'}_`

        const { key: statusKey } = await sendStyled(conn, m, infoText)
        global.mfActiveDownloads.set(statusKey.id, { controller })

        // 3. Iniciar la descarga
        tempPath = join(tmpdir(), `mf_${Date.now()}_${mfData.name.replace(/[/\\:*?"<>|]/g, '_')}`)

        const response = await axios({
            method:       'get',
            url:          mfData.link,
            responseType: 'stream',
            signal,
            httpsAgent,
            timeout:      0
        })

        let dlBytes = 0
        const dlStart = Date.now()

        const dlStream = new Transform({
            transform(chunk, _, cb) {
                dlBytes += chunk.length
                const now   = Date.now()
                const secs  = (now - dlStart) / 1000 || 0.001
                const speed = dlBytes / secs
                const pct   = sizeBytes > 0 ? (dlBytes / sizeBytes) * 100 : 0
                process.stdout.write(`\r[MediaFire] 📥 ${pct.toFixed(1)}% | ${fmtBytes(dlBytes)} | ${fmtBytes(speed)}/s`)
                cb(null, chunk)
            }
        })

        await pipeline(response.data, dlStream, fs.createWriteStream(tempPath), { signal })
        console.log(`\n[MediaFire] ✅ ${mfData.name} descargado al servidor.`)

        const realSize = fs.statSync(tempPath).size
        let upBytes = 0
        const upStart = Date.now()

        const upStream = new Transform({
            transform(chunk, _, cb) {
                upBytes += chunk.length
                const now   = Date.now()
                const secs  = (now - upStart) / 1000 || 0.001
                const speed = upBytes / secs
                const pct   = (upBytes / realSize) * 100
                process.stdout.write(`\r[MediaFire] 📤 ${pct.toFixed(1)}% | ${fmtBytes(upBytes)}/${fmtBytes(realSize)} | ${fmtBytes(speed)}/s`)
                cb(null, chunk)
            }
        })

        const readStream = fs.createReadStream(tempPath).pipe(upStream)

        // 4. Enviar el archivo SIN caption (texto)
        await conn.sendMessage(m.chat, {
            document: { stream: readStream },
            fileName: mfData.name,
            mimetype: mimeLookup(mfData.name) || 'application/octet-stream'
        }, { quoted: m })

        console.log(`\n[MediaFire] 🚀 Enviado a ${m.sender}`)
        global.mfActiveDownloads.delete(statusKey.id)

    } catch (e) {
        if (e.name === 'AbortError' || e.code === 'ERR_CANCELED') {
            console.log('\n[MediaFire] 🛑 Cancelado.')
            m.reply('🛑 _Descarga cancelada._')
        } else {
            const msg = typeof e === 'string' ? e : `❌ *Error:* ${e.message}`
            m.reply(msg)
            console.error('\n[MediaFire ERROR]', e)
        }
    } finally {
        if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath)
    }
}

handler.help    = ['mediafire <enlace>', 'mf <enlace>']
handler.tags    = ['downloader']
handler.command = ['mediafire', 'mf', 'cancelarmf']

export default handler
            
