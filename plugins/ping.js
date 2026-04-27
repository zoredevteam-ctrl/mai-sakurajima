import { performance } from 'perf_hooks'

const rateLatency = ms => {
    const n = parseFloat(ms)
    if (n < 100) return '🪷 𝖣𝗂𝗏𝗂𝗇𝗈'
    if (n < 300) return '🪭 𝖤𝗌𝗍𝖺𝖻𝗅𝖾'
    if (n < 600) return '⛩️ 𝖬𝖾𝖽𝗂𝗈'
    return           '⚜️ 𝖨𝗇𝖾𝗌𝗍𝖺𝖻𝗅𝖾'
}

let handler = async (m, { conn }) => {
    const start = performance.now()

    // Mensaje de carga inicial minimalista
    const { key } = await conn.sendMessage(m.chat, { 
        text: `> 🪷 _𝖬𝗂𝖽𝗂𝖾𝗇𝖽𝗈 𝖿𝗅𝗎𝗃𝗈 𝖼𝖾𝗅𝖾𝗌𝗍𝗂𝖺𝗅..._` 
    }, { quoted: m })

    const latencia = (performance.now() - start).toFixed(2)

    // Diseño con tipografía elegante y poco texto
    const txt = 
        `🪭  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  ──  🪭\n\n` +
        `✦ 𝖫𝖺𝗍𝖾𝗇𝖼𝗂𝖺: ${latencia} 𝗆𝗌\n` +
        `✦ 𝖤𝗌𝗍𝖺𝖽𝗈: ${rateLatency(latencia)}\n\n` +
        `⛩️ ──────────── ⛩️`

    await conn.sendMessage(m.chat, {
        text: txt,
        contextInfo: {
            isForwarded: true,
            forwardingScore: 99,
            forwardedNewsletterMessageInfo: {
                newsletterJid:   global.newsletterJid  || '120363408182996815@newsletter',
                newsletterName:  global.newsletterName || '⌜ ❀ 𝐇𝐢𝐫𝐮𝐤𝐚 ❀ 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 𝐏𝐚𝐭𝐫𝐨𝐧 ⌟',
                serverMessageId: -1
            },
            externalAdReply: {
                title: '⛩️ 𝖧𝖨𝖱𝖴𝖪𝖳𝖠 𝖲𝖸𝖲𝖳𝖤𝖬',
                body: `⚜️ ${latencia} ms ─ 𝖣𝖾𝗏𝖾𝗅𝗈𝗉𝖾𝖽 𝖻𝗒 𝖠𝖺𝗋𝗈𝗆`,
                mediaType: 1,
                thumbnailUrl: global.icono, 
                sourceUrl: global.rcanal || ''
            }
        }
    }, { edit: key }) 
}

handler.help = ['ping']
handler.tags = ['main']
handler.command = ['ping', 'p', 'speed', 'latencia']

export default handler
