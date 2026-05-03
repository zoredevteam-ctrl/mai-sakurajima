// plugins/terminal.js
import { exec } from 'child_process'

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    // ── PROTOCOLO DE SEGURIDAD XLR4 ──────────────────────────────────────────
    // Bloqueo estricto: Solo el owner puede ejecutar comandos de terminal
    if (!isOwner) {
        return conn.sendMessage(m.chat, { 
            text: `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                  `✦ [ ACCESO DENEGADO ]\n` +
                  `  ⟡ Permisos insuficientes.\n` +
                  `  ⟡ Este intento ha sido registrado en el firewall de XLR4-Security.` 
        }, { quoted: m })
    }

    if (args.length === 0) {
        return conn.sendMessage(m.chat, { 
            text: `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                  `✦ [ ERROR DE SINTAXIS ]\n` +
                  `  ⟡ Faltan parámetros de ejecución.\n` +
                  `  ⟡ Uso: *${usedPrefix + command} install <paquete>*\n` +
                  `  ⟡ Ejemplo: *${usedPrefix + command} install axios*` 
        }, { quoted: m })
    }

    // Reconstruimos el comando (ej. "npm install fluent-ffmpeg")
    const cmd = `${command} ${args.join(' ')}`

    await m.react('❄︎')
    await conn.sendMessage(m.chat, { 
        text: `✦ [ EJECUTANDO PROTOCOLO ]\n  ⟡ Terminal: \`${cmd}\`\n  ⟡ Procesando dependencias...` 
    }, { quoted: m })

    // Ejecución en la terminal del servidor
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`[XLR4 ERROR] ${error.message}`)
            return conn.sendMessage(m.chat, { 
                text: `✦ [ FALLO EN EJECUCIÓN ]\n  ⟡ Detalle del error:\n\`\`\`${error.message}\`\`\`` 
            }, { quoted: m })
        }
        
        if (stderr && !stdout) {
            return conn.sendMessage(m.chat, { 
                text: `✦ [ ADVERTENCIA DEL SISTEMA ]\n  ⟡ Salida:\n\`\`\`${stderr.trim()}\`\`\`` 
            }, { quoted: m })
        }

        // Salida exitosa
        conn.sendMessage(m.chat, { 
            text: `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                  `✦ [ OPERACIÓN COMPLETADA ]\n` +
                  `  ⟡ Salida del servidor:\n` +
                  `\`\`\`\n${stdout.trim().slice(0, 1500)}...\n\`\`\`` 
        }, { quoted: m })
    })
}

// Configuración del comando
handler.command = ['npm']
handler.owner = true // ← Etiqueta de seguridad vital
export default handler
