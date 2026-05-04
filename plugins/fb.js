// ❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎
// ✦ [ PROTOCOLO DE EXTRACCIÓN FACEBOOK ]
// ⟡ Design & Control: Adrien | XLR4-Security

import fetch from 'node-fetch'

const isFacebook = (url = '') => /facebook\.com|fb\.watch/i.test(url)
const clean = (str = '') => str.replace(/\\u0025/g, '%').replace(/\\\//g, '/').replace(/&amp;/g, '&')

const toMobile = (url = '') => url.replace(/(www\.|m\.)?facebook\.com/, 'm.facebook.com')
const toBasic = (url = '') => url.replace(/(www\.|m\.)?facebook\.com/, 'mbasic.facebook.com')

const agents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
]

async function fetchHTML(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": agents[Math.floor(Math.random() * agents.length)],
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "es-ES,es;q=0.9"
    }
  })
  if (!res.ok) throw new Error(`Señal interrumpida (HTTP ${res.status})`)
  return await res.text()
}

function extractAll(html = '') {
  const results = []
  const regexes = [
    /"browser_native_hd_url":"([^"]+)"/g,
    /"playable_url_quality_hd":"([^"]+)"/g,
    /"playable_url":"([^"]+)"/g,
    /(https:\/\/video\.[^"]+\.fbcdn\.net[^"]+)/g
  ]

  for (const regex of regexes) {
    let match
    while ((match = regex.exec(html)) !== null) {
      results.push(clean(match[1] || match[0]))
    }
  }
  return results.filter(v => v.startsWith('http'))
}

// ─── HANDLER PRINCIPAL ───────────────────────────────────────────────────────

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const url = args[0] || (m.quoted?.text ? m.quoted.text.trim() : '')

  if (!url || !isFacebook(url)) {
    const syntax = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR DE ENLACE ]\n  ⟡ Ingrese un link válido de Facebook.\n  ⟡ Uso: *${usedPrefix + command} <link>*`
    return conn.sendMessage(m.chat, { text: syntax }, { quoted: m })
  }

  await m.react('🕒')

  try {
    // Intento 1: Extracción de metadatos de escritorio
    let html = await fetchHTML(url)
    let videos = [...new Set(extractAll(html))]

    // Intento 2: Renderizado móvil si el primero falla
    if (!videos.length) {
      html = await fetchHTML(toMobile(url))
      videos = extractAll(html)
    }

    // Intento 3: Versión básica (Legacy)
    if (!videos.length) {
      html = await fetchHTML(toBasic(url))
      videos = extractAll(html)
    }

    if (!videos.length) throw new Error('No se interceptó flujo de video público.')

    const video = videos[0]
    await m.react('⬇️')

    const caption = `> ⟪❄︎⟫ Extracción Exitosa\n\n` +
                    `✦ [ REPORTE TÉCNICO ]\n` +
                    `  ⟡ Plataforma: *Facebook*\n` +
                    `  ⟡ Estado: *Descarga completada*\n` +
                    `  ⟡ Sello: *XLR4-Security*`

    await conn.sendMessage(m.chat, {
      video: { url: video },
      caption,
      mimetype: 'video/mp4'
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error('[FB ERROR]', e.message)
    await m.react('❌')
    
    let detail = 'Error desconocido en el nodo.'
    if (e.message.includes('HTTP')) detail = 'Error de conexión con los servidores de FB.'
    if (e.message.includes('público')) detail = 'El video es privado o requiere autenticación.'

    const failure = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ FALLO DE EXTRACCIÓN ]\n  ⟡ Detalle: ${detail}`
    conn.sendMessage(m.chat, { text: failure }, { quoted: m })
  }
}

handler.help = ['fb']
handler.command = ['fb', 'facebook', 'fbdl']
handler.tags = ['dl']

export default handler
