// ❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎
// ✦ [ PROTOCOLO DE ESCANEO DE GRUPO ]
// ⟡ Design: Adrien | XLR4-Security

let handler = async (m, { groupMetadata, command, conn, text, usedPrefix }) => {
    if (!text) return conn.reply(m.chat, `❄︎ [ ERROR ] Por favor, ingrese un criterio para el Top 10.\n\n› Ejemplo: *${usedPrefix + command} los más pro*`, m)

    // Obtener participantes y mezclar de forma aleatoria
    let participants = groupMetadata.participants.map(v => v.id)
    let sorted = participants.sort(() => 0.5 - Math.random())
    
    // Seleccionar los primeros 10 únicos
    let top10 = sorted.slice(0, 10)
    
    // Configuración estética
    const emojis = ['❄︎', '✦', '⟡', '💠', '⚔️', '⚙️', '🧊']
    const icon = emojis[Math.floor(Math.random() * emojis.length)]
    
    let report = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n`
    report += `✦ [ TOP 10: ${text.toUpperCase()} ]\n\n`
    
    top10.forEach((user, index) => {
        report += `  ⟡ *${index + 1}.* @${user.split('@')[0]}\n`
    })
    
    report += `\n> ❄︎ Escaneo de red completado.`

    await conn.sendMessage(m.chat, {
        text: report,
        mentions: top10,
        contextInfo: {
            externalAdReply: {
                title: '❄︎ HIYUKI PROTOCOL',
                body: `Análisis de grupo: ${text}`,
                mediaType: 1,
                thumbnailUrl: global.icono,
                sourceUrl: global.rcanal || ''
            }
        }
    }, { quoted: m })
}

handler.help = ['top10 <texto>']
handler.command = ['top', 'top10']
handler.tags = ['fun']
handler.group = true

export default handler
