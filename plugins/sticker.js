// ❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎
// ✦ [ PROTOCOLO DE CONVERSIÓN / STICKER ]
// ⟡ Design & Control: Adrien | XLR4-Security

import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let stiker = false
    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''

        if (/webp|image|video/g.test(mime)) {
            await m.react('🪄')
            
            // Usando el helper de simple.js (getFile)
            let img = await q.download?.() 
            
            // Si el anterior falla, usamos el método universal de simple.js
            if (!img) {
                let cl = await conn.getFile(q)
                img = cl.data
            }

            if (!img) throw new Error('No se pudo interceptar el flujo de datos.')

            let packname = global.packname || 'Hiyuki System'
            let author = global.author || 'Adrien | XLR4'
            
            stiker = await sticker(img, false, packname, author)
        } else if (args[0]) {
            if (/https?:\/\//.test(args[0])) stiker = await sticker(false, args[0], global.packname, global.author)
            else return conn.sendMessage(m.chat, { text: `❄︎ [ ERROR ] El URL no es válido.` }, { quoted: m })
        }

        if (stiker) {
            await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
            await m.react('✅')
        } else {
            throw new Error('El renderizado falló.')
        }

    } catch (e) {
        console.error(e)
        await m.react('❌')
        const errorMsg = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR DE RENDERIZADO ]\n  ⟡ Detalle: ${e.message}\n  ⟡ Uso: Responde a una imagen o video con *${usedPrefix + command}*`
        
        // Usamos sendMessage nativo por si simple.js no tiene reply
        await conn.sendMessage(m.chat, { text: errorMsg }, { quoted: m })
    }
}

handler.help = ['s', 'sticker']
handler.command = ['s', 'sticker', 'stiker']
handler.tags = ['tools']

export default handler
