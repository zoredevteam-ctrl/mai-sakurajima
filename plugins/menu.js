const getBannerBuffer = async (bannerSrc) => {
    if (!bannerSrc) return null
    try {
        if (bannerSrc.startsWith('data:image')) return Buffer.from(bannerSrc.split(',')[1], 'base64')
        const res = await fetch(bannerSrc)
        if (!res.ok) return null
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

let handler = async (m, { conn, usedPrefix }) => {
    const bannerSrc = global.banner || 'https://causas-files.vercel.app/fl/gl13.jpg'
    const canalLink = global.rcanal || ''
    const sender    = m.sender
    const username  = m.pushName || 'Usuario'

    // ── FECHA Y MOMENTO ───────────────────────────────────────────────────────
    const now       = new Date()
    const date      = new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', day: '2-digit', month: '2-digit', year: 'numeric' }).format(now)
    const hora      = new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', hour: 'numeric', hour12: false }).format(now)
    const h         = parseInt(hora)
    const momentDay = h < 12 ? 'mañana' : h < 18 ? 'tarde' : 'noche'

    // ── UPTIME ────────────────────────────────────────────────────────────────
    const sec    = Math.floor(process.uptime())
    const ud     = Math.floor(sec / 86400)
    const uh     = Math.floor((sec % 86400) / 3600)
    const um     = Math.floor((sec % 3600) / 60)
    const uptime = ud > 0 ? `${ud}d ${uh}h ${um}m` : `${uh}h ${um}m`

    // ── DATOS ─────────────────────────────────────────────────────────────────
    const dbData   = global.db?.data || {}
    const users    = dbData.users || {}
    const totalreg = Object.keys(users).length
    const userData = users[sender] || {}
    const coins    = (userData.money || 0).toLocaleString()
    const level    = userData.level || 1
    const exp      = (userData.exp  || 0).toLocaleString()
    const px       = usedPrefix || '#'

    // ── Owner check (Optimizado con Set) ──────────────────────────────────────
    const senderNum = sender.split('@')[0].split(':')[0]
    const ownersSet = new Set((Array.isArray(global.owner) ? global.owner : [global.owner]).map(o => String(Array.isArray(o) ? o[0] : o).replace(/\D/g, '')))
    const esOwner   = ownersSet.has(senderNum)

    // ── MENÚ USUARIOS ─────────────────────────────────────────────────────────
    const menuUsuarios = `
❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎

✦ Saludos, ${username}. 
Sistema iniciado correctamente esta ${momentDay}.

╔═══════⩽ ✧ ❄︎ ✧ ⩾═══════╗
       「 I N F O  S I S T E M A 」
╚═══════⩽ ✧ ❄︎ ✧ ⩾═══════╝
║ ✦ *Creadores*: Adrien
║ ✦ *Estado*: Online / Estable
║ ✦ *Fecha*: ${date}
║ ✦ *Uptime*: ${uptime}
║ ✦ *Usuarios*: ${totalreg}
╚════════════════════════╝

╔═══════⩽ ✧ ❄️ ✧ ⩾═══════╗
     「 I N F O  U S U A R I O 」
╚═══════⩽ ✧ ❄️ ✧ ⩾═══════╝
║ ✦ *Nombre*: ${username}
║ ✦ *Nivel*: ${level}
║ ✦ *EXP*: ${exp}
║ ✦ *Coins*: ${coins}
╚═══════════════════════╝

╔═══════⩽ ✧ ⚔︎ ✧ ⩾═══════╗
  「 C O M A N D O S  G E N E R A L E S 」
╚═══════⩽ ✧ ⚔︎ ✧ ⩾═══════╝
╰─➤ ❄︎
┣ ✦ *${px}ping* ┊ Latencia
┣ ✦ *${px}uptime* ┊ Tiempo activo
┣ ✦ *${px}menu* ┊ Este menú
┣ ✦ *${px}owner* ┊ Contacto
┣ ✦ *${px}reg* ┊ Registrarse
┣ ✦ *${px}clima* ┊ Clima
┣ ✦ *${px}sticker* ┊ Crear sticker
┣ ✦ *${px}toimg* ┊ Sticker → imagen

╔═══════⩽ ✧ ❄︎ ✧ ⩾═══════╗
    「 C O M A N D O S  G R U P O 」
╚═══════⩽ ✧ ❄︎ ✧ ⩾═══════╝
╰─➤ ❄︎
┣ ✦ *${px}kick* ┊ Expulsar
┣ ✦ *${px}add* ┊ Agregar
┣ ✦ *${px}ban* ┊ Banear
┣ ✦ *${px}tagall* ┊ Mencionar todos
┣ ✦ *${px}grupinfo* ┊ Info grupo
┣ ✦ *${px}antilink* ┊ Antilink
┣ ✦ *${px}warn* ┊ Advertir
┣ ✦ *${px}hidemensaje* ┊ Borrar mensaje
┣ ✦ *${px}welcome on/off* ┊ Bienvenida
┣ ✦ *${px}goodbye on/off* ┊ Despedida

╔═══════⩽ ✧ ❄️ ✧ ⩾═══════╗
   「 C O M A N D O S  P E R F I L 」
╚═══════⩽ ✧ ❄️ ✧ ⩾═══════╝
╰─➤ ❄︎
┣ ✦ *${px}perfil* ┊ Ver perfil
┣ ✦ *${px}userinfo* ┊ Info usuario
┣ ✦ *${px}setbio* ┊ Cambiar bio
┣ ✦ *${px}setbirthday* ┊ Cumpleaños

╔═══════⩽ ✧ ❄︎ ✧ ⩾═══════╗
    「 E C O N O M Í A 」
╚═══════⩽ ✧ ❄︎ ✧ ⩾═══════╝
╰─➤ ❄︎
┣ ✦ *${px}bal* ┊ Balance
┣ ✦ *${px}chamba* ┊ Trabajar
┣ ✦ *${px}daily* ┊ Recompensa diaria
┣ ✦ *${px}dep* ┊ Depositar
┣ ✦ *${px}retirar* ┊ Retirar
┣ ✦ *${px}transferir* ┊ Enviar
┣ ✦ *${px}robar* ┊ Robar
┣ ✦ *${px}top* ┊ Ranking

╔═══════⩽ ✧ ❄︎ ✧ ⩾═══════╗
    「 S O C I A L 」
╚═══════⩽ ✧ ❄︎ ✧ ⩾═══════╝
╰─➤ ❄︎
┣ ✦ *${px}casar* ┊ Casarse
┣ ✦ *${px}divorcio* ┊ Divorciarse
┣ ✦ *${px}adoptar* ┊ Adoptar

╔═══════⩽ ✧ ❄︎ ✧ ⩾═══════╗
    「 J U E G O S 」
╚═══════⩽ ✧ ❄︎ ✧ ⩾═══════╝
╰─➤ ❄︎
┣ ✦ *${px}8ball* ┊ Bola mágica
┣ ✦ *${px}dado* ┊ Tirar dado
┣ ✦ *${px}ruleta* ┊ Ruleta
┣ ✦ *${px}trivia* ┊ Trivia
┣ ✦ *${px}adivinanza* ┊ Adivinanza

╔═══════⩽ ✧ ❄︎ ✧ ⩾═══════╗
   「 R E A C C I O N E S 」
╚═══════⩽ ✧ ❄︎ ✧ ⩾═══════╝
╰─➤ ❄︎
┣ ✦ *${px}kiss* ┊ Besar
┣ ✦ *${px}hug* ┊ Abrazar
┣ ✦ *${px}pat* ┊ Palmear
┣ ✦ *${px}kill* ┊ Matar
┣ ✦ *${px}bite* ┊ Morder
┣ ✦ *${px}cry* ┊ Llorar
┣ ✦ *${px}happy* ┊ Feliz
┣ ✦ *${px}angry* ┊ Enojado
┣ ✦ *${px}cuddle* ┊ Acurrucarse
┣ ✦ *${px}neko* ┊ Neko
┣ ✦ *${px}cafe* ┊ Café
┣ ✦ *${px}dormir* ┊ Dormir
┣ ✦ *${px}push* ┊ Empujar
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

✦ Powered by Adrien | XLR4-Security ✦`.trim()

    // ── MENÚ OWNER ────────────────────────────────────────────────────────────
    const menuOwner = menuUsuarios + `

╔═══════⩽ ✧ ❄︎ ✧ ⩾═══════╗
    「 C O M A N D O S  O W N E R 」
╚═══════⩽ ✧ ❄︎ ✧ ⩾═══════╝
╰─➤ ❄︎
┣ ✦ *${px}addpremium* ┊ Dar premium
┣ ✦ *${px}delpremium* ┊ Quitar premium
┣ ✦ *${px}listpremium* ┊ Ver premiums
┣ ✦ *${px}addowner* ┊ Añadir owner
┣ ✦ *${px}delowner* ┊ Quitar owner
┣ ✦ *${px}listowner* ┊ Ver owners
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`

    const txt          = esOwner ? menuOwner : menuUsuarios
    const bannerBuffer = await getBannerBuffer(bannerSrc)

    try {
        await conn.sendMessage(m.chat, {
            document:    bannerBuffer || Buffer.from(''),
            mimetype:    'application/pdf',
            fileName:    `⌜ ❄︎ 𝐇𝐢𝐲𝐮𝐤𝐢 𝐒𝐲𝐬𝐭𝐞𝐦 ❄︎ ⌟`,
            fileLength:  99999999999999,
            pageCount:   1,
            caption:     txt,
            contextInfo: {
                isForwarded:     true,
                forwardingScore: 99,
                externalAdReply: {
                    title:                 `❄︎ 𝖧𝖨𝖸𝖴𝖪𝖨 𝖲𝖸𝖲𝖳𝖤𝖬 ❄︎`,
                    body:                  `✦ XLR4-Security Protocol`,
                    mediaType:             1,
                    thumbnail:             bannerBuffer,
                    renderLargerThumbnail: true,
                    sourceUrl:             canalLink
                },
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid  || '120363408182996815@newsletter',
                    newsletterName:  global.newsletterName || '「 ❄︎ 𝐇𝐢𝐲𝐮𝐤𝐢 𝐒𝐲𝐬𝐭𝐞𝐦 ❄︎ 」',
                    serverMessageId: -1
                }
            }
        }, { quoted: m })
    } catch (e) {
        console.error(e)
        await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
    }
}

handler.command = ['menu', 'help', 'comandos']
export default handler
