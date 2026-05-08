import { performance } from 'perf_hooks'
import os from 'os'

const handler = async (m, { conn, usedPrefix: px }) => {
    // ── CONFIGURACIÓN DE MARCA ──────────────────────────────────────────────
    const botName = '𝐇𝐈𝐘𝐔𝐊𝐈 𝐂𝐄𝐋𝐄𝐒𝐓𝐈𝐀𝐋'
    const brand = '𝐙𝟎𝐑𝐓 𝐒𝐲𝐬𝐭𝐞𝐦𝐬'
    const security = '𝐗𝐋𝐑𝟒-𝐒𝐞𝐜𝐮𝐫𝐢𝐭𝐲 𝐏𝐫𝐨𝐭𝐨𝐜𝐨𝐥'
    const banner = 'https://causas-files.vercel.app/fl/jwlr.jpg'
    const canal = global.rcanal || 'https://whatsapp.com'

    // ── MÉTRICAS DE RENDIMIENTO ─────────────────────────────────────────────
    const startTime = performance.now()
    const speed = (performance.now() - startTime).toFixed(4)
    const usedRam = (process.memoryUsage().rss / 1024 / 1024).toFixed(1)
    const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0)
    
    const uptime = ((s) => {
        const d = Math.floor(s / 86400); const h = Math.floor((s % 86400) / 3600); const m = Math.floor((s % 3600) / 60)
        return `${d}d ${h}h ${m}m`
    })(process.uptime())

    // ── DATA DEL USUARIO ────────────────────────────────────────────────────
    const user = global.db.data.users[m.sender] || {}
    const { level = 1, exp = 0, money = 0 } = user
    const isOwner = [conn.user.jid, ...global.owner.map(o => o[0] + '@s.whatsapp.net')].includes(m.sender)

    // ── ESTRUCTURA DEL MENÚ ─────────────────────────────────────────────────
    let menu = `
╭───  ❄︎  *${botName}* ───╮
       ᴀᴜᴛᴏᴍᴀᴛɪᴢᴀᴄɪᴏ́ɴ & ᴇsᴛɪʟᴏ

  *〔 ɪɴғᴏʀᴍᴀᴄɪᴏ́ɴ ᴅᴇʟ sɪsᴛᴇᴍᴀ 〕*
  ✦ *Uptime:* ${uptime}
  ✦ *Ping:* ${speed} ᴍs
  ✦ *RAM:* ${usedRam}ᴍʙ / ${totalRam}ɢʙ
  ✦ *Users:* ${Object.keys(global.db.data.users).length}

  *〔 ᴇsᴛᴀᴅᴏ ᴅᴇ ᴄᴜᴇɴᴛᴀ 〕*
  ✦ *Nivel:* ${level}
  ✦ *Coins:* ${money.toLocaleString()}
  ✦ *Exp:* ${exp.toLocaleString()}

  *〔 ᴄᴏᴍᴀɴᴅᴏs ɢᴇɴᴇʀᴀʟᴇs 〕*
  • \`${px}ping\` • \`${px}uptime\` • \`${px}menu\`
  • \`${px}owner\` • \`${px}reg\` • \`${px}clima\`
  • \`${px}sticker\` • \`${px}toimg\`

  *〔 ɢᴇsᴛɪᴏ́ɴ ᴅᴇ ɢʀᴜᴘᴏ 〕*
  • \`${px}kick\` • \`${px}add\` • \`${px}ban\`
  • \`${px}tagall\` • \`${px}grupinfo\` • \`${px}antilink\`
  • \`${px}warn\` • \`${px}hidemensaje\`
  • \`${px}welcome\` • \`${px}goodbye\`

  *〔 ᴘᴇʀғɪʟ & sᴏᴄɪᴀʟ 〕*
  • \`${px}perfil\` • \`${px}userinfo\` • \`${px}setbio\`
  • \`${px}setbirthday\` • \`${px}casar\`
  • \`${px}divorcio\` • \`${px}adoptar\`

  *〔 ᴇᴄᴏɴᴏᴍɪ́ᴀ & ᴊᴜᴇɢᴏs 〕*
  • \`${px}bal\` • \`${px}chamba\` • \`${px}daily\`
  • \`${px}dep\` • \`${px}retirar\` • \`${px}transferir\`
  • \`${px}robar\` • \`${px}top\` • \`${px}8ball\`
  • \`${px}dado\` • \`${px}ruleta\` • \`${px}trivia\`
  • \`${px}adivinanza\`

  *〔 ʀᴇᴀᴄᴄɪᴏɴᴇs 〕*
  • \`${px}kiss\` • \`${px}hug\` • \`${px}pat\` • \`${px}kill\`
  • \`${px}bite\` • \`${px}cry\` • \`${px}happy\` • \`${px}angry\`
  • \`${px}cuddle\` • \`${px}neko\` • \`${px}cafe\` 
  • \`${px}dormir\` • \`${px}push\`
`

    if (isOwner) {
        menu += `
  *〔 ᴘᴀɴᴇʟ ᴅᴇ ᴄᴏɴᴛʀᴏʟ 〕*
  • \`${px}addpremium\` • \`${px}delpremium\`
  • \`${px}listpremium\` • \`${px}addowner\`
  • \`${px}delowner\` • \`${px}listowner\`
`
    }

    menu += `
  *${security}*
  ${brand} © 2026
╰──────────────────────────╯`.trim()

    // ── ENVÍO PREMIUM (DOCUMENTO PDF) ───────────────────────────────────────
    await conn.sendMessage(m.chat, {
        document: { url: banner },
        mimetype: 'application/pdf',
        fileName: `❄︎ 𝐇𝐢𝐲𝐮𝐤𝐢 𝐒𝐲𝐬𝐭𝐞𝐦 ❄︎`,
        fileLength: 999999999999,
        pageCount: 1,
        caption: menu,
        contextInfo: {
            externalAdReply: {
                title: `❄︎ ${botName} ᴠ𝟸 ❄︎`,
                body: `ᴅᴇᴠᴇʟᴏᴘᴇᴅ ʙʏ ᴢ𝟶ʀᴛ sʏsᴛᴇᴍs`,
                mediaType: 1,
                thumbnailUrl: banner,
                sourceUrl: canal,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })
}

handler.command = ['menu', 'help', 'comandos']
export default handler
