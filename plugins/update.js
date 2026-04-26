import { exec } from 'child_process'
import chalk from 'chalk'

const getThumbnail = async () => {
    try {
        const res = await fetch(global.banner || 'https://causas-files.vercel.app/fl/fu5r.jpg')
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

const sendUpdate = async (conn, m, text) => {
    const thumbnail = await getThumbnail()
    return conn.sendMessage(m.chat, {
        text,
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.newsletterJid || '120363408182996815@newsletter',
                serverMessageId: '',
                newsletterName: global.newsletterName || 'Itsuki Nakano'
            },
            externalAdReply: {
                title: '⭐ ITSUKI UPDATE SYSTEM',
                body: 'Gestión de Repositorio y Datos',
                mediaType: 1,
                mediaUrl: global.rcanal || '',
                sourceUrl: global.rcanal || '',
                thumbnail,
                showAdAttribution: false,
                containsAutoReply: true,
                renderLargerThumbnail: false
            }
        }
    }, { quoted: m })
}

let handler = async (m, { conn, isOwner }) => {
    if (!isOwner) return m.reply('❌ **Acceso Denegado.**\n\nLo lamento, pero este protocolo es privado. Solo Aarom o Félix tienen la autorización necesaria para realizar cambios en mis archivos. 📚')

    await sendUpdate(conn, m, '⭐ *Iniciando revisión de datos...*\n\nPor favor, espera un momento mientras verifico si hay actualizaciones en el repositorio. 🍱')

    exec('git pull', async (err, stdout, stderr) => {
        if (err) {
            console.error(chalk.red('[ERROR UPDATE]:'), err)
            return sendUpdate(conn, m,
                `⚠ *HA OCURRIDO UN ERROR* ⭐\n\n` +
                `No he podido completar la descarga de datos. Aquí está el informe del error:\n` +
                `\`\`\`${err.message.slice(0, 300)}\`\`\``
            )
        }

        // Ya está actualizado
        if (stdout.includes('Already up to date')) {
            return sendUpdate(conn, m,
                `✅ *REVISIÓN FINALIZADA* ⭐\n\n` +
                `Todo está en orden. Ya cuento con la versión más reciente del sistema. No es necesario realizar cambios por ahora. ✨\n\n` +
                `_Si necesitas forzar un reinicio, usa *#restart*_ 🍗`
            )
        }

        // Hay cambios nuevos — recargar plugins sin reiniciar
        if (stdout.includes('Updating') || stdout.includes('Fast-forward') || stdout.includes('unpacking')) {
            await sendUpdate(conn, m,
                `✅ *ACTUALIZACIÓN EXITOSA* ⭐\n\n` +
                `He procesado los nuevos cambios correctamente:\n\`\`\`${stdout.slice(0, 400)}\`\`\`\n\n` +
                `🔄 *Iniciando recarga de módulos...*\n` +
                `No interrumpas el proceso, por favor. ✨`
            )

            try {
                const { readdirSync } = await import('fs')
                const { resolve, join } = await import('path')
                const { pathToFileURL } = await import('url')

                const pluginsDir = resolve('./plugins')
                const files = readdirSync(pluginsDir).filter(f => f.endsWith('.js'))
                let recargados = 0

                for (const file of files) {
                    try {
                        const filePath = join(pluginsDir, file)
                        const url = pathToFileURL(filePath).href + `?t=${Date.now()}`
                        const mod = await import(url)
                        if (mod.default) {
                            global.plugins?.set(file, mod.default)
                            recargados++
                        }
                    } catch (e) {
                        console.error(chalk.red(`[UPDATE] Error recargando ${file}:`), e.message)
                    }
                }

                console.log(chalk.magentaBright(`[UPDATE] ${recargados} plugins recargados`))

                return sendUpdate(conn, m,
                    `⭐ *¡LISTO!* ⭐\n\n` +
                    `Se han actualizado e instalado **${recargados}** módulos con éxito.\n` +
                    `El sistema ahora funciona con las últimas mejoras. ¿Podemos continuar ahora? 🍱`
                )
            } catch (e) {
                console.error(chalk.red('[UPDATE] Error recargando plugins:'), e.message)
                await sendUpdate(conn, m,
                    `⚠️ *AVISO DE SISTEMA*\n\n` +
                    `Hubo un problema con la recarga en caliente. Procederé a un reinicio completo en 3 segundos para asegurar la estabilidad. 🔄`
                )
                setTimeout(() => process.exit(0), 3000)
            }
        } else {
            return sendUpdate(conn, m,
                `⭐ *RESPUESTA INESPERADA:*\n\n` +
                `\`\`\`${(stdout || stderr || 'Sin respuesta').slice(0, 300)}\`\`\``
            )
        }
    })
}

handler.command = ['update', 'actualizar', 'gitpull']
handler.owner = true
export default handler