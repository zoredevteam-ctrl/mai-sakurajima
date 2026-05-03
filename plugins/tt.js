// ❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎
// ✦ [ PROTOCOLO DE DESCARGA TIKTOK ]
// ⟡ Design & Control: Adrien | XLR4-Security

const formatNum = (n) => {
    try {
        const v = parseInt(n) || 0
        if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M'
        if (v >= 1_000)     return (v / 1_000).toFixed(1) + 'k'
        return v.toLocaleString()
    } catch { return String(n || 0) }
}

const downloadTikTok = async (url) => {
    let videoUrl = null
    let autor    = 'Desconocido'
    let titulo   = ''
    let likes    = 0
    let plays    = 0

    const apis = [
        async () => {
            const r = await fetch('https://www.tikwm.com/api/?url=' + encodeURIComponent(url))
            const j = await r.json()
            if (j?.code !== 0) throw new Error('Tikwm Offline')
            autor  = j.data?.author?.unique_id || 'Desconocido'
            titulo = j.data?.title  || 'TikTok Video'
            likes  = j.data?.digg_count  || 0
            plays  = j.data?.play_count  || 0
            return j.data?.play || j.data?.wmplay
        },
        async () => {
            const r = await fetch('https://rest.alyabotpe.xyz/dl/tiktok?url=' + encodeURIComponent(url) + '&key=Duarte-zz12')
            const j = await r.json()
            const d = j.data || j.result
            if (!d) throw new Error('AlyaBot Offline')
            autor  = d.author || d.username || 'Desconocido'
            titulo = d.title  || d.desc || 'TikTok Video'
            return d.download || d.url
        }
    ]

    for (const fn of apis) {
        try {
            const link = await fn()
            if (link && String(link).startsWith('http')) {
                videoUrl = link
                break
            }
        } catch (e) { console.log('❄︎ [ LOG ] Fallo en nodo de descarga:', e.message) }
    }

    if (!videoUrl) throw new Error('No se pudo interceptar el flujo de video.')
    return { videoUrl, autor, titulo, likes, plays }
}

// ─── HANDLER PRINCIPAL ───────────────────────────────────────────────────────

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const url = args[0] || (m.quoted?.text ? m.quoted.text.trim() : '')

    if (!url || !url.includes('tiktok.com')) {
        const syntax = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR DE ENLACE ]\n  ⟡ Ingrese un link válido de TikTok.\n  ⟡ Uso: *${usedPrefix + command} <link>*`
        return conn.sendMessage(m.chat, { text: syntax }, { quoted: m })
    }

    await m.react('⏳')

    try {
        const { videoUrl, autor, titulo, likes, plays } = await downloadTikTok(url)
        
        await m.react('⬇️')

        const caption = `> ⟪❄︎⟫ Aquí tienes\n\n` +
                        `✦ [ DATOS DEL ARCHIVO ]\n` +
                        `  ⟡ Título: *${titulo}*\n` +
                        `  ⟡ Autor: *${autor}*\n` +
                        `  ⟡ Likes: *${formatNum(likes)}*\n` +
                        `  ⟡ Vistas: *${formatNum(plays)}*\n\n` +
                        `❄︎ Protocolo XLR4-Security`

        await m.react('📤')

        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption,
            mimetype: 'video/mp4',
            contextInfo: {
                externalAdReply: {
                    title: '❄︎ HIYUKI DOWNLOADER',
                    body: `Source: ${autor}`,
                    mediaType: 1,
                    thumbnailUrl: global.icono,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error('[XLR4 ERROR]', e.message)
        await m.react('❌')
        const failure = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ FALLO DE DESCARGA ]\n  ⟡ Detalle: ${e.message}`
        return conn.sendMessage(m.chat, { text: failure }, { quoted: m })
    }
}

handler.help = ['tt']
handler.command = ['tt', 'tiktok', 'tk']
handler.tags = ['dl']

export default handler
