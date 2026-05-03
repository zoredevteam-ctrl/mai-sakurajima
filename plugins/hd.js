// ❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎
// ✦ [ PROTOCOLO DE MEJORA VISUAL / HD ]
// ⟡ Design & Control: Adrien | XLR4-Security

import { randomUUID } from 'crypto'
import { downloadMediaMessage } from '@whiskeysockets/baileys'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'
const PUBLIC_JWT = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiIiLCJhdWQiOiIiLCJpYXQiOjE1MjMzNjQ4MjQsIm5iZiI6MTUyMzM2NDgyNCwianRpIjoicHJvamVjdF9wdWJsaWNfYzkwNWRkMWMwMWU5ZmQ3NzY5ODNjYTQwZDBhOWQyZjNfT1Vzd2EwODA0MGI4ZDJjN2NhM2NjZGE2MGQ2MTBhMmRkY2U3NyJ9.qvHSXgCJgqpC4gd6-paUlDLFmg0o2DsOvb1EUYPYx_E'
const TOOL = 'upscaleimage'

const BASE_HEADERS = {
  'accept': 'application/json',
  'user-agent': UA,
  'referer': 'https://www.iloveimg.com/',
  'origin': 'https://www.iloveimg.com',
  'authorization': `Bearer ${PUBLIC_JWT}`
}

function multipart(fields, fileField) {
  const boundary = '----WebKitFormBoundary' + randomUUID().replace(/-/g, '').slice(0, 16)
  const parts = []
  for (const [name, val] of Object.entries(fields)) {
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${val}\r\n`))
  }
  if (fileField) {
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${fileField.name}"; filename="${fileField.filename}"\r\nContent-Type: ${fileField.mime}\r\n\r\n`))
    parts.push(fileField.buffer)
    parts.push(Buffer.from('\r\n'))
  }
  parts.push(Buffer.from(`--${boundary}--\r\n`))
  return { body: Buffer.concat(parts), contentType: `multipart/form-data; boundary=${boundary}` }
}

async function iloveimgUpscale(imageBuffer, filename) {
  const start = await fetch(`https://api.iloveimg.com/v1/start/${TOOL}`, { headers: BASE_HEADERS })
  const { server, task } = await start.json()

  const { body: upBody, contentType: upType } = multipart({ task }, { name: 'file', filename, mime: 'image/jpeg', buffer: imageBuffer })
  const upload = await fetch(`https://${server}/v1/upload`, { method: 'POST', headers: { ...BASE_HEADERS, 'content-type': upType }, body: upBody })
  const { server_filename } = await upload.json()

  const { body: procBody, contentType: procType } = multipart({
    'packaged_filename': 'hiyuki_hd',
    'task': task,
    'tool': TOOL,
    'files[0][server_filename]': server_filename,
    'files[0][filename]': filename,
    'multiplier': '4',
  })
  await fetch(`https://${server}/v1/process`, { method: 'POST', headers: { ...BASE_HEADERS, 'content-type': procType }, body: procBody })

  const res = await fetch(`https://${server}/v1/download/${task}`, { headers: { 'user-agent': UA, 'referer': 'https://www.iloveimg.com/' } })
  return Buffer.from(await res.arrayBuffer())
}

// ─── HANDLER PRINCIPAL ───────────────────────────────────────────────────────

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/image\/(jpe?g|png|webp)/.test(mime)) {
    const errorText = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR DE MUESTRA ]\n  ⟡ Responde a una imagen para iniciar la mejora.\n  ⟡ Uso: *${usedPrefix + command}*`
    return conn.sendMessage(m.chat, { text: errorText }, { quoted: m })
  }

  await m.react('⏳')

  try {
    let media = await downloadMediaMessage(
        q,
        'buffer',
        {},
        { logger: console, reuploadRequest: conn.updateMediaMessage }
    )
    
    if (!media) throw new Error('No se pudo descargar el buffer de la imagen.')

    let filename = `hiyuki_hd_${Date.now()}.jpg`
    const resultBuffer = await iloveimgUpscale(media, filename)

    await conn.sendMessage(m.chat, {
      image: resultBuffer,
      caption: `> ⟪❄︎⟫ Calidad Optimizada\n\n✦ [ REPORTE TÉCNICO ]\n  ⟡ Escala: *x4 (Ultra HD)*\n  ⟡ Motor: *Neural-XLR4*\n  ⟡ Estado: *Renderizado exitoso*`
    }, { quoted: m })

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    const failureText = `❄︎ [ FALLO DE SISTEMA ]\n⟡ Detalle: ${e.message}`
    conn.sendMessage(m.chat, { text: failureText }, { quoted: m })
  }
}

handler.help = ['hd', 'upscale']
handler.command = ['hd', 'upscale', 'mejorar']
handler.tags = ['tools']

export default handler
