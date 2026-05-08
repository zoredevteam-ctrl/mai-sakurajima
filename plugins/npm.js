import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // ── PROTOCOLO DE SEGURIDAD XLR4 ──────────────────────────────────────────
    // Aunque handler.owner = true lo bloquea, este doble check refuerza el sistema.
    const isOwner = [conn.user.jid, ...global.owner.map(o => o[0] + '@s.whatsapp.net')].includes(m.sender)
    
    if (!isOwner) return 

    if (args.length === 0) {
        return conn.sendMessage(m.chat, { 
            text: `❄︎  ──  𝐇 𝐈 𝐘 𝐔 𝐊 𝐈  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ❄︎\n\n` +
                  `✦ [ ERROR DE SINTAXIS ]\n` +
                  `  ⟡ Faltan parámetros de ejecución.\n` +
                  `  ⟡ Uso: *${usedPrefix + command} <comando>*\n` +
                  `  ⟡ Ejemplo: *${usedPrefix + command} install axios*` 
        }, { quoted: m })
    }

    // Reconstruimos el comando de forma segura
    const fullCommand = `${command} ${args.join(' ')}`

    try {
        await m.react('❄️') // Reacción con emoji estándar para evitar errores
        await conn.sendMessage(m.chat, { 
            text: `✦ [ 𝐄𝐉𝐄𝐂𝐔𝐓𝐀𝐍𝐃𝐎 𝐏𝐑𝐎𝐓𝐎𝐂𝐎𝐋𝐎 ]\n  ⟡ Terminal: \`${fullCommand}\`\n  ⟡ Procesando en servidor...` 
        }, { quoted: m })

        // Ejecución con Promesa para evitar bloqueos de hilo
        const { stdout, stderr } = await execPromise(fullCommand)

        if (stdout || stderr) {
            let output = stdout || stderr
            return conn.sendMessage(m.chat, { 
                text: `❄︎  ──  𝐇 𝐈 𝐘 𝐔 𝐊 𝐈  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ❄︎\n\n` +
                      `✦ [ 𝐎𝐏𝐄𝐑𝐀𝐂𝐈𝐎́𝐍 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐃𝐀 ]\n` +
                      `  ⟡ Registro de salida:\n` +
                      `\`\`\`bash\n${output.trim().slice(0, 1500)}${output.length > 1500 ? '...' : ''}\n\`\`\`` 
            }, { quoted: m })
        }

    } catch (e) {
        // Captura de errores de ejecución (comando no encontrado, fallo de red, etc.)
        console.error(`[XLR4-SECURITY ERROR]`, e)
        return conn.sendMessage(m.chat, { 
            text: `✦ [ 𝐅𝐀𝐋𝐋𝐎 𝐄𝐍 𝐄𝐉𝐄𝐂𝐔𝐂𝐈𝐎́𝐍 ]\n  ⟡ El sistema XLR4 ha detectado un error:\n\`\`\`bash\n${e.message}\n\`\`\`` 
        }, { quoted: m })
    }
}

// Configuración avanzada del comando
handler.command = ['npm', 'git', 'term'] // Ahora puedes usar .npm, .git o .term
handler.owner = true 

export default handler
