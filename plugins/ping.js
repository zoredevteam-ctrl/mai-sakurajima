/**
 * PING — MAI SAKURAJIMA
 * Comandos: #ping, #p, #speed, #latencia
 * código desarrollado por mi 
 */

import { performance } from 'perf_hooks'

const rateLatency = ms => {
    const n = parseFloat(ms)
    if (n < 100) return '🧸 lo mejor'
    if (n < 300) return '🪶 Fea'
    if (n < 600) return '🧸 ni opino'
    return           '🪶 sin comentarios'
}

let handler = async (m, { conn }) => {
    // Calculamos el inicio
    const start = performance.now()
    
    // Mensaje de carga inicial con estilo elegante
    const { key } = await conn.sendMessage(m.chat, { 
        text: `> _Calculando latencia del sistema..._` 
    }, { quoted: m })

    // Calculamos el tiempo que tardó en enviar el mensaje
    const latencia = (performance.now() - start).toFixed(2)

    // Diseño elegante con tipografía sans-serif
    const txt = 
        `✿    𝖯𝖨𝖭𝖦 MAI  ✿\n\n` +
        `> 🧸 𝖫𝖺 𝗏𝖾𝗅𝗈𝖼𝗂𝖽𝖺𝖽 𝖽𝖾 𝗋𝖾𝗌𝗉𝗎𝖾𝗌𝗍𝖺 𝖽𝖾 𝖬𝖺𝗂 𝖾𝗌:\n\n` +
        `✦ 𝖫𝖺𝗍𝖾𝗇𝖼𝗂𝖺: ${latencia} 𝗆𝗌\n` +
        `✦ 𝖤𝗌𝗍𝖺𝖽𝗈: ${rateLatency(latencia)}\n\n` +
        `✿ ─────🧸🪶────── ✿`

    await conn.sendMessage(m.chat, {
        text: txt,
        contextInfo: {
            isForwarded: true,
            forwardingScore: 99,
            forwardedNewsletterMessageInfo: {
                newsletterJid:   global.newsletterJid  = '120363408182996815@newsletter',
                newsletterName:  global.newsletterName = '⌜ ❀ 𝐇𝐢𝐫𝐮𝐤𝐚 ❀ 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 𝐏𝐚𝐭𝐫𝐨𝐧 ⌟'
,
                serverMessageId: -1
            },
            externalAdReply: {
                title: '🧸🪶 𝖬𝖠𝖨 𝖲𝖠𝖪𝖴𝖱𝖠𝖩𝖨𝖬𝖠',
                body: `🧸 ${latencia} ms  ─  Developed by ˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ`,
                mediaType: 1,
                thumbnailUrl: global.icono, // Usamos la URL directamente para no afectar la velocidad del ping
                sourceUrl: global.rcanal || ''
            }
        }
    }, { edit: key }) // Editamos el mensaje de carga en lugar de enviar uno nuevo
}

handler.help = ['ping']
handler.tags = ['main']
handler.command = ['ping', 'p', 'speed', 'latencia']

export default handler
