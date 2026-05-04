import { readdirSync } from 'fs';
import { join, fileURLToPath } from 'path';

const handler = async (m, { conn }) => {
    // Definir la ruta a la carpeta de plugins
    const pluginsFolder = join(process.cwd(), 'plugins'); // Ajusta 'plugins' si tu carpeta se llama distinto
    let files;

    try {
        files = readdirSync(pluginsFolder).filter(file => file.endsWith('.js'));
    } catch (err) {
        return m.reply(`❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR DE DIRECTORIO ]\n  ⟡ No se pudo leer la carpeta de plugins.\n  ⟡ Detalle: ${err.message}`);
    }

    let errorList = [];
    let scannedCount = 0;

    // Notificación de que el proceso inició (útil si tienes muchos archivos)
    m.reply('❄️ Iniciando escaneo de módulos... esto puede tardar unos segundos.');

    for (const file of files) {
        scannedCount++;
        try {
            // Importación dinámica con timestamp para evitar la caché (Hot Reloading)
            const modulePath = `file://${join(pluginsFolder, file)}?t=${Date.now()}`;
            await import(modulePath);
        } catch (e) {
            // Capturamos el error y estructuramos la información
            errorList.push(
                `  ⟡ Archivo: ${file}\n` +
                `  ⟡ Tipo: ${e.name}\n` +
                `  ⟡ Detalle: ${e.message.split('\n')[0]}` // Solo tomamos la primera línea del error para no saturar el chat
            );
        }
    }

    // Construcción de la respuesta final con el diseño de la interfaz
    let responseText = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n`;
    responseText += `✦ [ REPORTE DE SISTEMA ]\n`;
    responseText += `  ⟡ Archivos analizados: ${scannedCount}\n`;
    responseText += `  ⟡ Archivos fallidos: ${errorList.length}\n\n`;

    if (errorList.length > 0) {
        responseText += `✦ [ DETALLE DE MÓDULOS DAÑADOS ]\n\n`;
        responseText += errorList.join('\n\n');
    } else {
        responseText += `✦ [ ESTADO: ÓPTIMO ]\n`;
        responseText += `  ⟡ Todos los archivos están funcionando sin errores de sintaxis.`;
    }

    await m.reply(responseText);
};

handler.command = /^(debug|checkplugins|fallos)$/i;
handler.rowner = true; // Importante: Restringir este comando solo a los creadores/owners

export default handler;
