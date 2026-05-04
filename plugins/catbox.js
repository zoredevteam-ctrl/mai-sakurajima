import fetch from 'node-fetch'
import FormData from 'form-data'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime) {
        const syntax = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR DE PARÁMETROS ]\n  ⟡ Responda a una imagen, video o audio para encriptarlo.\n  ⟡ Uso: *${usedPrefix + command}*`
        return conn.sendMessage(m.chat, { text: syntax }, { quoted: m })
    }

    await m.react('⏳')

    try {
        // ⟡ XLR4 BYPASS: Extracción directa del núcleo Baileys
        let mtype = q.mtype || m.mtype
        let mediaType = mtype ? mtype.replace('Message', '') : mime.split('/')[0]
        
        // Ajuste para notas de voz o audios
        if (mediaType === 'audio' || mediaType === 'voice') mediaType = 'audio'

        const stream = await downloadContentFromMessage(q.msg || q, mediaType)
        let media = Buffer.from([])
        for await(const chunk of stream) {
            media = Buffer.concat([media, chunk])
        }

        if (!media.length) throw new Error('Buffer vacío.')

        let bodyForm = new FormData()
        bodyForm.append('reqtype', 'fileupload')
        
        // Añadimos una extensión dinámica según el mime para evitar bloqueos
        let ext = mime.split('/')[1].split(';')[0]
        bodyForm.append('fileToUpload', media, `file_xlr4.${ext}`) 

        let res = await fetch('https://catbox.moe/user/api.php', {
            method: 'POST',
            body: bodyForm
        })
        
        if (!res.ok) throw new Error('Nodos de Catbox inactivos.')
        
        let link = await res.text()

        await m.react('⬇️')

        const responseText = `> ⟪❄︎⟫ *Hiyuki System: Cloud Storage*\n\n` +
            `✦ [ REPORTE DE ENLACE ]\n` +
            `  ⟡ *Servidor:* Catbox.moe\n` +
            `  ⟡ *Tamaño:* ${(media.length / 1024 / 1024).toFixed(2)} MB\n` +
            `  ⟡ *URL:* ${link}\n\n` +
            `⟡ *Seguridad:* XLR4-Security Activa`

        await conn.sendMessage(m.chat, { text: responseText }, { quoted: m })
        await m.react('✅')

    } catch (e) {
        console.error('[XLR4 CATBOX ERROR]', e)
        await m.react('❌')
        conn.sendMessage(m.chat, { text: `❄︎ [ ERROR CRÍTICO ]\n⟡ Detalle: Extracción Baileys Fallida.\n${e.message.slice(0, 50)}` }, { quoted: m })
    }
}

handler.help = ['catbox', 'tourl']
handler.tags = ['tools']
handler.command = ['catbox', 'tourl', 'upload']

export default handler
