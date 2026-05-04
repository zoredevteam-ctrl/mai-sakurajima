import * as cheerio from 'cheerio'

async function scraperFdown(fbUrl) {
    const encoded = encodeURIComponent(fbUrl)
    const res = await fetch(`https://fdown.net/download.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent':   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer':      'https://fdown.net/',
            'Origin':       'https://fdown.net'
        },
        body: `URLz=${encoded}`
    })
    if (!res.ok) throw new Error(`fdown HTTP ${res.status}`)
    const html = await res.text()
    const $    = cheerio.load(html)

    const hdUrl = $('#hdlink').attr('href') || $('a[id="hdlink"]').attr('href') || null
    const sdUrl = $('#sdlink').attr('href') || $('a[id="sdlink"]').attr('href') || null
    const title = $('h2.video-title, .video-title, #title').first().text().trim() || null

    const videoUrl = hdUrl || sdUrl
    if (!videoUrl) throw new Error('fdown: no encontró URL de video')
    return { videoUrl, title, quality: hdUrl ? 'HD' : 'SD', source: 'fdown.net' }
}

async function scraperGetfvid(fbUrl) {
    const page1 = await fetch('https://getfvid.com/', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    })
    if (!page1.ok) throw new Error(`getfvid home HTTP ${page1.status}`)
    const html1 = await page1.text()
    const $ = cheerio.load(html1)
    const token = $('input[name="_token"]').val() || ''
    if (!token) throw new Error('getfvid: no token csrf')

    const form = new URLSearchParams()
    form.append('_token', token)
    form.append('url', fbUrl)

    const res = await fetch('https://getfvid.com/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent':   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer':      'https://getfvid.com/',
            'Origin':       'https://getfvid.com'
        },
        body: form.toString()
    })
    if (!res.ok) throw new Error(`getfvid POST HTTP ${res.status}`)
    const html2 = await res.text()
    const $2    = cheerio.load(html2)

    const hdUrl = $2('a.btn-success:contains("HD"), a[title*="HD"]').first().attr('href') || null
    const sdUrl = $2('a.btn-success, a.download-link').first().attr('href') || null
    const title = $2('h2, .video-title, .title').first().text().trim() || null

    const videoUrl = hdUrl || sdUrl
    if (!videoUrl) throw new Error('getfvid: no encontró URL de video')
    return { videoUrl, title, quality: hdUrl ? 'HD' : 'SD', source: 'getfvid.com' }
}

async function scraperSnapsave(fbUrl) {
    const res = await fetch('https://snapsave.app/action.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent':   'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer':      'https://snapsave.app/',
            'Origin':       'https://snapsave.app'
        },
        body: `url=${encodeURIComponent(fbUrl)}`
    })
    if (!res.ok) throw new Error(`snapsave HTTP ${res.status}`)
    const data = await res.json()

    const html  = typeof data === 'string' ? data : JSON.stringify(data)
    const $ = cheerio.load(html)

    const hdUrl = $('a[data-resolution="hd"], a:contains("HD")').first().attr('href') || null
    const sdUrl = $('a[data-resolution="sd"], a:contains("SD"), a.download').first().attr('href') || null

    const videoUrl = hdUrl || sdUrl
    if (!videoUrl) throw new Error('snapsave: no encontró URL de video')
    return { videoUrl, quality: hdUrl ? 'HD' : 'SD', source: 'snapsave.app' }
}

async function downloadVideo(url) {
    const res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer':    'https://www.facebook.com/'
        },
        redirect: 'follow'
    })
    if (!res.ok) throw new Error(`descarga HTTP ${res.status}`)
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('video') && !ct.includes('octet-stream') && !ct.includes('mp4')) {
        throw new Error(`tipo de contenido inesperado: ${ct}`)
    }
    return Buffer.from(await res.arrayBuffer())
}

let handler = async (m, { args, command, usedPrefix, conn }) => {
    const thumb = await global.getIconThumb?.() || null
    const ctx   = global.getNewsletterCtx?.(thumb) || {}

    if (!args[0]) {
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
    if (!/facebook\.com|fb\.watch/i.test(fbLink)) {
        return conn.sendMessage(m.chat, {
            text:
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                `✦ [ ERROR DE ENLACE ]\n` +
                `  ⟡ El enlace no parece ser de Facebook.\n` +
                `  ⟡ Usa un link válido de *facebook.com* o *fb.watch*`,
            contextInfo: ctx
        }, { quoted: m })
    }

    const { key: waitKey } = await conn.sendMessage(m.chat, {
        text: `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n  ⟡ _Extrayendo video de Facebook..._`,
        contextInfo: ctx
    }, { quoted: m })

    const scrapers = [scraperFdown, scraperSnapsave, scraperGetfvid]
    let result = null

    for (const scraper of scrapers) {
        try {
            result = await scraper(fbLink)
            if (result?.videoUrl) break
        } catch (e) {
            console.log(`[FB-DL] ${scraper.name} falló:`, e.message)
        }
    }

    if (!result?.videoUrl) {
        await conn.sendMessage(m.chat, {
            text:
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                `✦ [ EXTRACCIÓN FALLIDA ]\n` +
                `  ⟡ No se pudo extraer el video de Facebook.\n` +
                `  ⟡ El video puede ser privado o los servicios están caídos.`,
            contextInfo: ctx
        }, { edit: waitKey })
        return
    }

    let buffer
    try {
        buffer = await downloadVideo(result.videoUrl)
    } catch (e) {
        console.log('[FB-DL] Error al descargar buffer:', e.message)
        await conn.sendMessage(m.chat, {
            text:
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                `✦ [ ERROR DE DESCARGA ]\n` +
                `  ⟡ Se extrajo el enlace pero falló la descarga.\n` +
                `  ⟡ Intenta de nuevo o usa otro link.`,
            contextInfo: ctx
        }, { edit: waitKey })
        return
    }

    const sizeText = (buffer.length / (1024 * 1024)).toFixed(2) + ' MB'

    const caption =
        `\`ˏˋ ❏ ғɪʟᴇ ɪɴғᴏ ˎˊ -\`\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `↬ \`✦ ᴛɪᴛᴜʟᴏ:\` *${result.title || 'Sin título'}*\n` +
        `↬ \`⬡ ᴄᴀʟɪᴅᴀᴅ:\` *${result.quality || 'SD'}*\n` +
        `↬ \`ⴵ sɪᴢᴇ:\` *${sizeText}*\n` +
        `↬ \`↳ ʟɪɴᴋ:\` *${fbLink}*\n` +
        `↬ \`⚙ sᴏᴜʀᴄᴇ:\` *${result.source}*\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `> ✎ 「✿𝐇𝐢𝐲𝐮𝐤𝐢 এ 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 𝐩𝐚𝐭𝐫𝐨𝐧✿」`

    try { await conn.sendMessage(m.chat, { delete: waitKey }) } catch {}

    await conn.sendMessage(m.chat, {
        video:    buffer,
        caption,
        fileName: 'facebook_video.mp4',
        mimetype: 'video/mp4',
        contextInfo: ctx
    }, { quoted: m })
}

handler.help    = ['fb <enlace>']
handler.tags    = ['downloader']
handler.command = ['fb', 'facebook', 'fbdl']

export default handler
    
