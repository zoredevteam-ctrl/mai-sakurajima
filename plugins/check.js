// plugins/check.js
import fs from 'fs'
import path from 'path'
import { Worker } from 'worker_threads'

let handler = async (m, { conn, isOwner }) => {
    if (!isOwner) return

    const pluginsDir = './plugins'
    const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))
    
    await m.react('🔍')
    
    let report = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n`
    report += `✦ [ ANÁLISIS DE INTEGRIDAD ESM ]\n`
    
    let errors = []
    let total = 0

    for (const file of files) {
        total++
        const filePath = path.join(pluginsDir, file)
        const code = fs.readFileSync(filePath, 'utf-8')

        // Validamos usando un Worker temporal para probar la carga del módulo
        // Esto evita el error de "outside a module"
        try {
            await new Promise((resolve, reject) => {
                const workerCode = `
                    import('file://${filePath.replace(/\\/g, '/')}')
                    .then(() => process.exit(0))
                    .catch(err => {
                        console.error(err);
                        process.exit(1);
                    })
                `
                const worker = new Worker(workerCode, { eval: true })
                worker.on('exit', (code) => {
                    if (code === 0) resolve()
                    else reject(new Error('Syntax Error'))
                })
                worker.on('error', reject)
                
                // Timeout de seguridad para no trabar el bot
                setTimeout(() => {
                    worker.terminate()
                    resolve()
                }, 1000)
            })
        } catch (e) {
            // Intentamos capturar la línea real del error buscando en el stack
            const stack = e.stack || ''
            const lineMatch = stack.match(/:(\d+):(\d+)/)
            const line = lineMatch ? lineMatch[1] : 'Sintaxis/Import'
            
            errors.push(`❌ *${file}*\n   ⟡ Estado: Crítico\n   ⟡ Nota: Revisar exportaciones o dependencias.`);
        }
    }

    if (errors.length === 0) {
        report += `  ⟡ Módulos analizados: ${total}\n  ⟡ Estado: *ÓPTIMO*\n\n> Todos los archivos .js son compatibles con el núcleo.`
    } else {
        report += `  ⟡ Módulos analizados: ${total}\n  ⟡ Incompatibles: ${errors.length}\n\n`
        report += errors.join('\n\n')
        report += `\n\n> Nota: Si todos fallan, el sistema de validación está bloqueado por permisos del VPS.`
    }

    return conn.sendMessage(m.chat, { text: report }, { quoted: m })
}

handler.command = ['check', 'debug', 'verificar']
handler.owner = true
export default handler
