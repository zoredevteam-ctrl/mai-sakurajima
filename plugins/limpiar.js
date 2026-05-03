import fs from 'fs'
import path from 'path'
import os from 'os'

let handler = async (m, { conn, isOwner }) => {
    if (!isOwner) return 

    await m.react('❄︎')
    
    // --- 1. Métrica de inicio ---
    const memoriaInicial = (os.totalmem() - os.freemem()) / 1024 / 1024
    
    // Directorios a limpiar
    const tmpDirs = ['./tmp', './temp', './session/baileys_store.json']
    let filesDeleted = 0

    // --- 2. Ejecución de la Purga ---
    for (const dir of tmpDirs) {
        if (fs.existsSync(dir)) {
            const stats = fs.statSync(dir)
            if (stats.isDirectory()) {
                const files = fs.readdirSync(dir)
                files.forEach(file => {
                    try {
                        fs.unlinkSync(path.join(dir, file))
                        filesDeleted++
                    } catch (e) { }
                })
            } else {
                try {
                    fs.unlinkSync(dir); filesDeleted++
                } catch (e) { }
            }
        }
    }

    // Limpieza selectiva de sesión (preservando el login)
    const authPath = './session'
    if (fs.existsSync(authPath)) {
        const authFiles = fs.readdirSync(authPath)
        authFiles.forEach(file => {
            if (file !== 'creds.json' && (file.includes('pre-key') || file.includes('sender-key') || file.includes('session-'))) {
                try {
                    fs.unlinkSync(path.join(authPath, file))
                    filesDeleted++
                } catch (e) { }
            }
        })
    }

    // --- 3. Métricas finales y Hardware ---
    const memoriaFinal = (os.totalmem() - os.freemem()) / 1024 / 1024
    const ramTotal = os.totalmem() / 1024 / 1024
    const cpuModelo = os.cpus()[0].model
    const uptime = Math.floor(os.uptime() / 3600)

    let texto = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n`
    texto += `✦ [ MANTENIMIENTO Y HARDWARE ]\n`
    texto += `  ⟡ Archivos purgados: *${filesDeleted}*\n`
    texto += `  ⟡ RAM en uso: *${memoriaFinal.toFixed(2)} MB* / ${Math.round(ramTotal)} MB\n`
    texto += `  ⟡ Ahorro estimado: *${(memoriaInicial - memoriaFinal).toFixed(2)} MB*\n`
    texto += `  ⟡ Uptime del VPS: *${uptime} horas*\n\n`
    texto += `✦ [ ESPECIFICACIONES ]\n`
    texto += `  ⟡ CPU: \`${cpuModelo}\`\n`
    texto += `  ⟡ Plataforma: \`${os.platform()} ${os.release()}\`\n\n`
    texto += `> Sistema optimizado bajo el protocolo XLR4.`

    return conn.sendMessage(m.chat, { text: texto }, { quoted: m })
}

handler.command = ['limpiar', 'purge', 'clean', 'rtam']
handler.owner = true
export default handler
