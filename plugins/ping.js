import { performance } from 'perf_hooks'
import os from 'os'
import fetch from 'node-fetch' // Asegúrate de tener node-fetch o usa el fetch nativo de Node 18+

let handler = async (m, { conn }) => {
    const start = performance.now()

    // ── PROTOCOLO DE IMAGEN (FIJANDO EL ICONO) ──────────────────────────────
    let logoBuffer = null
    try {
        const response = await fetch(global.icono)
        if (response.ok) logoBuffer = await response.buffer()
    } catch {
        // Si falla, se queda en null y el bot usará un placeholder automático
    }

    // ── ANIMACIÓN DE INTERCEPCIÓN ──────────────────────────────────────────
    const { key } = await conn.sendMessage(m.chat, { 
        text: `> ❄︎ _Estableciendo conexión con XLR4-Security..._` 
    }, { quoted: m })

    await new Promise(resolve => setTimeout(resolve, 500))
    const latencia = (performance.now() - start).toFixed(3)

    // ── MÉTRICAS DE HARDWARE ────────────────────────────────────────────────
    const ramUsada = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
    const cpuModelo = os.cpus()[0].model.split(' ')[0]
    
    const txt = `
╭───  ❄︎  *𝐇 𝐈 𝐘 𝐔 𝐊 𝐈  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌* ───╮
       ᴘʀᴏᴛᴏᴄᴏʟᴏ ᴅᴇ ʀᴇᴘᴏʀᴛᴇ ᴅɪɴᴀ́ᴍɪᴄᴏ

  ✦ *ʟᴀᴛᴇɴᴄɪᴀ:* ${latencia} ᴍs
  ✦ *ᴇsᴛᴀᴅᴏ:* ᴏᴘᴇʀᴀᴛɪᴠᴏ (ᴇsᴛᴀʙʟᴇ)
  ✦ *sᴇʀᴠɪᴅᴏʀ:* ${cpuModelo} ᴘʀᴏᴄᴇssᴏʀ
  ✦ *ᴍᴇᴍᴏʀɪᴀ:* ${ramUsada} ᴍʙ / ${(os.totalmem() / 1024 / 1024 / 1024).toFixed(0)} ɢʙ

  *〔 𝐗𝐋𝐑𝟒-𝐒𝐞𝐜𝐮𝐫𝐢𝐭𝐲 𝐏𝐫𝐨𝐭𝐨𝐜𝐨𝐥 〕*
╰───────────────────────────╯`.trim()

    // ── ENVÍO FINAL CON ICONO CORREGIDO ─────────────────────────────────────
    await conn.sendMessage(m.chat, {
        text: txt,
        contextInfo: {
            isForwarded: true,
            forwardingScore: 99,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.newsletterJid || '120363408182996815@newsletter',
                newsletterName: '❄︎ 𝐇𝐢𝐲𝐮𝐤𝐢 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 ❄︎',
                serverMessageId: -1
            },
            externalAdReply: {
                title: `❄︎ ᴘɪɴɢ: ${latencia} ᴍs`,
                body: `ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴢ𝟶ʀᴛ sʏsᴛᴇᴍs`,
                mediaType: 1,
                // AQUÍ ESTÁ EL TRUCO: Usar 'thumbnail' con el Buffer en lugar de la URL
                thumbnail: logoBuffer, 
                sourceUrl: global.rcanal,
                renderLargerThumbnail: false 
            }
        }
    }, { edit: key }) 
}

handler.help = ['ping']
handler.tags = ['main']
handler.command = ['ping', 'p', 'speed', 'latencia']

export default handler
