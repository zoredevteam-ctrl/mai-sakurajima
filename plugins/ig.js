// ❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎
// ✦ [ PROTOCOLO DE EXTRACCIÓN MULTI-NODO V3 ]
// ⟡ Design & Control: Adrien | XLR4-Security

import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const url = args[0] || (m.quoted ? (m.quoted.text || m.quoted.body || '') : '')

    if (!url) {
        const syntax = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR DE PARÁMETROS ]\n  ⟡ Ingrese un link válido de Instagram.\n  ⟡ Uso: *${usedPrefix + command} <link>*`
        return conn.sendMessage(m.chat, { text: syntax }, { quoted: m })
    }

    // Validación de enlace
    if (!url.match(/instagram\.com\/(p|reel|share|tv|stories)\//)) {
        return conn.sendMessage(m.chat, { text: `❄︎ [ ERROR ] El enlace no es un flujo de Instagram válido.` }, { quoted: m })
    }

    await m.react('⏳')

    try {
        const data = await getInstagramMedia(url)
        
        if (!data) {
            await m.react('❌')
            return conn.sendMessage(m.chat, { text: `❄︎ [ AGOTADO ] Ninguno de los 6 nodos respondió. Reintente más tarde.` }, { quoted: m })
        }

        await m.react('⬇️')

        // Construcción de la interfaz visual XLR4
        const caption = `> ⟪❄︎⟫ *Hiyuki System: IG Download*\n\n` +
            `✦ [ REPORTE DE EXTRACCIÓN ]\n` +
            `${data.title ? `  ⟡ *Usuario:* ${data.title}\n` : ''}` +
            `${data.like ? `  ⟡ *Likes:* ${data.like}\n` : ''}` +
            `${data.comment ? `  ⟡ *Comments:* ${data.comment}\n` : ''}` +
            `${data.duration ? `  ⟡ *Duración:* ${data.duration}\n` : ''}` +
            `  ⟡ *Formato:* ${data.format || 'mp4/jpg'}\n\n` +
            `⟡ *Seguridad:* XLR4-Security Activa`

        if (data.type === 'video') {
            await conn.sendMessage(m.chat, { 
                video: { url: data.url }, 
                caption, 
                mimetype: 'video/mp4', 
                fileName: 'hiyuki_ig.mp4' 
            }, { quoted: m })
        } else if (data.type === 'image') {
            await conn.sendMessage(m.chat, { 
                image: { url: data.url }, 
                caption 
            }, { quoted: m })
        }

        await m.react('✅')

    } catch (e) {
        console.error('[XLR4 ERROR]', e)
        await m.react('❌')
        conn.sendMessage(m.chat, { text: `❄︎ [ ERROR CRÍTICO ]\n⟡ Detalle: ${e.message}` }, { quoted: m })
    }
}

// ── Funcción de obtención Multi-API ──────────────────────────────────────────
async function getInstagramMedia(url) {
    // Aseguramos que global.APIs exista para evitar crash
    if (!global.APIs) global.APIs = {} 

    const apis = [
        { 
            endpoint: `https://api.ryzendesu.vip/api/downloader/igdl?url=${encodeURIComponent(url)}`, 
            extractor: res => {
                const item = res?.data?.[0]
                if (!item?.url) return null
                return { type: item.url.includes('.mp4') ? 'video' : 'image', url: item.url, format: 'mp4' }
            }
        },
        { 
            endpoint: `https://api.nekolabs.my.id/downloader/instagram?url=${encodeURIComponent(url)}`, 
            extractor: res => {
                if (!res.success || !res.result?.downloadUrl?.length) return null
                const mediaUrl = res.result.downloadUrl[0]
                return { type: res.result.metadata?.isVideo ? 'video' : 'image', title: res.result.metadata?.username, like: res.result.metadata?.like, url: mediaUrl }
            }
        },
        { 
            endpoint: `https://deliriustestapi.xyz/api/igdl?url=${encodeURIComponent(url)}`, 
            extractor: res => {
                const item = res.data?.[0]
                if (!item?.url) return null
                return { type: item.type === 'video' ? 'video' : 'image', url: item.url }
            }
        }
    ]

    for (const { endpoint, extractor } of apis) {
        try {
            const res = await fetch(endpoint).then(r => r.json())
            const result = extractor(res)
            if (result && result.url) return result
        } catch (e) {
            console.log(`❄︎ [ LOG ] Nodo fallido, saltando...`)
        }
        await new Promise(r => setTimeout(r, 800))
    }
    return null
}

handler.help = ['ig']
handler.tags = ['dl']
handler.command = ['instagram', 'ig', 'igdl']

export default handler
