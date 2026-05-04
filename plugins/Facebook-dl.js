let handler = async (m, { args, command, conn, usedPrefix }) => {

    if (!args[0]) {
        const thumb = await global.getIconThumb?.() || null
        const ctx   = global.getNewsletterCtx?.(thumb) || {}
        return conn.sendMessage(m.chat, {
            text:
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                `✦ [ FACEBOOK DOWNLOADER ]\n` +
                `  ⟡ Proporciona un enlace de Facebook.\n\n` +
                `✦ [ USO ]\n` +
                `  ⟡ *${usedPrefix + command}* https://fb.watch/xxxxx`,
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
                `✦ [ ENLACE INVÁLIDO ]\n` +
                `  ⟡ El enlace no corresponde a Facebook.`,
            contextInfo: ctx
        }, { quoted: m })
    }

    try {
        const encoded = encodeURIComponent(fbLink)

        const apis = [
            {
                url:   `https://rest.apicausas.xyz/api/v1/descargas/facebook?apikey=causa-db9690e010e31139&url=${encoded}`,
                parse: (json) => ({
                    videoUrl:  json.resultado?.url   || json.data?.url || json.url || null,
                    title:     json.resultado?.title || json.data?.title || json.title || null,
                    reactions: json.resultado?.likes || json.data?.likes || null,
                })
            },
            {
                url:   `https://eliasar-yt-api.vercel.app/api/facebookdl?link=${encoded}`,
                parse: (json) => ({
                    videoUrl:  json.data?.url || (Array.isArray(json.data) ? json.data[0]?.url : null) || json.url || null,
                    title:     json.data?.title || json.title || null,
                    reactions: json.data?.likes || null,
                })
            },
            {
                url:   `https://api.vreden.my.id/api/facebook?url=${encoded}`,
                parse: (json) => ({
                    videoUrl:  json.result?.url   || json.data?.url || json.url || null,
                    title:     json.result?.title || json.data?.title || json.title || null,
                    reactions: json.result?.likes || null,
                })
            }
        ]

        let videoUrl  = null
        let metaTitle = null
        let metaReact = null

        for (const api of apis) {
            try {
                const res = await fetch(api.url, { signal: AbortSignal.timeout(12000) })
                if (!res.ok) continue
                const json = await res.json()
                const data = api.parse(json)
                if (data.videoUrl?.startsWith('http')) {
                    videoUrl  = data.videoUrl
                    metaTitle = data.title
                    metaReact = data.reactions
                    break
                }
            } catch { continue }
        }

        if (!videoUrl) throw '[ ❌ ] No se pudo extraer el video. Las APIs podrían estar caídas.'

        const videoRes = await fetch(videoUrl, { signal: AbortSignal.timeout(60000) })
        if (!videoRes.ok) throw '[ ❌ ] No se pudo descargar el video.'

        const buffer  = Buffer.from(await videoRes.arrayBuffer())
        const sizeKB  = buffer.length / 1024
        const sizeFmt = sizeKB >= 1024
            ? `${(sizeKB / 1024).toFixed(2)} MB`
            : `${sizeKB.toFixed(2)} KB`

        const title     = metaTitle || 'Sin título'
        const reactions = metaReact ? String(metaReact) : 'N/A'
        const linkShort = fbLink.length > 40 ? fbLink.slice(0, 40) + '…' : fbLink

        const caption =
            `ˏˋ ❏ ғɪʟᴇ ɪɴғᴏ ˎˊ -\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `↬ ℘ ᴜsᴇʀ: *_${m.pushName}_*\n` +
            `↬ ❁ Reactions: *_${reactions}_*\n` +
            `↬ ✦ ɴᴀᴍᴇ: *_${title}_*\n` +
            `↬ ⴵ sɪᴢᴇ: *_${sizeFmt}_*\n` +
            `↬ ↳ ʟɪɴᴋ: *_${linkShort}_*\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `> ✎ 「✿𝐇𝐢𝐲𝐮𝐤𝐢 এ 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 𝐩𝐚𝐭𝐫𝐨𝐧✿」`

        const thumb = await global.getIconThumb?.() || null
        const ctx   = global.getNewsletterCtx?.(thumb, '❄︎ FACEBOOK DL', `${sizeFmt} ─ ${global.botName}`) || {}

        await conn.sendMessage(m.chat, {
            video:    buffer,
            caption,
            fileName: 'hiyuki_fb.mp4',
            mimetype: 'video/mp4',
            contextInfo: ctx
        }, { quoted: m })

    } catch (e) {
        const thumb = await global.getIconThumb?.() || null
        const ctx   = global.getNewsletterCtx?.(thumb) || {}
        conn.sendMessage(m.chat, {
            text:
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                `✦ [ ERROR DE DESCARGA ]\n` +
                `  ⟡ ${typeof e === 'string' ? e : (e?.message || 'Error inesperado.')}`,
            contextInfo: ctx
        }, { quoted: m })
    }
}

handler.help    = ['fb <enlace>']
handler.tags    = ['downloader']
handler.command = ['fb', 'facebook', 'fbdl']

export default handler
              
