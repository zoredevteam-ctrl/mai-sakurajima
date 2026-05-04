// ❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎
// ✦ [ PROTOCOLO DE CONVERSIÓN / STICKER ]
// ⟡ Design & Control: Adrien | XLR4-Security

import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let stiker = false
    try {
        // Determinamos si es un mensaje directo o citado
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''

        if (/webp|image|video/g.test(mime)) {
            await m.react('🪄')
            
            // Bypass del núcleo: Descarga directa desde Baileys
            let img = await downloadMediaMessage(
                q,
                'buffer',
                {},
                { logger: console, reuploadRequest: conn.updateMediaMessage }
            )

            if (!img) throw new Error('No se pudo extraer el buffer de la señal.')

            let packname = global.packname || 'Hiyuki System'
            let author = global.author || 'Adrien | XLR4'
            
            stiker = await sticker(img, false, packname, author)
        } else if (args[0] && /https?:\/\//.test(args[0])) {
            stiker = await sticker(false, args[0], global.packname, global.author)
        } else {
            const warning = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR DE MUESTRA ]\n  ⟡ Responde a una imagen o video con *${usedPrefix + command}*`
            return conn.sendMessage(m.chat, { text: warning }, { quoted: m })
        }

        if (stiker) {
            await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
            await m.react('✅')
        }

    } catch (e) {
        console.error(e)
        await m.react('❌')
        const errorMsg = `❄︎ [ FALLO DE RENDERIZADO ]\n⟡ Detalle: ${e.message}`
        conn.sendMessage(m.chat, { text: errorMsg }, { quoted: m })
    }
}

handler.help = ['s']
handler.command = ['s', 'sticker', 'stiker']
handler.tags = ['tools']

export default handler
