// plugins/utilidades.js
import { database } from '../lib/database.js'

const getThumb = async () => {
    try {
        const res = await fetch(global.icono || global.banner || '')
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

const sendReply = async (conn, m, txt) => {
    const thumb = await getThumb()
    try {
        await conn.sendMessage(m.chat, {
            text: txt,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid,
                    serverMessageId: -1,
                    newsletterName:  global.newsletterName
                },
                externalAdReply: {
                    title:                 'H I Y U K I  S Y S T E M',
                    body:                  'Módulo de Consulta Climática',
                    mediaType:             1,
                    thumbnail:             thumb,
                    renderLargerThumbnail: false,
                    sourceUrl:             global.rcanal || ''
                }
            }
        }, { quoted: m })
    } catch { await m.reply(txt) }
}

let handler = async (m, { conn, command, text }) => {
    const cmd = command.toLowerCase()

    // ── #clima ────────────────────────────────────────────────────────────────
    if (cmd === 'clima' || cmd === 'weather') {
        const ciudad = (text || '').trim()
        if (!ciudad) return sendReply(conn, m,
            `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
            `✦ [ MONITOREO CLIMÁTICO ]\n` +
            `  ⟡ Uso: *#clima <ciudad>*\n` +
            `  ⟡ Ejemplo: *#clima CDMX*`
        )

        await m.react('❄︎')
        try {
            const url  = `https://wttr.in/${encodeURIComponent(ciudad)}?format=j1&lang=es`
            const res  = await fetch(url)
            if (!res.ok) throw new Error('not_found')
            
            const data = await res.json()
            const cur  = data.current_condition?.[0]
            const loc  = data.nearest_area?.[0]
            
            const temp = cur?.temp_C
            const feel = cur?.FeelsLikeC
            const desc = cur?.weatherDesc?.[0]?.value || 'desconocido'
            const hum  = cur?.humidity
            const wind = cur?.windspeedKmph
            const pais = loc?.country?.[0]?.value || ''

            return sendReply(conn, m,
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                `✦ [ REPORTE METEOROLÓGICO ]\n` +
                `  ⟡ Ubicación: *${ciudad}${pais ? ', ' + pais : ''}*\n` +
                `  ⟡ Estado: *${desc}*\n` +
                `  ⟡ Temperatura: *${temp}°C*\n` +
                `  ⟡ Sensación: *${feel}°C*\n` +
                `  ⟡ Humedad: *${hum}%*\n` +
                `  ⟡ Viento: *${wind} km/h*`
            )
        } catch {
            return sendReply(conn, m, 
                `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n` +
                `✦ [ ERROR DE PROTOCOLO ]\n` +
                `  ⟡ No se han encontrado datos para: *${ciudad}*\n` +
                `  ⟡ Verifique la sintaxis e intente de nuevo.`
            )
        }
    }
}

handler.command = ['clima', 'weather']
export default handler
