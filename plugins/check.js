// plugins/check.js
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

// Convertimos exec a promesas para manejar el asincronismo limpiamente
const execPromise = promisify(exec)

let handler = async (m, { conn, isOwner }) => {
    if (!isOwner) return

    const pluginsDir = './plugins'
    const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))

    await m.react('🔍')

    let report = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n`
    report += `✦ [ ANÁLISIS DE SINTAXIS NATIVO ]\n`

    let errors = []
    let total = 0

    for (const file of files) {
        total++
        const filePath = path.join(pluginsDir, file)

        try {
            // "node --check" compila el archivo para buscar errores, pero no lo ejecuta.
            // Es la forma más segura de validar ESM.
            await execPromise(`node --check "${filePath}"`)
        } catch (e) {
            // Si hay un error de sintaxis, node lo arroja en stderr
            const errText = e.stderr || e.message
            
            // Extraemos la línea del error (ej. file.js:45)
            const matchLine = errText.match(/:(\d+)/)
            const line = matchLine ? matchLine[1] : '?'
            
            // Extraemos el tipo de error (ej. SyntaxError: Unexpected token)
            const matchError = errText.match(/(SyntaxError:.*?)\n/i) || errText.match(/(Error:.*?)\n/i)
            const errorDesc = matchError ? matchError[1] : 'Error de Exportación/Sintaxis'

            errors.push(`❌ *${file}*\n   ⟡ Línea: ${line}\n   ⟡ Detalle: ${errorDesc.trim()}`)
        }
    }

    if (errors.length === 0) {
        report += `  ⟡ Módulos analizados: ${total}\n  ⟡ Estado: *ÓPTIMO*\n\n> Todos los archivos .js tienen una sintaxis perfecta.`
    } else {
        report += `  ⟡ Módulos analizados: ${total}\n  ⟡ Fallos detectados: ${errors.length}\n\n`
        report += errors.join('\n\n')
        report += `\n\n> Corrige los errores de sintaxis marcados.`
    }

    return conn.sendMessage(m.chat, { text: report }, { quoted: m })
}

handler.command = ['check', 'debug', 'verificar']
handler.owner = true
export default handler
