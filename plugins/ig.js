// ❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎
// ✦ [ PROTOCOLO DE EXTRACCIÓN MULTI-NODO V4 ]
// ⟡ Design & Control: Adrien | XLR4-Security
// ⟡ Integration: Yuki-API Node

import fetch from 'node-fetch'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const url = args[0] || (m.quoted ? (m.quoted.text || m.quoted.body || '') : '')

    if (!url) {
        const syntax = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR DE PARÁMETROS ]\n  ⟡ Ingrese un link válido de Instagram.\n  ⟡ Uso: *${usedPrefix + command} <link>*`
        return conn.sendMessage(m.chat, { text: syntax }, { quoted: m })
    }

    if (!url.match(/instagram\.com\/(p|reel|share|tv|stories)\//)) {
        return conn.sendMessage(m.chat, { text: `❄︎ [ ERROR ] El enlace no es un flujo de Instagram válido.` }, { quoted: m })
    }

    await m.react('⏳')

    try {
        const data = await getInstagramMedia(url)
        
        if (!data) {
            await m.react('❌')
            return conn.sendMessage(m.chat, { text: `❄︎ [ AGOTADO ] Ninguno de los nodos (incluyendo Yuki-API) respondió. Servidores en mantenimiento.` }, { quoted: m })
        }

        await m.react('⬇️')

        const caption = `> ⟪❄︎⟫ *Hiyuki System: IG Download*\n\n` +
            `✦ [ REPORTE DE EXTRACCIÓN ]\n` +
            `${data.title ? `  ⟡ *Usuario:* ${data.title}\n` : ''}` +
            `${data.duration ? `  ⟡ *Duración:* ${data.duration}\n` : ''}` +
            `  ⟡ *Estado:* Encriptación Exitosa\n` +
            `  ⟡ *Seguridad:* XLR4-Security Activa`

        if (data.type === 'video') {
            await conn.sendMessage(m.chat, { 
                video: { url: data.url }, 
                caption, 
                mimetype: 'video/mp4', 
                fileName: 'hiyuki_ig.mp4' 
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
        conn.sendMessage(m.chat, { text: `❄︎ [ ERROR CRÍTICO ]\n⟡ Detalle: ${e.message.slice(0, 50)}` }, { quoted: m })
    }
}

async function getInstagramMedia(url) {
    const apis = [
        { 
            // ⟡ NUEVA API YUKI-WABOT
            endpoint: `https://api.yuki-wabot.my.id/api/dowloader/igdl?url=${encodeURIComponent(url)}`, 
            extractor: res => {
                const result = res?.result?.[0] || res?.result
                if (!result?.url) return null
                return { 
                    type: result.url.includes('.mp4') || result.type === 'video' ? 'video' : 'image', 
                    url: result.url,
                    title: result.username || null 
                }
            }
        },
        { 
            endpoint: `https://api.ryzendesu.vip/api/downloader/igdl?url=${encodeURIComponent(url)}`, 
            extractor: res => {
                const item = res?.data?.[0]
                if (!item?.url) return null
                return { type: item.url.includes('.mp4') ? 'video' : 'image', url: item.url }
            }
        },
        { 
            endpoint: `https://api.nekolabs.my.id/downloader/instagram?url=${encodeURIComponent(url)}`, 
            extractor: res => {
                if (!res.success || !res.result?.downloadUrl?.length) return null
                const mediaUrl = res.result.downloadUrl[0]
                return { type: res.result.metadata?.isVideo ? 'video' : 'image', title: res.result.metadata?.username, url: mediaUrl }
            }
        }
    ]

    for (const { endpoint, extractor } of apis) {
        try {
            const res = await fetch(endpoint).then(r => r.json())
            const result = extractor(res)
            if (result && result.url) return result
        } catch (e) {
            console.log(`❄︎ [ LOG ] Nodo inestable, saltando...`)
        }
        await new Promise(r => setTimeout(r, 600))
    }
    return null
}

handler.help = ['ig']
handler.tags = ['dl']
handler.command = ['instagram', 'ig', 'igdl']

export default handler
