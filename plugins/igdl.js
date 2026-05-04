// plugins/igdl.js

const isInstagram = (url = '') => /instagram\.com/i.test(url)

// ── APIs con fallback ─────────────────────────────────────────────────────────
const descargarIG = async (url) => {

    // API 1 — instadown
    try {
        const res  = await fetch(`https://instadown.vercel.app/api?url=${encodeURIComponent(url)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        const data = await res.json()
        if (data?.url || data?.video) return { url: data.url || data.video, tipo: 'video' }
        if (data?.image) return { url: data.image, tipo: 'image' }
    } catch {}

    // API 2 — saveig
    try {
        const res  = await fetch(`https://saveig.app/api?url=${encodeURIComponent(url)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        const data = await res.json()
        const item = data?.data?.[0]
        if (item?.url) return { url: item.url, tipo: item.type || 'video' }
    } catch {}

    // API 3 — igdownloader
    try {
        const res  = await fetch(`https://igdownloader.app/api/downloader?url=${encodeURIComponent(url)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        const data = await res.json()
        if (data?.medias?.[0]?.url) return { url: data.medias[0].url, tipo: 'video' }
    } catch {}

    // API 4 — Nexo
    try {
        const res  = await fetch(`https://nex-magical.vercel.app/download/instagram?url=${encodeURIComponent(url)}&apikey=NEX-D0E7E64C8F5E44E98F00D6B4`)
        const data = await res.json()
        const item = data?.result?.[0] || data?.resultado?.[0]
        if (item?.url) return { url: item.url, tipo: item.type || 'video' }
    } catch {}

    throw new Error('no se pudo obtener el contenido')
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const url = args[0] || (m.quoted?.body || '').trim()

    if (!url || !isInstagram(url)) return m.reply(
        `⟪❄︎⟫ ingresa un link válido de Instagram\n✎ uso: *${usedPrefix + command} <link>*❄︎`
    )

    await m.react('⏳')

    try {
        const media = await descargarIG(url)

        await m.react('⬇')

        const caption = `⟪❄︎⟫ *Instagram*\n✎ descarga completada❄︎`

        if (media.tipo === 'video' || media.url.includes('.mp4')) {
            await conn.sendMessage(m.chat, {
                video:    { url: media.url },
                caption,
                mimetype: 'video/mp4'
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, {
                image:   { url: media.url },
                caption
            }, { quoted: m })
        }

        await m.react('✓')

    } catch (e) {
        console.error('[IG ERROR]', e.message)
        await m.react('✗')
        await m.reply(`⟪❄︎⟫ no pude descargar ese contenido\n✎ puede ser privado o las APIs fallaron❄︎`)
    }
}

handler.command = ['ig', 'instagram', 'igdl']
handler.tags    = ['dl']
export default handler
