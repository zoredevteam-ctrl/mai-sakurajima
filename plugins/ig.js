// ❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎
// ✦ [ NÚCLEO DE EXTRACCIÓN INSTAGRAM V2 ]
// ⟡ Design & Control: Adrien | XLR4-Security

import axios from 'axios'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const url = args[0] || (m.quoted ? (m.quoted.text || m.quoted.body || '') : '')

    if (!url || !/instagram\.com/i.test(url)) {
        const syntax = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR DE PARÁMETROS ]\n  ⟡ Ingrese un link válido de Instagram.\n  ⟡ Uso: *${usedPrefix + command} <link>*`
        return conn.sendMessage(m.chat, { text: syntax }, { quoted: m })
    }

    await m.react('⏳')

    // Matriz de APIs (Nodos de respaldo)
    const apiEndPoints = [
        `https://api.ryzendesu.vip/api/downloader/igdl?url=${encodeURIComponent(url)}`,
        `https://api.lolhuman.xyz/api/instagram?apikey=8534f14d5610abc1fb3045ad&url=${encodeURIComponent(url)}`,
        `https://deliriustestapi.xyz/api/igdl?url=${encodeURIComponent(url)}`
    ]

    let videoUrl = null
    let success = false

    // Bucle de rescate: Prueba cada API hasta que una funcione
    for (const api of apiEndPoints) {
        try {
            const { data } = await axios.get(api)
            
            // Lógica de extracción según la API que responda
            if (data.data?.[0]?.url) videoUrl = data.data[0].url
            else if (data.result?.[0]) videoUrl = data.result[0]
            else if (data.result?.url) videoUrl = data.result.url

            if (videoUrl) {
                success = true
                break 
            }
        } catch (e) {
            console.log(`❄︎ [ LOG ] Nodo fallido, intentando siguiente...`)
            continue
        }
    }

    if (!success) {
        await m.react('❌')
        return conn.sendMessage(m.chat, { text: `❄︎ [ ERROR ] Todos los nodos de extracción están saturados. Intente en unos minutos.` }, { quoted: m })
    }

    try {
        await m.react('⬇️')

        const caption = `> ⟪❄︎⟫ Extracción Exitosa\n\n✦ [ REPORTE TÉCNICO ]\n  ⟡ Plataforma: *Instagram*\n  ⟡ Seguridad: *XLR4-Protocol*\n  ⟡ Estado: *Encriptado/Enviado*`

        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption,
            mimetype: 'video/mp4'
        }, { quoted: m })

        await m.react('✅')

    } catch (err) {
        await m.react('❌')
        conn.sendMessage(m.chat, { text: `❄︎ [ ERROR ] Fallo al procesar el buffer de video.` }, { quoted: m })
    }
}

handler.help = ['ig']
handler.tags = ['dl']
handler.command = ['ig', 'instagram', 'igdl']

export default handler
