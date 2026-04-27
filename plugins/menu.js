import { performance } from 'perf_hooks'

const getBannerBuffer = async (bannerSrc) => {
    if (!bannerSrc) return null
    try {
        if (bannerSrc.startsWith('data:image')) return Buffer.from(bannerSrc.split(',')[1], 'base64')
        const res = await fetch(bannerSrc)
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

let handler = async (m, { conn, usedPrefix, db }) => {
    const nombreBot = 'Hiruka System'
    const bannerSrc = global.banner || 'https://causas-files.vercel.app/fl/gl13.jpg'
    const canalLink = global.rcanal || ''

    const sender = m.sender
    const username = m.pushName || 'Usuario'

    // ── FECHA Y MOMENTO ──
    const now = new Date()
    const date = new Intl.DateTimeFormat('es-CO', {
        timeZone: 'America/Bogota',
        day: 'numeric', month: 'long', year: 'numeric'
    }).format(now)

    const hora = new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', hour: 'numeric', hour12: false }).format(now)
    const h = parseInt(hora)
    const momentDay = h < 12 ? 'mañana' : h < 18 ? 'tarde' : 'noche'

    // ── UPTIME ──
    const uptimeSec = Math.floor(process.uptime())
    const ud = Math.floor(uptimeSec / 86400)
    const uh = Math.floor((uptimeSec % 86400) / 3600)
    const um = Math.floor((uptimeSec % 3600) / 60)
    const uptime = ud > 0 ? `${ud}d ${uh}h ${um}m` : `${uh}h ${um}m`

    // ── DATOS ──
    const dbData = global.db?.data || {}
    const users = dbData.users || {}
    const totalreg = Object.keys(users).length
    const userData = users[sender] || {}
    
    // Rankings y Monedas
    const coins = (userData.money || 0).toLocaleString()
    const level = userData.level || 1
    const exp = (userData.exp || 0).toLocaleString()

    const px = usedPrefix || '#'

    // ── TEXTO ESTILO HIRUKA ──
    const txt = `
⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️

🪷 𝖲𝖺𝗅𝗎𝖽𝗈𝗌, ${username}. 
𝖤𝗌𝗉𝖾𝗋𝗈 𝗊𝗎𝖾 𝗍𝖾𝗇𝗀𝖺𝗌 𝗎𝗇𝖺 𝗅𝗂𝗇𝖽𝖺 ${momentDay}. (⁠✿⁠◡⁠‿⁠◡⁠)

╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗
       「 𝖨 𝖭 𝖥 𝖮  𝖲 𝖨 𝖲 𝖳 𝖤 𝖬 𝖠 」
╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝
║ 🪭 *𝖢𝖱𝖤𝖠𝖣𝖮𝖱*: ˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ
║ ⛩️ *𝖤𝖲𝖳𝖠𝖣𝖮*: 𝖢𝖾𝗅𝖾𝗌𝗍𝗂𝖺𝗅
║ ⚜️ *𝖥𝖤𝖢𝖧𝖠*: ${date}
║ ⏱️ *𝖴𝖯𝖳𝖨𝖬𝖤*: ${uptime}
║ 👥 *𝖴𝖲𝖴𝖠𝖱𝖨𝖮𝖲*: ${totalreg}
╚════════════════════════╝

╔═══════⩽ ✧ 🪷 ✧ ⩾═══════╗
     「 𝖨 𝖭 𝖥 𝖮  𝖴 𝖲 𝖴 𝖠 𝖱 𝖨 𝖮 」
╚═══════⩽ ✧ 🪷 ✧ ⩾═══════╝
║ 👤 *𝖭𝖮𝖬𝖡𝖱𝖤*: ${username}
║ 🚀 *𝖤𝖷𝖯*: ${exp}
║ 💲 *𝖢𝖮𝖨𝖭𝖲*: ${coins}
║ 📊 *𝖭𝖨𝖵𝖤𝖫*: ${level}
╚═══════════════════════╝

> ⚜️ 𝖴𝗌𝖺 *#Code* 𝗉𝖺𝗋𝖺 𝗌𝖾𝗋 𝖲𝗎𝖻-𝖡𝗈𝗍.

*𝖫 𝖨 𝖲 𝖳 𝖠  𝖣 𝖤  𝖢 𝖮 𝖬 𝖠 𝖭 𝖣 𝖮 𝖲*

⛩️───・──・──・﹕₊˚ ✦・🪭
┣ 🪷 *${px}ping* ┊ 𝖫𝖺𝗍𝖾𝗇𝖼𝗂𝖺
┣ 🪷 *${px}menu* ┊ 𝖤𝗌𝗍𝖾 𝗆𝖾𝗇𝗎́
┣ 🪷 *${px}owner* ┊ 𝖢𝗈𝗇𝗍𝖺𝖼𝗍𝗈
┣ 🪷 *${px}update* ┊ 𝖠𝖼𝗍𝗎𝖺𝗅𝗂𝗓𝖺𝗋
┣ 🪷 *${px}leave* ┊ 𝖲𝖺𝗅𝗂𝗋
┣ 🪷 *${px}kick* ┊ 𝖤𝗅𝗂𝗆𝗂𝗇𝖺𝗋
┣ 🪷 *${px}add* ┊ 𝖠𝗀𝗋𝖾𝗀𝖺𝗋
┣ 🪷 *${px}chamba* ┊ 𝖳𝗋𝖺𝖻𝖺𝗃𝖺𝗋
┣ 🪷 *${px}bal* ┊ 𝖡𝖺𝗅𝖺𝗇𝖼𝖾
┣ 🪷 *${px}ia* ┊ 𝖢𝗁𝖺𝗍 𝖨𝖠
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

🪷 𝖯𝗈𝗐𝖾𝗋 𝖻𝗒 𝖠𝖺𝗋𝗈𝗆 𝖲𝗒𝗌𝗍𝖾𝗆𝗌 🪭
`.trim()

    const bannerBuffer = await getBannerBuffer(bannerSrc)

    try {
        await conn.sendMessage(m.chat, {
            document: bannerBuffer || Buffer.from(''),
            mimetype: 'application/pdf',
            fileName: `⌜ ❀ 𝐇𝐢𝐫𝐮𝐤𝐚 ❀ 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 𝐏𝐚𝐭𝐫𝐨𝐧 ⌟`,
            fileLength: 99999999999999,
            pageCount: 1,
            caption: txt,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 99,
                externalAdReply: {
                    title: `⛩️ 𝖧𝖨𝖱𝖴𝖪𝖠 𝖲𝖸𝖲𝖳𝖤𝖬 ⛩️`,
                    body: `🪷 𝖣𝖾𝗏𝖾𝗅𝗈𝗉𝖾𝖽 𝖻𝗒 ˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ`,
                    mediaType: 1,
                    thumbnail: bannerBuffer,
                    renderLargerThumbnail: true,
                    sourceUrl: canalLink
                },
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.newsletterJid || '120363408182996815@newsletter',
                    newsletterName: global.newsletterName || '⌜ ❀ 𝐇𝐢𝐫𝐮𝐤𝐚 ❀ 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 𝐏𝐚𝐭𝐫𝐨𝐧 ⌟',
                    serverMessageId: -1
                }
            }
        }, { quoted: m })
    } catch (e) {
        console.error(e)
        await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
    }
}

handler.command = ['menu', 'help', 'comandos']
export default handler
