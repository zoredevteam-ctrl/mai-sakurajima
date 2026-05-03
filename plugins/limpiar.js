// plugins/limpiar.js
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, usedPrefix, command, isOwner }) => {
    if (!isOwner) return // Seguridad XLR4

    await m.react('🧹')
    
    // Directorios que suelen acumular basura
    const tmpDirs = ['./tmp', './temp', './session/baileys_store.json']
    let report = ''
    let filesDeleted = 0

    // 1. Limpieza de archivos temporales
    for (const dir of tmpDirs) {
        if (fs.existsSync(dir)) {
            const stats = fs.statSync(dir)
            if (stats.isDirectory()) {
                const files = fs.readdirSync(dir)
                files.forEach(file => {
                    try {
                        fs.unlinkSync(path.join(dir, file))
                        filesDeleted++
                    } catch (e) { /* Archivo en uso */ }
                })
                report += `  ⟡ Directorio \`${dir}\`: Limpiado.\n`
            } else {
                try {
                    fs.unlinkSync(dir)
                    filesDeleted++
                    report += `  ⟡ Archivo \`${dir}\`: Eliminado.\n`
                } catch (e) { }
            }
        }
    }

    // 2. Optimización de la Sesión (Solo archivos basura de Baileys)
    const authPath = './session'
    if (fs.existsSync(authPath)) {
        const authFiles = fs.readdirSync(authPath)
        authFiles.forEach(file => {
            // ELIMINA sesiones antiguas que NO sean la principal (creds.json)
            // Esto limpia archivos de pre-keys antiguos y basura de caché
            if (file !== 'creds.json' && (file.includes('pre-key') || file.includes('sender-key') || file.includes('session-'))) {
                try {
                    fs.unlinkSync(path.join(authPath, file))
                    filesDeleted++
                } catch (e) { }
            }
        })
        report += `  ⟡ Carpeta de Sesión: Optimizada (creds.json preservado).\n`
    }

    return conn.sendMessage(m.chat, {
        text: `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
              `✦ [ MANTENIMIENTO COMPLETADO ]\n` +
              report +
              `\n  ⟡ Total de archivos purgados: *${filesDeleted}*\n` +
              `  ⟡ Estado del sistema: *Optimizado*\n\n` +
              `> El núcleo de Hiyuki ahora está más ligero.`
    }, { quoted: m })
}

handler.command = ['limpiar', 'purge', 'clean']
handler.owner = true
export default handler
