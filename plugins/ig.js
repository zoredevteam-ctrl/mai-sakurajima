// ❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎
// ✦ [ PROTOCOLO DE EXTRACCIÓN INSTAGRAM ]
// ⟡ Design & Control: Adrien | XLR4-Security

import fetch from 'node-fetch'

const isInstagram = (url = '') => /instagram\.com/i.test(url)

const clean = (str = '') => {
  try {
    return decodeURIComponent(
      str.replace(/\\u0026/g, '&').replace(/\\u0025/g, '%').replace(/\\\//g, '/')
    )
  } catch { return str }
}

const agents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1"
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

function extractMedia(html = '') {
  let videos = []
  
  // Estrategia 1: JSON Video URL
  let jsonVideo = html.match(/"video_url":"([^"]+)"/g)
  if (jsonVideo) jsonVideo.forEach(v => videos.push(clean(v.split('"')[3])))

  // Estrategia 2: OpenGraph
  let ogVideo = html.match(/property="og:video" content="([^"]+)"/)
  if (ogVideo) videos.push(clean(ogVideo[1]))

  // Estrategia 3: CDN Direct
  let fallback = html.match(/https:\/\/video\.[^"]+\.cdninstagram\.com[^"]+/)
  if (fallback) videos.push(clean(fallback[0]))

  // Estrategia 4: DASH Manifest
  let dash = html.match(/"dash_manifest":"([^"]+)"/)
  if (dash) {
    let videoUrl = clean(dash[1]).match(/https:\/\/[^"]+\.mp4[^"]+/)
    if (videoUrl) videos.push(videoUrl[0])
  }

  return [...new Set(videos)].filter(v => v.startsWith('http'))
}

// ─── HANDLER PRINCIPAL ───────────────────────────────────────────────────────

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const url = args[0] || (m.quoted?.text ? m.quoted.text.trim() : '')

  if (!url || !isInstagram(url)) {
    const syntax = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR DE ENLACE ]\n  ⟡ Ingrese un link válido de Instagram.\n  ⟡ Uso: *${usedPrefix + command} <link>*`
    return conn.sendMessage(m.chat, { text: syntax }, { quoted: m })
  }

  await m.react('🕒')

  try {
    const html = await fetchHTML(url)
    const videos = extractMedia(html)

    if (!videos.length) throw new Error('NO_VIDEO_FOUND')

    await m.react('⬇️')

    const caption = `> ⟪❄︎⟫ Extracción Exitosa\n\n` +
                    `✦ [ REPORTE TÉCNICO ]\n` +
                    `  ⟡ Plataforma: *Instagram*\n` +
                    `  ⟡ Estado: *Descarga completada*\n` +
                    `  ⟡ Motor: *XLR4-Extraction*`

    await conn.sendMessage(m.chat, {
      video: { url: videos[0] },
      caption,
      mimetype: 'video/mp4'
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error('[IG ERROR]', e.message)
    await m.react('❌')
    
    let detail = 'Error inesperado en el nodo.'
    if (e.message.includes('HTTP')) detail = 'Error de conexión (Posible baneo de IP).'
    if (e.message === 'NO_VIDEO_FOUND') detail = 'Contenido privado o inaccesible sin login.'

    const failure = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ FALLO DE EXTRACCIÓN ]\n  ⟡ Detalle: ${detail}`
    conn.sendMessage(m.chat, { text: failure }, { quoted: m })
  }
}

handler.help = ['ig']
handler.command = ['ig', 'instagram', 'igdl']
handler.tags = ['dl']

export default handler
