// plugins/utilidades.js
import { database } from '../lib/database.js'

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
                    body:                  '🛠️ Utilidades Hiruka',
                    mediaType:             1,
                    thumbnail:             thumb,
                    renderLargerThumbnail: false,
                    sourceUrl:             global.rcanal || ''
                }
            }
        }, { quoted: m })
    } catch { await m.reply(txt) }
}

let handler = async (m, { conn, command, text }) => {
    const cmd = command.toLowerCase()

    // ── #ping ─────────────────────────────────────────────────────────────────
    if (cmd === 'ping' || cmd === 'speed') {
        const start = Date.now()
        await m.react('🏓')
        const ms = Date.now() - start
        const emoji = ms < 200 ? '🟢' : ms < 500 ? '🟡' : '🔴'
        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🏓 ✧ ⩾═══════╗\n` +
            `           「 𝖯𝖨𝖭𝖦 」\n` +
            `╚═══════⩽ ✧ 🏓 ✧ ⩾═══════╝\n` +
            `┣ 🪷 latencia: *${ms}ms* ${emoji}\n` +
            `┣ 🪷 ${ms < 200 ? 'rapidísimo. como Hiruka cuando te ignora' : ms < 500 ? 'normal. como cualquier día común' : 'un poco lento... igual que tú por las mañanas (⁠¬⁠_⁠¬⁠)'}\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
    }

    // ── #uptime ───────────────────────────────────────────────────────────────
    if (cmd === 'uptime' || cmd === 'tiempo') {
        const sec = Math.floor(process.uptime())
        const d   = Math.floor(sec / 86400)
        const h   = Math.floor((sec % 86400) / 3600)
        const min = Math.floor((sec % 3600) / 60)
        const s   = sec % 60
        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ ⏱️ ✧ ⩾═══════╗\n` +
            `          「 𝖴𝖯𝖳𝖨𝖬𝖤 」\n` +
            `╚═══════⩽ ✧ ⏱️ ✧ ⩾═══════╝\n` +
            `┣ 🪷 *${d}d ${h}h ${min}m ${s}s*\n` +
            `┣ 🪷 ${d > 0 ? `llevo ${d} día${d !== 1 ? 's' : ''} despierta sin descanso... gracias (⁠¬⁠_⁠¬⁠)` : 'recién encendida. como nueva (⁠✿⁠◡⁠‿⁠◡⁠)'}\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
    }

    // ── #sticker ──────────────────────────────────────────────────────────────
    if (cmd === 'sticker' || cmd === 's') {
        const quoted = m.quoted || m
        const mime   = quoted?.msg?.mimetype || ''

        if (!mime.startsWith('image') && !mime.startsWith('video')) return sendReply(conn, m,
            `╔═══════⩽ ✧ 🎨 ✧ ⩾═══════╗\n` +
            `         「 𝖲𝖳𝖨𝖢𝖪𝖤𝖱 」\n` +
            `╚═══════⩽ ✧ 🎨 ✧ ⩾═══════╝\n` +
            `┣ 🪷 responde a una *imagen* o *video*\n` +
            `┣ 🪷 uso: *#sticker* + responder imagen\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )

        await m.react('🎨')
        try {
            const media = await conn.downloadMediaMessage(quoted)
            await conn.sendMessage(m.chat, {
                sticker: media,
                ...(mime.startsWith('video') ? { gifPlayback: false } : {})
            }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            console.error('[STICKER ERROR]', e.message)
            await sendReply(conn, m, `┣ 🪷 no pude crear el sticker. intenta con otra imagen`)
        }
    }

    // ── #toimg ────────────────────────────────────────────────────────────────
    if (cmd === 'toimg' || cmd === 'toimage') {
        const quoted = m.quoted || m
        const mime   = quoted?.msg?.mimetype || ''

        if (!mime.includes('webp')) return sendReply(conn, m,
            `╔═══════⩽ ✧ 🖼️ ✧ ⩾═══════╗\n` +
            `          「 𝖳𝖮𝖨𝖬𝖦 」\n` +
            `╚═══════⩽ ✧ 🖼️ ✧ ⩾═══════╝\n` +
            `┣ 🪷 responde a un *sticker*\n` +
            `┣ 🪷 uso: *#toimg* + responder sticker\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )

        await m.react('🖼️')
        try {
            const media = await conn.downloadMediaMessage(quoted)
            await conn.sendMessage(m.chat, { image: media }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            console.error('[TOIMG ERROR]', e.message)
            await sendReply(conn, m, `┣ 🪷 no pude convertir el sticker`)
        }
    }

    // ── #clima ────────────────────────────────────────────────────────────────
    if (cmd === 'clima' || cmd === 'weather') {
        const ciudad = (text || '').trim()
        if (!ciudad) return sendReply(conn, m,
            `╔═══════⩽ ✧ 🌤️ ✧ ⩾═══════╗\n` +
            `           「 𝖢𝖫𝖨𝖬𝖠 」\n` +
            `╚═══════⩽ ✧ 🌤️ ✧ ⩾═══════╝\n` +
            `┣ 🪷 uso: *#clima <ciudad>*\n` +
            `┣ 🪷 ejemplo: *#clima Bogotá*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )

        await m.react('🌤️')
        try {
            const url  = `https://wttr.in/${encodeURIComponent(ciudad)}?format=j1&lang=es`
            const res  = await fetch(url)
            if (!res.ok) throw new Error('ciudad no encontrada')
            const data = await res.json()
            const cur  = data.current_condition?.[0]
            const loc  = data.nearest_area?.[0]
            const temp = cur?.temp_C
            const feel = cur?.FeelsLikeC
            const desc = cur?.weatherDesc?.[0]?.value || 'desconocido'
            const hum  = cur?.humidity
            const wind = cur?.windspeedKmph
            const pais = loc?.country?.[0]?.value || ''
            const emoji = parseInt(temp) < 10 ? '🥶' : parseInt(temp) < 20 ? '😐' : parseInt(temp) < 30 ? '😊' : '🥵'

            return sendReply(conn, m,
                `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
                `╔═══════⩽ ✧ 🌤️ ✧ ⩾═══════╗\n` +
                `           「 𝖢𝖫𝖨𝖬𝖠 」\n` +
                `╚═══════⩽ ✧ 🌤️ ✧ ⩾═══════╝\n` +
                `┣ 🪷 ciudad: *${ciudad}${pais ? ', ' + pais : ''}*\n` +
                `┣ 🪷 clima: *${desc}*\n` +
                `┣ 🪷 temp: *${temp}°C* ${emoji}\n` +
                `┣ 🪷 sensación: *${feel}°C*\n` +
                `┣ 🪷 humedad: *${hum}%*\n` +
                `┣ 🪷 viento: *${wind} km/h*\n` +
                `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
            )
        } catch {
            return sendReply(conn, m, `┣ 🪷 no encontré el clima de *${ciudad}*. escribe bien la ciudad (⁠¬⁠_⁠¬⁠)`)
        }
    }
}

handler.command = ['ping', 'speed', 'uptime', 'tiempo', 'sticker', 's', 'toimg', 'toimage', 'clima', 'weather']
export default handler
