// ❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎
// ✦ [ PROTOCOLO DE CONVERSIÓN / STICKER ]
// ⟡ Design & Control: Adrien | XLR4-Security

import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { sticker } from '../lib/sticker.js' // Asegúrate de que esta ruta sea correcta en tu bot

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let stiker = false
    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''

        if (/webp|image|video/g.test(mime)) {
            await m.react('🪄')
            
            // CORRECCIÓN: Uso de downloadMediaMessage nativo
            let img = await downloadMediaMessage(
                q,
                'buffer',
                {},
                { logger: console, reuploadRequest: conn.updateMediaMessage }
            )

            if (!img) throw new Error('No se pudo interceptar el buffer de imagen/video.')

            let packname = global.packname || 'Hiyuki System'
            let author = global.author || 'Adrien'
            
            stiker = await sticker(img, false, packname, author)
        } else if (args[0]) {
            if (isUrl(args[0])) stiker = await sticker(false, args[0], global.packname, global.author)
            else return conn.sendMessage(m.chat, { text: `❄︎ [ ERROR ] El URL no es válido.` }, { quoted: m })
        }

        if (stiker) {
            await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
            await m.react('✅')
        } else {
            throw new Error('La conversión falló.')
        }

    } catch (e) {
        console.error(e)
        await m.react('❌')
        const errorMsg = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR DE RENDERIZADO ]\n  ⟡ Detalle: ${e.message}\n  ⟡ Uso: Responde a una imagen o video corto con *${usedPrefix + command}*`
        conn.sendMessage(m.chat, { text: errorMsg }, { quoted: m })
    }
}

handler.help = ['s', 'sticker']
handler.command = ['s', 'sticker', 'stiker']
handler.tags = ['tools']

export default handler

const isUrl = (text) => {
    return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)(jpe?g|gif|png)/, 'gi'))
}
