// ❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎
// ✦ [ PROTOCOLO DE EMERGENCIA: SCAPER DIRECTO ]
// ⟡ Design & Control: Adrien | XLR4-Security

import axios from 'axios'
import cheerio from 'cheerio' // Asegúrate de tenerlo o instala: npm install cheerio

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const url = args[0] || (m.quoted ? (m.quoted.text || m.quoted.body || '') : '')

    if (!url || !/instagram\.com/i.test(url)) {
        return conn.sendMessage(m.chat, { text: `❄︎ [ ERROR ] Ingrese un enlace válido.` }, { quoted: m })
    }

    await m.react('⏳')

    try {
        // MÉTODO DE RESPALDO: Usando un servicio de descarga directa por POST
        const params = new URLSearchParams()
        params.append('q', url)
        params.append('t', 'media')
        params.append('lang', 'en')

        const { data } = await axios.post('https://v3.fastdl.app/api/convert', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
        })

        // Buscamos el link de descarga en la respuesta
        let videoUrl = data?.meta?.source || data?.url?.[0]?.url || data?.links?.[0]?.url

        if (!videoUrl) throw new Error('Nodos bloqueados por Instagram.')

        await m.react('⬇️')

        const caption = `> ⟪❄︎⟫ *Hiyuki System: Modo Bypass*\n\n✦ [ EXTRACCIÓN FORZADA ]\n  ⟡ Estado: *Exitoso*\n  ⟡ Método: *Fast-Scraping*\n  ⟡ Seguridad: *XLR4-Active*`

        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption,
            mimetype: 'video/mp4'
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        conn.sendMessage(m.chat, { 
            text: `❄︎ [ FALLO TOTAL ]\n\nInstagram ha bloqueado temporalmente todas las rutas de acceso. \n\n⟡ *Sugerencia:* Intenta con un link de TikTok o YouTube mientras se refrescan las IPs de los nodos.` 
        }, { quoted: m })
    }
}

handler.command = ['ig', 'instagram']
handler.tags = ['dl']

export default handler
