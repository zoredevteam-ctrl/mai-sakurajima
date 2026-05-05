// ❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎
// ✦ [ PROTOCOLO DE INSPECCIÓN: GRUPOS & CANALES ]
// ⟡ Design & Control: Adrien | XLR4-Security

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const text = args[0] || (m.quoted ? (m.quoted.text || m.quoted.body || '') : '')
    
    // Regex para detectar ambos tipos de enlaces
    const groupRegex = /chat.whatsapp.com\/([0-9A-Za-z]{20,24})/i
    const channelRegex = /whatsapp.com\/channel\/([0-9A-Za-z]{20,24})/i

    const isGroup = text.match(groupRegex)
    const isChannel = text.match(channelRegex)

    if (!isGroup && !isChannel) {
        const syntax = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR DE PARÁMETROS ]\n  ⟡ Ingrese un enlace de Grupo o Canal.\n  ⟡ Uso: *${usedPrefix + command} <link>*`
        return conn.sendMessage(m.chat, { text: syntax }, { quoted: m })
    }

    await m.react('⏳')

    try {
        if (isGroup) {
            // ─── LÓGICA DE INSPECCIÓN PARA GRUPOS ───────────────────
            const code = isGroup[1]
            const res = await conn.groupGetInviteInfo(code)
            
            const caption = `❄︎  ──  H I Y K I  S Y S T E M  ──  ❄︎\n\n` +
                `✦ [ REPORTE: GRUPO DETECTADO ]\n` +
                `  ⟡ *Nombre:* ${res.subject}\n` +
                `  ⟡ *JID:* \`${res.id}@g.us\`\n` +
                `  ⟡ *Creador:* @${res.owner?.split('@')[0] || 'Desconocido'}\n` +
                `  ⟡ *Participantes:* ${res.size}\n` +
                `  ⟡ *Creado:* ${new Date(res.creation * 1000).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}\n\n` +
                `✦ [ DESCRIPCIÓN ]\n  ${res.desc || 'Sin descripción.'}\n\n` +
                `⟡ *Seguridad:* XLR4-Security Activa`

            await conn.sendMessage(m.chat, { text: caption, mentions: res.owner ? [res.owner] : [] }, { quoted: m })

        } else if (isChannel) {
            // ─── LÓGICA DE INSPECCIÓN PARA CANALES ──────────────────
            const code = isChannel[1]
            const res = await conn.newsletterMetadata('invite', code)
            
            const caption = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                `✦ [ REPORTE: CANAL DETECTADO ]\n` +
                `  ⟡ *Nombre:* ${res.name}\n` +
                `  ⟡ *JID:* \`${res.id}\`\n` +
                `  ⟡ *Seguidores:* ${res.subscribers?.toLocaleString() || 'Oculto'}\n` +
                `  ⟡ *Estado:* ${res.state === 'active' ? 'Operativo ✅' : 'Inactivo ⚠️'}\n` +
                `  ⟡ *Verificado:* ${res.verification === 'verified' ? 'Sí ☑️' : 'No'}\n` +
                `  ⟡ *Creación:* ${new Date(res.creation_time * 1000).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}\n\n` +
                `✦ [ DESCRIPCIÓN ]\n  ${res.description || 'Canal sin descripción técnica.'}\n\n` +
                `⟡ *Seguridad:* XLR4-Security Activa`

            await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
        }

        await m.react('✅')

    } catch (e) {
        console.error('[XLR4 INSPECT ERROR]', e)
        await m.react('❌')
        conn.sendMessage(m.chat, { 
            text: `❄︎ [ FALLO DE ANÁLISIS ]\n⟡ No se pudo obtener información. El enlace puede estar roto o el servidor está saturado.` 
        }, { quoted: m })
    }
}

handler.help = ['inspect']
handler.tags = ['tools']
handler.command = ['inspect', 'revisar']

export default handler
