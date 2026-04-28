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
                    body:                  global.newsletterName || '',
                    mediaType:             1,
                    thumbnail:             thumb,
                    renderLargerThumbnail: false,
                    sourceUrl:             global.rcanal || ''
                }
            }
        }, { quoted: m })
    } catch {
        await m.reply(txt)
    }
}

let handler = async (m, { conn, text }) => {
    const sender = m.sender
    if (!database.data.users) database.data.users = {}

    const user = database.data.users[sender] || {}

    // ── Ya registrado ─────────────────────────────────────────────────────────
    if (user.registered) return sendReply(conn, m,
        `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
        `╔═══════⩽ ✧ 🪷 ✧ ⩾═══════╗\n` +
        `    「 𝖸𝖠 𝖤𝖲𝖳𝖠𝖲 𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖠𝖣𝖮 」\n` +
        `╚═══════⩽ ✧ 🪷 ✧ ⩾═══════╝\n` +
        `┣ 🪷 nombre: *${user.name}*\n` +
        `┣ 🪷 edad: *${user.age} años*\n` +
        `┣ 🪷 ya formas parte de Hiruka ✅\n` +
        `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
    )

    // ── Sin argumentos — mostrar uso ──────────────────────────────────────────
    if (!text || !text.trim()) return sendReply(conn, m,
        `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
        `╔═══════⩽ ✧ 🪷 ✧ ⩾═══════╗\n` +
        `         「 𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖮 」\n` +
        `╚═══════⩽ ✧ 🪷 ✧ ⩾═══════╝\n` +
        `┣ 🪷 uso: *#reg nombre.edad*\n` +
        `┣ 🪷 ejemplo: *#reg Kameki.20*\n` +
        `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
    )

    // ── Parsear nombre y edad ─────────────────────────────────────────────────
    const input = text.trim()
    const sep   = input.includes('.') ? '.' : input.includes('-') ? '-' : null

    if (!sep) return sendReply(conn, m,
        `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
        `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
        `    「 𝖥𝖮𝖱𝖬𝖠𝖳𝖮 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 」\n` +
        `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
        `┣ 🪷 usa un punto para separar\n` +
        `┣ 🪷 ejemplo: *#reg Kameki.20*\n` +
        `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
    )

    const partes = input.split(sep)
    const nombre = partes[0]?.trim()
    const edad   = parseInt(partes[1])

    if (!nombre || nombre.length < 2) return sendReply(conn, m,
        `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
        `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
        `     「 𝖭𝖮𝖬𝖡𝖱𝖤 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖮 」\n` +
        `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
        `┣ 🪷 el nombre debe tener al menos 2 letras\n` +
        `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
    )

    if (isNaN(edad) || edad < 5 || edad > 100) return sendReply(conn, m,
        `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
        `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
        `      「 𝖤𝖣𝖠𝖣 𝖨𝖭𝖵𝖠𝖫𝖨𝖣𝖠 」\n` +
        `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
        `┣ 🪷 pon una edad válida entre 5 y 100\n` +
        `┣ 🪷 ejemplo: *#reg Kameki.20*\n` +
        `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
    )

    // ── Guardar registro ──────────────────────────────────────────────────────
    if (!database.data.users[sender]) database.data.users[sender] = {}

    Object.assign(database.data.users[sender], {
        registered:      true,
        name:            nombre,
        age:             edad,
        registered_time: Date.now(),
        exp:             database.data.users[sender].exp   ?? 0,
        level:           database.data.users[sender].level ?? 1,
        money:           database.data.users[sender].money ?? 0,
        bank:            database.data.users[sender].bank  ?? 0,
        limit:           database.data.users[sender].limit ?? 20,
        premium:         database.data.users[sender].premium ?? false,
        warning:         database.data.users[sender].warning ?? 0
    })

    return sendReply(conn, m,
        `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
        `╔═══════⩽ ✧ 🪷 ✧ ⩾═══════╗\n` +
        `  「 𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖮 𝖢𝖮𝖬𝖯𝖫𝖤𝖳𝖠𝖣𝖮 」\n` +
        `╚═══════⩽ ✧ 🪷 ✧ ⩾═══════╝\n` +
        `┣ 🪷 nombre: *${nombre}*\n` +
        `┣ 🪷 edad: *${edad} años*\n` +
        `┣ 🪷 bienvenid@ a Hiruka ✅\n` +
        `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝\n\n` +
        `🪷 𝖯𝗈𝗐𝖾𝗋 𝖻𝗒 ˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ 🪭`
    )
}

handler.command = ['reg', 'registro', 'register']
export default handler
