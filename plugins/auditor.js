// plugins/auditor.js
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    // ── PROTOCOLO DE SEGURIDAD XLR4 ──────────────────────────────────────────
    if (!isOwner) {
        return conn.sendMessage(m.chat, { 
            text: `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                  `✦ [ ALERTA DE SEGURIDAD ]\n` +
                  `  ⟡ Acceso denegado al sistema de archivos del núcleo.\n` +
                  `  ⟡ Este incidente ha sido registrado.` 
        }, { quoted: m })
    }

    // Ruta solicitada (si no pone nada, abre la carpeta principal del bot)
    const inputPath = args.join(' ') || '.'
    const resolvedPath = path.resolve(inputPath)

    try {
        if (!fs.existsSync(resolvedPath)) {
            return conn.sendMessage(m.chat, { 
                text: `✦ [ ERROR DE RUTA ]\n  ⟡ No se encontró el directorio o archivo:\n  \`${inputPath}\`` 
            }, { quoted: m })
        }

        const stats = fs.statSync(resolvedPath)

        // ── 1. SI ES UNA CARPETA (Muestra los archivos adentro) ──────────────
        if (stats.isDirectory()) {
            const files = fs.readdirSync(resolvedPath)
            let folders = []
            let justFiles = []

            files.forEach(f => {
                const isDir = fs.statSync(path.join(resolvedPath, f)).isDirectory()
                if (isDir) folders.push(`📁 ${f}/`)
                else justFiles.push(`📄 ${f}`)
            })

            const output = [...folders, ...justFiles].join('\n  ⟡ ')
            
            return conn.sendMessage(m.chat, {
                text: `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                      `✦ [ EXPLORADOR DE DIRECTORIO ]\n` +
                      `  ⟡ Ruta actual: \`${inputPath}\`\n\n` +
                      `  ⟡ ${output || 'Carpeta vacía'}\n\n` +
                      `> ✦ Para leer un archivo usa: *${usedPrefix + command} ruta/del/archivo.js*`
            }, { quoted: m })

        // ── 2. SI ES UN ARCHIVO (Lo lee línea por línea) ─────────────────────
        } else if (stats.isFile()) {
            const content = fs.readFileSync(resolvedPath, 'utf-8')
            
            // Añadir numeración de líneas
            const lines = content.split('\n')
            let numberedContent = lines.map((line, index) => `${index + 1} | ${line}`).join('\n')

            // Prevención de cuelgue: Si el archivo tiene más de 4000 caracteres, se envía como txt
            if (numberedContent.length > 4000) {
                await conn.sendMessage(m.chat, { text: `✦ [ AVISO ] El archivo \`${inputPath}\` es muy extenso. Generando reporte de auditoría en formato documento para análisis profundo...` }, { quoted: m })
                
                const tmpPath = path.join('.', `XLR4_AUDIT_${Date.now()}.txt`)
                fs.writeFileSync(tmpPath, numberedContent)
                
                await conn.sendMessage(m.chat, {
                    document: fs.readFileSync(tmpPath),
                    fileName: `AUDIT_${path.basename(resolvedPath)}.txt`,
                    mimetype: 'text/plain',
                    caption: `❄︎ Análisis línea por línea de: ${inputPath}`
                }, { quoted: m })
                
                fs.unlinkSync(tmpPath)
                return
            }

            // Si es un archivo corto, lo muestra directo en WhatsApp
            return conn.sendMessage(m.chat, {
                text: `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                      `✦ [ LECTURA DE CÓDIGO ]\n` +
                      `  ⟡ Archivo: \`${inputPath}\`\n` +
                      `  ⟡ Líneas totales: ${lines.length}\n\n` +
                      `\`\`\`javascript\n${numberedContent}\n\`\`\``
            }, { quoted: m })
        }
    } catch (e) {
        return conn.sendMessage(m.chat, { text: `✦ [ ERROR CRÍTICO ]\n  ⟡ Detalle del sistema: ${e.message}` }, { quoted: m })
    }
}

handler.command = ['audit', 'ls', 'leerarchivos']
handler.owner = true // Módulo estrictamente protegido
export default handler
