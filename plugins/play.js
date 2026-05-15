const API_YUKI = 'https://api.yuki-wabot.my.id'
const API_STELLAR = 'https://api.stellarwa.xyz'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const requestFetch = async (url, timeout = 25000) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    try {
        const res = await fetch(url, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 15; Pixel 7) AppleWebKit/537.36',
                'Accept': 'application/json'
            }
        })
        if (!res.ok) return { ok: false, status: res.status }
        const raw = await res.json()
        return { ok: true, data: raw }
    } catch (e) {
        return { ok: false, error: e.message }
    } finally {
        clearTimeout(timer)
    }
}

// ─── BÚSQUEDA YOUTUBE ─────────────────────────────────────────────────────────

const searchYoutube = async (query) => {
    // Intento 1: Yuki API
    let res = await requestFetch(`${API_YUKI}/api/search/yt?q=${encodeURIComponent(query)}`)
    let results = res.data?.result || res.data?.data
    
    // Intento 2: Stellar API si Yuki falla
    if (!res.ok || !results?.length) {
        res = await requestFetch(`${API_STELLAR}/api/search/youtube?q=${encodeURIComponent(query)}`)
        results = res.data?.result || res.data?.data
    }

    if (results && results.length) {
        const s = results[0]
        return {
            title:    s.title || query,
            url:      s.url || s.link || `https://www.youtube.com/watch?v=${s.videoId}`,
            author:   s.author?.name || s.channel || s.author || 'Desconocido',
            duration: s.timestamp || s.duration || 'N/A',
            thumb:    s.thumbnail || s.image || s.imageUrl || ''
        }
    }
    return null
}

// ─── DESCARGA AUDIO ───────────────────────────────────────────────────────────

const getAudio = async (videoUrl) => {
    const encoded = encodeURIComponent(videoUrl)
    
    // Intento 1: Yuki API (/api/download/ytmp3)
    let res = await requestFetch(`${API_YUKI}/api/download/ytmp3?url=${encoded}`)
    let link = res.data?.result?.url || res.data?.result?.download || res.data?.data?.url
    
    // Intento 2: Stellar API (/api/download/ytmp3)
    if (!res.ok || !link) {
        res = await requestFetch(`${API_STELLAR}/api/download/ytmp3?url=${encoded}`)
        link = res.data?.result?.url || res.data?.result?.download || res.data?.data?.url
    }

    if (link && link.startsWith('http')) return link
    throw new Error('Ninguna de las APIs pudo generar el enlace de descarga.')
}

// ─── HANDLER ──────────────────────────────────────────────────────────────────

let handler = async (m, { conn, text }) => {
    const query = (text || '').trim()

    if (!query) {
        const thumb = await global.getBannerThumb()
        const ctx   = global.getNewsletterCtx(thumb, `🎵 ${global.botName}`, 'Music Downloader')
        return conn.sendMessage(m.chat, {
            text:
                `╭━━━━━━━━━━━━━━━━╮\n` +
                `┃  🎵 *NINO MUSIC* 🎵\n` +
                `╰━━━━━━━━━━━━━━━━╯\n\n` +
                `*ᐛ🎀* ¿Qué canción quieres escuchar?\n` +
                `> ✰ Dime el nombre o pega el link de YouTube~\n\n` +
                `✦ *Uso:*\n` +
                `› *${global.prefix}play* nombre o link\n\n` +
                `✦ *Ejemplos:*\n` +
                `› *${global.prefix}play* bad bunny tití me preguntó\n` +
                `› *${global.prefix}play* https://youtu.be/...\n\n` +
                `_¡No me hagas esperar, tonto!_ 🦋`,
            contextInfo: ctx
        }, { quoted: m })
    }

    await m.react('🔍')

    try {
        let song = null
        const isYtLink = query.includes('youtube.com/watch') || query.includes('youtu.be/')

        if (isYtLink) {
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
            await m.react('❌')
            const thumb = await global.getBannerThumb()
            const ctx   = global.getNewsletterCtx(thumb, `❌ ${global.botName}`, 'Sin resultados')
            return conn.sendMessage(m.chat, {
                text:
                    `╭━━━━━━━━━━━━━━━━╮\n` +
                    `┃  ❌ *SIN RESULTADOS* ┃\n` +
                    `╰━━━━━━━━━━━━━━━━╯\n\n` +
                    `*ᐛ🎀* No encontré nada para *${query}*\n` +
                    `> ✰ Asegúrate de escribir bien el nombre o intenta con otro término~\n\n` +
                    `_¡Vamos, intenta de nuevo!_ 🦋`,
                contextInfo: ctx
            }, { quoted: m })
        }

        // Enviar Info del video
        const caption =
            `╭━━━━━━━━━━━━━━━━╮\n` +
            `┃  🎵 *NINO MUSIC* 🎵\n` +
            `╰━━━━━━━━━━━━━━━━╯\n\n` +
            `➥ *${song.title}*\n\n` +
            `✿⃘ *Canal* › ${song.author}\n` +
            `✿⃘ *Duración* › ${song.duration}\n` +
            `✿⃘ *Link* › ${song.url}\n\n` +
            `𐙚 ❀ ｡ ↻ _Dame un momento, ya te envío el audio..._ 🦋`

        const thumb = await global.getBannerThumb()
        const ctx   = global.getNewsletterCtx(thumb, song.title.slice(0, 60), global.botName + ' Music 🎵')
        ctx.externalAdReply.thumbnailUrl = song.thumb || global.banner
        ctx.externalAdReply.sourceUrl    = song.url

        if (song.thumb) {
            await conn.sendMessage(m.chat, { image: { url: song.thumb }, caption, contextInfo: ctx }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { text: caption, contextInfo: ctx }, { quoted: m })
        }

        await m.react('⬇️')

        // Descarga
        const audioUrl    = await getAudio(song.url)
        const audioRes    = await fetch(audioUrl)
        if (!audioRes.ok) throw new Error('Error al descargar el buffer de audio: HTTP ' + audioRes.status)
        const audioBuffer = Buffer.from(await audioRes.arrayBuffer())

        if (!audioBuffer || audioBuffer.length < 1000) {
            throw new Error('El archivo de audio se descargó vacío.')
        }

        // Envío de Audio
        const audioCtx = global.getNewsletterCtx(thumb, song.title.slice(0, 60), global.botName + ' Music 🎵')
        audioCtx.externalAdReply.thumbnailUrl = song.thumb || global.banner
        audioCtx.externalAdReply.sourceUrl    = song.url

        await conn.sendMessage(m.chat, {
            audio:       audioBuffer,
            mimetype:    'audio/mpeg',
            ptt:         false,
            fileName:    song.title.slice(0, 60) + '.mp3',
            contextInfo: audioCtx
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error('[PLAY ERROR]', e.message)
        await m.react('❌')
        const thumb = await global.getBannerThumb()
        const ctx   = global.getNewsletterCtx(thumb, `❌ ${global.botName}`, 'Error')
        return conn.sendMessage(m.chat, {
            text:
                `╭━━━━━━━━━━━━━━━━╮\n` +
                `┃  ❌ *ERROR AL PROCESAR* ┃\n` +
                `╰━━━━━━━━━━━━━━━━╯\n\n` +
                `*ᐛ🎀* Ugh, ocurrió un problema con los servidores de descarga...\n` +
                `> ✰ *Detalle:* ${e.message}\n\n` +
                `_Prueba con otra canción por el momento tonto_ 🦋`,
            contextInfo: ctx
        }, { quoted: m })
    }
}

handler.help    = ['play <canción o link>']
handler.tags    = ['descargas']
handler.command = ['play', 'mp3', 'ytmp3', 'musica', 'playaudio']
export default handler
