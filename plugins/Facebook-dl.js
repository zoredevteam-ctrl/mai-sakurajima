const isFacebook = (url = '') => /facebook\.com|fb\.watch/i.test(url)
const clean = (str = '') => str.replace(/\\u0025/g, '%').replace(/\\\//g, '/').replace(/&amp;/g, '&')
const toMobile = (url = '') => url.replace(/(www\.|m\.)?facebook\.com/, 'm.facebook.com')
const toBasic  = (url = '') => url.replace(/(www\.|m\.)?facebook\.com/, 'mbasic.facebook.com')

const agents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
]

async function fetchHTML(url) {
    const res = await fetch(url, {
        headers: {
            'User-Agent':      agents[Math.floor(Math.random() * agents.length)],
            'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'es-ES,es;q=0.9'
        },
        signal: AbortSignal.timeout(15000)
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
}

function extractAll(html = '') {
    const results = []
    const regexes = [
        /"browser_native_hd_url":"([^"]+)"/g,
        /"playable_url_quality_hd":"([^"]+)"/g,
        /"playable_url":"([^"]+)"/g,
        /(https:\/\/video\.[^"]+\.fbcdn\.net[^"]+)/g
    ]
    for (const regex of regexes) {
        let match
        while ((match = regex.exec(html)) !== null) {
            results.push(clean(match[1] || match[0]))
        }
    }
    return results.filter(v => v.startsWith('http'))
}

let handler = async (m, { conn, args, usedPrefix, command }) => {

    const url = args[0] || (m.quoted?.text ? m.quoted.text.trim() : '')

    if (!url || !isFacebook(url)) {
        const thumb = await global.getIconThumb?.() || null
        const ctx   = global.getNewsletterCtx?.(thumb) || {}
        return conn.sendMessage(m.chat, {
            text:
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                `✦ [ FACEBOOK DOWNLOADER ]\n` +
                `  ⟡ Proporciona un enlace válido de Facebook.\n\n` +
                `✦ [ USO ]\n` +
                `  ⟡ *${usedPrefix + command}* https://fb.watch/xxxxx`,
            contextInfo: ctx
        }, { quoted: m })
    }

    try {
        let html   = await fetchHTML(url)
        let videos = [...new Set(extractAll(html))]

        if (!videos.length) {
            html   = await fetchHTML(toMobile(url))
            videos = [...new Set(extractAll(html))]
        }

        if (!videos.length) {
            html   = await fetchHTML(toBasic(url))
            videos = [...new Set(extractAll(html))]
        }

        if (!videos.length) throw new Error('El video es privado o no se pudo interceptar.')

        const videoUrl = videos[0]

        const videoRes = await fetch(videoUrl, { signal: AbortSignal.timeout(60000) })
        if (!videoRes.ok) throw new Error('No se pudo descargar el video.')

        const buffer  = Buffer.from(await videoRes.arrayBuffer())
        const sizeKB  = buffer.length / 1024
        const sizeFmt = sizeKB >= 1024
            ? `${(sizeKB / 1024).toFixed(2)} MB`
            : `${sizeKB.toFixed(2)} KB`

        const linkShort = url.length > 40 ? url.slice(0, 40) + '…' : url

        const caption =
            `\`ˏˋ ❏ ғɪʟᴇ ɪɴғᴏ ˎˊ -\`\n` +
            `━━━━━━━━━━━━━━━━━━\n` +
            `↬ \`℘ ᴜsᴇʀ:\` *${m.pushName}*\n` +
            `↬ \`❁ Reactions:\` *N/A*\n` +
            `↬ \`✦ ɴᴀᴍᴇ:\` *Facebook Video*\n` +
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
        console.error('[FB ERROR]', e.message)

        let detail = e.message || 'Error inesperado.'
        if (e.message.includes('HTTP'))    detail = 'Error de conexión con los servidores de Facebook.'
        if (e.message.includes('privado')) detail = 'El video es privado o requiere autenticación.'

        const thumb = await global.getIconThumb?.() || null
        const ctx   = global.getNewsletterCtx?.(thumb) || {}
        conn.sendMessage(m.chat, {
            text:
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                `✦ [ ERROR DE DESCARGA ]\n` +
                `  ⟡ ${detail}`,
            contextInfo: ctx
        }, { quoted: m })
    }
}

handler.help    = ['fb <enlace>']
handler.tags    = ['downloader']
handler.command = ['fb', 'facebook', 'fbdl']

export default handler
            
