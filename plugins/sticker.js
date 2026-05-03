// plugins/sticker.js

import { downloadMediaMessage } from '@whiskeysockets/baileys'
import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let stiker = false
    try {
        let q    = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''

        // nombre del usuario (número si no tiene name)
        const userName = m.pushName || m.sender.split('@')[0]

        // fecha y hora actuales
        const now    = new Date()
        const fecha  = now.toLocaleDateString('es-ES',  { day: '2-digit', month: '2-digit', year: 'numeric' })
        const hora   = now.toLocaleTimeString('es-ES',  { hour: '2-digit', minute: '2-digit' })

        // lo que se ve en el sticker al mantener presionado
        const packname = `❄︎ ${userName}  •  ${fecha} ${hora}`
        const author   = `❄︎ ${global.botName || 'Hiyuki Celestial MD'}`

        if (/webp|image|video/g.test(mime)) {
            await m.react('🪄')

            let img = await downloadMediaMessage(
                q,
                'buffer',
                {},
                { logger: console, reuploadRequest: conn.updateMediaMessage }
            )

            if (!img) throw new Error('no se pudo descargar el archivo')

            stiker = await sticker(img, false, packname, author)

        } else if (args[0] && /https?:\/\//.test(args[0])) {
            stiker = await sticker(false, args[0], packname, author)

        } else {
            return conn.sendMessage(m.chat, {
                text: `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                      `✦ [ USO ]\n` +
                      `  ⟡ Responde a una imagen o video con *${usedPrefix + command}*`
            }, { quoted: m })
        }

        if (stiker) {
            await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
            await m.react('✅')
        }

    } catch (e) {
        console.error('[STICKER]', e.message)
        await m.react('❌')
        conn.sendMessage(m.chat, {
            text: `❄︎ [ ERROR ]\n⟡ ${e.message}`
        }, { quoted: m })
    }
}

handler.help    = ['s']
handler.command = ['s', 'sticker', 'stiker']
handler.tags    = ['tools']

export default handler
