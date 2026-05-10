import fetch from 'node-fetch'

const NEX_BASE = 'https://nex-magical.vercel.app'
const NEX_KEY  = 'NEX-D0E7E64C8F5E44E98F00D6B4'

// ── Fetch con timeout y limpieza de JSON ─────────────────────────────────────
const nexFetch = async (url, timeout = 30000) => {
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
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const raw = await res.text()
        if (!raw) throw new Error('Respuesta vacía del servidor')
        
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
                return secs >= 20 // Filtro mínimo de 20 segundos
            })
            const s = filtered[0] || r.result[0]
            return {
                title:    s.title    || 'Sin título',
                url:      s.link     || s.url || '',
                author:   s.channel  || s.author || 'Desconocido',
                duration: s.duration || 'N/A',
                thumb:    s.imageUrl || s.thumbnail || ''
            }
        }
    } catch (e) { console.error('[SEARCH ERROR]:', e.message) }
    return null
}

// ── Obtener Contexto de Mensaje ───────────────────────────────────────────────
const getCtx = (thumb, title, body, url) => ({
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid:   global.newsletterJid,
        serverMessageId: -1,
        newsletterName:  global.newsletterName
    },
    externalAdReply: {
        title:                 title || global.botName || 'Hiruka Music',
        body:                  body  || global.newsletterName || 'Reproductor de Audio',
        mediaType:             1,
        thumbnail:             thumb,
        renderLargerThumbnail: true,
        sourceUrl:             url   || global.rcanal || ''
    }
})

// ── Handler ───────────────────────────────────────────────────────────────────
let handler = async (m, { conn, text, usedPrefix, command }) => {
    const query = (text || '').trim()
    const px    = usedPrefix || '#'
    
    // Obtener miniatura base del bot
    let botThumb = null
    try {
        const img = global.icono || global.banner
        if (img) botThumb = await (await fetch(img)).buffer()
    } catch { botThumb = null }

    if (!query) {
        return conn.sendMessage(m.chat, {
            text: `⊹ ──────────────────── ⊹\n  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  ✦  𝐌 𝐔 𝐒 𝐈 𝐂\n⊹ ──────────────────── ⊹\n\n  ◈ uso: *${px + command} <nombre o link>*\n  ◈ ejemplo: *${px + command} Stay With Me*\n\n> ✎ ${global.botName}`,
            contextInfo: getCtx(botThumb)
        }, { quoted: m })
    }

    await m.react('🔍')

    try {
        let song = null
        const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        const isLink  = ytRegex.test(query)

        if (isLink) {
            const vid = query.match(ytRegex)[1]
            song = {
                title: 'YouTube Video',
                url:   `https://www.youtube.com/watch?v=${vid}`,
                author: 'YouTube',
                duration: 'N/A',
                thumb: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`
            }
        } else {
            song = await searchYoutube(query)
        }

        if (!song || !song.url) {
            await m.react('✗')
            return m.reply('❌ No se encontraron resultados para tu búsqueda.')
        }

        // Mensaje de espera
        const infoTxt = `⊹ ──────────────────── ⊹\n  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  ✦  𝐌 𝐔 𝐒 𝐈 𝐂\n⊹ ──────────────────── ⊹\n\n  ◈ *Título:* ${song.title}\n  ◈ *Canal:* ${song.author}\n  ◈ *Duración:* ${song.duration}\n\n> Enviando audio, espera un momento...`
        
        await conn.sendMessage(m.chat, {
            image: { url: song.thumb },
            caption: infoTxt,
            contextInfo: getCtx(botThumb, song.title, song.author, song.url)
        }, { quoted: m })

        await m.react('📥')

        // Descarga de audio
        const downloadUrl = `${NEX_BASE}/download/audio?url=${encodeURIComponent(song.url)}&apikey=${NEX_KEY}`
        const resDownload = await nexFetch(downloadUrl)
        const audioLink   = resDownload?.result?.url || resDownload?.resultado?.url

        if (!audioLink) throw new Error('No se pudo obtener el enlace de descarga.')

        const audioRes = await fetch(audioLink)
        if (!audioRes.ok) throw new Error('Error al conectar con el servidor de archivos.')
        
        const audioBuffer = await audioRes.buffer()
        if (audioBuffer.length < 100) throw new Error('El archivo de audio está dañado o vacío.')

        await m.react('🎶')

        await conn.sendMessage(m.chat, {
            audio:    audioBuffer,
            mimetype: 'audio/mp4', // MP4 Audio suele ser más compatible en WhatsApp
            fileName: `${song.title}.mp3`,
            contextInfo: getCtx(botThumb, song.title, song.author, song.url)
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply(`⚠️ *Error:* ${e.message}`)
    }
}

handler.command = ['play', 'mp3', 'music', 'musica']
handler.tags    = ['dl']
export default handler
