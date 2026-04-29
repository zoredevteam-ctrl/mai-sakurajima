// plugins/spotify.js
import axios from 'axios'

const getThumb = async () => {
    try {
        const res = await fetch(global.icono || global.banner || '')
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

const sendReply = async (conn, m, txt) => {
    const thumb = await getThumb()
    try {
        await conn.sendMessage(m.chat, {
            text: txt,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid,
                    serverMessageId: -1,
                    newsletterName:  global.newsletterName
                },
                externalAdReply: {
                    title:                 global.botName || 'Hiruka Celestial MD',
                    body:                  '✦ Downloader',
                    mediaType:             1,
                    thumbnail:             thumb,
                    renderLargerThumbnail: false,
                    sourceUrl:             global.rcanal || ''
                }
            }
        }, { quoted: m })
    } catch { await m.reply(txt) }
}

// ── Spotify token ─────────────────────────────────────────────────────────────
async function getToken() {
    const res = await axios({
        method: 'post',
        url:    'https://accounts.spotify.com/api/token',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization:  'Basic ' + Buffer.from('acc6302297e040aeb6e4ac1fbdfd62c3:0e8439a1280a43aba9a5bc0a16f3f009').toString('base64')
        },
        data: 'grant_type=client_credentials'
    })
    return res.data.access_token
}

// ── Buscar canción en Spotify ─────────────────────────────────────────────────
async function buscarCancion(query) {
    const token = await getToken()
    const res   = await axios({
        method:  'get',
        url:     `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
        headers: { Authorization: `Bearer ${token}` }
    })
    return res.data.tracks.items.map(t => ({
        nombre:  t.name,
        artista: t.artists.map(a => a.name).join(', '),
        album:   t.album.name,
        duracion: formatMs(t.duration_ms),
        url:     t.external_urls.spotify,
        imagen:  t.album.images?.[0]?.url || ''
    }))
}

// ── Formatear duración ────────────────────────────────────────────────────────
function formatMs(ms) {
    const min = Math.floor(ms / 60000)
    const sec = Math.floor((ms % 60000) / 1000)
    return `${min}:${sec < 10 ? '0' : ''}${sec}`
}

// ── APIs de descarga con fallback ─────────────────────────────────────────────
async function descargarSpotify(url) {

    // API 1 — spotifydownloaders
    try {
        const res  = await axios.get(`https://spotifydownloaders.com/api/getSpotifyDownload?url=${url}`, { timeout: 15000 })
        const data = res.data
        if (data?.downloadLink) return { audio: data.downloadLink, titulo: data.name, artista: data.artists, imagen: data.cover }
    } catch {}

    // API 2 — co.wuk.sh
    try {
        const res  = await axios.post('https://co.wuk.sh/api/json', {
            url, aFormat: 'mp3', isAudioOnly: true
        }, { headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, timeout: 15000 })
        if (res.data?.url) return { audio: res.data.url }
    } catch {}

    // API 3 — ExpoNent API
    try {
        const res  = await axios.get(`https://api.exponent.im/spotify?url=${url}`, { timeout: 15000 })
        const data = res.data
        if (data?.audio) return { audio: data.audio, titulo: data.title, artista: data.artist, imagen: data.thumbnail }
    } catch {}

    // API 4 — SaveFrom alternativa
    try {
        const res  = await axios.get(`https://api.fabdl.com/spotify/get?url=${url}`, { timeout: 15000 })
        const data = res.data?.result
        if (data?.download_url) return { audio: data.download_url, titulo: data.name, artista: data.artists, imagen: data.image }
    } catch {}

    throw new Error('todas las APIs fallaron. intenta más tarde')
}

// ── Handler ───────────────────────────────────────────────────────────────────
let handler = async (m, { conn, text }) => {
    if (!text) return sendReply(conn, m,
        `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
        `╔═══════⩽ ✧ 🎵 ✧ ⩾═══════╗\n` +
        `         「 𝖲𝖯𝖮𝖳𝖨𝖥𝖸 」\n` +
        `╚═══════⩽ ✧ 🎵 ✧ ⩾═══════╝\n` +
        `┣ 🪷 uso: *#spotify <canción o artista>*\n` +
        `┣ 🪷 ejemplo: *#spotify bad bunny*\n` +
        `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
    )

    await m.react('🎵')

    try {
        // ── Buscar en Spotify ─────────────────────────────────────────────────
        const resultados = await buscarCancion(text)
        if (!resultados.length) return sendReply(conn, m,
            `╔═══════⩽ ✧ 🎵 ✧ ⩾═══════╗\n` +
            `         「 𝖲𝖯𝖮𝖳𝖨𝖥𝖸 」\n` +
            `╚═══════⩽ ✧ 🎵 ✧ ⩾═══════╝\n` +
            `┣ 🪷 no encontré *${text}* (⁠¬⁠_⁠¬⁠)\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )

        const song = resultados[0]

        // ── Aviso de descarga ─────────────────────────────────────────────────
        await sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🎵 ✧ ⩾═══════╗\n` +
            `         「 𝖲𝖯𝖮𝖳𝖨𝖥𝖸 」\n` +
            `╚═══════⩽ ✧ 🎵 ✧ ⩾═══════╝\n` +
            `┣ 🪷 título: *${song.nombre}*\n` +
            `┣ 🪷 artista: *${song.artista}*\n` +
            `┣ 🪷 álbum: *${song.album}*\n` +
            `┣ 🪷 duración: *${song.duracion}*\n` +
            `┣ 🪷 descargando... (⁠✿⁠◡⁠‿⁠◡⁠)\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )

        // ── Descargar con fallback ────────────────────────────────────────────
        const descarga = await descargarSpotify(song.url)

        // ── Enviar audio ──────────────────────────────────────────────────────
        await conn.sendMessage(m.chat, {
            audio:    { url: descarga.audio },
            fileName: `${descarga.titulo || song.nombre}.mp3`,
            mimetype: 'audio/mp4',
            ptt:      false,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid,
                    serverMessageId: -1,
                    newsletterName:  global.newsletterName
                },
                externalAdReply: {
                    title:                 descarga.titulo || song.nombre,
                    body:                  descarga.artista || song.artista,
                    mediaType:             1,
                    thumbnailUrl:          descarga.imagen || song.imagen,
                    sourceUrl:             song.url,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error('[SPOTIFY ERROR]', e.message)
        await m.react('❌')
        await sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🎵 ✧ ⩾═══════╗\n` +
            `         「 𝖲𝖯𝖮𝖳𝖨𝖥𝖸 」\n` +
            `╚═══════⩽ ✧ ✨ ✧ ⩾═══════╝\n` +
            `┣ 🪷 ${e.message?.slice(0, 120) || 'error inesperado'}\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
    }
}

handler.command = ['spotify', 'splay']
handler.tags    = ['downloader']
export default handler
