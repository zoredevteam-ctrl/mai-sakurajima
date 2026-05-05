// ❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎
// ✦ [ PROTOCOLO DE INSPECCIÓN DE ENLACES ]
// ⟡ Design & Control: Adrien | XLR4-Security

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // 1. Extraer el código del enlace (soporta varios formatos)
    const linkRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i
    const text = args[0] || (m.quoted ? (m.quoted.text || m.quoted.body || '') : '')
    const [_, code] = text.match(linkRegex) || []

    if (!code) {
        const syntax = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR DE PARÁMETROS ]\n  ⟡ Ingrese un enlace de grupo para inspeccionar.\n  ⟡ Uso: *${usedPrefix + command} <enlace>*`
        return conn.sendMessage(m.chat, { text: syntax }, { quoted: m })
    }

    await m.react('⏳')

    try {
        // 2. Solicitar metadatos al servidor de WhatsApp
        const res = await conn.groupGetInviteInfo(code)
        
        // 3. Formatear la respuesta técnica
        const caption = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
            `✦ [ REPORTE DE INTELIGENCIA ]\n` +
            `  ⟡ *Nombre:* ${res.subject}\n` +
            `  ⟡ *JID:* \`${res.id}@g.us\`\n` +
            `  ⟡ *Creador:* @${res.owner?.split('@')[0] || 'Desconocido'}\n` +
            `  ⟡ *Creado:* ${new Date(res.creation * 1000).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}\n` +
            `  ⟡ *Participantes:* ${res.size}\n\n` +
            `✦ [ ESTADO DEL LINK ]\n` +
            `  ⟡ Solo Admins: ${res.announce ? 'Sí' : 'No'}\n` +
            `  ⟡ Restringido: ${res.restrict ? 'Sí' : 'No'}\n\n` +
            `✦ [ DESCRIPCIÓN ]\n` +
            `  ${res.desc || 'Sin descripción técnica.'}\n\n` +
            `⟡ *Seguridad:* XLR4-Security Activa`

        await conn.sendMessage(m.chat, { 
            text: caption, 
            mentions: res.owner ? [res.owner] : [] 
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error('[XLR4 INSPECT ERROR]', e)
        await m.react('❌')
        conn.sendMessage(m.chat, { 
            text: `❄︎ [ FALLO DE ANÁLISIS ]\n⟡ El link es inválido o el sistema ha sido bloqueado por el grupo.` 
        }, { quoted: m })
    }
}

handler.help = ['inspect']
handler.tags = ['tools']
handler.command = ['inspect', 'revisar', 'inspeccionar']

export default handler
