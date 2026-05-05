// ❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎
// ✦ [ PROTOCOLO DE DIFUSIÓN CANAL / NEWSLETTER ]
// ⟡ Design & Control: Adrien | XLR4-Security
// ⟡ Patch: Native Newsletter Support & Media Bypass

import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const plugin = async (m, { conn, args, isOwner, isROwner, prefix, command }) => {
    // Verificar que exista el JID del canal en settings o global
    const targetJid = global.newsletterJid
    const sub = args[0]?.toLowerCase()

    if (!sub) {
        const infoMenu = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ CONTROL DE CANAL / NEWSLETTER ]\n  ⟡ Status: Operativo\n  ⟡ Target JID: \`${targetJid || 'NO VINCULADO'}\`\n\n✦ [ COMANDOS DE ACCESO ]\n  ⟡ *${prefix + command} send* <texto>\n  ⟡ *${prefix + command} forward* (Cita media)\n  ⟡ *${prefix + command} jid* (Extraer ID)\n\n> ❄︎ XLR4-Security Protocol`
        return conn.sendMessage(m.chat, { text: infoMenu }, { quoted: m })
    }

    // ─── ENVIAR TEXTO DIRECTO ────────────────────────────────────────
    if (sub === 'send') {
        if (!isOwner) return m.reply('❄︎ [ ACCESO DENEGADO ]')
        if (!targetJid) return m.reply('❄︎ [ ERROR ] No se ha configurado `global.newsletterJid`.')
        
        const texto = args.slice(1).join(' ')
        if (!texto) return m.reply(`❄︎ [ ERROR ] Uso: *${prefix}${command} send <mensaje>*`)

        try {
            await conn.sendMessage(targetJid, { text: texto })
            return m.reply('❄︎ [ SEÑAL ENVIADA ] Mensaje transmitido al canal.')
        } catch (e) {
            return m.reply(`❄︎ [ FALLO ] No se pudo enviar al canal. Revisa si el Bot es Admin.`)
        }
    }

    // ─── REENVIAR MEDIA (BYPASS EXTRACTION) ──────────────────────────
    if (sub === 'forward') {
        if (!isOwner) return m.reply('❄︎ [ ACCESO DENEGADO ]')
        if (!m.quoted) return m.reply(`❄︎ [ ERROR ] Cita el mensaje para retransmitir.`)
        if (!targetJid) return m.reply('❄︎ [ ERROR ] Canal no configurado.')

        const q = m.quoted
        const mime = (q.msg || q).mimetype || ''
        
        try {
            if (!mime) {
                // Si es solo texto
                await conn.sendMessage(targetJid, { text: q.text || q.body || '' })
            } else {
                // Protocolo de descarga segura
                const mediaType = q.mtype.replace('Message', '')
                const stream = await downloadContentFromMessage(q.msg || q, mediaType.includes('audio') ? 'audio' : mediaType)
                let buffer = Buffer.from([])
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk])
                }

                const messageOptions = {
                    [mediaType]: buffer,
                    caption: q.msg?.caption || ''
                }

                await conn.sendMessage(targetJid, messageOptions)
            }
            return m.reply('❄︎ [ TRANSMISIÓN EXITOSA ] El paquete de datos ha llegado al canal.')
        } catch (e) {
            console.error(e)
            return m.reply(`❄︎ [ FALLO EN TRANSMISIÓN ]\n⟡ Detalle: ${e.message}`)
        }
    }

    // ─── EXTRAER JID DEL CANAL ───────────────────────────────────────
    if (sub === 'jid') {
        if (!isROwner) return m.reply('❄︎ [ ACCESO NIVEL ROOT REQUERIDO ]')
        try {
            const inviteCode = global.rcanal.split('/').pop()
            const metadata = await conn.newsletterMetadata('invite', inviteCode)
            const jid = metadata?.id

            return m.reply(
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                `✦ [ IDENTIFICADOR ENCONTRADO ]\n` +
                `  ⟡ JID: \`${jid}\`\n\n` +
                `✦ [ ACCIÓN ]\n` +
                `  ⟡ Copia este ID y pégalo en global.newsletterJid.`
            )
        } catch (e) {
            return m.reply(`❄︎ [ ERROR ] No se pudo obtener el metadato del canal. Verifica el link en global.rcanal.`)
        }
    }
}

plugin.command = ['newsletter', 'nl', 'rcanal']
plugin.owner = true

export default plugin
