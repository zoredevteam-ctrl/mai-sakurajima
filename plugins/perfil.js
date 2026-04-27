import { database } from '../lib/database.js'

const getIconThumb = async () => {
    try {
        const res = await fetch(global.icono || global.banner || '')
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

const normJid = jid => (jid || '').split('@')[0].split(':')[0] + '@s.whatsapp.net'

const calcEdad = (bday) => {
    if (!bday) return null
    const parts = bday.split('/')
    if (parts.length < 2) return null
    const day   = parseInt(parts[0])
    const month = parseInt(parts[1]) - 1
    const year  = parts[2] ? parseInt(parts[2]) : new Date().getFullYear()
    const now   = new Date()
    let age     = now.getFullYear() - year
    if (now.getMonth() < month || (now.getMonth() === month && now.getDate() < day)) age--
    return parts[2] ? age : null
}

const diasParaCumple = (bday) => {
    if (!bday) return null
    const parts = bday.split('/')
    if (parts.length < 2) return null
    const day   = parseInt(parts[0])
    const month = parseInt(parts[1]) - 1
    const now   = new Date()
    let next    = new Date(now.getFullYear(), month, day)
    if (next < now) next.setFullYear(now.getFullYear() + 1)
    const diff  = Math.ceil((next - now) / (1000 * 60 * 60 * 24))
    return diff === 0 ? 'hoy 🎂' : diff === 1 ? 'mañana' : `en ${diff} días`
}

const getRango = l =>
    l >= 50 ? '👑 Leyenda'  :
    l >= 30 ? '💎 Diamante' :
    l >= 20 ? '🥇 Oro'      :
    l >= 10 ? '🥈 Plata'    :
    l >= 5  ? '🥉 Bronce'   : '🌱 Novato'

const tiempoRegistrado = (ts) => {
    if (!ts) return 'desconocido'
    const diff = Date.now() - ts
    const d    = Math.floor(diff / 86400000)
    const h    = Math.floor((diff % 86400000) / 3600000)
    if (d > 0) return `${d} día${d !== 1 ? 's' : ''}`
    return `${h} hora${h !== 1 ? 's' : ''}`
}

let handler = async (m, { conn, command, text, args, db }) => {
    const cmd    = command.toLowerCase()
    const sender = normJid(m.sender)
    const user   = database.getUser(sender)

    // ── #setbirthday ──────────────────────────────────────────────────────────
    if (cmd === 'setbirthday' || cmd === 'cumple' || cmd === 'setcumple') {
        const input = (text || '').trim()
        if (!input) return m.reply(
            `╭─「 🌸 *CUMPLEAÑOS* 」\n` +
            `│ ✿ uso: *#setbirthday dd/mm*\n` +
            `│ ✿ con año: *#setbirthday 15/03/2004*\n` +
            `╰────────────────────`
        )

        if (!/^(\d{1,2})\/(\d{1,2})(\/(\d{4}))?$/.test(input)) return m.reply(
            `╭─「 ⚠️ *FORMATO INVÁLIDO* 」\n` +
            `│ ✿ correcto: *dd/mm* o *dd/mm/aaaa*\n` +
            `│ ✿ ejemplo:  *15/03* o *15/03/2004*\n` +
            `╰────────────────────`
        )

        user.birthday = input
        const dias = diasParaCumple(input)
        return m.reply(
            `╭─「 🎂 *CUMPLEAÑOS GUARDADO* 」\n` +
            `│ ✿ fecha: *${input}*\n` +
            `│ ✿ ${dias === 'hoy 🎂' ? '¡hoy es tu cumpleaños! 🎉' : `faltan: *${dias}*`}\n` +
            `╰────────────────────`
        )
    }

    // ── #setbio ───────────────────────────────────────────────────────────────
    if (cmd === 'setbio' || cmd === 'bio') {
        const bio = (text || '').trim()
        if (!bio) return m.reply(
            `╭─「 📝 *BIOGRAFÍA* 」\n` +
            `│ ✿ uso: *#setbio <tu descripción>*\n` +
            `│ ✿ máx: 100 caracteres\n` +
            `╰────────────────────`
        )
        if (bio.length > 100) return m.reply(
            `╭─「 ⚠️ *DEMASIADO LARGA* 」\n` +
            `│ ✿ máximo 100 caracteres\n` +
            `╰────────────────────`
        )
        user.bio = bio
        return m.reply(
            `╭─「 ✅ *BIOGRAFÍA GUARDADA* 」\n` +
            `│ ✿ *${bio}*\n` +
            `╰────────────────────`
        )
    }

    // ── #perfil ───────────────────────────────────────────────────────────────
    const target     = m.mentionedJid?.[0] ? normJid(m.mentionedJid[0])
                     : m.quoted?.sender    ? normJid(m.quoted.sender)
                     : sender
    const targetUser = database.getUser(target)
    const esMio      = target === sender

    const nombre = esMio
        ? (m.pushName || sender.split('@')[0])
        : (targetUser.name || target.split('@')[0])
    if (!targetUser.name && esMio && m.pushName) targetUser.name = m.pushName

    const money = (targetUser.money ?? targetUser.limit ?? 0).toLocaleString()
    const bank  = (targetUser.bank  ?? 0).toLocaleString()
    const exp   = (targetUser.exp   ?? 0).toLocaleString()
    const lvl   = targetUser.level  ?? 1
    const rango = getRango(lvl)

    const users   = database.data?.users || {}
    const sorted  = Object.entries(users).sort((a, b) =>
        (b[1]?.money ?? b[1]?.limit ?? 0) - (a[1]?.money ?? a[1]?.limit ?? 0)
    )
    const rankPos = sorted.findIndex(([j]) => j === target) + 1
    const rank    = rankPos > 0 ? `#${rankPos} de ${Object.keys(users).length}` : 'sin ranking'

    const bday      = targetUser.birthday || null
    const edad      = bday ? calcEdad(bday) : null
    const diasCumple = bday ? diasParaCumple(bday) : null
    const cumpleTxt = bday
        ? diasCumple === 'hoy 🎂'
            ? `${bday} ─ ¡hoy es su cumpleaños! 🎉`
            : `${bday} ─ ${diasCumple}`
        : 'no registrado'

    const casado  = targetUser.casadoCon
        ? `con @${targetUser.casadoCon.split('@')[0]}`
        : 'soltero/a'
    const hijos   = targetUser.hijos?.length ?? 0
    const bio     = targetUser.bio || 'sin biografía'
    const regTime = targetUser.registered_time
        ? tiempoRegistrado(targetUser.registered_time)
        : 'desconocido'
    const premium = targetUser.premium ? '✅ sí' : '❌ no'
    const warns   = targetUser.warning ?? 0

    const txt =
        `╭─「 👤 *PERFIL* 」\n` +
        `│ ✿ nombre: *${nombre}*\n` +
        (edad !== null
        ? `│ ✿ años: *${edad}*\n`
        : '') +
        `│ ✿ bio: ${bio}\n` +
        `│\n` +
        `│ 💰 *ECONOMÍA*\n` +
        `│ ✿ coins: *${money}*\n` +
        `│ ✿ banco: *${bank}*\n` +
        `│ ✿ exp: *${exp}*\n` +
        `│ ✿ nivel: *${lvl}* ─ ${rango}\n` +
        `│ ✿ ranking: *${rank}*\n` +
        `│\n` +
        `│ 💞 *SOCIAL*\n` +
        `│ ✿ estado: *${casado}*\n` +
        `│ ✿ hijos: *${hijos}*\n` +
        `│\n` +
        `│ 🗂️ *CUENTA*\n` +
        `│ ✿ premium: ${premium}\n` +
        `│ ✿ warns: *${warns}/3*\n` +
        `│ ✿ registro: *hace ${regTime}*\n` +
        `│ ✿ cumpleaños: *${cumpleTxt}*\n` +
        `╰────────────────────\n` +
        `꒰⑅ᵕ༚ᵕ꒱˖♡ ${esMio ? 'este eres tú.' : `perfil de @${target.split('@')[0]}.`}`

    let ppBuffer = null
    try {
        const ppUrl = await conn.profilePictureUrl(target, 'image')
        const ppRes = await fetch(ppUrl)
        ppBuffer    = Buffer.from(await ppRes.arrayBuffer())
    } catch {
        ppBuffer = await getIconThumb()
    }

    const iconThumb = await getIconThumb()

    try {
        await conn.sendMessage(m.chat, {
            image:   ppBuffer,
            caption: txt,
            mentions: esMio ? [sender] : [target],
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid,
                    serverMessageId: -1,
                    newsletterName:  global.newsletterName
                },
                externalAdReply: {
                    title:                 `✦ ${nombre}`,
                    body:                  `${rango} ─ Nv. ${lvl}`,
                    mediaType:             1,
                    thumbnail:             iconThumb,
                    renderLargerThumbnail: false,
                    sourceUrl:             global.rcanal || ''
                }
            }
        }, { quoted: m })
    } catch (e) {
        console.error('[PERFIL ERROR]', e?.message)
        await m.reply(txt)
    }
}

handler.command = ['perfil', 'profile', 'setbirthday', 'setcumple', 'cumple', 'setbio', 'bio']
export default handler
