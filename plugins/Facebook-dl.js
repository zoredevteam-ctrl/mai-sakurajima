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
                `  ⟡ Uso: *${usedPrefix + command}* https://www.facebook.com/share/r/xxxx`,
            contextInfo: ctx
        }, { quoted: m })
    }

    const fbLink = args[0]
    if (!/facebook\.com|fb\.watch/i.test(fbLink)) {
        const thumb = await global.getIconThumb?.() || null
        const ctx   = global.getNewsletterCtx?.(thumb) || {}
        return conn.sendMessage(m.chat, {
            text:
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                `✦ [ ERROR DE ENLACE ]\n` +
                `  ⟡ El enlace no parece ser de Facebook.\n\n` +
                `  ⟡ Asegúrate de usar un link válido de *facebook.com* o *fb.watch*`,
            contextInfo: ctx
        }, { quoted: m })
    }

    await m.react('⏳')

    const encoded = encodeURIComponent(fbLink)
    const apiKey  = global.APICAUSAS_KEY || 'causa-db9690e010e31139'
    const apiUrl  = `https://rest.apicausas.xyz/api/v1/descargas/facebook?apikey=${apiKey}&url=${encoded}`

    let videoUrl  = null
    let title     = null
    let thumbnail = null

    try {
        const res = await fetch(apiUrl, { signal: AbortSignal.timeout(15000) })
        if (!res.ok) throw new Error(`API respondió con HTTP ${res.status}`)
        const json = await res.json()

        if (!json.status) throw new Error('API devolvió status false')

        title     = json.title     || null
        thumbnail = json.thumbnail || null
        videoUrl  = json.data?.url || null

        if (!videoUrl?.startsWith('http')) videoUrl = null
    } catch (err) {
        console.error('[FB-DL] Error APICausas:', err.message)
    }

    if (!videoUrl) {
        await m.react('❌')
        const thumb = await global.getIconThumb?.() || null
        const ctx   = global.getNewsletterCtx?.(thumb) || {}
        return conn.sendMessage(m.chat, {
            text:
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                `✦ [ EXTRACCIÓN FALLIDA ]\n` +
                `  ⟡ No se pudo extraer el video.\n\n` +
                `  ⟡ APICausas no devolvió resultado. Intenta más tarde.`,
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
                `  ⟡ No se pudo descargar el archivo.\n\n` +
                `  ⟡ ${err.message}`,
            contextInfo: ctx
        }, { quoted: m })
    }

    const sizeText = (buffer.length / (1024 * 1024)).toFixed(2) + ' MB'

    // Aquí se cambió el autor para que muestre el nombre del sistema en lugar de los datos de la API
    const caption =
        `\`ˏˋ ❏ ғɪʟᴇ ɪɴғᴏ ˎˊ -\`\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `↬ \`✧ ᴛɪᴛᴜʟᴏ:\` *${title  || 'Sin título'}*\n` +
        `↬ \`✦ ᴀᴜᴛᴏʀ:\` *Hiyuki System*\n` +
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
    
