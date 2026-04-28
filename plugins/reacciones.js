// plugins/reacciones.js
// ── Todas las reacciones anime en un solo archivo ─────────────────────────────

const reaccion = async (m, conn, db, config) => {
    const { reactInicio, reactFin, videos, textos, errorMsg } = config
    try {
        await m.react(reactInicio)

        let who
        if (m.mentionedJid?.length > 0) who = m.mentionedJid[0]
        else if (m.quoted)               who = m.quoted.sender
        else                             who = m.sender

        // Resolver LID en grupos
        if (who && (who.endsWith('@lid') || isNaN(who.split('@')[0]))) {
            try {
                const meta  = await conn.groupMetadata(m.chat)
                const found = meta.participants.find(p => p.id === who || p.lid === who)
                if (found?.jid) who = found.jid
            } catch {}
        }

        const getName = jid => db?.users?.[jid]?.name || jid?.split('@')[0] || 'alguien'
        const name    = getName(who)
        const name2   = m.pushName || getName(m.sender)

        let str
        if (m.mentionedJid?.length > 0) str = textos.mention(name2, name)
        else if (m.quoted)               str = textos.quoted(name2, name)
        else                             str = textos.solo(name2)

        const video = videos[Math.floor(Math.random() * videos.length)]
        const thumb = await global.getIconThumb?.() || null
        const ctx   = global.getNewsletterCtx?.(thumb, `⛩️ ${global.botName || 'Hiruka'}`, '🪷 Reacciones Anime') || {}

        await conn.sendMessage(m.chat, {
            video:       { url: video },
            gifPlayback: true,
            caption:     str,
            mentions:    [who],
            contextInfo: ctx
        }, { quoted: m })

        await m.react(reactFin)

    } catch (e) {
        console.error('[REACCION ERROR]', e.message)
        await m.react('💔')
        await m.reply(errorMsg)
    }
}

// ── CONFIGS ───────────────────────────────────────────────────────────────────
const CONFIGS = {

    kiss: {
        reactInicio: '🫦', reactFin: '💋',
        errorMsg: '💔 algo salió mal enviando el beso~',
        textos: {
            mention: (a, b) => `\`${a}\` *le dio un beso a* \`${b}\` ( ˘ ³˘)♥`,
            quoted:  (a, b) => `\`${a}\` *besó a* \`${b}\` 💋`,
            solo:    (a)    => `\`${a}\` *se besó a sí mismo* ( ˘ ³˘)♥`
        },
        videos: [
            'https://files.catbox.moe/hu4p0g.mp4',
            'https://files.catbox.moe/jevc51.mp4',
            'https://files.catbox.moe/zekrvg.mp4',
            'https://files.catbox.moe/czed90.mp4',
            'https://files.catbox.moe/nnsf25.mp4',
            'https://files.catbox.moe/zpxhw0.mp4',
            'https://files.catbox.moe/er4b5i.mp4',
            'https://files.catbox.moe/h462h6.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/c6dcf64474.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/cc153bf57a.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/81a25e0763.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/75ead7d20a.mp4'
        ]
    },

    hug: {
        reactInicio: '🫂', reactFin: '🌸',
        errorMsg: '💔 algo salió mal enviando el abrazo~',
        textos: {
            mention: (a, b) => `\`${a}\` *le dio un abrazo a* \`${b}\` 🤗`,
            quoted:  (a, b) => `\`${a}\` *abrazó a* \`${b}\` 🌸`,
            solo:    (a)    => `\`${a}\` *se abrazó a sí mismo* 🫂`
        },
        videos: [
            'https://telegra.ph/file/6a3aa01fabb95e3558eec.mp4',
            'https://telegra.ph/file/0e5b24907be34da0cbe84.mp4',
            'https://telegra.ph/file/6bc3cd10684f036e541ed.mp4',
            'https://telegra.ph/file/3e443a3363a90906220d8.mp4',
            'https://telegra.ph/file/56d886660696365f9696b.mp4',
            'https://telegra.ph/file/3eeadd9d69653803b33c6.mp4'
        ]
    },

    kill: {
        reactInicio: '🗡️', reactFin: '⚰️',
        errorMsg: '⚠️ algo falló~',
        textos: {
            mention: (a, b) => `\`${a}\` *mató a* \`${b}\` 💀`,
            quoted:  (a, b) => `\`${a}\` *eliminó a* \`${b}\` ⚰️`,
            solo:    (a)    => `\`${a}\` *se mató a sí mismo* 😵`
        },
        videos: [
            'https://files.catbox.moe/pv2q2f.mp4',
            'https://files.catbox.moe/oon0oa.mp4',
            'https://files.catbox.moe/vibexk.mp4',
            'https://files.catbox.moe/cv7odw.mp4',
            'https://files.catbox.moe/bztm0m.mp4',
            'https://files.catbox.moe/7ualwg.mp4'
        ]
    },

    push: {
        reactInicio: '🤜', reactFin: '💨',
        errorMsg: '💔 algo salió mal~',
        textos: {
            mention: (a, b) => `\`${a}\` *empujó a* \`${b}\` 🤜💨`,
            quoted:  (a, b) => `\`${a}\` *empujó a* \`${b}\` 😤`,
            solo:    (a)    => `\`${a}\` *intentó empujarse a sí mismo* 😂`
        },
        videos: [
            'https://files.catbox.moe/pv2q2f.mp4',
            'https://files.catbox.moe/oon0oa.mp4',
            'https://files.catbox.moe/vibexk.mp4',
            'https://files.catbox.moe/cv7odw.mp4'
        ]
    },

    dormir: {
        reactInicio: '😴', reactFin: '💤',
        errorMsg: '💔 algo salió mal~',
        textos: {
            mention: (a, b) => `\`${a}\` *se quedó dormido con* \`${b}\` 💤`,
            quoted:  (a, b) => `\`${a}\` *duerme junto a* \`${b}\` 😴`,
            solo:    (a)    => `\`${a}\` *se quedó dormido* 💤 zzz`
        },
        videos: [
            'https://telegra.ph/file/9c69837650993b40113dc.mp4',
            'https://telegra.ph/file/071f2b8d26bca81578dd0.mp4',
            'https://telegra.ph/file/0af82e78c57f7178a333b.mp4',
            'https://telegra.ph/file/8fb8739072537a63f8aee.mp4'
        ]
    },

    triste: {
        reactInicio: '😢', reactFin: '🌧️',
        errorMsg: '💔 algo salió mal~',
        textos: {
            mention: (a, b) => `\`${a}\` *está triste por* \`${b}\` 😢`,
            quoted:  (a, b) => `\`${a}\` *llora por* \`${b}\` 💧`,
            solo:    (a)    => `\`${a}\` *está muy triste* 😔`
        },
        videos: [
            'https://telegra.ph/file/9c69837650993b40113dc.mp4',
            'https://telegra.ph/file/071f2b8d26bca81578dd0.mp4',
            'https://telegra.ph/file/4f81cb97f31ce497c3a81.mp4',
            'https://telegra.ph/file/6d626e72747e0c71eb920.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/78c0c53c0c.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/2f86507473.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/f2a571c4d4.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/1f0ead4b47.mp4'
        ]
    },

    pat: {
        reactInicio: '🥺', reactFin: '🌸',
        errorMsg: '💔 algo salió mal~',
        textos: {
            mention: (a, b) => `\`${a}\` *le dio palmaditas a* \`${b}\` 🥺`,
            quoted:  (a, b) => `\`${a}\` *palmeó a* \`${b}\` con cariño 🌸`,
            solo:    (a)    => `\`${a}\` *se palmea a sí mismo* 🥺`
        },
        videos: [
            'https://telegra.ph/file/6a3aa01fabb95e3558eec.mp4',
            'https://telegra.ph/file/0e5b24907be34da0cbe84.mp4',
            'https://telegra.ph/file/56d886660696365f9696b.mp4',
            'https://telegra.ph/file/436624e53c5f041bfd597.mp4'
        ]
    },

    neko: {
        reactInicio: '🐱', reactFin: '✨',
        errorMsg: '💔 algo salió mal~',
        textos: {
            mention: (a, b) => `*Nyaa~* \`${a}\` *le hace mimos a* \`${b}\` 🐱✨`,
            quoted:  (a, b) => `\`${a}\` *modo neko con* \`${b}\` 🐱`,
            solo:    (a)    => `*Nyaa~* \`${a}\` *activa el modo neko* 🐱✨`
        },
        videos: [
            'https://files.catbox.moe/hu4p0g.mp4',
            'https://files.catbox.moe/jevc51.mp4',
            'https://files.catbox.moe/zekrvg.mp4',
            'https://files.catbox.moe/czed90.mp4'
        ]
    },

    angry: {
        reactInicio: '😡', reactFin: '💢',
        errorMsg: '💔 algo salió mal~',
        textos: {
            mention: (a, b) => `\`${a}\` *está enojado/a con* \`${b}\` 😡`,
            quoted:  (a, b) => `\`${a}\` *está enojado/a con* \`${b}\` 💢`,
            solo:    (a)    => `\`${a}\` *está enojado/a* 😡`
        },
        videos: [
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/d80daa67bf.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/92eb27d9e6.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/c57ab0faeb.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/d8e8618f1c.mp4'
        ]
    },

    bite: {
        reactInicio: '😅', reactFin: '🦷',
        errorMsg: '💔 algo salió mal~',
        textos: {
            mention: (a, b) => `\`${a}\` *mordió a* \`${b}\` 😬`,
            quoted:  (a, b) => `\`${a}\` *mordió a* \`${b}\` 🦷`,
            solo:    (a)    => `\`${a}\` *se mordió a sí mismo* 😅`
        },
        videos: [
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/c78f05ab2d.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/3c253c9459.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/69470b97a7.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/229f06b30d.mp4'
        ]
    },

    cafe: {
        reactInicio: '☕', reactFin: '🍵',
        errorMsg: '💔 algo salió mal~',
        textos: {
            mention: (a, b) => `\`${a}\` *tomó un café con* \`${b}\` ☕`,
            quoted:  (a, b) => `\`${a}\` *está tomando café con* \`${b}\` 🍵`,
            solo:    (a)    => `\`${a}\` *se toma un café* ☕`
        },
        videos: [
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/501e03e9dd.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/23ba7f263e.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/2c6f5e3244.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/93a5f1e7ac.mp4'
        ]
    },

    cry: {
        reactInicio: '😭', reactFin: '💧',
        errorMsg: '💔 algo salió mal~',
        textos: {
            mention: (a, b) => `\`${a}\` *está llorando por culpa de* \`${b}\` 😭`,
            quoted:  (a, b) => `\`${a}\` *está llorando por* \`${b}\` 💧`,
            solo:    (a)    => `\`${a}\` *está llorando* 😭`
        },
        videos: [
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/78c0c53c0c.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/2f86507473.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/f2a571c4d4.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/1f0ead4b47.mp4'
        ]
    },

    cuddle: {
        reactInicio: '🥰', reactFin: '💞',
        errorMsg: '💔 algo salió mal~',
        textos: {
            mention: (a, b) => `\`${a}\` *se acurrucó con* \`${b}\` 🥰`,
            quoted:  (a, b) => `\`${a}\` *está acurrucándose con* \`${b}\` 💞`,
            solo:    (a)    => `\`${a}\` *se está acurrucando* 🥰`
        },
        videos: [
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/60500e485e.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/1d4b95642f.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/e92a96833e.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/280b598160.mp4'
        ]
    },

    happy: {
        reactInicio: '😁', reactFin: '🎉',
        errorMsg: '💔 algo salió mal~',
        textos: {
            mention: (a, b) => `\`${a}\` *está feliz por* \`${b}\` 😁`,
            quoted:  (a, b) => `\`${a}\` *está feliz por* \`${b}\` 🎉`,
            solo:    (a)    => `\`${a}\` *está muy feliz hoy* 🎊`
        },
        videos: [
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/20c6772812.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/21e5a361b4.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/e9c628b6a4.mp4',
            'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/04b941e024.mp4'
        ]
    }
}

// ── Mapa de alias → key de config ────────────────────────────────────────────
const MAP = {
    kiss: 'kiss',     besar: 'kiss',
    hug: 'hug',       abrazar: 'hug',
    kill: 'kill',     matar: 'kill',
    push: 'push',     empujar: 'push',
    dormir: 'dormir', sleep: 'dormir',
    triste: 'triste', sad: 'triste',
    pat: 'pat',       palmear: 'pat',
    neko: 'neko',     waifu: 'neko',
    angry: 'angry',   enojado: 'angry',
    bite: 'bite',     morder: 'bite',
    coffe: 'cafe',    cafe: 'cafe',
    cry: 'cry',       llorar: 'cry',
    cuddle: 'cuddle', acurrucarse: 'cuddle',
    happy: 'happy',   feliz: 'happy'
}

let handler = async (m, { conn, command, db }) => {
    const cmd    = command.toLowerCase()
    const config = CONFIGS[MAP[cmd]]
    if (config) await reaccion(m, conn, db, config)
}

handler.command = Object.keys(MAP)
handler.tags    = ['anime']
export default handler
