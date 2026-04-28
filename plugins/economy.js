// plugins/economy.js
// ── Sistema de economía con personalidad troll de Hiruka ─────────────────────

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
                    title:                 global.botName || 'Hiruka Celestial MD',
                    body:                  '💰 Economía Hiruka',
                    mediaType:             1,
                    thumbnail:             thumb,
                    renderLargerThumbnail: false,
                    sourceUrl:             global.rcanal || ''
                }
            }
        }, { quoted: m })
    } catch {
        await m.reply(txt)
    }
}

const getUser = (sender) => {
    if (!database.data.users) database.data.users = {}
    if (!database.data.users[sender]) {
        database.data.users[sender] = {
            money: 0, bank: 0, exp: 0, level: 1,
            limit: 20, registered: false, premium: false,
            warning: 0, lastwork: 0, lastdaily: 0, lastrob: 0
        }
    }
    return database.data.users[sender]
}

// ── Nivel por exp ─────────────────────────────────────────────────────────────
const checkLevel = (user) => {
    const xpNeeded = user.level * 100
    if (user.exp >= xpNeeded) {
        user.level += 1
        user.exp   -= xpNeeded
        return true
    }
    return false
}

// ── Frases troll de Hiruka ────────────────────────────────────────────────────
const trollWork = [
    'limpiaste baños de un estadio',
    'vendiste calcetines usados en el mercado',
    'fuiste extra en una telenovela de las 3pm',
    'repartiste volantes bajo el sol a las 2pm',
    'cuidaste el carro de alguien que no volvió',
    'bailaste en una boda de desconocidos',
    'hiciste delivery en bicicleta bajo la lluvia',
    'vendiste empanadas pero te comiste la mitad',
    'trabajaste de niñero y los niños te traumaron',
    'fuiste influencer por 10 minutos y nadie te vio'
]

const trollRob = [
    'intentaste robar pero tropezaste y caíste al piso 💀',
    'el guardia de seguridad era tu vecino 😭',
    'te distrajiste viendo un gato y fallaste',
    'resbalaste con una cáscara de banano en pleno robo',
    'la víctima resultó ser karateca, huiste llorando',
    'intentaste huir pero olvidaste dónde estacionaste'
]

const trollDaily = [
    'el universo decidió ser amable contigo hoy... por accidente',
    'aquí tienes, no lo gastes en tonterías... bueno sí, hazlo',
    'Hiruka te da esto a regañadientes (¬_¬)',
    'supongo que te lo mereces... tal vez',
    'el subsidio diario de los que no tienen nada mejor que hacer'
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
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 💰 ✧ ⩾═══════╗\n` +
            `         「 𝖡𝖠𝖫𝖠𝖭𝖢𝖤 」\n` +
            `╚═══════⩽ ✧ 💰 ✧ ⩾═══════╝\n` +
            `┣ 🪷 efectivo: *$${(user.money || 0).toLocaleString()}*\n` +
            `┣ 🪷 banco: *$${(user.bank || 0).toLocaleString()}*\n` +
            `┣ 🪷 total: *$${total.toLocaleString()}*\n` +
            `┣ 🪷 nivel: *${user.level}* ─ exp: *${user.exp}*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝\n` +
            `🪷 ${total === 0 ? 'estás en quiebra. clásico. (⁠¬⁠_⁠¬⁠)' : total < 500 ? 'tienes cuatro pesos. no te hagas ilusiones.' : '¡no está mal! sigue así~ (⁠ ⁠´⁠◡⁠‿⁠◡⁠\`⁠)'}`
        )
    }

    // ── #chamba / #trabajar ───────────────────────────────────────────────────
    if (cmd === 'chamba' || cmd === 'trabajar' || cmd === 'work') {
        const cooldown = 30 * 60 * 1000 // 30 min
        const now      = Date.now()
        const diff     = now - (user.lastwork || 0)

        if (diff < cooldown) {
            const resta = Math.ceil((cooldown - diff) / 60000)
            return sendReply(conn, m,
                `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
                `╔═══════⩽ ✧ 😤 ✧ ⩾═══════╗\n` +
                `       「 𝖠𝖴𝖭 𝖭𝖮 😤 」\n` +
                `╚═══════⩽ ✧ 😤 ✧ ⩾═══════╝\n` +
                `┣ 🪷 ¿ya quieres más? qué ambición...\n` +
                `┣ 🪷 espera *${resta} min* antes de volver a chambear\n` +
                `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
            )
        }

        const ganado  = Math.floor(Math.random() * 400) + 100
        const expGain = Math.floor(Math.random() * 20) + 5
        user.money    = (user.money || 0) + ganado
        user.exp      = (user.exp   || 0) + expGain
        user.lastwork = now
        const subiNivel = checkLevel(user)

        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 💼 ✧ ⩾═══════╗\n` +
            `         「 𝖢𝖧𝖠𝖬𝖡𝖠 」\n` +
            `╚═══════⩽ ✧ 💼 ✧ ⩾═══════╝\n` +
            `┣ 🪷 hoy *${rand(trollWork)}*\n` +
            `┣ 🪷 ganaste: *$${ganado.toLocaleString()}*\n` +
            `┣ 🪷 exp: *+${expGain}*\n` +
            (subiNivel ? `┣ 🎉 *¡subiste al nivel ${user.level}!* no está mal para alguien tan mediocre\n` : '') +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝\n` +
            `🪷 vuelve en 30 min si no tienes nada mejor que hacer`
        )
    }

    // ── #daily ────────────────────────────────────────────────────────────────
    if (cmd === 'daily' || cmd === 'diario') {
        const cooldown = 24 * 60 * 60 * 1000
        const now      = Date.now()
        const diff     = now - (user.lastdaily || 0)

        if (diff < cooldown) {
            const horas = Math.ceil((cooldown - diff) / 3600000)
            return sendReply(conn, m,
                `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
                `╔═══════⩽ ✧ ⏰ ✧ ⩾═══════╗\n` +
                `     「 𝖸𝖠 𝖫𝖮 𝖳𝖮𝖬𝖠𝖲𝖳𝖤 」\n` +
                `╚═══════⩽ ✧ ⏰ ✧ ⩾═══════╝\n` +
                `┣ 🪷 ya reclamaste hoy. la codicia no es bonita\n` +
                `┣ 🪷 vuelve en *${horas}h* aproximadamente\n` +
                `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
            )
        }

        const ganado     = Math.floor(Math.random() * 300) + 200
        user.money       = (user.money || 0) + ganado
        user.lastdaily   = now

        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🎁 ✧ ⩾═══════╗\n` +
            `       「 𝖣𝖠𝖨𝖫𝖸 𝖱𝖤𝖶𝖠𝖱𝖣 」\n` +
            `╚═══════⩽ ✧ 🎁 ✧ ⩾═══════╝\n` +
            `┣ 🪷 ganaste: *$${ganado.toLocaleString()}*\n` +
            `┣ 🪷 ${rand(trollDaily)}\n` +
            `┣ 🪷 saldo: *$${(user.money).toLocaleString()}*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
    }

    // ── #dep — depositar al banco ─────────────────────────────────────────────
    if (cmd === 'dep' || cmd === 'depositar') {
        const cantidad = args[0] === 'all' ? user.money : parseInt(args[0])
        if (!cantidad || isNaN(cantidad) || cantidad <= 0) return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🏦 ✧ ⩾═══════╗\n` +
            `        「 𝖣𝖤𝖯𝖮𝖲𝖨𝖳𝖠𝖱 」\n` +
            `╚═══════⩽ ✧ 🏦 ✧ ⩾═══════╝\n` +
            `┣ 🪷 uso: *#dep <cantidad>* o *#dep all*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
        if (cantidad > user.money) return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🏦 ✧ ⩾═══════╗\n` +
            `        「 𝖣𝖤𝖯𝖮𝖲𝖨𝖳𝖠𝖱 」\n` +
            `╚═══════⩽ ✧ 🏦 ✧ ⩾═══════╝\n` +
            `┣ 🪷 no tienes *$${cantidad.toLocaleString()}* en efectivo 😭\n` +
            `┣ 🪷 tienes: *$${(user.money || 0).toLocaleString()}*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
        user.money -= cantidad
        user.bank  = (user.bank || 0) + cantidad
        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🏦 ✧ ⩾═══════╗\n` +
            `        「 𝖣𝖤𝖯𝖮𝖲𝖨𝖳𝖠𝖱 」\n` +
            `╚═══════⩽ ✧ 🏦 ✧ ⩾═══════╝\n` +
            `┣ 🪷 depositaste: *$${cantidad.toLocaleString()}*\n` +
            `┣ 🪷 banco: *$${(user.bank).toLocaleString()}*\n` +
            `┣ 🪷 efectivo: *$${(user.money).toLocaleString()}*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝\n` +
            `🪷 qué responsable... no te conocía ese lado (¬_¬)`
        )
    }

    // ── #retirar ──────────────────────────────────────────────────────────────
    if (cmd === 'retirar' || cmd === 'withdraw') {
        const cantidad = args[0] === 'all' ? user.bank : parseInt(args[0])
        if (!cantidad || isNaN(cantidad) || cantidad <= 0) return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🏦 ✧ ⩾═══════╗\n` +
            `         「 𝖱𝖤𝖳𝖨𝖱𝖠𝖱 」\n` +
            `╚═══════⩽ ✧ 🏦 ✧ ⩾═══════╝\n` +
            `┣ 🪷 uso: *#retirar <cantidad>* o *#retirar all*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
        if (cantidad > (user.bank || 0)) return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🏦 ✧ ⩾═══════╗\n` +
            `         「 𝖱𝖤𝖳𝖨𝖱𝖠𝖱 」\n` +
            `╚═══════⩽ ✧ 🏦 ✧ ⩾═══════╝\n` +
            `┣ 🪷 no tienes eso en el banco 😬\n` +
            `┣ 🪷 banco: *$${(user.bank || 0).toLocaleString()}*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
        user.bank  -= cantidad
        user.money = (user.money || 0) + cantidad
        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🏦 ✧ ⩾═══════╗\n` +
            `         「 𝖱𝖤𝖳𝖨𝖱𝖠𝖱 」\n` +
            `╚═══════⩽ ✧ 🏦 ✧ ⩾═══════╝\n` +
            `┣ 🪷 retiraste: *$${cantidad.toLocaleString()}*\n` +
            `┣ 🪷 efectivo: *$${(user.money).toLocaleString()}*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝\n` +
            `🪷 ya te gastaste todo ¿verdad? lo sé (⁠¬⁠_⁠¬⁠)`
        )
    }

    // ── #transferir ───────────────────────────────────────────────────────────
    if (cmd === 'transferir' || cmd === 'transfer' || cmd === 'pagar') {
        const target = m.mentionedJid?.[0] || m.quoted?.sender
        const cantidad = parseInt(args.find(a => !isNaN(a)))
        if (!target) return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 💸 ✧ ⩾═══════╗\n` +
            `       「 𝖳𝖱𝖠𝖭𝖲𝖥𝖤𝖱𝖨𝖱 」\n` +
            `╚═══════⩽ ✧ 💸 ✧ ⩾═══════╝\n` +
            `┣ 🪷 uso: *#transferir @usuario <cantidad>*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
        if (!cantidad || isNaN(cantidad) || cantidad <= 0) return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 💸 ✧ ⩾═══════╗\n` +
            `       「 𝖳𝖱𝖠𝖭𝖲𝖥𝖤𝖱𝖨𝖱 」\n` +
            `╚═══════⩽ ✧ 💸 ✧ ⩾═══════╝\n` +
            `┣ 🪷 indica una cantidad válida\n` +
            `┣ 🪷 uso: *#transferir @usuario 500*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
        if (cantidad > user.money) return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 💸 ✧ ⩾═══════╗\n` +
            `       「 𝖳𝖱𝖠𝖭𝖲𝖥𝖤𝖱𝖨𝖱 」\n` +
            `╚═══════⩽ ✧ 💸 ✧ ⩾═══════╝\n` +
            `┣ 🪷 no tienes suficiente efectivo 😭\n` +
            `┣ 🪷 tienes: *$${(user.money || 0).toLocaleString()}*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
        const targetUser = getUser(target)
        user.money        -= cantidad
        targetUser.money   = (targetUser.money || 0) + cantidad
        const targetNum    = target.split('@')[0]
        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 💸 ✧ ⩾═══════╗\n` +
            `       「 𝖳𝖱𝖠𝖭𝖲𝖥𝖤𝖱𝖨𝖱 」\n` +
            `╚═══════⩽ ✧ 💸 ✧ ⩾═══════╝\n` +
            `┣ 🪷 enviaste: *$${cantidad.toLocaleString()}*\n` +
            `┣ 🪷 para: *@${targetNum}*\n` +
            `┣ 🪷 tu saldo: *$${(user.money).toLocaleString()}*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝\n` +
            `🪷 qué generoso... o le debes algo (⁠¬⁠_⁠¬⁠)`
        )
    }

    // ── #robar ────────────────────────────────────────────────────────────────
    if (cmd === 'robar' || cmd === 'rob') {
        const target = m.mentionedJid?.[0] || m.quoted?.sender
        if (!target || target === sender) return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🦹 ✧ ⩾═══════╗\n` +
            `          「 𝖱𝖮𝖡𝖠𝖱 」\n` +
            `╚═══════⩽ ✧ 🦹 ✧ ⩾═══════╝\n` +
            `┣ 🪷 menciona a alguien para robarle\n` +
            `┣ 🪷 uso: *#robar @usuario*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )

        const cooldown = 60 * 60 * 1000
        const now      = Date.now()
        const diff     = now - (user.lastrob || 0)
        if (diff < cooldown) {
            const min = Math.ceil((cooldown - diff) / 60000)
            return sendReply(conn, m,
                `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
                `╔═══════⩽ ✧ 🦹 ✧ ⩾═══════╗\n` +
                `          「 𝖱𝖮𝖡𝖠𝖱 」\n` +
                `╚═══════⩽ ✧ 🦹 ✧ ⩾═══════╝\n` +
                `┣ 🪷 la policía aún te está buscando...\n` +
                `┣ 🪷 espera *${min} min* antes de volver a delinquir\n` +
                `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
            )
        }

        const targetUser = getUser(target)
        const targetNum  = target.split('@')[0]
        user.lastrob     = now
        const exito      = Math.random() > 0.45 // 55% de éxito

        if (!exito || (targetUser.money || 0) <= 0) {
            const multa = Math.floor(Math.random() * 100) + 50
            user.money  = Math.max(0, (user.money || 0) - multa)
            return sendReply(conn, m,
                `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
                `╔═══════⩽ ✧ 🚔 ✧ ⩾═══════╗\n` +
                `       「 𝖱𝖮𝖡𝖮 𝖥𝖠𝖫𝖫𝖨𝖣𝖮 」\n` +
                `╚═══════⩽ ✧ 🚔 ✧ ⩾═══════╝\n` +
                `┣ 🪷 ${rand(trollRob)}\n` +
                `┣ 🪷 te multaron *$${multa}* por intentarlo\n` +
                `┣ 🪷 saldo: *$${(user.money).toLocaleString()}*\n` +
                `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝\n` +
                `🪷 qué vergüenza. en serio. (⁠¬⁠_⁠¬⁠)`
            )
        }

        const robado        = Math.floor(Math.random() * (targetUser.money * 0.3)) + 50
        targetUser.money   -= robado
        user.money          = (user.money || 0) + robado

        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🦹 ✧ ⩾═══════╗\n` +
            `      「 𝖱𝖮𝖡𝖮 𝖤𝖷𝖨𝖳𝖮𝖲𝖮 」\n` +
            `╚═══════⩽ ✧ 🦹 ✧ ⩾═══════╝\n` +
            `┣ 🪷 le robaste *$${robado.toLocaleString()}* a @${targetNum}\n` +
            `┣ 🪷 tu saldo: *$${(user.money).toLocaleString()}*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝\n` +
            `🪷 Hiruka no aprueba esto... pero admite que fue limpio (⁠✿⁠◡⁠‿⁠◡⁠)`
        )
    }

    // ── #top — ranking ────────────────────────────────────────────────────────
    if (cmd === 'top' || cmd === 'ranking') {
        const users  = database.data?.users || {}
        const sorted = Object.entries(users)
            .sort((a, b) => ((b[1].money || 0) + (b[1].bank || 0)) - ((a[1].money || 0) + (a[1].bank || 0)))
            .slice(0, 10)

        if (!sorted.length) return sendReply(conn, m,
            `┣ 🪷 no hay nadie registrado aún. qué triste.`
        )

        const medals = ['🥇', '🥈', '🥉']
        const lista  = sorted.map(([jid, u], i) => {
            const total = ((u.money || 0) + (u.bank || 0)).toLocaleString()
            const name  = u.name || jid.split('@')[0]
            const med   = medals[i] || `${i + 1}.`
            return `┣ ${med} *${name}* ─ $${total}`
        }).join('\n')

        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🏆 ✧ ⩾═══════╗\n` +
            `        「 𝖳𝖮𝖯 𝖱𝖨𝖢𝖮𝖲 」\n` +
            `╚═══════⩽ ✧ 🏆 ✧ ⩾═══════╝\n` +
            `${lista}\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝\n` +
            `🪷 ¿no estás en el top? a trabajar entonces (⁠¬⁠_⁠¬⁠)`
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
