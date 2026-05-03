// plugins/parejas.js

const rand    = arr => arr[Math.floor(Math.random() * arr.length)]
const pickDiff = (arr, ...excluir) => {
    let pick
    do { pick = rand(arr) } while (excluir.includes(pick))
    return pick
}
const toM = jid => '@' + jid.split('@')[0]

let handler = async (m, { conn, command }) => {
    const cmd = command.toLowerCase()

    // Obtener participantes directo desde conn
    let ps = []
    try {
        const meta = await conn.groupMetadata(m.chat)
        ps = meta.participants.map(p => p.id || p.jid).filter(Boolean)
    } catch (e) {
        return m.reply(`⟪❄︎⟫ no pude obtener los miembros del grupo❄︎`)
    }

    if (ps.length < 2) return m.reply(`⟪❄︎⟫ necesito al menos 2 personas en el grupo❄︎`)

    // ── #pareja ───────────────────────────────────────────────────────────────
    if (cmd === 'pareja' || cmd === 'formarpareja' || cmd === 'formarparejas') {
        const a = rand(ps)
        const b = pickDiff(ps, a)

        return conn.sendMessage(m.chat, {
            text:
                `⟪❄︎⟫ *pareja del día*\n` +
                `✎ ${toM(a)} debería casarse con ${toM(b)}\n` +
                `✎ hacen una bonita pareja ❄︎`,
            mentions: [a, b]
        }, { quoted: m })
    }

    // ── #parejas — top 5 ──────────────────────────────────────────────────────
    if (cmd === 'parejas' || cmd === 'formarpareja5') {
        if (ps.length < 10) return m.reply(`⟪❄︎⟫ necesito al menos 10 personas para el top 5❄︎`)

        const a = rand(ps)
        const b = pickDiff(ps, a)
        const c = pickDiff(ps, a, b)
        const d = pickDiff(ps, a, b, c)
        const e = pickDiff(ps, a, b, c, d)
        const f = pickDiff(ps, a, b, c, d, e)
        const g = pickDiff(ps, a, b, c, d, e, f)
        const h = pickDiff(ps, a, b, c, d, e, f, g)
        const i = pickDiff(ps, a, b, c, d, e, f, g, h)
        const j = pickDiff(ps, a, b, c, d, e, f, g, h, i)

        return conn.sendMessage(m.chat, {
            text:
                `⟪❄︎⟫ *top 5 parejas del grupo*\n\n` +
                `✎ 1. ${toM(a)} y ${toM(b)}\n` +
                `  esta pareja está destinada a estar junta\n\n` +
                `✎ 2. ${toM(c)} y ${toM(d)}\n` +
                `  dos tortolitos enamorados\n\n` +
                `✎ 3. ${toM(e)} y ${toM(f)}\n` +
                `  ya hasta familia deberían tener\n\n` +
                `✎ 4. ${toM(g)} y ${toM(h)}\n` +
                `  estos ya se casaron en secreto\n\n` +
                `✎ 5. ${toM(i)} y ${toM(j)}\n` +
                `  de luna de miel sin decirle a nadie❄︎`,
            mentions: [a, b, c, d, e, f, g, h, i, j]
        }, { quoted: m })
    }
}

handler.command = ['pareja', 'formarpareja', 'formarparejas', 'parejas', 'formarpareja5']
handler.group   = true
handler.tags    = ['fun']
export default handler
