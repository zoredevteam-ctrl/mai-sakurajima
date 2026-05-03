// plugins/check.js
import fs from 'fs'
import path from 'path'
import vm from 'vm'

let handler = async (m, { conn, isOwner }) => {
    if (!isOwner) return

    const pluginsDir = './plugins'
    const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))
    
    let report = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n`
    report += `✦ [ ANÁLISIS DE INTEGRIDAD ]\n`
    
    let errors = []
    let total = 0

    for (const file of files) {
        total++
        const filePath = path.join(pluginsDir, file)
        const code = fs.readFileSync(filePath, 'utf-8')

        try {
            // Creamos un script de prueba para validar la sintaxis
            new vm.Script(code)
        } catch (e) {
            // Si falla, extraemos la línea del error del stack trace
            const stack = e.stack || ''
            const lineMatch = stack.match(/evalmachine\.<anonymous>:(\d+)/) || stack.match(/:(\d+):(\d+)/)
            const line = lineMatch ? lineMatch[1] : 'Desconocida'
            
            errors.push(`❌ *${file}*\n   ⟡ Error: ${e.message}\n   ⟡ Línea: ${line}`)
        }
    }

    if (errors.length === 0) {
        report += `  ⟡ Estado: *Óptimo*\n  ⟡ Módulos analizados: ${total}\n  ⟡ Conflictos: 0\n\n> Todos los protocolos están operativos.`
    } else {
        report += `  ⟡ Módulos analizados: ${total}\n  ⟡ Fallos detectados: ${errors.length}\n\n`
        report += errors.join('\n\n')
        report += `\n\n> Corrija las líneas indicadas para restablecer el sistema.`
    }

    return conn.sendMessage(m.chat, { text: report }, { quoted: m })
}

handler.command = ['check', 'debug', 'verificar']
handler.owner = true
export default handler
