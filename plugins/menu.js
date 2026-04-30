const getBannerBuffer = async (bannerSrc) => {
    if (!bannerSrc) return null
    try {
        if (bannerSrc.startsWith('data:image')) return Buffer.from(bannerSrc.split(',')[1], 'base64')
        const res = await fetch(bannerSrc)
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

let handler = async (m, { conn, usedPrefix }) => {
    const bannerSrc = global.banner || 'https://causas-files.vercel.app/fl/gl13.jpg'
    const canalLink = global.rcanal || ''
    const sender    = m.sender
    const username  = m.pushName || 'Usuario'

    // ── FECHA Y MOMENTO ───────────────────────────────────────────────────────
    const now       = new Date()
    const date      = new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', day: 'numeric', month: 'long', year: 'numeric' }).format(now)
    const hora      = new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', hour: 'numeric', hour12: false }).format(now)
    const h         = parseInt(hora)
    const momentDay = h < 12 ? 'mañana' : h < 18 ? 'tarde' : 'noche'

    // ── UPTIME ────────────────────────────────────────────────────────────────
    const sec    = Math.floor(process.uptime())
    const ud     = Math.floor(sec / 86400)
    const uh     = Math.floor((sec % 86400) / 3600)
    const um     = Math.floor((sec % 3600) / 60)
    const uptime = ud > 0 ? `${ud}d ${uh}h ${um}m` : `${uh}h ${um}m`

    // ── DATOS ─────────────────────────────────────────────────────────────────
    const dbData   = global.db?.data || {}
    const users    = dbData.users || {}
    const totalreg = Object.keys(users).length
    const userData = users[sender] || {}
    const coins    = (userData.money || 0).toLocaleString()
    const level    = userData.level || 1
    const exp      = (userData.exp  || 0).toLocaleString()
    const px       = usedPrefix || '#'

    // ── Owner check ───────────────────────────────────────────────────────────
    const senderNum = sender.split('@')[0].split(':')[0]
    const owners    = Array.isArray(global.owner) ? global.owner : [global.owner]
    const esOwner   = owners.some(o => {
        const v = Array.isArray(o) ? o[0] : o
        return String(v).replace(/\D/g, '') === senderNum
    })

    // ── MENÚ USUARIOS ─────────────────────────────────────────────────────────
    const menuUsuarios = `
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

╔═══════⩽ ✧ 🪷 ✧ ⩾═══════╗
  「 𝖢 𝖮 𝖬 𝖠 𝖭 𝖣 𝖮 𝖲  𝖦 𝖤 𝖭 𝖤 𝖱 𝖠 𝖫 𝖤 𝖲 」
╚═══════⩽ ✧ 🪷 ✧ ⩾═══════╝
⛩️───・──・──・﹕₊˚ ✦・🪭
┣ 🪷 *${px}ping* ┊ 𝖫𝖺𝗍𝖾𝗇𝖼𝗂𝖺
┣ 🪷 *${px}uptime* ┊ 𝖳𝗂𝖾𝗆𝗉𝗈 𝖺𝖼𝗍𝗂𝗏𝗈
┣ 🪷 *${px}menu* ┊ 𝖤𝗌𝗍𝖾 𝗆𝖾𝗇𝗎́
┣ 🪷 *${px}owner* ┊ 𝖢𝗈𝗇𝗍𝖺𝖼𝗍𝗈
┣ 🪷 *${px}reg* ┊ 𝖱𝖾𝗀𝗂𝗌𝗍𝗋𝖺𝗋𝗌𝖾
┣ 🪷 *${px}clima* ┊ 𝖢𝗅𝗂𝗆𝖺
┣ 🪷 *${px}sticker* ┊ 𝖢𝗋𝖾𝖺𝗋 𝗌𝗍𝗂𝖼𝗄𝖾𝗋
┣ 🪷 *${px}toimg* ┊ 𝖲𝗍𝗂𝖼𝗄𝖾𝗋 → 𝗂𝗆𝖺𝗀𝖾𝗇

╔═══════⩽ ✧ 🪷 ✧ ⩾═══════╗
    「 𝖢 𝖮 𝖬 𝖠 𝖭 𝖣 𝖮 𝖲  𝖦 𝖱 𝖴 𝖯 𝖮 」
╚═══════⩽ ✧ 🪷 ✧ ⩾═══════╝
⛩️───・──・──・﹕₊˚ ✦・🪭
┣ 🪷 *${px}kick* ┊ 𝖤𝗑𝗉𝗎𝗅𝗌𝖺𝗋
┣ 🪷 *${px}add* ┊ 𝖠𝗀𝗋𝖾𝗀𝖺𝗋
┣ 🪷 *${px}ban* ┊ 𝖡𝖺𝗇𝖾𝖺𝗋
┣ 🪷 *${px}tagall* ┊ 𝖬𝖾𝗇𝖼𝗂𝗈𝗇𝖺𝗋 𝗍𝗈𝖽𝗈𝗌
┣ 🪷 *${px}grupinfo* ┊ 𝖨𝗇𝖿𝗈 𝗀𝗋𝗎𝗉𝗈
┣ 🪷 *${px}antilink* ┊ 𝖠𝗇𝗍𝗂𝗅𝗂𝗇𝗄
┣ 🪷 *${px}warn* ┊ 𝖠𝖽𝗏𝖾𝗋𝗍𝗂𝗋
┣ 🪷 *${px}hidemensaje* ┊ 𝖡𝗈𝗋𝗋𝖺𝗋 𝗆𝖾𝗇𝗌𝖺𝗃𝖾
┣ 🪷 *${px}welcome on/off* ┊ 𝖡𝗂𝖾𝗇𝗏𝖾𝗇𝗂𝖽𝖺
┣ 🪷 *${px}goodbye on/off* ┊ 𝖣𝖾𝗌𝗉𝖾𝖽𝗂𝖽𝖺

╔═══════⩽ ✧ 🪷 ✧ ⩾═══════╗
   「 𝖢 𝖮 𝖬 𝖠 𝖭 𝖣 𝖮 𝖲  𝖯 𝖤 𝖱 𝖥 𝖨 𝖫 」
╚═══════⩽ ✧ 🪷 ✧ ⩾═══════╝
⛩️───・──・──・﹕₊˚ ✦・🪭
┣ 🪷 *${px}perfil* ┊ 𝖵𝖾𝗋 𝗉𝖾𝗋𝖿𝗂𝗅
┣ 🪷 *${px}userinfo* ┊ 𝖨𝗇𝖿𝗈 𝗎𝗌𝗎𝖺𝗋𝗂𝗈
┣ 🪷 *${px}setbio* ┊ 𝖢𝖺𝗆𝖻𝗂𝖺𝗋 𝖻𝗂𝗈
┣ 🪷 *${px}setbirthday* ┊ 𝖢𝗎𝗆𝗉𝗅𝖾𝖺𝗇̃𝗈𝗌

╔═══════⩽ ✧ 💰 ✧ ⩾═══════╗
    「 𝖢 𝖮 𝖬 𝖠 𝖭 𝖣 𝖮 𝖲  𝖤 𝖢 𝖮 𝖭 𝖮 𝖬 𝖨 𝖠 」
╚═══════⩽ ✧ 💰 ✧ ⩾═══════╝
⛩️───・──・──・﹕₊˚ ✦・💰
┣ 🪷 *${px}bal* ┊ 𝖡𝖺𝗅𝖺𝗇𝖼𝖾
┣ 🪷 *${px}chamba* ┊ 𝖳𝗋𝖺𝖻𝖺𝗃𝖺𝗋
┣ 🪷 *${px}daily* ┊ 𝖱𝖾𝖼𝗈𝗆𝗉𝖾𝗇𝗌𝖺 𝖽𝗂𝖺𝗋𝗂𝖺
┣ 🪷 *${px}dep* ┊ 𝖣𝖾𝗉𝗈𝗌𝗂𝗍𝖺𝗋
┣ 🪷 *${px}retirar* ┊ 𝖱𝖾𝗍𝗂𝗋𝖺𝗋
┣ 🪷 *${px}transferir* ┊ 𝖤𝗇𝗏𝗂𝖺𝗋
┣ 🪷 *${px}robar* ┊ 𝖱𝗈𝖻𝖺𝗋
┣ 🪷 *${px}top* ┊ 𝖱𝖺𝗇𝗄𝗂𝗇𝗀

╔═══════⩽ ✧ 💞 ✧ ⩾═══════╗
    「 𝖢 𝖮 𝖬 𝖠 𝖭 𝖣 𝖮 𝖲  𝖲 𝖮 𝖢 𝖨 𝖠 𝖫 」
╚═══════⩽ ✧ 💞 ✧ ⩾═══════╝
⛩️───・──・──・﹕₊˚ ✦・💞
┣ 🪷 *${px}casar* ┊ 𝖢𝖺𝗌𝖺𝗋𝗌𝖾
┣ 🪷 *${px}divorcio* ┊ 𝖣𝗂𝗏𝗈𝗋𝖼𝗂𝖺𝗋𝗌𝖾
┣ 🪷 *${px}adoptar* ┊ 𝖠𝖽𝗈𝗉𝗍𝖺𝗋

╔═══════⩽ ✧ 🎮 ✧ ⩾═══════╗
    「 𝖢 𝖮 𝖬 𝖠 𝖭 𝖣 𝖮 𝖲  𝖩 𝖴 𝖤 𝖦 𝖮 𝖲 」
╚═══════⩽ ✧ 🎮 ✧ ⩾═══════╝
⛩️───・──・──・﹕₊˚ ✦・🎮
┣ 🪷 *${px}8ball* ┊ 𝖡𝗈𝗅𝖺 𝗆𝖺́𝗀𝗂𝖼𝖺
┣ 🪷 *${px}dado* ┊ 𝖳𝗂𝗋𝖺𝗋 𝖽𝖺𝖽𝗈
┣ 🪷 *${px}ruleta* ┊ 𝖱𝗎𝗅𝖾𝗍𝖺
┣ 🪷 *${px}trivia* ┊ 𝖳𝗋𝗂𝗏𝗂𝖺
┣ 🪷 *${px}adivinanza* ┊ 𝖠𝖽𝗂𝗏𝗂𝗇𝖺𝗇𝗓𝖺

╔═══════⩽ ✧ 🎭 ✧ ⩾═══════╗
   「 𝖢 𝖮 𝖬 𝖠 𝖭 𝖣 𝖮 𝖲  𝖠 𝖭 𝖨 𝖬 𝖤 」
╚═══════⩽ ✧ 🎭 ✧ ⩾═══════╝
⛩️───・──・──・﹕₊˚ ✦・🎭
┣ 🪷 *${px}kiss* ┊ 𝖡𝖾𝗌𝖺𝗋
┣ 🪷 *${px}hug* ┊ 𝖠𝖻𝗋𝖺𝗓𝖺𝗋
┣ 🪷 *${px}pat* ┊ 𝖯𝖺𝗅𝗆𝖾𝖺𝗋
┣ 🪷 *${px}kill* ┊ 𝖬𝖺𝗍𝖺𝗋
┣ 🪷 *${px}bite* ┊ 𝖬𝗈𝗋𝖽𝖾𝗋
┣ 🪷 *${px}cry* ┊ 𝖫𝗅𝗈𝗋𝖺𝗋
┣ 🪷 *${px}happy* ┊ 𝖥𝖾𝗅𝗂𝗓
┣ 🪷 *${px}angry* ┊ 𝖤𝗇𝗈𝗃𝖺𝖽𝗈
┣ 🪷 *${px}cuddle* ┊ 𝖠𝖼𝗎𝗋𝗋𝗎𝖼𝖺𝗋𝗌𝖾
┣ 🪷 *${px}neko* ┊ 𝖭𝖾𝗄𝗈
┣ 🪷 *${px}cafe* ┊ 𝖢𝖺𝖿𝖾́
┣ 🪷 *${px}dormir* ┊ 𝖣𝗈𝗋𝗆𝗂𝗋
┣ 🪷 *${px}push* ┊ 𝖤𝗆𝗉𝗎𝗃𝖺𝗋
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

🪷 𝖯𝗈𝗐𝖾𝗋 𝖻𝗒 ˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ XLRS4 🪭`.trim()

    // ── MENÚ OWNER ────────────────────────────────────────────────────────────
    const menuOwner = menuUsuarios + `

╔═══════⩽ ✧ 👑 ✧ ⩾═══════╗
    「 𝖢 𝖮 𝖬 𝖠 𝖭 𝖣 𝖮 𝖲  𝖮 𝖶 𝖭 𝖤 𝖱 」
╚═══════⩽ ✧ 👑 ✧ ⩾═══════╝
⛩️───・──・──・﹕₊˚ ✦・👑
┣ 👑 *${px}addpremium* ┊ 𝖣𝖺𝗋 𝗉𝗋𝖾𝗆𝗂𝗎𝗆
┣ 👑 *${px}delpremium* ┊ 𝖰𝗎𝗂𝗍𝖺𝗋 𝗉𝗋𝖾𝗆𝗂𝗎𝗆
┣ 👑 *${px}listpremium* ┊ 𝖵𝖾𝗋 𝗉𝗋𝖾𝗆𝗂𝗎𝗆𝗌
┣ 👑 *${px}addowner* ┊ 𝖠𝗇̃𝖺𝖽𝗂𝗋 𝗈𝗐𝗇𝖾𝗋
┣ 👑 *${px}delowner* ┊ 𝖰𝗎𝗂𝗍𝖺𝗋 𝗈𝗐𝗇𝖾𝗋
┣ 👑 *${px}listowner* ┊ 𝖵𝖾𝗋 𝗈𝗐𝗇𝖾𝗋𝗌
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`

    const txt          = esOwner ? menuOwner : menuUsuarios
    const bannerBuffer = await getBannerBuffer(bannerSrc)

    try {
        await conn.sendMessage(m.chat, {
            document:    bannerBuffer || Buffer.from(''),
            mimetype:    'application/pdf',
            fileName:    `⌜ ❀ 𝐇𝐢𝐫𝐮𝐤𝐚 ❀ 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 𝐏𝐚𝐭𝐫𝐨𝐧 ⌟`,
            fileLength:  99999999999999,
            pageCount:   1,
            caption:     txt,
            contextInfo: {
                isForwarded:     true,
                forwardingScore: 99,
                externalAdReply: {
                    title:                 `⛩️ 𝖧𝖨𝖱𝖴𝖪𝖠 𝖲𝖸𝖲𝖳𝖤𝖬 ⛩️`,
                    body:                  `🪷 𝖣𝖾𝗏𝖾𝗅𝗈𝗉𝖾𝖽 𝖻𝗒 ˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ`,
                    mediaType:             1,
                    thumbnail:             bannerBuffer,
                    renderLargerThumbnail: true,
                    sourceUrl:             canalLink
                },
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid  || '120363408182996815@newsletter',
                    newsletterName:  global.newsletterName || '「✿𝐇𝐢𝐲𝐮𝐤𝐢 এ 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 𝐩𝐚𝐭𝐫𝐨𝐧✿」',
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
