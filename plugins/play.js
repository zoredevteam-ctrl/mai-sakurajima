// plugins/play.js

const NEX_BASE = 'https://nex-magical.vercel.app'
const NEX_KEY  = 'NEX-D0E7E64C8F5E44E98F00D6B4'

// ── Fetch con timeout ─────────────────────────────────────────────────────────
const nexFetch = async (url, timeout = 25000) => {
    const controller = new AbortController()
    const timer      = setTimeout(() => controller.abort(), timeout)
    try {
        const res = await fetch(url, {
            signal:  controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36',
                'Accept':     'application/json',
                'x-api-key':  NEX_KEY
            }
        })
        if (!res.ok) throw new Error('HTTP ' + res.status)
        const raw = await res.text()
        return JSON.parse(
            raw.replace(/\bverdadero\b/g, 'true')
               .replace(/\bfalso\b/g,     'false')
               .replace(/\bnulo\b/g,      'null')
        )
    } finally {
        clearTimeout(timer)
    }
}

// ── Buscar en YouTube ─────────────────────────────────────────────────────────
const searchYoutube = async (query) => {
    try {
        const r = await nexFetch(`${NEX_BASE}/search/youtube?q=${encodeURIComponent(query)}&apikey=${NEX_KEY}`)
        if (r?.status && r?.result?.length) {
            const filtered = r.result.filter(v => {
                const parts = (v.duration || '0:00').split(':')
                const secs  = parts.length >= 2
                    ? parseInt(parts[parts.length - 2] || 0) * 60 + parseInt(parts[parts.length - 1] || 0)
                    : 0
                return secs >= 60
            })
            const s = filtered[0] || r.result[0]
            return {
                title:    s.title    || query,
                url:      s.link     || '',
                author:   s.channel  || 'Desconocido',
                duration: s.duration || 'N/A',
                thumb:    s.imageUrl || ''
            }
        }
    } catch (e) { console.log('[PLAY] search falló:', e.message) }
    return null
}

// ── Descargar audio ───────────────────────────────────────────────────────────
const getAudio = async (videoUrl) => {
    const r    = await nexFetch(`${NEX_BASE}/download/audio?url=${encodeURIComponent(videoUrl)}&apikey=${NEX_KEY}`)
    const link = r?.result?.url || r?.resultado?.url || null
    if (link?.startsWith('http')) return link
    throw new Error('no se obtuvo URL de descarga')
}

// ── Thumbnail del bot ─────────────────────────────────────────────────────────
const getThumb = async () => {
    try {
        const res = await fetch(global.icono || global.banner || '')
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

const ctx = (thumb, title, body) => ({
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid:   global.newsletterJid,
        serverMessageId: -1,
        newsletterName:  global.newsletterName
    },
    externalAdReply: {
        title:                 title || global.botName || 'Hiruka',
        body:                  body  || global.newsletterName || '',
        mediaType:             1,
        thumbnail:             thumb,
        renderLargerThumbnail: false,
        sourceUrl:             global.rcanal || ''
    }
})

// ── Handler ───────────────────────────────────────────────────────────────────
let handler = async (m, { conn, text }) => {
    const query = (text || '').trim()
    const thumb = await getThumb()
    const px    = global.prefix || '#'

    if (!query) return conn.sendMessage(m.chat, {
        text:
            `⊹ ──────────────────── ⊹\n` +
            `  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  ✦  𝐌 𝐔 𝐒 𝐈 𝐂\n` +
            `⊹ ──────────────────── ⊹\n\n` +
            `  ◈ uso    *${px}play <canción o link>*\n` +
            `  ◈ ejemplo  *${px}play bad bunny*\n` +
            `  ◈ link     *${px}play https://youtu.be/...*\n\n` +
            `> ✎ ${global.newsletterName || global.botName}`,
        contextInfo: ctx(thumb)
    }, { quoted: m })

    await m.react('✦')

    try {
        // ── Resolver búsqueda o link ──────────────────────────────────────────
        let song = null
        const isLink = query.includes('youtube.com/watch') || query.includes('youtu.be/')

        if (isLink) {
            const videoId = query.match(/(?:youtu\.be\/|watch\?v=)([a-zA-Z0-9_-]{11})/)?.[1]
            song = {
                title:    'YouTube Video',
                url:      query,
                author:   'N/A',
                duration: 'N/A',
                thumb:    videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ''
            }
        } else {
            song = await searchYoutube(query)
        }

        if (!song?.url) {
            await m.react('✗')
            return conn.sendMessage(m.chat, {
                text:
                    `⊹ ──────────────────── ⊹\n` +
                    `  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  ✦  𝐌 𝐔 𝐒 𝐈 𝐂\n` +
                    `⊹ ──────────────────── ⊹\n\n` +
                    `  ◈ no encontré resultados para\n` +
                    `  ◈ *${query}*\n\n` +
                    `> ✎ ${global.newsletterName || global.botName}`,
                contextInfo: ctx(thumb)
            }, { quoted: m })
        }

        // ── Mensaje de info mientras descarga ─────────────────────────────────
        const infoTxt =
            `⊹ ──────────────────── ⊹\n` +
            `  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  ✦  𝐌 𝐔 𝐒 𝐈 𝐂\n` +
            `⊹ ──────────────────── ⊹\n\n` +
            `  ◈ título    *${song.title}*\n` +
            `  ◈ canal     ${song.author}\n` +
            `  ◈ duración  ${song.duration}\n\n` +
            `  descargando... (⁠✿⁠◡⁠‿⁠◡⁠)\n\n` +
            `> ✎ ${global.newsletterName || global.botName}`

        const infoCtx = ctx(thumb, song.title.slice(0, 60), song.author)
        infoCtx.externalAdReply.thumbnailUrl = song.thumb || global.banner
        infoCtx.externalAdReply.sourceUrl    = song.url

        if (song.thumb) {
            await conn.sendMessage(m.chat, {
                image:       { url: song.thumb },
                caption:     infoTxt,
                contextInfo: infoCtx
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, {
                text:        infoTxt,
                contextInfo: infoCtx
            }, { quoted: m })
        }

        await m.react('⬇')

        // ── Descargar y enviar audio ──────────────────────────────────────────
        const audioUrl    = await getAudio(song.url)
        const audioRes    = await fetch(audioUrl)
        if (!audioRes.ok) throw new Error('error al descargar audio: HTTP ' + audioRes.status)
        const audioBuffer = Buffer.from(await audioRes.arrayBuffer())
        if (!audioBuffer || audioBuffer.length < 1000) throw new Error('audio vacío o corrupto')

        const audioCtx = ctx(thumb, song.title.slice(0, 60), song.author)
        audioCtx.externalAdReply.thumbnailUrl = song.thumb || global.banner
        audioCtx.externalAdReply.sourceUrl    = song.url

        await conn.sendMessage(m.chat, {
            audio:       audioBuffer,
            mimetype:    'audio/mpeg',
            ptt:         false,
            fileName:    song.title.slice(0, 60) + '.mp3',
            contextInfo: audioCtx
        }, { quoted: m })

        await m.react('✓')

    } catch (e) {
        console.error('[PLAY ERROR]', e.message)
        await m.react('✗')
        const thumb = await getThumb()
        return conn.sendMessage(m.chat, {
            text:
                `⊹ ──────────────────── ⊹\n` +
                `  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  ✦  𝐌 𝐔 𝐒 𝐈 𝐂\n` +
                `⊹ ──────────────────── ⊹\n\n` +
                `  ◈ ocurrió un error durante la descarga\n` +
                `  ◈ ${e.message.slice(0, 120)}\n\n` +
                `> ✎ ${global.newsletterName || global.botName}`,
            contextInfo: ctx(thumb)
        }, { quoted: m })
    }
}

handler.command = ['play', 'mp3', 'ytmp3', 'musica', 'playaudio']
handler.tags    = ['descargas']
export default handler
