/**
 * PING — MAI SAKURAJIMA
 * Comandos: #ping, #p, #speed, #latencia
 * Z0RT SYSTEMS
 */

import { performance } from 'perf_hooks'

const getIconThumb = async () => {
    try {
        const res = await fetch(global.icono || global.banner || '')
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

const rateLatency = ms => {
    const n = parseFloat(ms)
    if (n < 100) return '✦ Excelente'
    if (n < 300) return '◈ Buena'
    if (n < 600) return '◇ Regular'
    return           '✧ Lenta'
}

let handler = async (m, { conn }) => {
    const start    = performance.now()
    await m.reply('...')
    const latencia = (performance.now() - start).toFixed(2)
    const thumb    = await getIconThumb()

    const txt =
        `⌜ ──────────── ⌝\n` +
        `  P I N G\n` +
        `⌞ ──────────── ⌟\n\n` +
        `  ✦ Latencia    ${latencia} ms\n` +
        `  ✦ Estado      ${rateLatency(latencia)}\n\n` +
        `  ◈ Canal       ${global.rcanal || 'sin configurar'}\n\n` +
        `  ⋆ ─── ✧ ─── Z0RT SYSTEMS ─── ✧ ─── ⋆`

    await conn.sendMessage(m.chat, {
        text: txt,
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid:   global.newsletterJid,
                serverMessageId: -1,
                newsletterName:  global.newsletterName
            },
            externalAdReply: {
                title:                 `${global.botName || 'Mai Sakurajima'}`,
                body:                  `${latencia} ms  ─  ${rateLatency(latencia)}`,
                mediaType:             1,
                thumbnail:             thumb,
                renderLargerThumbnail: false,
                sourceUrl:             global.rcanal || ''
            }
        }
    }, { quoted: m })
}

handler.command = ['ping', 'p', 'speed', 'latencia']
export default handler