// plugins/restart.js
import { exec } from 'child_process'

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
                    body:                  '✦ Sistema',
                    mediaType:             1,
                    thumbnail:             thumb,
                    renderLargerThumbnail: false,
                    sourceUrl:             global.rcanal || ''
                }
            }
        }, { quoted: m })
    } catch { await m.reply(txt) }
}

let handler = async (m, { conn, isOwner }) => {
    if (!isOwner) return sendReply(conn, m,
        `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
        `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
        `    「 𝖠𝖢𝖢𝖤𝖲𝖮 𝖱𝖤𝖲𝖳𝖱𝖨𝖭𝖦𝖨𝖣𝖮 」\n` +
        `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
        `┣ 🪷 solo el *owner* puede reiniciar\n` +
        `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
    )

    await m.react('🔄')

    await sendReply(conn, m,
        `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
        `╔═══════⩽ ✧ 🔄 ✧ ⩾═══════╗\n` +
        `         「 𝖱𝖤𝖲𝖳𝖠𝖱𝖳 」\n` +
        `╚═══════⩽ ✧ 🔄 ✧ ⩾═══════╝\n` +
        `┣ 🪷 reiniciando Hiruka...\n` +
        `┣ 🪷 vuelvo en unos segundos (⁠✿⁠◡⁠‿⁠◡⁠)\n` +
        `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
    )

    setTimeout(() => {
        exec('npm start', (err) => {
            if (err) console.error('[RESTART ERROR]', err.message)
        })
        process.exit(0)
    }, 2000)
}

handler.command = ['restart', 'reiniciar', 'reboot']
handler.owner   = true
export default handler
