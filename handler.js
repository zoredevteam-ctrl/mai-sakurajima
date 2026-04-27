import './settings.js';
import chalk from 'chalk';
import printLog from './lib/print.js';
import { smsg } from './lib/simple.js';
import { database } from './lib/database.js';
import { readdirSync } from 'fs';
import { join, resolve } from 'path';
import { pathToFileURL } from 'url';

const toNum         = v => (v + '').replace(/[^0-9]/g, '');
const localPart     = v => (v + '').split('@')[0].split(':')[0].split('/')[0].split(',')[0];
const normalizeCore = v => toNum(localPart(v));

const normalizeJid = v => {
    if (!v) return '';
    if (typeof v === 'number') v = String(v);
    v = (v + '').trim();
    if (v.startsWith('@')) v = v.slice(1);
    if (v.endsWith('@g.us')) return v;
    if (v.includes('@s.whatsapp.net')) {
        const n = toNum(v.split('@')[0]);
        return n ? n + '@s.whatsapp.net' : v;
    }
    const n = toNum(v);
    return n ? n + '@s.whatsapp.net' : v;
};

function pickOwners() {
    const arr  = Array.isArray(global.owner) ? global.owner : [];
    const flat = [];
    for (const v of arr) {
        if (Array.isArray(v)) flat.push({ num: normalizeCore(v[0]), root: !!v[2] });
        else flat.push({ num: normalizeCore(v), root: false });
    }
    return flat;
}

function isOwnerJid(jid) {
    const num = normalizeCore(jid);
    return pickOwners().some(o => o.num === num);
}

function isRootOwnerJid(jid) {
    const num = normalizeCore(jid);
    return pickOwners().some(o => o.num === num && o.root);
}

function isPremiumJid(jid) {
    const num   = normalizeCore(jid);
    const prems = Array.isArray(global.prems) ? global.prems.map(normalizeCore) : [];
    if (prems.includes(num)) return true;
    const u = database.data?.users?.[normalizeJid(jid)];
    return !!u?.premium;
}

const PREFIXES = ['#', '.', '/', '$'];

function getPrefix(body) {
    for (const p of PREFIXES) {
        if (body.startsWith(p)) return p;
    }
    return null;
}

const similarity = (a, b) => {
    let matches = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a[i] === b[i]) matches++;
    }
    return Math.floor((matches / Math.max(a.length, b.length)) * 100);
};

// ── Reply estilo HIRUKA con newsletter context ────────────────────────────────
const hirukaReply = async (conn, m, txt) => {
    try {
        const thumb = await global.getIconThumb?.() || null;
        const ctx   = global.getNewsletterCtx?.(thumb) || {};
        await conn.sendMessage(m.chat, { text: txt, contextInfo: ctx }, { quoted: m });
    } catch {
        try { await m.reply(txt); } catch {}
    }
};

// ── Cabecera HIRUKA ───────────────────────────────────────────────────────────
const H = `⛩️  ──  𝐇 𝐈 𝐑 𝐔 𝐊 𝐀  𝐒 𝐘 𝐒 𝐓 𝐄 𝐌  ──  ⛩️\n\n`;
const F = `\n╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝`;

const box = (title, lines) =>
    H +
    `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
    `  「 ${title} 」\n` +
    `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
    lines.map(l => `┣ 🪷 ${l}`).join('\n') +
    F;

// ─────────────────────────────────────────────────────────────────────────────

const eventsLoadedFor = new WeakSet();

export const loadEvents = async (conn) => {
    if (!conn?.ev?.on) return;
    if (eventsLoadedFor.has(conn)) return;
    eventsLoadedFor.add(conn);

    const eventsPath = resolve('./events');
    let files = [];

    try {
        files = readdirSync(eventsPath).filter(f => f.endsWith('.js'));
    } catch {
        console.log(chalk.yellow('✦ [EVENTS] Carpeta ./events no encontrada, omitiendo...'));
        return;
    }

    for (const file of files) {
        try {
            const url = pathToFileURL(join(eventsPath, file)).href;
            const mod = await import(url);
            if (!mod.event || !mod.run) continue;
            conn.ev.on(mod.event, (data) => {
                const id = data?.id || data?.key?.remoteJid || null;
                if (mod.enabled && id && !mod.enabled(id)) return;
                mod.run(conn, data);
            });
            console.log(chalk.hex('#6EC6FF')(`✦ [EVENTS] ${file} → ${mod.event}`));
        } catch (e) {
            console.log(chalk.red(`[EVENTS ERROR] ${file}:`), e.message);
        }
    }
};

export const handler = async (m, conn, plugins) => {
    try {
        if (!m) return;

        await loadEvents(conn);
        m = await smsg(conn, m);

        // ── Bot OFF ───────────────────────────────────────────────────────────
        if (global.botOff && !m.fromMe) {
            const senderCheck = (m.sender || '').replace(/:[0-9A-Za-z]+(?=@s\.whatsapp\.net)/, '');
            if (!isOwnerJid(senderCheck)) return;
        }

        // ── Primary ───────────────────────────────────────────────────────────
        if (m.isGroup && conn._subbotId) {
            const groupData = database.data?.groups?.[m.chat];
            if (groupData?.primaryOnly) {
                const body = (m.body || '').trim().toLowerCase();
                const isPrimaryCmd = ['#setprimary','#removeprimary','.setprimary','.removeprimary'].some(c => body.startsWith(c));
                if (!isPrimaryCmd) return;
            }
        }

        // ── Mute ──────────────────────────────────────────────────────────────
        if (m.isGroup) {
            const muted = database.data?.groups?.[m.chat]?.muted || [];
            if (muted.includes(m.sender)) {
                try { await conn.sendMessage(m.chat, { delete: m.key }); } catch {}
                return;
            }
        }

        if (!m.body) return;

        const prefix = getPrefix(m.body);
        if (m.body && !m.fromMe) {
            printLog(!!prefix, m.sender, m.isGroup ? m.chat : null, m.body, m.pushName);
        }

        // ── handler.before ────────────────────────────────────────────────────
        if (m.isGroup) {
            const bodyCheck   = (m.body || '').trim();
            const tienePrefix = ['#', '.', '/', '$'].some(p => bodyCheck.startsWith(p));
            if (!tienePrefix) {
                for (const [, plugin] of plugins) {
                    if (typeof plugin?.before === 'function') {
                        try {
                            const senderB  = (m.sender || '').replace(/:[0-9A-Za-z]+(?=@s\.whatsapp\.net)/, '');
                            const isOwnerB = isOwnerJid(senderB);
                            let isAdminB   = isOwnerB;
                            if (!isAdminB) {
                                try {
                                    const gMeta = await conn.groupMetadata(m.chat);
                                    isAdminB = gMeta.participants.some(p =>
                                        (normalizeCore(p.id || p.jid) === normalizeCore(senderB)) &&
                                        (p.admin || p.isAdmin || p.isSuperAdmin)
                                    );
                                } catch {}
                            }
                            const stop = await plugin.before(m, { conn, isAdmin: isAdminB, isOwner: isOwnerB });
                            if (stop === true) return;
                        } catch (e) {
                            console.log(chalk.red('[BEFORE ERROR]'), e.message);
                        }
                    }
                }
            }
        }

        if (!prefix) return;

        const body        = m.body.slice(prefix.length).trim();
        const args        = body.split(/ +/).filter(Boolean);
        const commandName = args.shift()?.toLowerCase();
        if (!commandName) return;

        // ── Normalización del sender ──────────────────────────────────────────
        let senderJid         = m.sender || '';
        const senderCanonical = senderJid.replace(/:[0-9A-Za-z]+(?=@s\.whatsapp\.net)/, '');

        if (senderCanonical !== senderJid) {
            m.realSender = senderJid;
            senderJid    = senderCanonical;
        }

        if (senderJid.endsWith('@lid') && m.isGroup) {
            try {
                const groupMeta = await conn.groupMetadata(m.chat);
                const rawNum    = normalizeCore(senderJid);
                const found     = groupMeta.participants.find(p => normalizeCore(p.id || p.jid) === rawNum);
                if (found && (found.jid || found.id)?.endsWith('@s.whatsapp.net')) {
                    senderJid = (found.jid || found.id).includes(':')
                        ? (found.jid || found.id).split(':')[0] + '@s.whatsapp.net'
                        : (found.jid || found.id);
                    m.sender = senderJid;
                }
            } catch {}
        }

        const isROwner = isRootOwnerJid(senderJid);
        const isOwner  = isROwner || isOwnerJid(senderJid);

        // ── Búsqueda de comando ───────────────────────────────────────────────
        let cmd = null;

        if (prefix === '$') {
            for (const [, plugin] of plugins) {
                if (plugin.customPrefix?.includes?.('$')) {
                    cmd = plugin; args.unshift(commandName); break;
                }
            }
        } else {
            for (const [, plugin] of plugins) {
                if (!plugin.command) continue;
                const cmds = Array.isArray(plugin.command)
                    ? plugin.command
                    : plugin.command instanceof RegExp ? [] : [plugin.command];
                if (cmds.map(c => c.toLowerCase()).includes(commandName)) {
                    cmd = plugin; break;
                }
            }
        }

        // ── Comando no encontrado ─────────────────────────────────────────────
        if (!cmd) {
            const allCommands = [];
            for (const [, plugin] of plugins) {
                if (!plugin.command) continue;
                const cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command];
                for (const c of cmds) { if (typeof c === 'string') allCommands.push(c.toLowerCase()); }
            }

            const similares = allCommands
                .map(c => ({ cmd: c, score: similarity(commandName, c) }))
                .filter(o => o.score >= 45)
                .sort((a, b) => b.score - a.score)
                .slice(0, 3);

            const txt =
                H +
                `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
                `   「 𝖢𝖮𝖬𝖠𝖭𝖣𝖮 𝖭𝖮 𝖤𝖭𝖢𝖮𝖭𝖳𝖱𝖠𝖣𝖮 」\n` +
                `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
                `┣ 🪷 *${prefix + commandName}* no existe. (⁠✿⁠◡⁠‿⁠◡⁠)\n` +
                `┣ 🪷 usa *${prefix}menu* para ver todo\n` +
                (similares.length
                    ? `\n╔═══════⩽ ✧ 🪷 ✧ ⩾═══════╗\n` +
                      `  「 𝖳𝖠𝖫 𝖵𝖤𝖹 𝖰𝖴𝖨𝖲𝖨𝖲𝖳𝖤 𝖣𝖤𝖢𝖨𝖱... 」\n` +
                      `╚═══════⩽ ✧ 🪷 ✧ ⩾═══════╝\n` +
                      similares.map(s => `┣ 🪷 \`${prefix + s.cmd}\`  ─  ${s.score}%`).join('\n')
                    : '') +
                F;

            return hirukaReply(conn, m, txt);
        }

        const isPremium    = isOwner || isPremiumJid(senderJid);
        const isRegistered = isOwner || !!database.data?.users?.[senderJid]?.registered;

        const isGroup  = m.isGroup;
        let isAdmin    = false;
        let isBotAdmin = false;

        if (isGroup) {
            try {
                const groupMeta = await conn.groupMetadata(m.chat);
                isAdmin = groupMeta.participants.some(p =>
                    (p.id === senderJid || p.jid === senderJid) && (p.admin || p.isAdmin || p.isSuperAdmin)
                ) || isOwner;
                const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
                isBotAdmin   = groupMeta.participants.some(p =>
                    (p.id === botJid || p.jid === botJid) && (p.admin || p.isAdmin || p.isSuperAdmin)
                );
            } catch (err) {
                console.log(chalk.red('[ERROR GROUP META]'), err.message);
            }
        }

        // ── Inicialización DB ─────────────────────────────────────────────────
        if (!database.data.users)  database.data.users  = {};
        if (!database.data.groups) database.data.groups = {};

        if (!database.data.users[senderJid]) {
            database.data.users[senderJid] = {
                registered: false, premium: false, banned: false,
                warning: 0, exp: 0, level: 1, limit: 20,
                lastclaim: 0, registered_time: 0,
                name: m.pushName || '', age: null
            };
        }

        if (isGroup && !database.data.groups[m.chat]) {
            database.data.groups[m.chat] = { modoadmin: false, muted: [] };
        }

        // ── Resolver who ──────────────────────────────────────────────────────
        let who = null;
        if (m.mentionedJid?.[0]) who = m.mentionedJid[0];
        else if (m.quoted?.sender) who = m.quoted.sender;

        if (who) {
            const rawNum = who.split('@')[0].split(':')[0];
            const isLid  = who.endsWith('@lid') || rawNum.length > 13;
            if (isLid && m.isGroup) {
                try {
                    const groupMeta = await conn.groupMetadata(m.chat);
                    const found     = groupMeta.participants.find(p => normalizeCore(p.id || p.jid) === rawNum);
                    if (found?.jid?.endsWith('@s.whatsapp.net')) {
                        who = found.jid.includes(':') ? found.jid.split(':')[0] + '@s.whatsapp.net' : found.jid;
                    } else if (found?.id?.endsWith('@s.whatsapp.net')) {
                        who = found.id;
                    } else {
                        who = rawNum + '@s.whatsapp.net';
                    }
                } catch { who = rawNum + '@s.whatsapp.net'; }
            } else {
                who = rawNum + '@s.whatsapp.net';
            }
        }

        // ── Validaciones estilo HIRUKA ────────────────────────────────────────

        if (isGroup && database.data.groups[m.chat]?.modoadmin && !isAdmin && !isOwner) {
            return hirukaReply(conn, m, box('𝖬𝖮𝖣𝖮 𝖠𝖣𝖬𝖨𝖭 𝖠𝖢𝖳𝖨𝖵𝖮', [
                'solo obedezco a los *administradores*'
            ]));
        }

        if (database.data.settings?.modoowner && !isOwner) {
            return hirukaReply(conn, m, box('𝖬𝖮𝖣𝖮 𝖮𝖶𝖭𝖤𝖱 𝖠𝖢𝖳𝖨𝖵𝖮', [
                'ahora mismo solo atiendo al *owner*'
            ]));
        }

        if (database.data.users[senderJid]?.banned && !isOwner) {
            return hirukaReply(conn, m, box('𝖠𝖢𝖢𝖤𝖲𝖮 𝖱𝖤𝖲𝖳𝖱𝖨𝖭𝖦𝖨𝖣𝖮', [
                'no puedo atenderte. (￣ヘ￣)'
            ]));
        }

        if (cmd.rowner && !isROwner) {
            if (isOwner) return hirukaReply(conn, m, box('𝖠𝖢𝖢𝖤𝖲𝖮 𝖤𝖷𝖢𝖫𝖴𝖲𝖨𝖵𝖮', ['procedo de inmediato. ٩(◕‿◕)۶']));
            return hirukaReply(conn, m, box('𝖠𝖢𝖢𝖤𝖲𝖮 𝖤𝖷𝖢𝖫𝖴𝖲𝖨𝖵𝖮', [
                'solo para el *owner principal*. (￣ヘ￣)'
            ]));
        }

        if (cmd.owner && !isOwner) {
            return hirukaReply(conn, m, box('𝖠𝖢𝖢𝖤𝖲𝖮 𝖱𝖤𝖲𝖳𝖱𝖨𝖭𝖦𝖨𝖣𝖮', [
                'solo para los *creadores*. (￣ヘ￣)'
            ]));
        }

        if (cmd.premium && !isPremium) {
            return hirukaReply(conn, m, box('𝖤𝖷𝖢𝖫𝖴𝖲𝖨𝖵𝖮 𝖯𝖱𝖤𝖬𝖨𝖴𝖬', [
                'necesitas *premium* para esto. (〃￣ω￣〃)'
            ]));
        }

        if (cmd.register && !isRegistered) {
            return hirukaReply(conn, m, box('𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖮 𝖱𝖤𝖰𝖴𝖤𝖱𝖨𝖣𝖮', [
                'primero debes registrarte. (⁠✿⁠◡⁠‿⁠◡⁠)',
                `usa: *${prefix}reg nombre.edad*`
            ]));
        }

        if (cmd.group && !isGroup) {
            return hirukaReply(conn, m, box('𝖲𝖮𝖫𝖮 𝖤𝖭 𝖦𝖱𝖴𝖯𝖮𝖲', [
                'este comando solo funciona en *grupos*. (°ロ°)'
            ]));
        }

        if (cmd.admin && !isAdmin) {
            if (isOwner) return hirukaReply(conn, m, box('𝖠𝖣𝖬𝖨𝖭', ['procedo. ٩(◕‿◕)۶']));
            return hirukaReply(conn, m, box('𝖲𝖮𝖫𝖮 𝖠𝖣𝖬𝖨𝖭𝖨𝖲𝖳𝖱𝖠𝖣𝖮𝖱𝖤𝖲', [
                'necesitas ser *admin* para esto. (￣ヘ￣)'
            ]));
        }

        if (cmd.botAdmin && !isBotAdmin) {
            return hirukaReply(conn, m, box('𝖭𝖤𝖢𝖤𝖲𝖨𝖳𝖮 𝖲𝖤𝖱 𝖠𝖣𝖬𝖨𝖭', [
                'dame *admin* para ejecutar esto. (⁠っ⁠. ⸝⸝⸝ . c⁠)'
            ]));
        }

        if (cmd.private && isGroup) {
            return hirukaReply(conn, m, box('𝖲𝖮𝖫𝖮 𝖤𝖭 𝖯𝖱𝖨𝖵𝖠𝖣𝖮', [
                'úsalo en nuestro *chat personal*. (⁠˘⁠︶⁠˘⁠)⁠.⁠｡⁠*⁠♡'
            ]));
        }

        if (cmd.limit && !isPremium && !isOwner) {
            const userLimit = database.data.users[senderJid].limit ?? 0;
            if (userLimit < 1) {
                return hirukaReply(conn, m, box('𝖫𝖨𝖬𝖨𝖳𝖤 𝖠𝖦𝖮𝖳𝖠𝖣𝖮', [
                    'agotaste tus usos de hoy. (－‸－)',
                    'vuelve mañana o adquiere *premium*'
                ]));
            }
            database.data.users[senderJid].limit -= 1;
        }

        // ── Ejecución del plugin ──────────────────────────────────────────────
        try {
            const fn = typeof cmd === 'function'
                ? cmd
                : typeof cmd.run === 'function'
                ? cmd.run.bind(cmd)
                : null;
            if (!fn) throw new TypeError(`Plugin "${commandName}" sin funcion valida`);

            await fn(m, {
                conn, args,
                text: args.join(' '),
                command: commandName,
                usedPrefix: prefix,
                isOwner, isROwner, isPremium, isRegistered,
                isAdmin, isBotAdmin, isGroup,
                who, db: database.data, prefix, plugins
            });
        } catch (e) {
            console.log(chalk.red('\n[!] ERROR EN PLUGIN:'), e);

            const name       = e?.name    || 'Error desconocido';
            const message    = e?.message || String(e);
            const stackLines = e?.stack?.split('\n') || [];
            let file = 'desconocido', line = '?';

            for (const l of stackLines) {
                const match = l.match(/\((.*plugins.*[\\/]([^:\\/]+)):(\d+):(\d+)\)/);
                if (match) { file = match[2]; line = match[3]; break; }
            }

            if (isOwner) {
                await hirukaReply(conn, m,
                    H +
                    `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
                    `      「 𝖤𝖱𝖱𝖮𝖱 𝖣𝖤𝖳𝖤𝖢𝖳𝖠𝖣𝖮 」\n` +
                    `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
                    `┣ 🪷 comando:  *${prefix + commandName}*\n` +
                    `┣ 🪷 archivo:  ${file}  (línea: ${line})\n` +
                    `┣ 🪷 error:    ${name}\n` +
                    `┣ 🪷 detalle:  ${message.slice(0, 280)}` +
                    F
                );
            }
        }

    } catch (err) {
        console.log(chalk.red('[HANDLER ERROR]'), err);
        const senderCheck = (m?.sender || '').replace(/:[0-9A-Za-z]+(?=@s\.whatsapp\.net)/, '');
        if (m?.reply && isOwnerJid(senderCheck)) {
            await hirukaReply(conn, m,
                H +
                `╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗\n` +
                `        「 𝖤𝖱𝖱𝖮𝖱 𝖢𝖱𝖨𝖳𝖨𝖢𝖮 」\n` +
                `╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝\n` +
                `┣ 🪷 ${String(err).slice(0, 280)}` +
                F
            );
        }
    }
};
