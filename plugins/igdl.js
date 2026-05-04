// plugins/igdl.js

const isInstagram = url => /instagram\.com\/(p|reel|share|tv|stories)\//i.test(url)

async function getInstagramMedia(url) {
    const apis = [
        {
            endpoint: `https://api.ryzendesu.vip/api/downloader/igdl?url=${encodeURIComponent(url)}`,
            extractor: res => {
                const item = res?.data?.[0]
                if (!item?.url) return null
                return { type: item.url.includes('.mp4') ? 'video' : 'image', url: item.url }
            }
        },
        {
            endpoint: `https://nex-magical.vercel.app/download/instagram?url=${encodeURIComponent(url)}&apikey=NEX-D0E7E64C8F5E44E98F00D6B4`,
            extractor: res => {
                const item = res?.result?.[0] || res?.resultado?.[0]
                if (!item?.url) return null
                return { type: item.type === 'video' ? 'video' : 'image', url: item.url }
            }
        },
        {
            endpoint: `https://api.nekorinn.my.id/downloader/instagram?url=${encodeURIComponent(url)}`,
            extractor: res => {
                if (!res.success || !res.result?.downloadUrl?.length) return null
                const mediaUrl = res.result.downloadUrl[0]
                if (!mediaUrl) return null
                return {
                    type:     res.result.metadata?.isVideo ? 'video' : 'image',
                    url:      mediaUrl,
                    usuario:  res.result.metadata?.username || null,
                    caption:  res.result.metadata?.caption  || null,
                    likes:    res.result.metadata?.like     || null,
                    comments: res.result.metadata?.comment  || null
                }
            }
        },
        {
            endpoint: `https://api.lolhuman.xyz/api/instagram2?apikey=nolimit&url=${encodeURIComponent(url)}`,
            extractor: res => {
                const item = res?.result?.[0]
                if (!item?.url) return null
                return { type: item.type === 'video' ? 'video' : 'image', url: item.url }
            }
        },
        {
            endpoint: `https://api.tiklydown.eu.org/api/download/social?url=${encodeURIComponent(url)}`,
            extractor: res => {
                const item = res?.result?.medias?.[0]
                if (!item?.url) return null
                return { type: item.type === 'video' ? 'video' : 'image', url: item.url }
            }
        }
    ]

    for (const { endpoint, extractor } of apis) {
        try {
            const res    = await fetch(endpoint, { headers: { 'User-Agent': 'Mozilla/5.0' } })
            const data   = await res.json()
            const result = extractor(data)
            if (result) return result
        } catch {}
        await new Promise(r => setTimeout(r, 500))
    }
    return null
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const url = args[0] || (m.quoted?.body || '').trim()

    if (!url) return m.reply(
        `⟪❄︎⟫ ingresa un link de Instagram\n✎ uso: *${usedPrefix + command} <link>*❄︎`
    )
    if (!isInstagram(url)) return m.reply(
        `⟪❄︎⟫ el link no es válido\n✎ debe ser de Instagram (reel, post, stories)❄︎`
    )

    await m.react('⏳')

    try {
        const media = await getInstagramMedia(url)

        if (!media) {
            await m.react('✗')
            return m.reply(`⟪❄︎⟫ no pude obtener el contenido\n✎ puede ser privado o las APIs no responden❄︎`)
        }

        await m.react('⬇')

        const caption =
            `⟪❄︎⟫ *Instagram*\n` +
            (media.usuario  ? `✎ usuario: *${media.usuario}*\n`      : '') +
            (media.caption  ? `✎ desc: ${media.caption.slice(0, 80)}\n` : '') +
            (media.likes    ? `✎ likes: *${media.likes}*\n`           : '') +
            (media.comments ? `✎ comentarios: *${media.comments}*\n`  : '') +
            `✎ descarga completada❄︎`

        if (media.type === 'video') {
            await conn.sendMessage(m.chat, {
                video:    { url: media.url },
                caption,
                mimetype: 'video/mp4',
                fileName: 'hiyuki_ig.mp4'
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, {
                image:   { url: media.url },
                caption
            }, { quoted: m })
        }

        await m.react('✓')

    } catch (e) {
        console.error('[IGDL ERROR]', e.message)
        await m.react('✗')
        await m.reply(`⟪❄︎⟫ error: ${e.message.slice(0, 100)}❄︎`)
    }
}

handler.command = ['ig', 'instagram', 'igdl']
handler.tags    = ['dl']
export default handler
