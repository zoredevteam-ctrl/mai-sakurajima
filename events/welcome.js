// events/welcome.js

export const event = 'group-participants.update'

const getThumb = async () => {
    try {
        const res = await fetch(global.icono || global.banner || '')
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

const getProfilePic = async (conn, jid) => {
    try {
        const url = await conn.profilePictureUrl(jid, 'image')
        const res = await fetch(url)
        return Buffer.from(await res.arrayBuffer())
    } catch {
        return await getThumb()
    }
}

export const run = async (conn, update) => {
    try {
        const { id, participants, action } = update
        if (!id?.endsWith('@g.us')) return

        const { database } = await import('../lib/database.js')
        const group = database.data?.groups?.[id]

        // ── Verificar si aplica la acción ─────────────────────────────────────
        if (action === 'add'    && !group?.welcome) return
        if (action === 'remove' && !group?.goodbye) return

        let groupName    = id
        let groupDesc    = ''
        let totalMembers = 0
        try {
            const meta   = await conn.groupMetadata(id)
            groupName    = meta.subject || id
            groupDesc    = meta.desc    || ''
            totalMembers = meta.participants?.length || 0
        } catch {}

        const thumb = await getThumb()

        for (const jid of participants) {
            const num   = jid.split('@')[0]
            const ppBuf = await getProfilePic(conn, jid)

            // ── BIENVENIDA ────────────────────────────────────────────────────
            if (action === 'add') {
                const txt =
                    `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
                    `╔═══════⩽ ✧ 🪷 ✧ ⩾═══════╗\n` +
                    `   「 𝖡 𝖨 𝖤 𝖭 𝖵 𝖤 𝖭 𝖨 𝖣 𝖠 」\n` +
                    `╚═══════⩽ ✧ 🪷 ✧ ⩾═══════╝\n` +
                    `┣ 🪷 hola, @${num}! (⁠ ⁠´⁠◡⁠‿⁠◡⁠\`⁠)\n` +
                    `┣ 🪷 bienvenid@ a *${groupName}*\n` +
                    `┣ 🪷 miembros: *${totalMembers}*\n` +
                    (groupDesc ? `┣ 🪷 ${groupDesc.slice(0, 80)}\n` : '') +
                    `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝\n\n` +
                    `🪷 𝖯𝗈𝗐𝖾𝗋 𝖻𝗒 ˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ 🪭`

                await conn.sendMessage(id, {
                    image: ppBuf,
                    caption: txt,
                    mentions: [jid],
                    contextInfo: {
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid:   global.newsletterJid,
                            serverMessageId: -1,
                            newsletterName:  global.newsletterName
                        },
                        externalAdReply: {
                            title:                 `🪷 Bienvenid@ al grupo`,
                            body:                  global.newsletterName || 'Hiruka Celestial MD',
                            mediaType:             1,
                            thumbnail:             thumb,
                            renderLargerThumbnail: false,
                            sourceUrl:             global.rcanal || ''
                        }
                    }
                })

            // ── DESPEDIDA ─────────────────────────────────────────────────────
            } else if (action === 'remove') {
                const txt =
                    `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
                    `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
                    `  「 𝖧 𝖠 𝖲 𝖳 𝖠  𝖫 𝖴 𝖤 𝖦 𝖮 」\n` +
                    `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
                    `┣ 🪷 @${num} ha salido del grupo\n` +
                    `┣ 🪷 miembros restantes: *${totalMembers - 1}*\n` +
                    `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝\n\n` +
                    `🪷 𝖯𝗈𝗐𝖾𝗋 𝖻𝗒 ˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ 🪭`

                await conn.sendMessage(id, {
                    image: ppBuf,
                    caption: txt,
                    mentions: [jid],
                    contextInfo: {
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid:   global.newsletterJid,
                            serverMessageId: -1,
                            newsletterName:  global.newsletterName
                        },
                        externalAdReply: {
                            title:                 `🪭 Hasta luego`,
                            body:                  global.newsletterName || 'Hiruka Celestial MD',
                            mediaType:             1,
                            thumbnail:             thumb,
                            renderLargerThumbnail: false,
                            sourceUrl:             global.rcanal || ''
                        }
                    }
                })
            }
        }
    } catch (e) {
        console.error('[WELCOME EVENT ERROR]', e.message)
    }
}
