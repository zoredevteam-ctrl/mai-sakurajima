import { exec } from 'child_process'
import chalk from 'chalk'

const getThumbnail = async () => {
    try {
        const res = await fetch(global.icono  = 'https://causas-files.vercel.app/fl/mmal.jpg')
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

const sendUpdate = async (conn, m, text) => {
    const thumbnail = await getThumbnail()
    return conn.sendMessage(m.chat, {
        text,
        contextInfo: {
            isForwarded: true,
            forwardingScore: 99,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '120363408182996815@newsletter',
                newsletterName: '⌜ ❀ 𝐇𝐢𝐫𝐮𝐤𝐚 ❀ 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 𝐏𝐚𝐭𝐫𝐨𝐧 ⌟',
                serverMessageId: -1
            },
            externalAdReply: {
                title: '⛩️ 𝖧𝖨推𝖴𝖪𝖠 𝖴𝖯𝖣𝖠𝖳𝖤',
                body: '🪭 𝖦𝖾𝗌𝗍𝗂ó𝗇 𝖽𝖾𝗅 𝖥𝗅𝗎𝗃𝗈 𝖢𝖾𝗅𝖾𝗌𝗍𝗂𝖺𝗅',
                mediaType: 1,
                sourceUrl: global.rcanal || '',
                thumbnail,
                showAdAttribution: false
            }
        }
    }, { quoted: m })
}

let handler = async (m, { conn, isOwner }) => {
    if (!isOwner) return m.reply('⛩️ _𝖠𝖼𝖼𝖾𝗌𝗈 𝖽𝖾𝗇𝖾𝗀𝖺𝖽𝗈. 𝖲𝗈𝗅𝗈 𝗆𝗂 𝖼𝗋𝖾𝖺𝖽𝗈𝗋 𝗉𝗎𝖾𝖽𝖾 𝖺𝗅𝗍𝖾𝗋𝖺𝗋 𝗆𝗂 𝗌𝗂𝗌𝗍𝖾𝗆𝖺._')

    await sendUpdate(conn, m, '🪷 _𝖲𝗂𝗇𝖼𝗋𝗈𝗇𝗂𝗓𝖺𝗇𝖽𝗈 𝖼𝗈𝗇 𝖾𝗅 𝗋𝖾𝗉𝗈𝗌𝗂𝗍𝗈𝗋𝗂𝗈... 𝖾𝗌𝗉𝖾𝗋𝖾 𝗎𝗇 𝗆𝗈𝗆𝖾𝗇𝗍𝗈._')

    exec('git pull', async (err, stdout) => {
        if (err) {
            return sendUpdate(conn, m, `⚜️ *𝖤𝖱𝖱𝖮𝖱 𝖣𝖤 𝖲𝖨𝖲𝖳𝖤𝖬𝖠*\n\n\`\`\`${err.message.slice(0, 250)}\`\`\``)
        }

        if (stdout.includes('Already up to date')) {
            return sendUpdate(conn, m, '🪭 *𝖲𝖨𝖲𝖳𝖤𝖬𝖠 𝖠𝖫 𝖣Í𝖠*\n\n_𝖸𝖺 𝗉𝗈𝗌𝖾𝗈 𝗅𝖺𝗌 ú𝗅𝗍𝗂𝗆𝖺𝗌 𝗆𝖾𝗃𝗈𝗋𝖺𝗌 𝖼𝖾𝗅𝖾𝗌𝗍𝗂𝖺𝗅𝖾𝗌._')
        }

        if (stdout.includes('Updating') || stdout.includes('Fast-forward')) {
            await sendUpdate(conn, m, `✅ *𝖠𝖢𝖳𝖴𝖠𝖫𝖨𝖹𝖠𝖢𝖨Ó𝖭 𝖥𝖨𝖭𝖠𝖫𝖨𝖹𝖠𝖣𝖠*\n\n🪷 _𝖱𝖾𝖼𝖺𝗋𝗀𝖺𝗇𝖽𝗈 𝗆ó𝖽𝗎𝗅𝗈𝗌..._`)

            try {
                const { readdirSync } = await import('fs')
                const { resolve, join } = await import('path')
                const { pathToFileURL } = await import('url')

                const pluginsDir = resolve('./plugins')
                const files = readdirSync(pluginsDir).filter(f => f.endsWith('.js'))
                let count = 0

                for (const file of files) {
                    const url = pathToFileURL(join(pluginsDir, file)).href + `?t=${Date.now()}`
                    const mod = await import(url)
                    if (mod.default) {
                        global.plugins?.set(file, mod.default)
                        count++
                    }
                }

                return sendUpdate(conn, m, `⛩️ *𝖯𝖱𝖮𝖢𝖤𝖲𝖮 𝖢𝖮𝖬𝖯𝖫𝖤𝖳𝖠𝖣𝖮*\n\n_𝖲𝖾 𝗁𝖺𝗇 𝗋𝖾𝗇𝗈𝗏𝖺𝖽𝗈 **${count}** 𝖿𝗎𝗇𝖼𝗂𝗈𝗇𝖾𝗌 𝖼𝗈𝗇 é𝗑𝗂𝗍𝗈._`)
            } catch (e) {
                setTimeout(() => process.exit(0), 2000)
            }
        }
    })
}

handler.command = ['update', 'actualizar', 'gitpull']
handler.owner = true
export default handler
