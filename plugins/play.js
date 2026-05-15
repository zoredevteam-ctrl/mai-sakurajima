const API_BASE = 'https://rest.apicausas.xyz'

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const causasFetch = async (url, timeout = 25000) => {
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
        const raw = await res.text()
        return { ok: res.ok, status: res.status, raw }
    } catch (e) {
        return { ok: false, status: 'FETCH_ERROR', raw: e.message }
    } finally {
        clearTimeout(timer)
    }
}

// ─── BÚSQUEDA YOUTUBE ─────────────────────────────────────────────────────────

const searchYoutube = async (query, debugInfo) => {
    // Lista de rutas más comunes para buscar en este tipo de APIs
    const endpoints = [
        `${API_BASE}/search/youtube?q=${encodeURIComponent(query)}`,
        `${API_BASE}/api/search/youtube?q=${encodeURIComponent(query)}`,
        `${API_BASE}/ytsearch?q=${encodeURIComponent(query)}`,
        `${API_BASE}/api/ytsearch?q=${encodeURIComponent(query)}`
    ]

    for (let endpoint of endpoints) {
        try {
            debugInfo.searchUrl = endpoint
            const res = await causasFetch(endpoint)
            debugInfo.searchResponse = `[Status ${res.status}] ${res.raw.slice(0, 200)}`

            if (res.ok) {
                const fixed = res.raw
                    .replace(/\bverdadero\b/g, 'true')
                    .replace(/\bfalso\b/g,     'false')
                    .replace(/\bnulo\b/g,      'null')
                    
                const r = JSON.parse(fixed)
                const results = r?.result || r?.resultado || r?.data || r?.videos || r?.items || (Array.isArray(r) ? r : null)
                
                if (results && results.length) {
                    const s = results[0]
                    return {
                        title:    s.title    || s.name || query,
                        url:      s.link     || s.url || '',
                        author:   s.channel  || s.author || 'Desconocido',
                        duration: s.duration || 'N/A',
                        views:    s.views    || 'N/A',
                        thumb:    s.imageUrl || s.thumbnail || s.thumb || s.image || ''
                    }
                }
            }
        } catch (e) {
            debugInfo.searchResponse += ` | Error: ${e.message}`
        }
    }
    return null
}

// ─── DESCARGA AUDIO ───────────────────────────────────────────────────────────

const getAudio = async (videoUrl, debugInfo) => {
    const encoded = encodeURIComponent(videoUrl)
    // Lista de rutas más comunes para descargas por si la original también cambia
    const endpoints = [
        `${API_BASE}/download/audio?url=${encoded}`,
        `${API_BASE}/api/download/audio?url=${encoded}`,
        `${API_BASE}/downloader/ytmp3?url=${encoded}`,
        `${API_BASE}/api/downloader/ytmp3?url=${encoded}`
    ]

    for (let endpoint of endpoints) {
        try {
            const res = await causasFetch(endpoint)
            debugInfo.downloadResponse = `[Status ${res.status}] ${res.raw.slice(0, 200)}`

            if (res.ok) {
                const fixed = res.raw
                    .replace(/\bverdadero\b/g, 'true')
                    .replace(/\bfalso\b/g,     'false')
                    .replace(/\bnulo\b/g,      'null')
                    
                const r = JSON.parse(fixed)
                const link = r?.result?.url || r?.resultado?.url || r?.data?.url || r?.url || r?.link || r?.result || r?.download || null
                
                if (link && link.startsWith('http')) return link
            }
        } catch (e) {
            debugInfo.downloadResponse += ` | Error: ${e.message}`
        }
    }
    throw new Error('La API no admitió ninguna de las rutas de descarga conocidas.')
}

// ─── HANDLER ──────────────────────────────────────────────────────────────────

let handler = async (m, { conn, text }) => {
    const query = (text || '').trim()
    let debugInfo = { searchUrl: '', searchResponse: 'Ninguna', downloadResponse: 'Ninguna' }

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
                views:    'N/A',
                thumb:    videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ''
            }
        } else {
            song = await searchYoutube(query, debugInfo)
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
                    `> ✰ Probé múltiples rutas en la API y todas fallaron.\n\n` +
                    `🛠️ *ÚLTIMO INTENTO:* \`${debugInfo.searchUrl}\`\n` +
                    `➔ *Respuesta:* \`${debugInfo.searchResponse}\`\n\n` +
                    `_Prueba usando un enlace directo de YouTube para ver si el descargador responde._ 🦋`,
                contextInfo: ctx
            }, { quoted: m })
        }

        const caption =
            `╭━━━━━━━━━━━━━━━━╮\n` +
            `┃  🎵 *NINO MUSIC* 🎵\n` +
            `╰━━━━━━━━━━━━━━━━╯\n\n` +
            `➥ *${song.title}*\n\n` +
            `✿⃘ *Canal* › ${song.author}\n` +
            `✿⃘ *Duración* › ${song.duration}\n` +
            `✿⃘ *Link* › ${song.url}\n\n` +
            `𐙚 ❀ ｡ ↻ _Dame un momento, ya te envío el audio~_ 🦋`

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

        const audioUrl    = await getAudio(song.url, debugInfo)
        const audioRes    = await fetch(audioUrl)
        if (!audioRes.ok) throw new Error('Error al descargar el archivo de audio: HTTP ' + audioRes.status)
        const audioBuffer = Buffer.from(await audioRes.arrayBuffer())

        if (!audioBuffer || audioBuffer.length < 1000) {
            throw new Error('El archivo descargado no parece un audio válido')
        }

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
                `*ᐛ🎀* Ugh, algo salió mal...\n` +
                `> ✰ ${e.message}\n\n` +
                `🛠️ *LOG DE DESCARGA:* \`${debugInfo.downloadResponse}\`\n\n` +
                `_Si sale error de rutas, es que esta API usa endpoints completamente diferentes._ 🦋`,
            contextInfo: ctx
        }, { quoted: m })
    }
}

handler.help    = ['play <canción o link>']
handler.tags    = ['descargas']
handler.command = ['play', 'mp3', 'ytmp3', 'musica', 'playaudio']
export default handler
