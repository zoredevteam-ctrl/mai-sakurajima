import fetch from 'node-fetch'

let handler = async (m, { args, command, usedPrefix, conn }) => {
    if (!args[0]) {
        const thumb = await global.getIconThumb?.() || null
        const ctx   = global.getNewsletterCtx?.(thumb) || {}
        return conn.sendMessage(m.chat, {
            text:
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                `ˏˋ ❏ ғᴀᴄᴇʙᴏᴏᴋ ɪɴғᴏ ˎˊ -\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `↬ \`✧ ᴜsᴏ:\` *${usedPrefix + command} <enlace>*\n` +
                `↬ \`✦ ᴇᴊᴇᴍᴘʟᴏ:\` ${usedPrefix + command} https://fb.watch/xxxx\n` +
                `━━━━━━━━━━━━━━━━━━\n` +
                `> ✎ 「✿𝐇𝐢𝐲𝐮𝐤𝐢 এ 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 𝐩𝐚𝐭𝐫𝐨𝐧✿」`,
            contextInfo: ctx
        }, { quoted: m })
    }

    const fbLink = args[0]
    if (!/facebook\.com|fb\.watch/g.test(fbLink)) {
        return m.reply('❌ El enlace no es válido. Debe ser de Facebook.')
    }

    const encoded = encodeURIComponent(fbLink)
    const apis = [
        `https://rest.apicausas.xyz/api/v1/descargas/facebook?url=${encoded}&apikey=causa-db9690e010e31139`,
        `https://eliasar-yt-api.vercel.app/api/facebookdl?link=${encoded}`,
        `https://api.vreden.my.id/api/facebook?url=${encoded}`
    ]

    let videoUrl = null
    let title    = 'Facebook Video'
    let author   = 'Desconocido'
    let likes    = 'Varios'

    for (const api of apis) {
        try {
            const res = await fetch(api)
            if (!res.ok) continue
            const json = await res.json()
            
            title = json.resultado?.titulo || json.resultado?.title || json.data?.title || json.result?.title || json.title || title
            author = json.resultado?.autor || json.resultado?.author || json.data?.author || json.result?.author || json.author?.name || author
            likes = json.resultado?.likes || json.data?.likes || json.result?.likes || likes
            videoUrl = json.resultado?.url || json.data?.url || json.result?.url || (Array.isArray(json.data) ? json.data[0]?.url : null) || json.url

            if (videoUrl?.startsWith('http')) break
        } catch (err) {
            continue
        }
    }

    if (!videoUrl) return m.reply('❌ No se pudo extraer el video de Facebook.')

    try {
        const videoRes = await fetch(videoUrl)
        if (!videoRes.ok) throw new Error()
        
        const buffer   = Buffer.from(await videoRes.arrayBuffer())
        const sizeText = (buffer.length / (1024 * 1024)).toFixed(2) + ' MB'

        const caption =
            `\`ˏˋ ❏ ғɪʟᴇ ɪɴғᴏ ˎˊ -\`\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `↬ \`✧ ᴀᴜᴛᴏʀ:\` *${author}*\n` +
            `↬ \`✦ ᴛɪᴛᴜʟᴏ:\` *${title}*\n` +
            `↬ \`ღ ʟɪᴋᴇs:\` *${likes}*\n` +
            `↬ \`ⴵ sɪᴢᴇ:\` *${sizeText}*\n` +
            `↬ \`↳ ʟɪɴᴋ:\` *${fbLink}*\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `> ✎ 「✿𝐇𝐢𝐲𝐮𝐤𝐢 এ 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 𝐩𝐚𝐭𝐫𝐨𝐧✿」`

        const thumb = await global.getIconThumb?.() || null
        const ctx   = global.getNewsletterCtx?.(thumb) || {}

        await conn.sendMessage(m.chat, {
            video:    buffer,
            caption:  caption,
            fileName: 'fb_video.mp4',
            mimetype: 'video/mp4',
            contextInfo: ctx
        }, { quoted: m })

    } catch (e) {
        m.reply('❌ Error al procesar el archivo de video.')
    }
}

handler.help    = ['fb <enlace>']
handler.tags    = ['downloader']
handler.command = ['fb', 'facebook', 'fbdl']

export default handler
    
