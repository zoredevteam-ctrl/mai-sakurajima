// plugins/juegos.js
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
                    body:                  '🎮 Juegos Hiruka',
                    mediaType:             1,
                    thumbnail:             thumb,
                    renderLargerThumbnail: false,
                    sourceUrl:             global.rcanal || ''
                }
            }
        }, { quoted: m })
    } catch { await m.reply(txt) }
}

const getUser = (sender) => {
    if (!database.data.users) database.data.users = {}
    if (!database.data.users[sender]) database.data.users[sender] = { money: 0, bank: 0 }
    return database.data.users[sender]
}

const rand = arr => arr[Math.floor(Math.random() * arr.length)]

// ── 8ball respuestas ──────────────────────────────────────────────────────────
const respuestas8ball = [
    '✅ sí, definitivamente.',
    '✅ todo apunta a que sí.',
    '✅ sin duda alguna.',
    '✅ puedes contar con ello.',
    '🤔 es muy probable.',
    '🤔 las señales dicen que sí.',
    '🤔 pregunta de nuevo más tarde.',
    '🤔 no puedo predecirlo ahora.',
    '❌ no cuentes con ello.',
    '❌ mis fuentes dicen que no.',
    '❌ las perspectivas no son buenas.',
    '❌ definitivamente no.'
]

const trollsBall = [
    'Hiruka dice que ni pierdas el tiempo preguntando eso (⁠¬⁠_⁠¬⁠)',
    'la respuesta es obvia y aun así preguntaste... impresionante',
    'el universo prefiere no opinar sobre eso',
    'si tuvieras más fe no necesitarías preguntarme'
]

// ── Trivia ────────────────────────────────────────────────────────────────────
const triviaData = [
    { p: '¿Cuántos colores tiene el arcoíris?', r: '7', ops: ['5', '6', '7', '8'] },
    { p: '¿Cuál es el río más largo del mundo?', r: 'nilo', ops: ['amazonas', 'nilo', 'yangtsé', 'misisipi'] },
    { p: '¿En qué año llegó el hombre a la luna?', r: '1969', ops: ['1965', '1969', '1972', '1975'] },
    { p: '¿Cuántos huesos tiene el cuerpo humano adulto?', r: '206', ops: ['180', '196', '206', '215'] },
    { p: '¿Cuál es el planeta más grande del sistema solar?', r: 'júpiter', ops: ['saturno', 'júpiter', 'neptuno', 'urano'] },
    { p: '¿Cuántos lados tiene un hexágono?', r: '6', ops: ['5', '6', '7', '8'] },
    { p: '¿Cuál es el océano más grande?', r: 'pacífico', ops: ['atlántico', 'índico', 'pacífico', 'ártico'] },
    { p: '¿Cuántos continentes hay en el mundo?', r: '7', ops: ['5', '6', '7', '8'] },
    { p: '¿Cuál es el metal más ligero?', r: 'litio', ops: ['aluminio', 'litio', 'magnesio', 'titanio'] },
    { p: '¿En qué país se inventó el fútbol?', r: 'inglaterra', ops: ['brasil', 'argentina', 'inglaterra', 'alemania'] }
]

// Guardar trivias activas por chat
const triviaActiva = new Map()

let handler = async (m, { conn, command, text, args }) => {
    const cmd    = command.toLowerCase()
    const sender = m.sender
    const user   = getUser(sender)

    // ── #8ball ────────────────────────────────────────────────────────────────
    if (cmd === '8ball' || cmd === 'bola') {
        const pregunta = (text || '').trim()
        if (!pregunta) return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🎱 ✧ ⩾═══════╗\n` +
            `           「 𝟠𝖡𝖠𝖫𝖫 」\n` +
            `╚═══════⩽ ✧ 🎱 ✧ ⩾═══════╝\n` +
            `┣ 🪷 hazme una pregunta\n` +
            `┣ 🪷 uso: *#8ball ¿me irá bien hoy?*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
        const esTroll = Math.random() < 0.25
        const resp    = esTroll ? rand(trollsBall) : rand(respuestas8ball)
        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🎱 ✧ ⩾═══════╗\n` +
            `           「 𝟠𝖡𝖠𝖫𝖫 」\n` +
            `╚═══════⩽ ✧ 🎱 ✧ ⩾═══════╝\n` +
            `┣ 🪷 pregunta: *${pregunta}*\n` +
            `┣ 🎱 ${resp}\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
    }

    // ── #dado ─────────────────────────────────────────────────────────────────
    if (cmd === 'dado' || cmd === 'dice') {
        const apuesta = parseInt(args[0])
        if (!apuesta || isNaN(apuesta) || apuesta <= 0) return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🎲 ✧ ⩾═══════╗\n` +
            `           「 𝖣𝖠𝖣𝖮 」\n` +
            `╚═══════⩽ ✧ 🎲 ✧ ⩾═══════╝\n` +
            `┣ 🪷 uso: *#dado <apuesta>*\n` +
            `┣ 🪷 ejemplo: *#dado 200*\n` +
            `┣ 🪷 saca 4-6 para ganar x2\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
        if (apuesta > (user.money || 0)) return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🎲 ✧ ⩾═══════╗\n` +
            `           「 𝖣𝖠𝖣𝖮 」\n` +
            `╚═══════⩽ ✧ 🎲 ✧ ⩾═══════╝\n` +
            `┣ 🪷 no tienes *$${apuesta.toLocaleString()}*\n` +
            `┣ 🪷 efectivo: *$${(user.money || 0).toLocaleString()}*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
        const resultado = Math.floor(Math.random() * 6) + 1
        const gano      = resultado >= 4
        if (gano) {
            user.money = (user.money || 0) + apuesta
        } else {
            user.money = Math.max(0, (user.money || 0) - apuesta)
        }
        const caras = ['⚀','⚁','⚂','⚃','⚄','⚅']
        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🎲 ✧ ⩾═══════╗\n` +
            `           「 𝖣𝖠𝖣𝖮 」\n` +
            `╚═══════⩽ ✧ 🎲 ✧ ⩾═══════╝\n` +
            `┣ 🎲 resultado: *${caras[resultado - 1]} ${resultado}*\n` +
            `┣ 🪷 apuesta: *$${apuesta.toLocaleString()}*\n` +
            `┣ 🪷 ${gano ? `ganaste *$${apuesta.toLocaleString()}* 🎉` : `perdiste *$${apuesta.toLocaleString()}* 😭`}\n` +
            `┣ 🪷 saldo: *$${(user.money).toLocaleString()}*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝\n` +
            `🪷 ${gano ? 'no te acostumbres. fue suerte (⁠¬⁠_⁠¬⁠)' : 'Hiruka te dijo que no aposteras todo. no me escuchas (⁠¬⁠_⁠¬⁠)'}`
        )
    }

    // ── #ruleta ───────────────────────────────────────────────────────────────
    if (cmd === 'ruleta' || cmd === 'roulette') {
        const apuesta = parseInt(args[0])
        const color   = (args[1] || '').toLowerCase()
        if (!apuesta || isNaN(apuesta) || !['rojo', 'negro', 'verde'].includes(color)) return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🎰 ✧ ⩾═══════╗\n` +
            `          「 𝖱𝖴𝖫𝖤𝖳𝖠 」\n` +
            `╚═══════⩽ ✧ 🎰 ✧ ⩾═══════╝\n` +
            `┣ 🪷 uso: *#ruleta <apuesta> <color>*\n` +
            `┣ 🪷 colores: *rojo* x2 ┊ *negro* x2 ┊ *verde* x14\n` +
            `┣ 🪷 ejemplo: *#ruleta 200 rojo*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
        if (apuesta > (user.money || 0)) return sendReply(conn, m,
            `┣ 🪷 no tienes suficiente efectivo. tienes *$${(user.money || 0).toLocaleString()}*`
        )
        const numero   = Math.floor(Math.random() * 37)
        const esVerde  = numero === 0
        const esRojo   = !esVerde && numero % 2 === 1
        const esNegro  = !esVerde && !esRojo
        const resultado = esVerde ? 'verde' : esRojo ? 'rojo' : 'negro'
        const emojis   = { rojo: '🔴', negro: '⚫', verde: '🟢' }
        const mult     = color === 'verde' ? 14 : 2
        const gano     = resultado === color

        if (gano) {
            user.money = (user.money || 0) + apuesta * mult
        } else {
            user.money = Math.max(0, (user.money || 0) - apuesta)
        }

        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🎰 ✧ ⩾═══════╗\n` +
            `          「 𝖱𝖴𝖫𝖤𝖳𝖠 」\n` +
            `╚═══════⩽ ✧ 🎰 ✧ ⩾═══════╝\n` +
            `┣ 🎰 número: *${numero}* ${emojis[resultado]}\n` +
            `┣ 🪷 apostaste: *${color}* — salió *${resultado}*\n` +
            `┣ 🪷 ${gano ? `ganaste *$${(apuesta * mult).toLocaleString()}* 🎉` : `perdiste *$${apuesta.toLocaleString()}* 😭`}\n` +
            `┣ 🪷 saldo: *$${(user.money).toLocaleString()}*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝\n` +
            `🪷 ${gano ? '¡suerte de principiante! (⁠✿⁠◡⁠‿⁠◡⁠)' : 'la ruleta siempre gana. lección del día (⁠¬⁠_⁠¬⁠)'}`
        )
    }

    // ── #trivia ───────────────────────────────────────────────────────────────
    if (cmd === 'trivia') {
        if (triviaActiva.has(m.chat)) return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🧠 ✧ ⩾═══════╗\n` +
            `          「 𝖳𝖱𝖨𝖵𝖨𝖠 」\n` +
            `╚═══════⩽ ✧ 🧠 ✧ ⩾═══════╝\n` +
            `┣ 🪷 ya hay una trivia activa en este chat\n` +
            `┣ 🪷 responde con *#respuesta <opción>*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
        const q       = rand(triviaData)
        const ops     = q.ops.sort(() => Math.random() - 0.5)
        const letras  = ['A', 'B', 'C', 'D']
        const opcTxt  = ops.map((o, i) => `┣ 🪷 *${letras[i]})* ${o}`).join('\n')
        const idx     = ops.indexOf(q.r) === -1
            ? ops.findIndex(o => o.toLowerCase() === q.r.toLowerCase())
            : ops.indexOf(q.r)
        triviaActiva.set(m.chat, { respuesta: q.r, letra: letras[idx], premio: 150, timeout: setTimeout(() => {
            triviaActiva.delete(m.chat)
        }, 60000) })

        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🧠 ✧ ⩾═══════╗\n` +
            `          「 𝖳𝖱𝖨𝖵𝖨𝖠 」\n` +
            `╚═══════⩽ ✧ 🧠 ✧ ⩾═══════╝\n` +
            `┣ 🪷 *${q.p}*\n` +
            `┣\n` +
            `${opcTxt}\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝\n` +
            `🪷 usa *#respuesta A/B/C/D* — tienes 60 seg\n` +
            `🪷 premio: *$150* si aciertas`
        )
    }

    // ── #respuesta ────────────────────────────────────────────────────────────
    if (cmd === 'respuesta' || cmd === 'resp') {
        const trivia = triviaActiva.get(m.chat)
        if (!trivia) return sendReply(conn, m,
            `┣ 🪷 no hay trivia activa. usa *#trivia* para empezar`
        )
        const resp = (args[0] || '').toUpperCase()
        if (!['A','B','C','D'].includes(resp)) return sendReply(conn, m,
            `┣ 🪷 responde con *A*, *B*, *C* o *D*`
        )
        const correcto = resp === trivia.letra
        clearTimeout(trivia.timeout)
        triviaActiva.delete(m.chat)

        if (correcto) {
            user.money = (user.money || 0) + trivia.premio
            user.exp   = (user.exp   || 0) + 30
        }

        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🧠 ✧ ⩾═══════╗\n` +
            `          「 𝖳𝖱𝖨𝖵𝖨𝖠 」\n` +
            `╚═══════⩽ ✧ 🧠 ✧ ⩾═══════╝\n` +
            `┣ 🪷 respuesta correcta: *${trivia.letra}) ${trivia.respuesta}*\n` +
            `┣ 🪷 tu respuesta: *${resp}*\n` +
            `┣ 🪷 ${correcto ? `¡correcto! ganaste *$${trivia.premio}* y *+30 exp* 🎉` : `incorrecto. estudia más (⁠¬⁠_⁠¬⁠)`}\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
    }

    // ── #adivinanza ───────────────────────────────────────────────────────────
    if (cmd === 'adivinanza') {
        const adivinanzas = [
            { p: 'Tengo ciudades pero no casas, montañas pero no árboles, agua pero no peces. ¿Qué soy?', r: 'mapa' },
            { p: 'Cuanto más me secas, más mojado me vuelvo. ¿Qué soy?', r: 'toalla' },
            { p: 'Vuelo sin alas, lloro sin ojos. ¿Qué soy?', r: 'nube' },
            { p: 'Tengo manos pero no puedo aplaudir. ¿Qué soy?', r: 'reloj' },
            { p: 'Soy ligero como una pluma pero ni el hombre más fuerte puede sostenerme por 5 minutos. ¿Qué soy?', r: 'aliento' },
            { p: 'Entre más grande, menos puedes ver. ¿Qué soy?', r: 'oscuridad' },
            { p: 'Tengo dientes pero no puedo morder. ¿Qué soy?', r: 'peine' },
            { p: 'Soy siempre delante tuyo pero no puedes verme. ¿Qué soy?', r: 'futuro' }
        ]
        const q = rand(adivinanzas)
        triviaActiva.set(m.chat + '_adi', { respuesta: q.r, premio: 100, timeout: setTimeout(() => {
            triviaActiva.delete(m.chat + '_adi')
        }, 90000) })

        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🤔 ✧ ⩾═══════╗\n` +
            `       「 𝖠𝖣𝖨𝖵𝖨𝖭𝖠𝖭𝖹𝖠 」\n` +
            `╚═══════⩽ ✧ 🤔 ✧ ⩾═══════╝\n` +
            `┣ 🪷 *${q.p}*\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝\n` +
            `🪷 usa *#respadi <respuesta>* — tienes 90 seg\n` +
            `🪷 premio: *$100*`
        )
    }

    // ── #respadi ──────────────────────────────────────────────────────────────
    if (cmd === 'respadi') {
        const adi = triviaActiva.get(m.chat + '_adi')
        if (!adi) return sendReply(conn, m, `┣ 🪷 no hay adivinanza activa. usa *#adivinanza*`)
        const resp     = (text || '').trim().toLowerCase()
        const correcto = resp === adi.respuesta.toLowerCase()
        clearTimeout(adi.timeout)
        triviaActiva.delete(m.chat + '_adi')

        if (correcto) {
            user.money = (user.money || 0) + adi.premio
            user.exp   = (user.exp   || 0) + 20
        }

        return sendReply(conn, m,
            `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n` +
            `╔═══════⩽ ✧ 🤔 ✧ ⩾═══════╗\n` +
            `       「 𝖠𝖣𝖨𝖵𝖨𝖭𝖠𝖭𝖹𝖠 」\n` +
            `╚═══════⩽ ✧ 🤔 ✧ ⩾═══════╝\n` +
            `┣ 🪷 respuesta: *${adi.respuesta}*\n` +
            `┣ 🪷 ${correcto ? `¡correcto! *+$${adi.premio}* y *+20 exp* 🎉` : `incorrecto (⁠¬⁠_⁠¬⁠) era "${adi.respuesta}"`}\n` +
            `╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`
        )
    }
}

handler.command = ['8ball', 'bola', 'dado', 'dice', 'ruleta', 'roulette', 'trivia', 'respuesta', 'resp', 'adivinanza', 'respadi']
export default handler
