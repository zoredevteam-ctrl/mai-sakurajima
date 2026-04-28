const getThumb = async () => {
    try {
        const res = await fetch(global.icono || global.banner || '')
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

let handler = async (m, { conn }) => {
    const thumb = await getThumb()

    const owners = Array.isArray(global.owner) ? global.owner : [global.owner]

    // Filtrar solo números reales (no LID)
    const ownerNums = owners
        .map(o => Array.isArray(o) ? o[0] : o)
        .filter(n => String(n).length <= 15)
        .map(n => String(n).replace(/\D/g, ''))

    const txt =
        `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
        `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
        `          「 𝖮 𝖶 𝖭 𝖤 𝖱 」\n` +
        `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
        `┣ 🪷 nombre: *˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ*\n` +
        `┣ 🪷 dev de: *Hiruka Celestial MD*\n` +
        `┣ 🪷 sistema: *Z0RT SYSTEMS*\n` +
        `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝\n\n` +
        `🪷 𝖯𝗈𝗐𝖾𝗋 𝖻𝗒 ˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ 🪭`

    try {
        // Enviar vCards de cada owner
        for (const num of ownerNums) {
            const vcard =
                `BEGIN:VCARD\n` +
                `VERSION:3.0\n` +
                `FN:˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ\n` +
                `ORG:Z0RT SYSTEMS;\n` +
                `TEL;type=CELL;type=VOICE;waid=${num}:+${num}\n` +
                `END:VCARD`

            await conn.sendMessage(m.chat, {
                contacts: {
                    displayName: '˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ',
                    contacts: [{ vcard }]
                }
            }, { quoted: m })
        }

        // Enviar texto con newsletter context
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
                    title:                 `˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ`,
                    body:                  'Z0RT SYSTEMS',
                    mediaType:             1,
                    thumbnail:             thumb,
                    renderLargerThumbnail: false,
                    sourceUrl:             global.rcanal || ''
                }
            }
        }, { quoted: m })

    } catch (e) {
        console.error('[OWNER ERROR]', e.message)
        await m.reply(txt)
    }
}

handler.command = ['owner', 'creador', 'dev']
export default handler
