// ❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎
// ✦ [ PROTOCOLO DE EXTRACCIÓN INSTAGRAM / AXIOS ]

import axios from 'axios'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const url = args[0] || (m.quoted ? (m.quoted.text || m.quoted.body || '') : '')

    if (!url || !/instagram\.com/i.test(url)) {
        return conn.sendMessage(m.chat, { text: `❄︎ [ ERROR ] Ingrese un link válido de Instagram.` }, { quoted: m })
    }

    await m.react('⏳')

    try {
        // Usamos axios en lugar de fetch para mayor compatibilidad
        const { data: res } = await axios.get(`https://api.ryzendesu.vip/api/downloader/igdl?url=${encodeURIComponent(url)}`)
        
        const data = res?.data?.[0]
        if (!data || !data.url) throw new Error('No se interceptó el video.')

        await m.react('⬇️')

        await conn.sendMessage(m.chat, {
            video: { url: data.url },
            caption: `> ⟪❄︎⟫ Extracción Exitosa\n\n✦ [ REPORTE ]\n  ⟡ Plataforma: *Instagram*\n  ⟡ Seguridad: *XLR4-Protocol*`,
            mimetype: 'video/mp4'
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        conn.sendMessage(m.chat, { text: `❄︎ [ FALLO ] El servidor no respondió. Reintente más tarde.` }, { quoted: m })
    }
}

handler.help = ['ig']
handler.tags = ['dl']
handler.command = ['ig', 'instagram', 'igdl']

export default handler
