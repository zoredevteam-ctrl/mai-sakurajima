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
            'Content-Type':  'application/x-www-form-urlencoded',
            Authorization:   'Basic ' + Buffer.from('acc6302297e040aeb6e4ac1fbdfd62c3:0e8439a1280a43aba9a5bc0a16f3f009').toString('base64')
        },
        data: 'grant_type=client_credentials'
    })
    return res.data.access_token
}

// ── Buscar canción ────────────────────────────────────────────────────────────
async function buscarCancion(query) {
    const token = await getToken()
    const res   = await axios({
        method: 'get',
        url:    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track`,
        headers: { Authorization: `Bearer ${token}` }
    })
    return res.data.tracks.items.map(t => ({
        nombre:   t.name,
        artista:  t.artists.map(a => a.name).join(', '),
        album:    t.album.name,
        duracion: formatMs(t.duration_ms),
        url:      t.external_urls.spotify,
        imagen:   t.album.images?.[0]?.url || ''
    }))
}

// ── Formatear duración ────────────────────────────────────────────────────────
function formatMs(ms) {
    const min = Math.floor(ms / 60000)
    const sec = Math.floor((ms % 60000) / 1000)
    return `${min}:${sec < 10 ? '0' : ''}${sec}`
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
        const resultados = await buscarCancion(text)
        if (!resultados.length) return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🎵 ✧ ⩾═══════╗\n` +
            `         「 𝖲𝖯𝖮𝖳𝖨𝖥𝖸 」\n` +
            `╚═══════⩽ ✧ 🎵 ✧ ⩾═══════╝\n` +
            `┣ 🪷 no encontré *${text}*\n` +
            `┣ 🪷 intenta con otro nombre (⁠¬⁠_⁠¬⁠)\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )

        const song = resultados[0]

        // ── Obtener descarga ──────────────────────────────────────────────────
        const apiRes = await fetch(`https://archive-ui.tanakadomp.biz.id/download/spotify?url=${song.url}`)
        if (!apiRes.ok) throw new Error(`API error: ${apiRes.status}`)

        const data = await apiRes.json()
        if (!data?.result?.data?.download) throw new Error('No se obtuvo enlace de descarga')

        const info = data.result.data

        // ── Mensaje info con thumbnail ────────────────────────────────────────
        const thumb = await getThumb()
        const txt   =
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🎵 ✧ ⩾═══════╗\n` +
            `         「 𝖲𝖯𝖮𝖳𝖨𝖥𝖸 」\n` +
            `╚═══════⩽ ✧ 🎵 ✧ ⩾═══════╝\n` +
            `┣ 🪷 título: *${info.title || song.nombre}*\n` +
            `┣ 🪷 artista: *${song.artista}*\n` +
            `┣ 🪷 álbum: *${song.album}*\n` +
            `┣ 🪷 duración: *${formatMs(info.durasi) || song.duracion}*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝\n` +
            `🪷 descargando... espera (⁠✿⁠◡⁠‿⁠◡⁠)`

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
                    title:                 info.title || song.nombre,
                    body:                  song.artista,
                    mediaType:             1,
                    thumbnailUrl:          info.image,
                    mediaUrl:              info.download,
                    sourceUrl:             song.url,
                    renderLargerThumbnail: true,
                    showAdAttribution:     true
                }
            }
        }, { quoted: m })

        // ── Enviar audio ──────────────────────────────────────────────────────
        await conn.sendMessage(m.chat, {
            audio:    { url: info.download },
            fileName: `${info.title || song.nombre}.mp3`,
            mimetype: 'audio/mp4',
            ptt:      false
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error('[SPOTIFY ERROR]', e.message)
        await m.react('❌')
        await sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🎵 ✧ ⩾═══════╗\n` +
            `         「 𝖲𝖯𝖮𝖳𝖨𝖥𝖸 」\n` +
            `╚═══════⩽ ✧ 🎵 ✧ ⩾═══════╝\n` +
            `┣ 🪷 no pude descargar la canción\n` +
            `┣ 🪷 ${e.message?.slice(0, 100) || 'error desconocido'}\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
    }
}

handler.command  = ['spotify', 'splay']
handler.tags     = ['downloader']
export default handler
