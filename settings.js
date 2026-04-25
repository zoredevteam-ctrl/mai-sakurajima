import fs from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

// ━─── ✦ ───━  IDENTIDAD  ━─── ✦ ───━

global.botName    = 'Mai Sakurajima'
global.ownerName  = '˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ'
global.botVersion = '1.0.0'

global.owner = [
  ['573107400303', '˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ', true],
  ['123613520896125', '˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ LID', true]
]

global.owners = global.owner.map(v => v[0])
global.mods   = []
global.prems  = []

global.prefix = '#'

// ━─── ✦ ───━  ENLACES  ━─── ✦ ───━

global.rcanal = 'https://whatsapp.com/channel/0029Vb85bh7EAKWOM4Zw8N3G'

global.newsletterJid  = '120363408182996815@newsletter'
global.newsletterName = '⌜ ✦ 𝐌𝐚𝐢 𝐒𝐚𝐤𝐮𝐫𝐚𝐣𝐢𝐦𝐚 ✦ 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐎𝐰𝐧𝐞𝐫 ⌟'

// Banner principal (imagen grande para menú)
global.banner = 'https://causas-files.vercel.app/fl/srzh.jpg'

// Icono (imagen pequeña para comandos)
global.icono  = 'https://causas-files.vercel.app/fl/gl13.jpg'

// ━─── ✦ ───━  HELPERS DE IMAGEN  ━─── ✦ ───━

// Banner grande — para menú y bienvenidas
global.getBannerThumb = async () => {
    try {
        const res = await fetch(global.banner)
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

// Icono pequeño — para comandos normales
global.getIconThumb = async () => {
    try {
        const res = await fetch(global.icono)
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

// ━─── ✦ ───━  NEWSLETTER CONTEXT  ━─── ✦ ───━

// useBanner: true = imagen grande (menú), false = icono pequeño (comandos)
global.getNewsletterCtx = (thumbnail = null, title = null, body = null, renderLarge = false) => {
    return {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid:   global.newsletterJid,
            serverMessageId: -1,
            newsletterName:  global.newsletterName
        },
        externalAdReply: {
            title:                 title || `✦ ${global.botName}`,
            body:                  body  || '˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ',
            mediaType:             1,
            mediaUrl:              global.rcanal,
            sourceUrl:             global.rcanal,
            thumbnail,
            showAdAttribution:     false,
            containsAutoReply:     true,
            renderLargerThumbnail: renderLarge
        }
    }
}

// ━─── ✦ ───━  MENSAJES DE SISTEMA  ━─── ✦ ───━

global.mess = {
    wait:     '⪧ un momento ⪦ (⁠✿⁠◡⁠‿⁠◡⁠)',
    success:  '⪧ listo ⪦ (⁠ ⁠´⁠◡⁠‿⁠◡⁠`⁠)',
    error:    '⪧ algo salió mal ⪦ (⁠˘⁠︶⁠˘⁠)⁠.⁠｡⁠*⁠♡',
    owner:    '⪧ solo para el owner ⪦',
    group:    '⪧ solo en grupos ⪦',
    admin:    '⪧ solo administradores ⪦',
    botAdmin: '⪧ necesito ser admin ⪦',
    restrict: '⪧ función bloqueada ⪦',
    notReg:   '⪧ primero regístrate ⪦'
}

// ━─── ✦ ───━  AUTO-RELOAD  ━─── ✦ ───━

const file = fileURLToPath(import.meta.url)
fs.watchFile(file, async () => {
    try {
        fs.unwatchFile(file)
        console.log(chalk.cyanBright('\n✦ [SETTINGS] Recargado.'))
        await import(`${file}?update=${Date.now()}`)
    } catch (e) {
        console.error(chalk.red('[!] Error en auto-reload:'), e)
    }
})

export default global