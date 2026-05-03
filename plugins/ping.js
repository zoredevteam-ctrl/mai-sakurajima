import { performance } from 'perf_hooks'

let handler = async (m, { conn }) => {
    const start = performance.now()

    // Mensaje de intercepción rápido
    const { key } = await conn.sendMessage(m.chat, { 
        text: `> ❄︎ _Calculando latencia..._` 
    }, { quoted: m })

    const latencia = (performance.now() - start).toFixed(2)

    // Diseño minimalista: Solo la latencia
    const txt = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ Latencia: ${latencia} ms`

    await conn.sendMessage(m.chat, {
        text: txt,
        contextInfo: {
            isForwarded: true,
            forwardingScore: 99,
            forwardedNewsletterMessageInfo: {
                newsletterJid:   global.newsletterJid  || '120363408182996815@newsletter',
                newsletterName:  global.newsletterName || '❄︎ Hiyuki System ❄︎',
                serverMessageId: -1
            },
            externalAdReply: {
                title: '❄︎ HIYUKI PROTOCOL',
                body: `Ping: ${latencia} ms ─ Developed by Adrien`,
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
