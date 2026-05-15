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
    try {
        const endpoint = `${API_BASE}/search/youtube?q=${encodeURIComponent(query)}`
        debugInfo.searchUrl = endpoint
        
        const res = await causasFetch(endpoint)
        debugInfo.searchResponse = `[Status ${res.status}] ${res.raw.slice(0, 300)}`
        
        if (!res.ok) return null
        
        // Normalizar y parsear
        const fixed = res.raw
            .replace(/\bverdadero\b/g, 'true')
            .replace(/\bfalso\b/g,     'false')
            .replace(/\bnulo\b/g,      'null')
            
        const r = JSON.parse(fixed)
        const results = r?.result || r?.resultado || r?.data || r?.videos || r?.items || (Array.isArray(r) ? r : null)
        
        if (results && results.length) {
            const filtered = results.filter(v => {
                const parts = (v.duration || '0:00').split(':')
                const secs  = parts.length >= 2
                    ? parseInt(parts[parts.length - 2] || 0) * 60 + parseInt(parts[parts.length - 1] || 0)
                    : 0
                return secs >= 60
            })
            const s = filtered[0] || results[0]
            
            return {
                title:    s.title    || s.name || query,
                url:      s.link     || s.url || '',
                author:   s.channel  || s.author || 'Desconocido',
                duration: s.duration || 'N/A',
                views:    s.views    || 'N/A',
                thumb:    s.imageUrl || s.thumbnail || s.thumb || s.image || ''
            }
        }
    } catch (e) { 
        debugInfo.searchResponse += ` | Catch: ${e.message}`
    }
    return null
}

// ─── DESCARGA AUDIO ───────────────────────────────────────────────────────────

const getAudio = async (videoUrl, debugInfo) => {
    try {
        const encoded = encodeURIComponent(videoUrl)
        const endpoint = `${API_BASE}/download/audio?url=${encoded}`
        
        const res = await causasFetch(endpoint)
        debugInfo.downloadResponse = `[Status ${res.status}] ${res.raw.slice(0, 300)}`
        
        if (!res.ok) throw new Error(`Servidor respondió con estado: ${res.status}`)
        
        const fixed = res.raw
            .replace(/\bverdadero\b/g, 'true')
            .replace(/\bfalso\b/g,     'false')
            .replace(/\bnulo\b/g,      'null')
            
        const r = JSON.parse(fixed)
        const link = r?.result?.url || r?.resultado?.url || r?.data?.url || r?.url || r?.link || r?.result || r?.download || null
        
        if (link && link.startsWith('http')) return link
        throw new Error('No se encontró un enlace de descarga directo en el JSON')
    } catch (e) {
        throw new Error('Error en descarga: ' + e.message)
    }
}

// ─── HANDLER ──────────────────────────────────────────────────────────────────

let handler = async (m, { conn, text }) => {
    const query = (text || '').trim()
    
    // Objeto local para almacenar logs de esta petición
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
                    `> ✰ Intenta con un nombre más específico o el link directo~\n\n` +
                    `🛠️ *INFO DE DEPURACIÓN (API):*\n` +
                    `➔ *URL:* \`${debugInfo.searchUrl}\n\` +
                    `➔ *Respuesta:* \`${debugInfo.searchResponse}\`\n\n` +
                    `_¡Copia este mensaje completo y pásamelo para ver qué responde la API!_ 🦋`,
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
                `🛠️ *INFO DE DEPURACIÓN (DESCARGA):*\n` +
                `➔ *Respuesta:* \`${debugInfo.downloadResponse}\`\n\n` +
                `_Pásame este texto para corregir la lectura del JSON._ 🦋`,
            contextInfo: ctx
        }, { quoted: m })
    }
}

handler.help    = ['play <canción o link>']
handler.tags    = ['descargas']
handler.command = ['play', 'mp3', 'ytmp3', 'musica', 'playaudio']
export default handler
