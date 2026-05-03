// ❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎
// ✦ [ PROTOCOLO DE DIFUSIÓN CANAL / NEWSLETTER ]
// ⟡ Design & Control: Adrien | XLR4-Security

import { database } from '../lib/database.js'

const plugin = async (m, { conn, args, isOwner, isROwner, prefix, command }) => {
    const sub = args[0]?.toLowerCase()

    // ─── ENVIAR TEXTO AL CANAL (NEWSLETTER) ───────────────────────────
    if (sub === 'send') {
        if (!isOwner) return m.reply('❄︎  [ ACCESO DENEGADO ]\n⟡ Solo el Owner puede emitir señales al canal.')
        const texto = args.slice(1).join(' ')
        if (!texto) return m.reply(`❄︎ [ ERROR ] Uso: *${prefix}${command} send <mensaje>*`)
        
        await global.sendToChannel(conn, texto, database.data)
        return m.reply('❄︎ [ SEÑAL ENVIADA ] Mensaje transmitido al canal con éxito.')
    }

    // ─── REENVIAR MEDIA/TEXTO AL CANAL ────────────────────────────────
    if (sub === 'forward') {
        if (!isOwner) return m.reply('❄︎ [ ACCESO DENEGADO ]')
        if (!m.quoted) return m.reply(`❄︎ [ ERROR ] Cita el mensaje (texto/imagen/video) para retransmitir.`)
        
        const qType = m.quoted.mtype
        try {
            if (qType === 'conversation' || qType === 'extendedTextMessage') {
                await global.sendToChannel(conn, m.quoted.body || m.quoted.text || '', database.data)
            } else if (qType === 'imageMessage' || qType === 'videoMessage') {
                const media = await m.quoted.download()
                const type = qType === 'imageMessage' ? 'image' : 'video'
                
                await conn.sendMessage(global.newsletterJid, {
                    [type]: media,
                    caption: m.quoted.msg?.caption || ''
                })
            } else {
                return m.reply('❄︎ [ ADVERTENCIA ] Tipo de encriptación de media no soportada.')
            }
            return m.reply('❄︎ [ TRANSMISIÓN EXITOSA ] El paquete de datos ha llegado al canal.')
        } catch (e) {
            return m.reply(`❄︎ [ FALLO EN TRANSMISIÓN ]\n⟡ Detalle: ${e.message}`)
        }
    }

    // ─── EXTRACCIÓN DE JID (TECNOLOGÍA XLR4) ─────────────────────────
    if (sub === 'jid') {
        if (!isROwner) return m.reply('❄︎ [ ACCESO NIVEL ROOT REQUERIDO ]')
        try {
            const inviteCode = global.rcanal.split('/').pop()
            const metadata = await conn.newsletterMetadata('invite', inviteCode)
            const jid = metadata?.id || 'No encontrado'
            
            return m.reply(
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                `✦ [ IDENTIFICADOR DE CANAL ]\n` +
                `  ⟡ JID: \`${jid}\`\n\n` +
                `✦ [ CONFIGURACIÓN ]\n` +
                `  ⟡ Actualiza global.newsletterJid en settings.js.`
            )
        } catch (e) {
            return m.reply(`❄︎ [ ERROR DE VINCULACIÓN ]\n⟡ Detalle: ${e.message}`)
        }
    }

    // ─── MENÚ DE PROTOCOLO ───────────────────────────────────────────
    const infoMenu = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎

✦ [ CONTROL DE CANAL / NEWSLETTER ]
  ⟡ Status: Operativo
  ⟡ Canal: ${global.rcanal}
  ⟡ Target JID: \`${global.newsletterJid}\`

✦ [ COMANDOS DE ACCESO ]
  ⟡ *${prefix + command} send* <texto>
  ⟡ *${prefix + command} forward* (Cita media)
  ⟡ *${prefix + command} jid* (Sincronizar JID)

> ❄︎ XLR4-Security Protocol`

    await conn.sendMessage(m.chat, { text: infoMenu }, { quoted: m })
}

plugin.command = ['newsletter', 'nl', 'rcanal']
plugin.description = 'Gestión del canal de noticias de Hiyuki System'
plugin.owner = true // Solo owners para evitar spam en el canal

export default plugin
