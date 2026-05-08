// plugins/economy.js
// ── Sistema de Economía Financiera (Hiyuki Celestial) ───────────────────────

import { database } from '../lib/database.js'

const getThumb = async () => {
    try {
        const res = await fetch(global.icono || global.banner || '')
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

// ── FIX MENCIONES: Se añadió el parámetro "mentions" ────────────────────────
const sendReply = async (conn, m, txt, mentions = []) => {
    const thumb = await getThumb()
    try {
        await conn.sendMessage(m.chat, {
            text: txt,
            mentions: mentions, // Aquí es donde ocurre la magia de la etiqueta
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid || '120363408182996815@newsletter',
                    serverMessageId: -1,
                    newsletterName:  '❄︎ 𝐇𝐢𝐲𝐮𝐤𝐢 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 ❄︎'
                },
                externalAdReply: {
                    title:                 '🏦 𝐙𝟎𝐑𝐓 𝐅𝐢𝐧𝐚𝐧𝐜𝐢𝐚𝐥 𝐒𝐲𝐬𝐭𝐞𝐦',
                    body:                  '𝐗𝐋𝐑𝟒 𝐄𝐜𝐨𝐧𝐨𝐦𝐲 𝐏𝐫𝐨𝐭𝐨𝐜𝐨𝐥',
                    mediaType:             1,
                    thumbnail:             thumb,
                    renderLargerThumbnail: false,
                    sourceUrl:             global.rcanal || ''
                }
            }
        }, { quoted: m })
    } catch {
        await conn.sendMessage(m.chat, { text: txt, mentions }, { quoted: m })
    }
}

const getUser = (sender) => {
    if (!database.data.users) database.data.users = {}
    if (!database.data.users[sender]) {
        database.data.users[sender] = {
            money: 0, bank: 0, exp: 0, level: 1,
            warning: 0, lastwork: 0, lastdaily: 0, lastrob: 0
        }
    }
    return database.data.users[sender]
}

const checkLevel = (user) => {
    const xpNeeded = user.level * 100
    if (user.exp >= xpNeeded) {
        user.level += 1
        user.exp   -= xpNeeded
        return true
    }
    return false
}

// ── FRASES ESTILO HIYUKI / XLR4 ───────────────────────────────────────────────
const cyberWork = [
    'desencriptaste una base de datos de bajo nivel',
    'auditaste la seguridad de un servidor local',
    'vendiste exploits obsoletos en la dark web',
    'hiciste mantenimiento de hardware a un novato',
    'minaste criptomonedas con el PC de tu vecino',
    'reparaste un bot genérico mal programado'
]

const cyberRob = [
    'el cortafuegos de Hiyuki bloqueó tu intento de extracción',
    'te rastrearon la IP; Hiyuki tuvo que borrar tus huellas',
    'el objetivo no tenía fondos. Patético.',
    'tu script falló en medio del ataque y el sistema te penalizó'
]

const rand = arr => arr[Math.floor(Math.random() * arr.length)]

// ─────────────────────────────────────────────────────────────────────────────

let handler = async (m, { conn, command, text, args }) => {
    const cmd    = command.toLowerCase()
    const sender = m.sender
    const user   = getUser(sender)

    // ── #bal — balance ────────────────────────────────────────────────────────
    if (cmd === 'bal' || cmd === 'balance' || cmd === 'dinero') {
        const total = (user.money || 0) + (user.bank || 0)
        return sendReply(conn, m,
            `╭───  ❄︎  *𝐙𝟎𝐑𝐓 𝐅𝐈𝐍𝐀𝐍𝐂𝐈𝐀𝐋* ───╮\n` +
            `       ᴇsᴛᴀᴅᴏ ᴅᴇ ᴄᴜᴇɴᴛᴀ\n\n` +
            `  ✦ *Efectivo:* $${(user.money || 0).toLocaleString()}\n` +
            `  ✦ *Banco:* $${(user.bank || 0).toLocaleString()}\n` +
            `  ✦ *Patrimonio:* $${total.toLocaleString()}\n` +
            `  ✦ *Nivel:* ${user.level} (EXP: ${user.exp})\n\n` +
            `> _${total === 0 ? 'Sin fondos detectados. Trabaja.' : 'Recursos financieros estables.'}_\n` +
            `╰──────────────────────────╯`
        )
    }

    // ── #chamba / #trabajar ───────────────────────────────────────────────────
    if (cmd === 'chamba' || cmd === 'trabajar' || cmd === 'work') {
        const cooldown = 30 * 60 * 1000 
        const now      = Date.now()
        const diff     = now - (user.lastwork || 0)

        if (diff < cooldown) {
            const resta = Math.ceil((cooldown - diff) / 60000)
            return sendReply(conn, m, `> ⏱️ _Protocolo bloqueado. Podrás ejecutar una nueva tarea en *${resta} min*._`)
        }

        const ganado  = Math.floor(Math.random() * 400) + 100
        const expGain = Math.floor(Math.random() * 20) + 5
        user.money    = (user.money || 0) + ganado
        user.exp      = (user.exp   || 0) + expGain
        user.lastwork = now
        const subiNivel = checkLevel(user)

        return sendReply(conn, m,
            `╭───  💼  *𝐓𝐀𝐑𝐄𝐀 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐃𝐀* ───╮\n` +
            `  ✦ *Actividad:* Hoy ${rand(cyberWork)}.\n` +
            `  ✦ *Ingreso:* +$${ganado.toLocaleString()}\n` +
            `  ✦ *Experiencia:* +${expGain} XP\n` +
            (subiNivel ? `  ✦ *Ascenso:* ¡Alcanzaste el Nivel ${user.level}!\n` : '') +
            `╰──────────────────────────╯`
        )
    }

    // ── #daily ────────────────────────────────────────────────────────────────
    if (cmd === 'daily' || cmd === 'diario') {
        const cooldown = 24 * 60 * 60 * 1000
        const diff     = Date.now() - (user.lastdaily || 0)

        if (diff < cooldown) return sendReply(conn, m, `> 🚫 _Asignación de recursos denegada. Ya reclamaste tu cuota de hoy._`)

        const ganado     = Math.floor(Math.random() * 300) + 200
        user.money       = (user.money || 0) + ganado
        user.lastdaily   = Date.now()

        return sendReply(conn, m,
            `╭───  🎁  *𝐂𝐔𝐎𝐓𝐀 𝐃𝐈𝐀𝐑𝐈𝐀* ───╮\n` +
            `  ✦ *Asignación:* +$${ganado.toLocaleString()}\n` +
            `  ✦ *Balance Actual:* $${(user.money).toLocaleString()}\n\n` +
            `> _Recursos inyectados por Hiyuki. No los malgastes._\n` +
            `╰──────────────────────╯`
        )
    }

    // ── #dep — depositar al banco ─────────────────────────────────────────────
    if (cmd === 'dep' || cmd === 'depositar') {
        const cantidad = args[0] === 'all' ? user.money : parseInt(args[0])
        if (!cantidad || isNaN(cantidad) || cantidad <= 0) return sendReply(conn, m, `> ⚠️ _Uso: *${command} <cantidad>* o *${command} all*_`)
        
        if (cantidad > user.money) return sendReply(conn, m, `> ❌ _Fondos insuficientes. Efectivo actual: $${(user.money || 0).toLocaleString()}_`)
        
        user.money -= cantidad
        user.bank  = (user.bank || 0) + cantidad
        return sendReply(conn, m, `> 🏦 _Se han transferido *$${cantidad.toLocaleString()}* a tu bóveda segura._`)
    }

    // ── #retirar ──────────────────────────────────────────────────────────────
    if (cmd === 'retirar' || cmd === 'withdraw') {
        const cantidad = args[0] === 'all' ? user.bank : parseInt(args[0])
        if (!cantidad || isNaN(cantidad) || cantidad <= 0) return sendReply(conn, m, `> ⚠️ _Uso: *${command} <cantidad>* o *${command} all*_`)
        
        if (cantidad > (user.bank || 0)) return sendReply(conn, m, `> ❌ _Fondos insuficientes. Balance en bóveda: $${(user.bank || 0).toLocaleString()}_`)
        
        user.bank  -= cantidad
        user.money = (user.money || 0) + cantidad
        return sendReply(conn, m, `> 💵 _Se han extraído *$${cantidad.toLocaleString()}* de tu bóveda._`)
    }

    // ── #transferir ───────────────────────────────────────────────────────────
    if (cmd === 'transferir' || cmd === 'transfer' || cmd === 'pagar') {
        const target = m.mentionedJid?.[0] || m.quoted?.sender
        const cantidad = parseInt(args.find(a => !isNaN(a)))
        
        if (!target) return sendReply(conn, m, `> ⚠️ _Etiqueta al destinatario._`)
        if (!cantidad || isNaN(cantidad) || cantidad <= 0) return sendReply(conn, m, `> ⚠️ _Indica una cantidad válida._`)
        if (cantidad > user.money) return sendReply(conn, m, `> ❌ _Fondos insuficientes. Tienes: $${(user.money || 0).toLocaleString()}_`)
        
        const targetUser = getUser(target)
        user.money        -= cantidad
        targetUser.money   = (targetUser.money || 0) + cantidad
        const targetNum    = target.split('@')[0]
        
        // El array de mentions [target] asegura que el @ sea clickeable
        return sendReply(conn, m,
            `╭───  💸  *𝐓𝐑𝐀𝐍𝐒𝐅𝐄𝐑𝐄𝐍𝐂𝐈𝐀* ───╮\n` +
            `  ✦ *Monto:* $${cantidad.toLocaleString()}\n` +
            `  ✦ *Destino:* @${targetNum}\n` +
            `  ✦ *Tu saldo restante:* $${(user.money).toLocaleString()}\n` +
            `╰────────────────────────╯`,
            [target] // ¡ESTO ES CLAVE PARA ARREGLAR TU BUG!
        )
    }

    // ── #robar ────────────────────────────────────────────────────────────────
    if (cmd === 'robar' || cmd === 'rob') {
        const target = m.mentionedJid?.[0] || m.quoted?.sender
        if (!target || target === sender) return sendReply(conn, m, `> ⚠️ _Etiqueta a un objetivo válido para extraer fondos._`)

        const cooldown = 60 * 60 * 1000
        const diff     = Date.now() - (user.lastrob || 0)
        
        if (diff < cooldown) return sendReply(conn, m, `> ⏱️ _Sistemas en alerta. Debes esperar *${Math.ceil((cooldown - diff) / 60000)} min* antes de otra vulneración._`)

        const targetUser = getUser(target)
        const targetNum  = target.split('@')[0]
        user.lastrob     = Date.now()
        const exito      = Math.random() > 0.45 

        if (!exito || (targetUser.money || 0) <= 0) {
            const multa = Math.floor(Math.random() * 100) + 50
            user.money  = Math.max(0, (user.money || 0) - multa)
            return sendReply(conn, m,
                `╭───  🚨  *𝐀𝐓𝐀𝐐𝐔𝐄 𝐈𝐍𝐓𝐄𝐑𝐂𝐄𝐏𝐓𝐀𝐃𝐎* ───╮\n` +
                `  ✦ ${rand(cyberRob)}\n` +
                `  ✦ *Penalización:* -$${multa.toLocaleString()}\n` +
                `╰───────────────────────────╯`,
                [target]
            )
        }

        const robado        = Math.floor(Math.random() * (targetUser.money * 0.3)) + 50
        targetUser.money   -= robado
        user.money          = (user.money || 0) + robado

        return sendReply(conn, m,
            `╭───  🦹  *𝐄𝐗𝐓𝐑𝐀𝐂𝐂𝐈𝐎́𝐍 𝐄𝐗𝐈𝐓𝐎𝐒𝐀* ───╮\n` +
            `  ✦ *Víctima:* @${targetNum}\n` +
            `  ✦ *Robado:* $${robado.toLocaleString()}\n` +
            `  ✦ *Nuevo saldo:* $${(user.money).toLocaleString()}\n` +
            `╰───────────────────────────╯`,
            [target]
        )
    }

    // ── #top — ranking ────────────────────────────────────────────────────────
    if (cmd === 'top' || cmd === 'ranking') {
        const users  = database.data?.users || {}
        const sorted = Object.entries(users)
            .sort((a, b) => ((b[1].money || 0) + (b[1].bank || 0)) - ((a[1].money || 0) + (a[1].bank || 0)))
            .slice(0, 10)

        if (!sorted.length) return sendReply(conn, m, `> ⚠️ _La base de datos financiera está vacía._`)

        const medals = ['🥇', '🥈', '🥉']
        const lista  = sorted.map(([jid, u], i) => {
            const total = ((u.money || 0) + (u.bank || 0)).toLocaleString()
            const name  = u.name || jid.split('@')[0]
            const med   = medals[i] || `  ${i + 1}.`
            return ` ${med} *${name}* ─ $${total}`
        }).join('\n')

        return sendReply(conn, m,
            `╭───  🏆  *𝐓𝐎𝐏 𝐅𝐈𝐍𝐀𝐍𝐂𝐈𝐄𝐑𝐎* ───╮\n` +
            `${lista}\n` +
            `╰────────────────────────╯`
        )
    }
}

handler.command = [
    'bal', 'balance', 'dinero',
    'chamba', 'trabajar', 'work',
    'daily', 'diario',
    'dep', 'depositar',
    'retirar', 'withdraw',
    'transferir', 'transfer', 'pagar',
    'robar', 'rob',
    'top', 'ranking'
]

export default handler
