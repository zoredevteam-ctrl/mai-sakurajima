/**
 * MENU — MAI SAKURAJIMA
 * Comandos: #menu, #help, #comandos
 * Z0RT SYSTEMS
 */

import { database } from '../lib/database.js'

const getBannerBase64 = async () => {
    try {
        const src = global.banner || ''
        if (!src) return null
        if (src.startsWith('data:image')) return src.split(',')[1]
        const res = await fetch(src)
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer()).toString('base64')
    } catch { return null }
}

const getBannerBuffer = async () => {
    try {
        const src = global.banner || ''
        if (!src) return null
        if (src.startsWith('data:image')) return Buffer.from(src.split(',')[1], 'base64')
        const res = await fetch(src)
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

let handler = async (m, { conn, usedPrefix, db }) => {
    const sender = (m.sender || '')
        .replace(/:[0-9A-Za-z]+(?=@s\.whatsapp\.net)/, '')
        .split('@')[0].split(':')[0] + '@s.whatsapp.net'

    const px       = usedPrefix || global.prefix || '#'
    const username = m.pushName || 'invitado'
    const botName  = global.botName  || 'Mai Sakurajima'
    const canal    = global.rcanal   || ''

    // ── HORA Y SALUDO ─────────────────────────────────────────────────────────
    const now  = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Bogota' }))
    const hora = now.getHours()
    const saludo =
        hora >= 5  && hora < 12 ? 'buenos dias'   :
        hora >= 12 && hora < 18 ? 'buenas tardes' :
        hora >= 18 && hora < 22 ? 'buenas noches' : 'hola de nuevo'

    const fechaTxt = new Intl.DateTimeFormat('es-CO', {
        timeZone: 'America/Bogota',
        weekday: 'long', day: 'numeric', month: 'long'
    }).format(now)

    // ── UPTIME ────────────────────────────────────────────────────────────────
    const up = process.uptime()
    const uptime =
        Math.floor(up / 86400) > 0
            ? `${Math.floor(up/86400)}d ${Math.floor((up%86400)/3600)}h`
            : Math.floor(up / 3600) > 0
            ? `${Math.floor(up/3600)}h ${Math.floor((up%3600)/60)}m`
            : `${Math.floor(up/60)}m ${Math.floor(up%60)}s`

    // ── DATOS USUARIO ─────────────────────────────────────────────────────────
    const dbData   = db || database.data || {}
    const users    = dbData.users  || {}
    const total    = Object.keys(users).length
    const userData = users[sender] || {}

    const money = (userData.money ?? userData.limit ?? 0).toLocaleString()
    const bank  = (userData.bank  ?? 0).toLocaleString()
    const exp   = (userData.exp   ?? 0).toLocaleString()
    const lvl   = userData.level  ?? 1

    const getRango = l =>
        l >= 50 ? 'Leyenda'   :
        l >= 30 ? 'Diamante'  :
        l >= 20 ? 'Oro'       :
        l >= 10 ? 'Plata'     :
        l >= 5  ? 'Bronce'    : 'Novato'

    const sorted  = Object.entries(users).sort((a,b)=>(b[1]?.money??b[1]?.limit??0)-(a[1]?.money??a[1]?.limit??0))
    const rankPos = sorted.findIndex(u => u[0] === sender) + 1
    const rank    = rankPos > 0 ? `#${rankPos} de ${total}` : 'sin ranking'

    // ── TEXTO DEL MENU ────────────────────────────────────────────────────────
    const txt = `
⌜ ──────────────────────── ⌝
       ✦  ${botName.toUpperCase()}  ✦
   ˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ  —  Z0RT SYSTEMS
⌞ ──────────────────────── ⌟

  ${saludo}, *${username}*.
  hoy es ${fechaTxt}.

  este panel fue creado para ti
  con mucho cuidado. (⁠✿⁠◡⁠‿⁠◡⁠)

⪧ ──────────────── ⪦
     ✦  S I S T E M A
⪧ ──────────────── ⪦

  ◈ prefijo        [ ${px} ]
  ◈ usuarios       ${total.toLocaleString()}
  ◈ activo         ${uptime}
  ◈ canal          ${canal}

⪧ ──────────────── ⪦
     ✦  T U  P E R F I L
⪧ ──────────────── ⪦

  ◈ nombre         ${username}
  ◈ coins          ${money}
  ◈ banco          ${bank}
  ◈ experiencia    ${exp}
  ◈ nivel          ${lvl}  ─  ${getRango(lvl)}
  ◈ ranking        ${rank}

──────── ʚĭɞ ────────

  ✦  C O M A N D O S
  usa *${px}menu* seguido de
  la categoria para mas detalles.

⋆ ─── ✧ ─── ⋆

  𝗦𝗜𝗦𝗧𝗘𝗠𝗔
  ${px}ping  ${px}menu  ${px}owner  ${px}report

  𝗠𝗢𝗗𝗘𝗥𝗔𝗖𝗜𝗢𝗡
  ${px}warn  ${px}mute  ${px}tempban  ${px}antilink
  ${px}antispam  ${px}closegroup  ${px}welcome

  𝗘𝗖𝗢𝗡𝗢𝗠𝗜𝗔
  ${px}daily  ${px}work  ${px}minar  ${px}crime
  ${px}pesca  ${px}rob  ${px}slots  ${px}bal
  ${px}depositar  ${px}retirar  ${px}top  ${px}lvl
  ${px}donar  ${px}prestamo  ${px}invertir

  𝗦𝗢𝗖𝗜𝗔𝗟
  ${px}casar  ${px}divorcio  ${px}adoptar
  ${px}duelo  ${px}perfil  ${px}carta

  𝗝𝗨𝗘𝗚𝗢𝗦
  ${px}trivia  ${px}adivina  ${px}ruleta
  ${px}rruleta  ${px}pista

  𝗜𝗔
  ${px}ia  ${px}imagen  ${px}letra

  𝗠𝗜𝗦𝗧𝗜𝗖𝗔
  ${px}horoscopo  ${px}tarot  ${px}prediccion

  𝗔𝗡𝗜𝗠𝗘
  ${px}rw  ${px}kiss  ${px}hug  ${px}neko
  ${px}waifu  ${px}pat

  𝗗𝗘𝗦𝗖𝗔𝗥𝗚𝗔𝗦
  ${px}play  ${px}playvid  ${px}pin
  ${px}letra  ${px}enviartt

  𝗦𝗨𝗕-𝗕𝗢𝗧𝗦
  ${px}code  ${px}subbots  ${px}delsubbot
  ${px}setnombre  ${px}setbanner

⋆ ─── ✧ ─── ⋆

  ꒰⑅ᵕ༚ᵕ꒱˖♡  gracias por usarme.
`.trim()

    // ── ENVIO — PDF falso con banner grande ───────────────────────────────────
    const bannerBase64 = await getBannerBase64()
    const bannerBuffer = bannerBase64
        ? Buffer.from(bannerBase64, 'base64')
        : await getBannerBuffer()

    try {
        await conn.sendMessage(m.chat, {
            document:  bannerBuffer || Buffer.from(''),
            mimetype:  'application/pdf',
            fileName:  `${botName}.pdf`,
            fileLength: 2199023255552,
            pageCount: 1,
            caption:   txt,
            mentions:  [m.sender],
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                externalAdReply: {
                    title:                 `✦  ${botName.toUpperCase()}`,
                    body:                  '˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ',
                    mediaType:             1,
                    thumbnail:             bannerBase64 || '',
                    renderLargerThumbnail: true,
                    sourceUrl:             canal
                },
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid,
                    newsletterName:  global.newsletterName,
                    serverMessageId: -1
                }
            }
        }, { quoted: m })
    } catch (e) {
        console.error('[MENU ERROR]', e?.message)
        try { await conn.sendMessage(m.chat, { text: txt }, { quoted: m }) } catch {}
    }
}

handler.command = ['menu', 'help', 'comandos']
export default handler