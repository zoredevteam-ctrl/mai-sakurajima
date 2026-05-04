import fetch from 'node-fetch'

export async function gdriveDl(url) {
  if (!url?.match(/drive\.google/i)) throw '❌ URL no válida de Google Drive.'

  const idMatch = url.match(/\/d\/(.*?)\//) || url.match(/[?&]id=([^&]+)/)
  const id = idMatch?.[1]
  if (!id) throw '❌ No se pudo extraer el ID del archivo.'

  const res = await fetch(`https://drive.google.com/uc?id=${id}&authuser=0&export=download`, {
    method : 'post',
    headers: {
      'accept-encoding'    : 'gzip, deflate, br',
      'content-length'     : '0',
      'Content-Type'       : 'application/x-www-form-urlencoded;charset=UTF-8',
      'origin'             : 'https://drive.google.com',
      'user-agent'         : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36',
      'x-drive-first-party': 'DriveWebUi',
      'x-json-requested'   : 'true',
    },
  })

  const raw = await res.text()
  const { fileName, sizeBytes, downloadUrl } = JSON.parse(raw.slice(4))

  if (!downloadUrl) throw '❌ Límite de descarga alcanzado o el archivo es privado.'

  const head = await fetch(downloadUrl, { method: 'HEAD' })
  if (!head.ok) throw `❌ Error HTTP al verificar el archivo: ${head.statusText}`

  return {
    downloadUrl,
    fileName,
    sizeBytes : Number(sizeBytes),
    mimetype  : head.headers.get('content-type') || 'application/octet-stream',
  }
}

