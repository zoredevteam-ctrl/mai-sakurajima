// plugins/owner.js

const getThumb = async () => {
    try {
        const res = await fetch(global.icono || global.banner || '')
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

const owners_info = [
    {
        num:  '573107400303',
        nombre: '˚₊· ͟͟͞͞  ɪ ᴀᴍ  Aᴅʀɪᴇɴ',
        org:  'Z0RT SYSTEMS',
        rol:  'Creador Principal',
        desc: 'él fue quien me dió vida y hizo todo mi proceso desde cero'
    },
    {
        num:  '51925092348',
        nombre: 'Jhon',
        org:  'Z0RT SYSTEMS',
        rol:  'Creador Dos',
        desc: 'cualquier error o sugerencia de nuevos comandos puedes contactarte con él'
    }
]

let handler = async (m, { conn }) => {
    const thumb = await getThumb()

    try {
        for (const owner of owners_info) {
            const vcard =
                `BEGIN:VCARD\n` +
                `VERSION:3.0\n` +
                `FN:${owner.nombre}\n` +
                `ORG:${owner.org};\n` +
                `TEL;type=CELL;type=VOICE;waid=${owner.num}:+${owner.num}\n` +
                `END:VCARD`

            await conn.sendMessage(m.chat, {
                contacts: {
                    displayName: owner.nombre,
                    contacts: [{ vcard }]
                }
            }, { quoted: m })

            await conn.sendMessage(m.chat, {
                text:
                    `⟪❄︎⟫ *${owner.rol}*\n` +
                    `✎ nombre: *${owner.nombre}*\n` +
                    `✎ sistema: *${owner.org}*\n` +
                    `✎ ${owner.desc}❄︎`,
                contextInfo: {
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid:   global.newsletterJid,
                        serverMessageId: -1,
                        newsletterName:  global.newsletterName
                    },
                    externalAdReply: {
                        title:                 owner.nombre,
                        body:                  owner.org,
                        mediaType:             1,
                        thumbnail:             thumb,
                        renderLargerThumbnail: false,
                        sourceUrl:             global.rcanal || ''
                    }
                }
            }, { quoted: m })
        }

    } catch (e) {
        console.error('[OWNER ERROR]', e.message)
        await m.reply(
            `⟪❄︎⟫ *creadores de Hiyuki*\n` +
            `✎ ${owners_info[0].nombre} — ${owners_info[0].rol}\n` +
            `✎ ${owners_info[1].nombre} — ${owners_info[1].rol}❄︎`
        )
    }
}

handler.command = ['owner', 'creador', 'dev']
export default handler
