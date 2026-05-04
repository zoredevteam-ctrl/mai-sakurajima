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

    const TITLE_KEYS    = ['title', 'name', 'video_title', 'caption', 'description', 'text', 'nombre']
    const REACTION_KEYS = ['likes', 'reactions', 'like_count', 'reaction_count', 'likes_count', 'total_reactions', 'views']
    const URL_KEYS      = ['url', 'hd', 'sd', 'video_url', 'download_url', 'playable_url', 'link', 'src']

    const deepFind = (obj, keys, depth = 0) => {
        if (!obj || typeof obj !== 'object' || depth > 6) return null
        for (const k of keys) {
            if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k]
        }
        for (const v of Object.values(obj)) {
            if (typeof v === 'object') {
                const found = deepFind(v, keys, depth + 1)
                if (found) return found
            }
        }
        return null
    }

    const findVideoUrl = (obj, depth = 0) => {
        if (!obj || typeof obj !== 'object' || depth > 6) return null
        if (Array.isArray(obj)) {
            for (const item of obj) {
                const found = findVideoUrl(item, depth + 1)
                if (found) return found
            }
            return null
        }
        for (const k of URL_KEYS) {
            const val = obj[k]
            if (typeof val === 'string' && val.startsWith('http') && /\.(mp4|webm)|fbcdn\.net/.test(val)) return val
        }
        for (const v of Object.values(obj)) {
            if (typeof v === 'object') {
                const found = findVideoUrl(v, depth + 1)
                if (found) return found
            }
        }
        return null
    }

    try {
        const encoded = encodeURIComponent(fbLink)

        const apiUrls = [
            `https://rest.apicausas.xyz/api/v1/descargas/facebook?apikey=causa-db9690e010e31139&url=${encoded}`,
            `https://eliasar-yt-api.vercel.app/api/facebookdl?link=${encoded}`,
            `https://api.vreden.my.id/api/facebook?url=${encoded}`
        ]

        let videoUrl  = null
        let metaTitle = null
        let metaReact = null

        for (const apiUrl of apiUrls) {
            try {
                const res = await fetch(apiUrl, { signal: AbortSignal.timeout(12000) })
                if (!res.ok) continue
                const json = await res.json()

                const found = findVideoUrl(json)
                if (!found) continue

                videoUrl  = found
                metaTitle = deepFind(json, TITLE_KEYS)
                metaReact = deepFind(json, REACTION_KEYS)
                break
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

        const title     = metaTitle ? String(metaTitle).slice(0, 60) : 'Sin título'
        const reactions = metaReact ? String(metaReact) : 'N/A'
        const linkShort = fbLink.length > 40 ? fbLink.slice(0, 40) + '…' : fbLink

        const caption =
            `\`ˏˋ ❏ ғɪʟᴇ ɪɴғᴏ ˎˊ -\`\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `↬ \`℘ ᴜsᴇʀ:\` *${m.pushName}*\n` +
            `↬ \`❁ Reactions:\` *${reactions}*\n` +
            `↬ \`✦ ɴᴀᴍᴇ:\` *${title}*\n` +
            `↬ \`ⴵ sɪᴢᴇ:\` *${sizeFmt}*\n` +
            `↬ \`↳ ʟɪɴᴋ:\` *${linkShort}*\n` +
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
            
