// ❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎
// ✦ [ PROTOCOLO DE EXTRACCIÓN INSTAGRAM ]
// ⟡ Design & Control: Adrien | XLR4-Security

import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // 1. Obtener URL de argumentos o mensaje citado
    const url = args[0] || (m.quoted ? (m.quoted.text || m.quoted.body || '') : '')

    if (!url || !/instagram\.com/i.test(url)) {
        const syntax = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR DE PARÁMETROS ]\n  ⟡ Ingrese un link válido de Instagram.\n  ⟡ Uso: *${usedPrefix + command} <link>*`
        return conn.sendMessage(m.chat, { text: syntax }, { quoted: m })
    }

    await m.react('⏳')

    try {
        // Usando una API de alta disponibilidad (Ryzendesu)
        const response = await fetch(`https://api.ryzendesu.vip/api/downloader/igdl?url=${encodeURIComponent(url)}`)
        const res = await response.json()
        
        const data = res?.data?.[0]
        if (!data || !data.url) throw new Error('No se interceptó el flujo de datos.')

        await m.react('⬇️')

        const caption = `> ⟪❄︎⟫ Extracción Exitosa\n\n` +
                        `✦ [ REPORTE TÉCNICO ]\n` +
                        `  ⟡ Plataforma: *Instagram*\n` +
                        `  ⟡ Seguridad: *XLR4-Protocol*`

        if (data.url.includes('.mp4')) {
            await conn.sendMessage(m.chat, {
                video: { url: data.url },
                caption,
                mimetype: 'video/mp4'
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, {
                image: { url: data.url },
                caption
            }, { quoted: m })
        }

        await m.react('✅')

    } catch (e) {
        console.error('[XLR4 ERROR]', e)
        await m.react('❌')
        conn.sendMessage(m.chat, { text: `❄︎ [ FALLO ] El servidor no respondió. Reintente en unos segundos.` }, { quoted: m })
    }
}

// ✦ CONFIGURACIÓN DEL REGISTRO
handler.help = ['ig']
handler.tags = ['dl']
handler.command = ['ig', 'instagram', 'igdl'] // Asegúrate que esté en minúsculas

export default handler
