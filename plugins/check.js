import { readdirSync, existsSync } from 'fs';
import { join } from 'path';

const handler = async (m, { conn, usedPrefix }) => {
    const pluginsFolder = join(process.cwd(), 'plugins');
    const files = readdirSync(pluginsFolder).filter(file => file.endsWith('.js'));
    
    // Lista de archivos cargados actualmente en el sistema (sin la extensión .js)
    const loadedPlugins = Object.keys(global.plugins).map(p => p.replace('.js', ''));
    
    let report = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n`;
    report += `✦ [ REPORTE DE CARGA CRÍTICA ]\n`;
    
    let failures = [];

    for (const file of files) {
        const fileName = file.replace('.js', '');
        
        // Si el archivo NO está en la memoria del bot
        if (!global.plugins[file] && !global.plugins[fileName]) {
            try {
                // Intentamos un import dinámico para ver el error real
                const path = `file://${join(pluginsFolder, file)}?t=${Date.now()}`;
                await import(path);
                
                // Si llega aquí es porque el archivo está bien pero quizás no tiene el formato correcto
                failures.push(`  ⟡ Archivo: ${file}\n  ⟡ Error: Formato no reconocido (Falta export default o handler)`);
            } catch (e) {
                // Aquí capturamos el error de consola que tanto buscas
                failures.push(`  ⟡ Archivo: ${file}\n  ⟡ Error: ${e.message.split('\n')[0]}`);
            }
        }
    }

    if (failures.length === 0) {
        report += `  ⟡ Estado: [ TODO CARGADO ]\n`;
        report += `  ⟡ No hay discrepancias entre la carpeta y la memoria.`;
    } else {
        report += `  ⟡ Módulos con fallas: ${failures.length}\n\n`;
        report += `✦ [ LISTA DE ERRORES ]\n\n`;
        report += failures.join('\n\n');
    }

    report += `\n\n❄️ Tip: Si el error es "Cannot find module", instala la dependencia con: npm install [nombre]`;

    await m.reply(report);
};

handler.command = /^(check|verificar|errors)$/i;
handler.rowner = true; // Solo tú puedes verlo

export default handler;
