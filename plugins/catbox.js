// ❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎
// ✦ [ PROTOCOLO DE SUBIDA: CATBOX.MOE ]
// ⟡ Design & Control: Adrien | XLR4-Security

import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = async (m, { conn, usedPrefix, command }) => {
    // Verificamos si el usuario respondió a un mensaje con multimedia
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime) {
        const syntax = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR DE PARÁMETROS ]\n  ⟡ Responda a una imagen, video o audio para encriptarlo.\n  ⟡ Uso: *${usedPrefix + command}*`
        return conn.sendMessage(m.chat, { text: syntax }, { quoted: m })
    }

    await m.react('⏳')

    try {
        // Descargamos el buffer del mensaje citado
        let media = await q.download()
        if (!media) throw new Error('Buffer vacío.')

        // Creamos el formulario para enviarlo a Catbox
        let bodyForm = new FormData()
        bodyForm.append('reqtype', 'fileupload')
        // Le asignamos un nombre genérico para que Catbox lo acepte sin problemas
        bodyForm.append('fileToUpload', media, 'file_xlr4.bin') 

        // Enviamos la petición al servidor
        let res = await fetch('https://catbox.moe/user/api.php', {
            method: 'POST',
            body: bodyForm
        })
        
        if (!res.ok) throw new Error('Nodos de Catbox inactivos.')
        
        // Catbox devuelve directamente el link en texto plano
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
        conn.sendMessage(m.chat, { text: `❄︎ [ ERROR CRÍTICO ]\n⟡ Detalle: Fallo al subir el archivo al host.\n${e.message}` }, { quoted: m })
    }
}

handler.help = ['catbox', 'tourl']
handler.tags = ['tools']
handler.command = ['catbox', 'tourl', 'upload']

export default handler
