// plugins/rw.js
import { database } from '../lib/database.js'

const COOLDOWN = 12 * 60 * 60 * 1000 // 12 horas

const getThumb = async () => {
    try {
        const res = await fetch(global.icono || global.banner || '')
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

const msToTime = (ms) => {
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
}

// ── Obtener waifu de nekos.best ───────────────────────────────────────────────
const getWaifu = async () => {
    const tipos  = ['waifu', 'neko', 'kitsune']
    const tipo   = tipos[Math.floor(Math.random() * tipos.length)]
    const res    = await fetch(`https://nekos.best/api/v2/${tipo}`)
    const data   = await res.json()
    const result = data?.results?.[0]
    return {
        url:    result?.url || null,
        anime:  result?.anime_name || 'Desconocido',
        artista: result?.artist_name || 'Desconocido',
        tipo
    }
}

// ── Rareza random ─────────────────────────────────────────────────────────────
const getRareza = () => {
    const rand = Math.random() * 100
    if (rand < 1)  return { nombre: '❄︎ Celestial', valor: 1000, stars: '★★★★★' }
    if (rand < 5)  return { nombre: '✦ Legendaria', valor: 500,  stars: '★★★★☆' }
    if (rand < 15) return { nombre: '◈ Épica',      valor: 200,  stars: '★★★☆☆' }
    if (rand < 35) return { nombre: '◇ Rara',       valor: 100,  stars: '★★☆☆☆' }
    return             { nombre: '· Común',          valor: 30,   stars: '★☆☆☆☆' }
}

let handler = async (m, { conn, command }) => {
    const cmd    = command.toLowerCase()
    const sender = m.sender

    if (!database.data.users) database.data.users = {}
    if (!database.data.users[sender]) database.data.users[sender] = {}
    const user = database.data.users[sender]

    // ── #rw — ver waifus reclamadas ───────────────────────────────────────────
    if (cmd === 'rw' || cmd === 'waifus') {
        const waifus = user.waifus || []
        if (!waifus.length) return m.reply(
            `⟪❄︎⟫ no tienes waifus aún\n✎ usa *#c* para reclamar una❄︎`
        )
        const lista = waifus.slice(-5).map((w, i) =>
            `✎ ${i + 1}. *${w.anime}* — ${w.rareza}`
        ).join('\n')
        return m.reply(
            `⟪❄︎⟫ *tus waifus* (${waifus.length} total)\n${lista}❄︎`
        )
    }

    // ── #c — reclamar waifu ───────────────────────────────────────────────────
    if (cmd === 'c' || cmd === 'claim' || cmd === 'reclamar') {
        const lastClaim = user.lastRw || 0
        const diff      = Date.now() - lastClaim

        if (diff < COOLDOWN) return m.reply(
            `⟪❄︎⟫ ya reclamaste tu waifu\n✎ vuelve en *${msToTime(COOLDOWN - diff)}*❄︎`
        )

        await m.react('✦')

        try {
            const waifu  = await getWaifu()
            const rareza = getRareza()

            if (!waifu.url) throw new Error('no se obtuvo imagen')

            // Guardar en colección
            if (!user.waifus) user.waifus = []
            user.waifus.push({
                anime:  waifu.anime,
                rareza: rareza.nombre,
                valor:  rareza.valor,
                tipo:   waifu.tipo,
                fecha:  Date.now()
            })
            user.lastRw = Date.now()
            user.money  = (user.money || 0) + rareza.valor

            const thumb = await getThumb()

            await conn.sendMessage(m.chat, {
                image:   { url: waifu.url },
                caption:
                    `⟪❄︎⟫ *waifu reclamada*\n` +
                    `✎ rareza: *${rareza.nombre}*\n` +
                    `✎ estrellas: ${rareza.stars}\n` +
                    `✎ anime: *${waifu.anime}*\n` +
                    `✎ artista: ${waifu.artista}\n` +
                    `✎ coins: *+${rareza.valor}*\n` +
                    `✎ colección: *${user.waifus.length}* waifus\n` +
                    `✎ próximo reclamo: *${msToTime(COOLDOWN)}*❄︎`,
                contextInfo: {
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid:   global.newsletterJid,
                        serverMessageId: -1,
                        newsletterName:  global.newsletterName
                    },
                    externalAdReply: {
                        title:                 rareza.nombre,
                        body:                  waifu.anime,
                        mediaType:             1,
                        thumbnail:             thumb,
                        renderLargerThumbnail: false,
                        sourceUrl:             global.rcanal || ''
                    }
                }
            }, { quoted: m })

            await m.react('✅')

        } catch (e) {
            console.error('[RW ERROR]', e.message)
            await m.react('✗')
            await m.reply(`⟪❄︎⟫ error al obtener waifu, intenta de nuevo❄︎`)
        }
    }
}

handler.command = ['rw', 'waifus', 'c', 'claim', 'reclamar']
export default handler
