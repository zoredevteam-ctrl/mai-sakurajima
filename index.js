import './settings.js'
import chalk from 'chalk'
import pino from 'pino'
import qrcode from 'qrcode-terminal'
import fs from 'fs'
import path from 'path'
import readlineSync from 'readline-sync'
import { fileURLToPath } from 'url'
import {
  Browsers,
  makeWASocket,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  jidDecode,
  DisconnectReason
} from '@whiskeysockets/baileys'
import { handler } from './handler.js'
import { database } from './lib/database.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pluginsDir = path.join(__dirname, 'plugins')
global.conns = []

// ─── LOGGER ───────────────────────────────────────────────────────────────────
const log = {
  info:    msg => console.log(chalk.bgCyan.black.bold('  INFO  ')   + ' ' + chalk.white(msg)),
  success: msg => console.log(chalk.bgAnsi256(51).black.bold(' SUCCESS') + ' ' + chalk.cyanBright(msg)),
  warn:    msg => console.log(chalk.bgYellow.black.bold('  WARN  ')  + ' ' + chalk.yellow(msg)),
  error:   msg => console.log(chalk.bgRed.white.bold('  ERROR ')    + ' ' + chalk.redBright(msg))
}

// ─── COLORES CELESTIAL ────────────────────────────────────────────────────────
const c1 = chalk.hex('#A8D8FF')
const c2 = chalk.hex('#6EC6FF')
const c3 = chalk.hex('#3A8FD5')
const c4 = chalk.hex('#C8E6FF')
const cG = chalk.hex('#E0F7FF')

// ─── BANNER ───────────────────────────────────────────────────────────────────
const maiBanner = `
${c3('╔══════════════════════════════════════════════╗')}
${c3('║')}                                              ${c3('║')}
${c3('║')}  ${c2('██╗  ██╗██╗██████╗ ██╗   ██╗██╗  ██╗ █████╗')}  ${c3('║')}
${c3('║')}  ${c2('██║  ██║██║██╔══██╗██║   ██║██║ ██╔╝██╔══██╗')} ${c3('║')}
${c3('║')}  ${c2('███████║██║██████╔╝██║   ██║█████╔╝ ███████║')}  ${c3('║')}
${c3('║')}  ${c2('██╔══██║██║██╔══██╗██║   ██║██╔═██╗ ██╔══██║')} ${c3('║')}
${c3('║')}  ${c1('██║  ██║██║██║  ██║╚██████╔╝██║  ██╗██║  ██║')} ${c3('║')}
${c3('║')}  ${c1('╚═╝  ╚═╝╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝')}${c3('║')}
${c3('║')}                                              ${c3('║')}
${c3('║')}  ${c4('✦ ──── ✧ ── C E L E S T I A L  M D ── ✧ ──── ✦')}${c3('║')}
${c3('║')}  ${cG.bold('  ˚₊· ͟͟͞͞  H I R U K A  |  Z0RT SYSTEMS        ')}  ${c3('║')}
${c3('║')}  ${chalk.gray('  Version: ' + (global.botVersion || '1.0.0') + '  |  Premium Owner Edition   ')}  ${c3('║')}
${c3('╚══════════════════════════════════════════════╝')}
`

// ─── CARGA DE PLUGINS ─────────────────────────────────────────────────────────
const plugins = new Map()

async function loadPlugins() {
  if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true })
  const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))
  for (const file of files) {
    try {
      const filePath = path.resolve(pluginsDir, file)
      const plugin   = (await import(`file://${filePath}?t=${Date.now()}`)).default
      if (plugin) {
        plugins.set(file, plugin)
        log.success(`Cargado: ${file}`)
      }
    } catch (e) {
      log.error(`Error en ${file}: ${e.message}`)
    }
  }
}

// ─── SESIÓN ───────────────────────────────────────────────────────────────────
global.sessionName = './Sessions/Owner'
if (!fs.existsSync(global.sessionName)) fs.mkdirSync(global.sessionName, { recursive: true })

const methodCodeQR = process.argv.includes('--qr')
const methodCode   = process.argv.includes('--code')

let opcion      = ''
let phoneNumber = ''

// ─── BOT ──────────────────────────────────────────────────────────────────────
async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(global.sessionName)
  const { version }          = await fetchLatestBaileysVersion()

  if (!methodCodeQR && !methodCode && !state.creds.registered && !opcion) {
    console.clear()
    console.log(maiBanner)
    console.log(chalk.bold.hex('#6EC6FF')('✦ SELECCIONA TU METODO DE VINCULACION:\n'))
    console.log(chalk.hex('#A8D8FF')('   [ 1 ]') + chalk.white(' Codigo QR'))
    console.log(chalk.hex('#A8D8FF')('   [ 2 ]') + chalk.white(' Codigo de 8 digitos'))
    opcion = readlineSync.question(chalk.bold.yellow('\n ─── ✦ Elige una opcion (1 o 2): ')).trim()

    if (opcion === '2') {
      phoneNumber = readlineSync
        .question(chalk.hex('#6EC6FF')('\n ✦ Ingresa tu numero (ej: 57310...): '))
        .replace(/\D/g, '')
    }
  }

  const conn = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: Browsers.ubuntu('Chrome'),
    auth: {
      creds: state.creds,
      keys:  makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    markOnlineOnConnect:            true,
    generateHighQualityLinkPreview: true,
    getMessage: async () => ({ conversation: 'Hiruka Celestial MD.' })
  })

  global.conn = conn

  conn.decodeJid = jid => {
    if (!jid) return jid
    const decode = jidDecode(jid) || {}
    return (decode.user && decode.server) ? `${decode.user}@${decode.server}` : jid
  }

  conn.ev.on('creds.update', saveCreds)

  if ((opcion === '2' || methodCode) && !state.creds.registered) {
    setTimeout(async () => {
      try {
        const code      = await conn.requestPairingCode(phoneNumber)
        const formatted = code?.match(/.{1,4}/g)?.join('-') || code
        console.log(
          chalk.bgHex('#3A8FD5').black.bold('\n ✦ TU CODIGO: ') +
          chalk.bgBlack.white.bold(` ${formatted} `) +
          '\n'
        )
      } catch (e) {
        log.error(`No se pudo obtener el codigo: ${e.message}`)
      }
    }, 3000)
  }

  // ─── EVENTO: CONEXION ─────────────────────────────────────────────────────
  conn.ev.on('connection.update', async update => {
    const { qr, connection, lastDisconnect } = update

    if (qr && (opcion === '1' || methodCodeQR)) {
      console.log(chalk.hex('#6EC6FF')('\n ✦ Escanea este codigo QR:'))
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      log.success(`Online: ${conn.user?.name || 'Hiruka Celestial MD'} ✓`)
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const reason     = lastDisconnect?.error?.message || 'Desconocido'

      if (statusCode !== DisconnectReason.loggedOut) {
        log.warn(`Reconectando... (razon: ${reason})`)
        startBot()
      } else {
        log.error('Sesion cerrada. Borra la carpeta Sessions para re-vincular.')
      }
    }
  })

  // ─── EVENTO: PARTICIPANTES DE GRUPO ──────────────────────────────────────
  conn.ev.on('group-participants.update', async (anu) => {
    try {
      for (const [, plugin] of plugins) {
        if (typeof plugin?.participantsUpdate === 'function') {
          try {
            await plugin.participantsUpdate(conn, anu, database.data)
          } catch (e) {
            console.error('[PARTICIPANTS PLUGIN ERROR]', e.message)
          }
        }
      }
    } catch (err) {
      log.error(`group-participants.update: ${err.message}`)
    }
  })

  // ─── EVENTO: MENSAJES ────────────────────────────────────────────────────
  conn.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    const m = messages[0]
    if (!m?.message) return
    const jid = m.key?.remoteJid || ''
    if (jid === 'status@broadcast') return
    if (jid.endsWith('@newsletter')) return
    try {
      await handler(m, conn, plugins)
    } catch (e) {
      log.error(`handler: ${e.message}`)
    }
  })
}

// ─── ARRANQUE ─────────────────────────────────────────────────────────────────
;(async () => {
  await database.read()

  if (database.data?.settings?.prefix) global.prefix = database.data.settings.prefix
  if (database.data?.settings?.banner) global.banner = database.data.settings.banner

  await loadPlugins()
  global.plugins = plugins
  await startBot()
})()
