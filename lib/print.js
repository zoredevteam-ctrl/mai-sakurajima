import chalk from 'chalk'

const c1 = chalk.hex('#E8C5D4')   // rosa suave
const c2 = chalk.hex('#F2A7C3')   // rosa medio
const c3 = chalk.hex('#C48FA0')   // rosa oscuro
const cg = chalk.gray

const printLog = async (hasPrefix, sender, chat, body, pushName, conn = null) => {
    if (!body) return

    try {
        const now      = new Date()
        const time     = now.toLocaleTimeString('es-CO',  { hour12: false, timeZone: 'America/Bogota' })
        const date     = now.toLocaleDateString('es-CO',  { timeZone: 'America/Bogota' })
        const num      = (sender || '').split('@')[0].split(':')[0]
        const nombre   = pushName || num
        const bodyShort = (body || '').slice(0, 80)
        const tipo     = hasPrefix ? 'cmd' : 'msg'

        if (chat && chat.endsWith('@g.us')) {
            let groupName = chat.split('@')[0]
            if (conn) {
                try {
                    const meta = await conn.groupMetadata(chat)
                    groupName  = meta.subject || groupName
                } catch {}
            }

            console.log(
                cg('  ╭─── ✦ ───────────────────────────') + '\n' +
                cg('  │ ') + c1(`${date}  ${time}`) + '  ' + c3(`[${tipo}]`) + '\n' +
                cg('  │ ') + c2('grupo   ') + chalk.white(groupName) + '\n' +
                cg('  │ ') + c2('sender  ') + chalk.white(nombre) + cg(` (${num})`) + '\n' +
                cg('  │ ') + c2('mensaje ') + chalk.white(bodyShort || '(sin texto)') + '\n' +
                cg('  ╰─── ✧ ───────────────────────────')
            )
        } else {
            console.log(
                cg('  ╭─── ✦ ───────────────────────────') + '\n' +
                cg('  │ ') + c1(`${date}  ${time}`) + '  ' + c3(`[${tipo}]`) + '\n' +
                cg('  │ ') + c2('privado ') + chalk.white(nombre) + cg(` (${num})`) + '\n' +
                cg('  │ ') + c2('mensaje ') + chalk.white(bodyShort || '(sin texto)') + '\n' +
                cg('  ╰─── ✧ ───────────────────────────')
            )
        }
    } catch (e) {
        console.log(
            cg('  ╭─── ✦ ───────────────────────────') + '\n' +
            cg('  │ ') + chalk.red('error   ') + chalk.white(e.message) + '\n' +
            cg('  ╰─── ✧ ───────────────────────────')
        )
    }
}

export default printLog