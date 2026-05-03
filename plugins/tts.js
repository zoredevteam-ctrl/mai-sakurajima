// ❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎
// ✦ [ PROTOCOLO DE BÚSQUEDA TIKTOK ]
// ⟡ Design & Control: Adrien | XLR4-Security

const formatNum = (n) => {
    try {
        const v = parseInt(n) || 0
        if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M'
        if (v >= 1_000)     return (v / 1_000).toFixed(1) + 'k'
        return v.toLocaleString()
    } catch { return String(n || 0) }
}

const fixUrl = (url) => {
    if (!url) return null
    const s = String(url)
    if (s.startsWith('http')) return s
    if (s.startsWith('/'))    return 'https://www.tikwm.com' + s
    return null
}

// ─── MOTOR DE BÚSQUEDA XLR4 ──────────────────────────────────────────────────

const searchTikTok = async (query) => {
    // Intento 1: Tikwm
    try {
        const r = await fetch('https://www.tikwm.com/api/feed/search?keywords=' + encodeURIComponent(query) + '&count=5&cursor=0&web=1')
        const j = await r.json()
        if (j?.code === 0 && j?.data?.videos?.length) {
            const v = j.data.videos[0]
            return {
                videoId: v.id,
                titulo: v.title || query,
                autor: v.author?.unique_id || 'Desconocido',
                likes: v.digg_count || 0,
                plays: v.play_count || 0,
                videoUrl: fixUrl(v.play) || fixUrl(v.wmplay),
                thumb: fixUrl(v.cover) || fixUrl(v.origin_cover)
            }
        }
    } catch (e) { console.error('Error Tikwm:', e.message) }

    // Intento 2: AlyaBot (Fallback)
    try {
        const r = await fetch('https://rest.alyabotpe.xyz/search/tiktok?q=' + encodeURIComponent(query) + '&key=Duarte-zz12')
        const j = await r.json()
        const v = j?.data?.[0] || j?.result?.[0]
        if (v) return {
            videoId: v.id || '',
            titulo: v.title || v.desc || query,
            autor: v.author || v.username || 'Desconocido',
            likes: v.likes || 0,
            plays: v.plays || 0,
            videoUrl: fixUrl(v.play) || fixUrl(v.url),
            thumb: fixUrl(v.cover) || fixUrl(v.thumbnail)
        }
    } catch (e) { console.error('Error AlyaBot:', e.message) }

    return null
}

// ─── HANDLER PRINCIPAL ───────────────────────────────────────────────────────

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const query = (text || '').trim()

    if (!query) {
        return conn.sendMessage(m.chat, { 
            text: `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR DE SINTAXIS ]\n  ⟡ Ingrese un término de búsqueda.\n  ⟡ Uso: *${usedPrefix + command} <búsqueda>*` 
        }, { quoted: m })
    }

    await m.react('🔍')

    try {
        const result = await searchTikTok(query)

        if (!result) {
            await m.react('❌')
            return conn.sendMessage(m.chat, { 
                text: `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ SIN RESULTADOS ]\n  ⟡ No se encontró información para: *${query}*` 
            }, { quoted: m })
        }

        await m.react('⬇️')

        let finalUrl = result.videoUrl
        // Si no hay URL directa, intentamos obtenerla por ID
        if (!finalUrl && result.videoId) {
            try {
                const r = await fetch(`https://www.tikwm.com/api/?url=https://www.tiktok.com/@${result.autor}/video/${result.videoId}`)
                const j = await r.json()
                if (j?.code === 0) finalUrl = fixUrl(j.data?.play)
            } catch (e) {}
        }

        if (!finalUrl) throw new Error('No se pudo extraer el flujo de video.')

        const caption = `> ⟪❄︎⟫ Aquí tienes\n\n` +
                        `✦ [ DATOS DEL ARCHIVO ]\n` +
                        `  ⟡ Título: *${result.titulo}*\n` +
                        `  ⟡ Autor: *${result.autor}*\n` +
                        `  ⟡ Likes: *${formatNum(result.likes)}*\n` +
                        `  ⟡ Vistas: *${formatNum(result.plays)}*\n\n` +
                        `❄︎ Protocolo XLR4-Security`

        await m.react('📤')

        await conn.sendMessage(m.chat, {
            video: { url: finalUrl },
            caption,
            mimetype: 'video/mp4',
            contextInfo: {
                externalAdReply: {
                    title: '❄︎ HIYUKI TIKTOK SEARCH',
                    body: `Resultados para: ${query}`,
                    mediaType: 1,
                    thumbnailUrl: result.thumb || global.icono,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error('[XLR4 ERROR]', e.message)
        await m.react('❌')
        return conn.sendMessage(m.chat, { 
            text: `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR CRÍTICO ]\n  ⟡ Detalle: ${e.message}` 
        }, { quoted: m })
    }
}

handler.command = ['tiktoksearch', 'tts', 'buscartt']
handler.tags = ['dl']
export default handler
