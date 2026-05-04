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

    const encoded = encodeURIComponent(fbLink)

    const apis = [
        `https://rest.apicausas.xyz/api/v1/descargas/facebook?url=${encoded}&apikey=causa-121-Nino-k`,
        `https://eliasar-yt-api.vercel.app/api/facebookdl?link=${encoded}`,
        `https://api.vreden.my.id/api/facebook?url=${encoded}`
    ]

    let videoUrl = null
    let title    = null
    let author   = null
    let likes    = null

    for (const api of apis) {
        try {
            const res = await fetch(api)
            if (!res.ok) continue
            const json = await res.json()

            title  = json.resultado?.titulo || json.resultado?.title  || json.data?.title   || json.result?.title  || json.title       || title
            author = json.resultado?.autor  || json.resultado?.author || json.data?.author  || json.result?.author || json.author?.name || author
            likes  = json.resultado?.likes  || json.data?.likes       || json.result?.likes || likes

            videoUrl =
                json.resultado?.url ||
                json.data?.url      ||
                json.result?.url    ||
                (Array.isArray(json.data) ? json.data[0]?.url : null) ||
                json.url

            if (videoUrl?.startsWith('http')) break
        } catch (err) {
            console.error(`[FB-DL] Fallo en API: ${api}`, err.message)
            continue
        }
    }

    if (!videoUrl) {
        const thumb = await global.getIconThumb?.() || null
        const ctx   = global.getNewsletterCtx?.(thumb) || {}
        return conn.sendMessage(m.chat, {
            text:
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                `✦ [ EXTRACCIÓN FALLIDA ]\n` +
                `  ⟡ No se pudo extraer el video.\n` +
                `  ⟡ Las APIs pueden estar caídas. Intenta más tarde.`,
            contextInfo: ctx
        }, { quoted: m })
    }

    const videoRes = await fetch(videoUrl)
    if (!videoRes.ok) {
        const thumb = await global.getIconThumb?.() || null
        const ctx   = global.getNewsletterCtx?.(thumb) || {}
        return conn.sendMessage(m.chat, {
            text:
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                `✦ [ ERROR DE DESCARGA ]\n` +
                `  ⟡ El servidor no permitió descargar el archivo.`,
            contextInfo: ctx
        }, { quoted: m })
    }

    const buffer   = Buffer.from(await videoRes.arrayBuffer())
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

