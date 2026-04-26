import { exec } from 'child_process'
import { promisify } from 'util'
const execAsync = promisify(exec)

let handler = async (m, { conn, isOwner }) => {
    // Verificación de seguridad
    if (!isOwner) return 

    try {
        // Mensaje inicial de búsqueda
        const { key } = await conn.sendMessage(m.chat, { 
            text: `✿ ─── 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 𝖣𝖤 𝖢𝖮𝖭𝖳𝖱𝖮𝖫 ─── ✿\n\n> 🌷 _Buscando actualizaciones en el repositorio..._` 
        }, { quoted: m })

        // Ejecución del comando git
        const stdout = await execAsync('git pull')
        
        // Estilo de respuesta elegante
        let txt = `✦ ─── 𝖠𝖢𝖳𝖴𝖠𝖫𝖨𝖹𝖠𝖢𝖨𝖮𝖭 ─── ✦\n\n`
        
        if (stdout.stdout.includes('Already up to date')) {
            txt += `> ✿ El sistema ya se encuentra en su versión más reciente. No hay cambios pendientes.\n\n¡Todo está en orden! (⁠✿⁠^⁠‿⁠^⁠)`
        } else {
            txt += `> 🌷 ¡Éxito! Se han aplicado nuevos cambios correctamente.\n\n**Registro de cambios:**\n${stdout.stdout}\n\nReiniciando para aplicar mejoras... ✨`
        }

        await conn.sendMessage(m.chat, {
            text: txt,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 99,
                externalAdReply: {
                    title: '👑 𝖭𝖨𝖭𝖮 𝖲𝖸𝖲𝖳𝖤𝖬 𝖴𝖯𝖣𝖠𝖳𝖤',
                    body: 'Gestión de repositorio y mejoras ✨',
                    mediaType: 1,
                    thumbnail: global.icono, // Uso del icono global
                    sourceUrl: global.rcanal // Enlace del canal
                },
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.newsletterJid || '120363404822730259@newsletter',
                    newsletterName: global.newsletterName || '𓆩 ✧ 𝐍𝐢𝐧𝐨 ⌁ 𝑼𝒑𝒅𝒂𝒕𝒆𝒔 ✧ 𓆪',
                    serverMessageId: -1
                }
            }
        }, { edit: key })

        // Si hubo cambios, se recomienda reiniciar el proceso (depende de tu hosting)
        if (!stdout.stdout.includes('Already up to date')) {
            setTimeout(() => { process.exit() }, 3000)
        }

    } catch (e) {
        console.error(e)
        await m.reply(`❌ **Error en el sistema:**\n\n\`\`\`${e.message}\`\`\``)
    }
}

handler.help = ['update']
handler.tags = ['owner']
handler.command = ['update', 'actualizar', 'fix']
handler.owner = true

export default handler
