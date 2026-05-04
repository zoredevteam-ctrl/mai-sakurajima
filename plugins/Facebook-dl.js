let handler = async (m, { args, command, usedPrefix, conn }) => {
    if (!args[0]) {
        const thumb = await global.getIconThumb?.() || null
        const ctx   = global.getNewsletterCtx?.(thumb) || {}
        return conn.sendMessage(m.chat, {
            text:
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                `✦ [ FACEBOOK DOWNLOADER ]\n` +
                `  ⟡ Proporciona un enlace de Facebook.\n\n` +
                `  ⟡ Uso: *${usedPrefix + command}* https://fb.watch/xxxx\n` +
                `  ⟡ Uso: *${usedPrefix + command}* https://www.facebook.com/watch/?v=xxx`,
            contextInfo: ctx
        }, { quoted: m })
    }

    const fbLink = args[0]
    if (!/facebook\.com|fb\.watch/g.test(fbLink)) {
        const thumb = await global.getIconThumb?.() || null
        const ctx   = global.getNewsletterCtx?.(thumb) || {}
        return conn.sendMessage(m.chat, {
            text:
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                `✦ [ ERROR DE ENLACE ]\n` +
                `  ⟡ El enlace no parece ser de Facebook.\n` +
                `  ⟡ Asegúrate de usar un link válido de *facebook.com* o *fb.watch*`,
            contextInfo: ctx
        }, { quoted: m })
    }

    await m.react('⏳')

    const encoded = encodeURIComponent(fbLink)
    const apis = [
        `https://rest.apicausas.xyz/api/v1/descargas/facebook?url=${encoded}&apikey=causa-db9690e010e31139`,
        `https://eliasar-yt-api.vercel.app/api/facebookdl?link=${encoded}`,
        `https://api.vreden.my.id/api/facebook?url=${encoded}`,
        `https://api.agatz.xyz/api/facebook?url=${encoded}`
    ]

    let videoUrl = null
    let title    = null
    let author   = null
    let likes    = null

    for (const api of apis) {
        try {
            const res = await fetch(api, { signal: AbortSignal.timeout(12000) })
            if (!res.ok) continue
            const json = await res.json()

            const candidateUrl =
                json.resultado?.url ||
                json.data?.url      ||
                json.result?.url    ||
                (Array.isArray(json.data) ? json.data[0]?.url : null) ||
                json.url

            if (!candidateUrl?.startsWith('http')) continue

            try {
                const headCheck = await fetch(candidateUrl, {
                    method: 'HEAD',
                    signal: AbortSignal.timeout(8000)
                })
                if (!headCheck.ok) continue
            } catch {
                continue
            }

            title  = json.resultado?.titulo || json.resultado?.title  || json.data?.title  || json.result?.title  || json.title       || title
            author = json.resultado?.autor  || json.resultado?.author || json.data?.author || json.result?.author || json.author?.name || author
            likes  = json.resultado?.likes  || json.data?.likes       || json.result?.likes || likes
            videoUrl = candidateUrl
            break

        } catch {
            continue
        }
    }

    if (!videoUrl) {
        await m.react('❌')
        const thumb = await global.getIconThumb?.() || null
        const ctx   = global.getNewsletterCtx?.(thumb) || {}
        return conn.sendMessage(m.chat, {
            text:
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                `✦ [ EXTRACCIÓN FALLIDA ]\n` +
                `  ⟡ No se pudo extraer el video.\n` +
                `  ⟡ Las APIs o CDNs están caídos. Intenta más tarde.`,
            contextInfo: ctx
        }, { quoted: m })
    }

    let buffer
    try {
        const videoRes = await fetch(videoUrl, { signal: AbortSignal.timeout(60000) })
        if (!videoRes.ok) throw new Error(`HTTP ${videoRes.status}`)
        buffer = Buffer.from(await videoRes.arrayBuffer())
    } catch (err) {
        await m.react('❌')
        const thumb = await global.getIconThumb?.() || null
        const ctx   = global.getNewsletterCtx?.(thumb) || {}
        return conn.sendMessage(m.chat, {
            text:
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                `✦ [ ERROR DE DESCARGA ]\n` +
                `  ⟡ El servidor no permitió descargar el archivo.\n` +
                `  ⟡ ${err.message}`,
            contextInfo: ctx
        }, { quoted: m })
    }

    const sizeText = (buffer.length / (1024 * 1024)).toFixed(2) + ' MB'
    const caption =
        `\`ˏˋ ❏ ғɪʟᴇ ɪɴғᴏ ˎˊ -\`\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `↬ \`✧ ᴀᴜᴛᴏʀ:\` *${author || 'Desconocido'}*\n` +
        `↬ \`✦ ᴛɪᴛᴜʟᴏ:\` *${title  || 'Sin título'}*\n` +
        `↬ \`ღ ʟɪᴋᴇs:\` *${likes  || 'N/A'}*\n` +
        `↬ \`ⴵ sɪᴢᴇ:\` *${sizeText}*\n` +
        `↬ \`↳ ʟɪɴᴋ:\` *${fbLink}*\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `> ✎ 「✿𝐇𝐢𝐲𝐮𝐤𝐢 এ 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 𝐩𝐚𝐭𝐫𝐨𝐧✿」`

    const thumb = await global.getIconThumb?.() || null
    const ctx   = global.getNewsletterCtx?.(thumb) || {}

    await m.react('✅')
    await conn.sendMessage(m.chat, {
        video:    buffer,
        caption:  caption,
        fileName: 'facebook_video.mp4',
        mimetype: 'video/mp4',
        contextInfo: ctx
    }, { quoted: m })
}

handler.help    = ['fb <enlace>']
handler.tags    = ['downloader']
handler.command = ['fb', 'facebook', 'fbdl']

export default handler
                        
