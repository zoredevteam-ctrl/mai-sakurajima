// plugins/update.js
import { exec } from 'child_process'

const getThumb = async () => {
    try {
        const res = await fetch(global.icono || '')
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

const ctx = async () => {
    const thumb = await getThumb()
    return {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid:   global.newsletterJid,
            serverMessageId: -1,
            newsletterName:  global.newsletterName
        },
        externalAdReply: {
            title:                 `✦ ${global.botName || 'Hiyuki'} — Update`,
            body:                  global.newsletterName || '',
            mediaType:             1,
            sourceUrl:             global.rcanal || '',
            thumbnail:             thumb,
            showAdAttribution:     false,
            renderLargerThumbnail: false
        }
    }
}

// Edita el mismo mensaje en vez de mandar uno nuevo
const editMsg = async (conn, sent, txt) => {
    try {
        await conn.sendMessage(sent.key.remoteJid, {
            text: txt,
            edit: sent.key
        })
    } catch {
        // Si no soporta edición, fallback silencioso
    }
}

let handler = async (m, { conn, isOwner }) => {
    if (!isOwner) return m.reply(`⟪❄︎⟫ solo el owner puede usar esto❄︎`)

    const context = await ctx()

    // Mensaje inicial
    const sent = await conn.sendMessage(m.chat, {
        text: `⟪❄︎⟫ sincronizando con el repositorio...❄︎`,
        contextInfo: context
    }, { quoted: m })

    exec('git pull', async (err, stdout) => {
        if (err) {
            return editMsg(conn, sent,
                `⟪❄︎⟫ *error de sistema*\n✎ ${err.message.slice(0, 250)}❄︎`
            )
        }

        if (stdout.includes('Already up to date')) {
            return editMsg(conn, sent,
                `⟪❄︎⟫ *sistema al día*\n✎ ya tienes la última versión❄︎`
            )
        }

        if (stdout.includes('Updating') || stdout.includes('Fast-forward')) {
            await editMsg(conn, sent,
                `⟪❄︎⟫ *actualización encontrada*\n✎ recargando módulos...❄︎`
            )

            try {
                const { readdirSync } = await import('fs')
                const { resolve, join } = await import('path')
                const { pathToFileURL } = await import('url')

                const pluginsDir = resolve('./plugins')
                const files      = readdirSync(pluginsDir).filter(f => f.endsWith('.js'))
                let count        = 0

                for (const file of files) {
                    const url = pathToFileURL(join(pluginsDir, file)).href + `?t=${Date.now()}`
                    const mod = await import(url)
                    if (mod.default) {
                        global.plugins?.set(file, mod.default)
                        count++
                    }
                }

                return editMsg(conn, sent,
                    `⟪❄︎⟫ *actualización completada*\n✎ ${count} módulos recargados correctamente❄︎`
                )
            } catch {
                await editMsg(conn, sent,
                    `⟪❄︎⟫ *reiniciando sistema*\n✎ espera un momento...❄︎`
                )
                setTimeout(() => process.exit(0), 2000)
            }
        }
    })
}

handler.command = ['update', 'actualizar', 'gitpull']
handler.owner   = true
export default handler
