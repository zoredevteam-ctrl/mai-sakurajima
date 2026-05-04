import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { sticker } from '../lib/sticker.js'

const HEADER = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎`

const MIME_IMAGE = /image\/(jpe?g|png|webp)/i
const MIME_VIDEO = /video\//i

const PACKNAME = global.botName   || 'Hiyuki Celestial MD'
const AUTHOR   = global.ownerName || '˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let q    = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    const isUrl    = args[0] && /^https?:\/\//i.test(args[0])
    const hasMedia = MIME_IMAGE.test(mime) || MIME_VIDEO.test(mime)

    if (!hasMedia && !isUrl) {
        return conn.sendMessage(m.chat, {
            text: `${HEADER}\n\n✦ [ ERROR DE MUESTRA ]\n  ⟡ Responde a una *imagen* o *video* con *${usedPrefix + command}*\n  ⟡ También puedes pasar una *URL* directamente.`
        }, { quoted: m })
    }

    await m.react('🪄')

    try {
        let buffer

        if (isUrl) {
            const res = await fetch(args[0])
            if (!res.ok) throw new Error(`URL inválida (${res.status})`)
            buffer = Buffer.from(await res.arrayBuffer())
        } else {
            buffer = await downloadMediaMessage(
                q,
                'buffer',
                {},
                { logger: console, reuploadRequest: conn.updateMediaMessage }
            )
            if (!buffer) throw new Error('No se pudo extraer el buffer del mensaje.')
        }

        let webpBuf = await sticker(buffer, null, PACKNAME, AUTHOR)

        if (!webpBuf || webpBuf instanceof Error) throw webpBuf || new Error('Conversión fallida.')

        await conn.sendMessage(m.chat, { sticker: webpBuf }, { quoted: m })
        await m.react('✅')

    } catch (e) {
        console.error('[sticker]', e)
        await m.react('❌')
        conn.sendMessage(m.chat, {
            text: `${HEADER}\n\n✦ [ FALLO DE RENDERIZADO ]\n  ⟡ ${e?.message || 'Error desconocido'}`
        }, { quoted: m })
    }
}

handler.help    = ['s', 'sticker', 'stiker']
handler.command = ['s', 'sticker', 'stiker']
handler.tags    = ['tools']

export default handler
    
