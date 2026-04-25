/**
 * PERFIL — MAI SAKURAJIMA
 * #perfil — ver tu perfil con foto
 * #setbirthday dd/mm — registrar cumpleaños
 * #setbio <texto> — establecer biografía
 * Z0RT SYSTEMS
 */

import { database } from '../lib/database.js'

const getIconThumb = async () => {
    try {
        const res = await fetch(global.icono || global.banner || '')
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

const normJid = jid => (jid || '').split('@')[0].split(':')[0] + '@s.whatsapp.net'

// ── Calcular edad a partir de cumpleaños dd/mm/aaaa o dd/mm ──────────────────
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

// ── Días para el próximo cumpleaños ──────────────────────────────────────────
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
    return diff === 0 ? 'hoy' : diff === 1 ? 'manana' : `en ${diff} dias`
}

// ── Rango por nivel ───────────────────────────────────────────────────────────
const getRango = l =>
    l >= 50 ? 'Leyenda'  :
    l >= 30 ? 'Diamante' :
    l >= 20 ? 'Oro'      :
    l >= 10 ? 'Plata'    :
    l >= 5  ? 'Bronce'   : 'Novato'

// ── Tiempo registrado ─────────────────────────────────────────────────────────
const tiempoRegistrado = (ts) => {
    if (!ts) return 'desconocido'
    const diff = Date.now() - ts
    const d    = Math.floor(diff / 86400000)
    const h    = Math.floor((diff % 86400000) / 3600000)
    if (d > 0) return `${d} dia${d !== 1 ? 's' : ''}`
    return `${h} hora${h !== 1 ? 's' : ''}`
}

let handler = async (m, { conn, command, text, args, db }) => {
    const cmd = command.toLowerCase()

    const sender = normJid(m.sender)
    const user   = database.getUser(sender)

    // ── #setbirthday dd/mm o dd/mm/aaaa ──────────────────────────────────────
    if (cmd === 'setbirthday' || cmd === 'cumple' || cmd === 'setcumple') {
        const input = (text || '').trim()
        if (!input) {
            return m.reply(
                `⌜ ──────────── ⌝\n` +
                `  ✦ CUMPLEANOS\n` +
                `⌞ ──────────── ⌟\n\n` +
                `  ◈ uso      *#setbirthday dd/mm*\n` +
                `  ◈ ejemplo  *#setbirthday 15/03*\n\n` +
                `  ◈ tambien puedes poner el ano\n` +
                `  ◈ ejemplo  *#setbirthday 15/03/2004* (⁠✿⁠◡⁠‿⁠◡⁠)`
            )
        }

        const regex = /^(\d{1,2})\/(\d{1,2})(\/(\d{4}))?$/
        if (!regex.test(input)) {
            return m.reply(
                `⌜ ──────────── ⌝\n` +
                `  ✦ FORMATO INVALIDO\n` +
                `⌞ ──────────── ⌟\n\n` +
                `  ◈ formato correcto  *dd/mm* o *dd/mm/aaaa*\n` +
                `  ◈ ejemplo           *15/03* o *15/03/2004*`
            )
        }

        user.birthday = input
        return m.reply(
            `⌜ ──────────── ⌝\n` +
            `  ✦ CUMPLEANOS GUARDADO\n` +
            `⌞ ──────────── ⌟\n\n` +
            `  ◈ fecha  *${input}*\n` +
            `  ◈ ${diasParaCumple(input) === 'hoy' ? 'hoy es tu cumpleanos! (⁠๑⁠˃⁠ᴗ⁠˂⁠)⁠ﻭ' : `faltan  *${diasParaCumple(input)}*`}\n\n` +
            `  ꒰⑅ᵕ༚ᵕ꒱˖♡  guardado correctamente.`
        )
    }

    // ── #setbio <texto> ───────────────────────────────────────────────────────
    if (cmd === 'setbio' || cmd === 'bio') {
        const bio = (text || '').trim()
        if (!bio) {
            return m.reply(
                `⌜ ──────────── ⌝\n` +
                `  ✦ BIOGRAFIA\n` +
                `⌞ ──────────── ⌟\n\n` +
                `  ◈ uso  *#setbio <tu descripcion>*\n` +
                `  ◈ max  100 caracteres`
            )
        }
        if (bio.length > 100) {
            return m.reply(`  ◈ la biografia no puede superar 100 caracteres. (⁠˘⁠︶⁠˘⁠)⁠.⁠｡⁠*⁠♡`)
        }
        user.bio = bio
        return m.reply(
            `⌜ ──────────── ⌝\n` +
            `  ✦ BIOGRAFIA GUARDADA\n` +
            `⌞ ──────────── ⌟\n\n` +
            `  ◈ *${bio}*\n\n` +
            `  ꒰⑅ᵕ༚ᵕ꒱˖♡  actualizada correctamente.`
        )
    }

    // ── #perfil [@usuario] ────────────────────────────────────────────────────
    const target     = m.mentionedJid?.[0] ? normJid(m.mentionedJid[0])
                     : m.quoted?.sender    ? normJid(m.quoted.sender)
                     : sender
    const targetUser = database.getUser(target)
    const esMio      = target === sender

    // Nombre
    const nombre = esMio
        ? (m.pushName || sender.split('@')[0])
        : (targetUser.name || target.split('@')[0])

    if (!targetUser.name && esMio && m.pushName) targetUser.name = m.pushName

    // Datos económicos
    const money = (targetUser.money ?? targetUser.limit ?? 0).toLocaleString()
    const bank  = (targetUser.bank  ?? 0).toLocaleString()
    const exp   = (targetUser.exp   ?? 0).toLocaleString()
    const lvl   = targetUser.level  ?? 1
    const rango = getRango(lvl)

    // Ranking
    const users   = database.data?.users || {}
    const sorted  = Object.entries(users).sort((a, b) =>
        (b[1]?.money ?? b[1]?.limit ?? 0) - (a[1]?.money ?? a[1]?.limit ?? 0)
    )
    const rankPos = sorted.findIndex(([j]) => j === target) + 1
    const rank    = rankPos > 0 ? `#${rankPos} de ${Object.keys(users).length}` : 'sin ranking'

    // Cumpleaños
    const bday    = targetUser.birthday || null
    const edad    = bday ? calcEdad(bday) : null
    const cumpleTxt = bday
        ? diasParaCumple(bday) === 'hoy'
            ? `${bday}  ─  hoy es su cumpleanos!`
            : `${bday}  ─  ${diasParaCumple(bday)}`
        : 'no registrado'

    // Estado social
    const casado   = targetUser.casadoCon
        ? `con @${targetUser.casadoCon.split('@')[0]}`
        : 'soltero/a'
    const hijos    = targetUser.hijos?.length ?? 0
    const bio      = targetUser.bio || 'sin biografia'
    const regTime  = targetUser.registered_time
        ? tiempoRegistrado(targetUser.registered_time)
        : 'desconocido'
    const premium  = targetUser.premium ? 'si' : 'no'
    const warns    = targetUser.warning  ?? 0

    // Construir texto del perfil
    const txt =
        `⌜ ──────────────────────── ⌝\n` +
        `  ✦  P E R F I L\n` +
        `⌞ ──────────────────────── ⌟\n\n` +
        `  ◈ nombre       *${nombre}*\n` +
        (edad !== null
            ? `  ◈ edad         ${edad} anos\n`
            : '') +
        `  ◈ bio          ${bio}\n\n` +
        `⪧ ──────────── ⪦\n` +
        `     ✦  economia\n` +
        `⪧ ──────────── ⪦\n\n` +
        `  ◈ coins        ${money}\n` +
        `  ◈ banco        ${bank}\n` +
        `  ◈ experiencia  ${exp}\n` +
        `  ◈ nivel        ${lvl}  ─  ${rango}\n` +
        `  ◈ ranking      ${rank}\n\n` +
        `⪧ ──────────── ⪦\n` +
        `     ✦  social\n` +
        `⪧ ──────────── ⪦\n\n` +
        `  ◈ estado       ${casado}\n` +
        `  ◈ hijos        ${hijos}\n\n` +
        `⪧ ──────────── ⪦\n` +
        `     ✦  cuenta\n` +
        `⪧ ──────────── ⪦\n\n` +
        `  ◈ premium      ${premium}\n` +
        `  ◈ warns        ${warns} / 3\n` +
        `  ◈ registro     hace ${regTime}\n` +
        `  ◈ cumpleanos   ${cumpleTxt}\n\n` +
        `  ⋆ ─── ✧ ─── ⋆\n` +
        `  ꒰⑅ᵕ༚ᵕ꒱˖♡  ${esMio ? 'este eres tu.' : `perfil de @${target.split('@')[0]}.`}`

    // ── Obtener foto de perfil como imagen ────────────────────────────────────
    let ppBuffer = null
    try {
        const ppUrl = await conn.profilePictureUrl(target, 'image')
        const ppRes = await fetch(ppUrl)
        ppBuffer    = Buffer.from(await ppRes.arrayBuffer())
    } catch {
        // Si no tiene foto usamos el icono del bot
        ppBuffer = await getIconThumb()
    }

    const iconThumb = await getIconThumb()

    // ── Enviar foto + texto ───────────────────────────────────────────────────
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
                    title:                 `✦  ${nombre}`,
                    body:                  `${rango}  ─  Nv. ${lvl}`,
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