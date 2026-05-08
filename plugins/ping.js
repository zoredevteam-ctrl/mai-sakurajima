import { performance } from 'perf_hooks'
import os from 'os'

let handler = async (m, { conn }) => {
    const start = performance.now()

    // ── ANIMACIÓN DE INTERCEPCIÓN (UX PREMIUM) ──────────────────────────────
    const { key } = await conn.sendMessage(m.chat, { 
        text: `> ❄︎ _Estableciendo conexión con XLR4-Security..._` 
    }, { quoted: m })

    // Pequeño delay para simular escaneo real
    await new Promise(resolve => setTimeout(resolve, 500))
    await conn.sendMessage(m.chat, { text: `> ❄︎ _Analizando latencia del servidor..._`, edit: key }, { quoted: m })

    const end = performance.now()
    const latencia = (end - start).toFixed(3)

    // ── MÉTRICAS DE HARDWARE (SENIOR STATS) ─────────────────────────────────
    const ramUsada = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
    const ramTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0)
    const cpuModelo = os.cpus()[0].model.split(' ')[0] // Ej: Intel o AMD
    
    // ── DISEÑO FINAL ────────────────────────────────────────────────────────
    const txt = `
╭───  ❄︎  *𝐇 𝐈 𝐘 𝐔 𝐊 𝐈  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌* ───╮
       ᴘʀᴏᴛᴏᴄᴏʟᴏ ᴅᴇ ʀᴇᴘᴏʀᴛᴇ ᴅɪɴᴀ́ᴍɪᴄᴏ

  ✦ *ʟᴀᴛᴇɴᴄɪᴀ:* ${latencia} ᴍs
  ✦ *ᴇsᴛᴀᴅᴏ:* ᴏᴘᴇʀᴀᴛɪᴠᴏ (ᴇsᴛᴀʙʟᴇ)
  ✦ *sᴇʀᴠɪᴅᴏʀ:* ${cpuModelo} ᴘʀᴏᴄᴇssᴏʀ
  ✦ *ᴍᴇᴍᴏʀɪᴀ:* ${ramUsada} ᴍʙ / ${ramTotal} ɢʙ

  *〔 𝐗𝐋𝐑𝟒-𝐒𝐞𝐜𝐮𝐫𝐢𝐭𝐲 𝐏𝐫𝐨𝐭𝐨𝐜𝐨𝐥 〕*
╰───────────────────────────╯`.trim()

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
                thumbnailUrl: global.icono, 
                sourceUrl: global.rcanal,
                renderLargerThumbnail: false // En el ping, miniatura pequeña es más elegante
            }
        }
    }, { edit: key }) 
}

handler.help = ['ping']
handler.tags = ['main']
handler.command = ['ping', 'p', 'speed', 'latencia']

export default handler
