import moment from 'moment-timezone';
import fs from 'fs';
import { xpRange } from '../lib/levelling.js';
import path from 'path';

const cwd = process.cwd();

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // 1. Validar base de datos
    if (!global.db.data) await global.db.read();

    let userId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;
    let name = await conn.getName(userId);
    let user = global.db.data.users[userId];

    if (!user) return conn.reply(m.chat, '⚜️ 𝖤𝗅 𝗎𝗌𝗎𝖺𝗋𝗂𝗈 𝗇𝗈 𝖾𝗌𝗍𝖺́ 𝗋𝖾𝗀𝗂𝗌𝗍𝗋𝖺𝖽𝗈 𝖾𝗇 𝗅𝗈𝗌 𝗋𝖾𝗀𝗂𝗌𝗍𝗋𝗈𝗌 𝖼𝖾𝗅𝖾𝗌𝗍𝗂𝖺𝗅𝖾𝗌.', m);

    // 2. Datos del usuario
    let { exp, level, role, money, limit } = user; 
    let coins = user.coin || 0; 

    // 3. Cálculos de sistema
    let _uptime = process.uptime() * 1000;
    let uptime = clockString(_uptime);
    let totalreg = Object.keys(global.db.data.users).length;
    let totalCommands = Object.values(global.plugins).filter(v => v.help && v.tags).length;

    // 4. Gestión de Medios (Videos/Gifs)
    const gifVideosDir = path.join(cwd, 'src', 'menu');
    let randomGif;

    if (fs.existsSync(gifVideosDir)) {
      const gifVideos = fs.readdirSync(gifVideosDir)
        .filter(file => file.endsWith('.mp4'))
        .map(file => path.join(gifVideosDir, file));

      if (gifVideos.length > 0) {
        randomGif = gifVideos[Math.floor(Math.random() * gifVideos.length)];
      }
    }

    // 5. Verificación de Oficialidad
    const isOfficial = conn.user.jid === global.conn?.user?.jid;

    let txt = `
⛩️ ─── 𝖠𝖵𝖨𝖲𝖮 𝖣𝖤 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ─── ⛩️
🪷 𝖲𝖺𝗅𝗎𝖽𝗈𝗌, ${name}. 𝖲𝗈𝗒 𝖧𝗂𝗋𝗎𝗄𝖺... (⁠✿⁠◡⁠‿⁠◡⁠)

╔═══════⩽ ✧ 🪭 ✧ ⩾═══════╗
       「 𝖨 𝖭 𝖥 𝖮  𝖡 𝖮 𝖳 」
╚═══════⩽ ✧ 🪭 ✧ ⩾═══════╝
║ 🪭 *𝖭𝖮𝖬𝖡𝖱𝖤*: 𝖧𝖨𝖱𝖴𝖪𝖠 𝖲𝖸𝖲𝖳𝖤𝖬
║ 🪭 *CREADOR*: ˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ
║ ⛩️ *𝖬𝖮𝖣𝖮*: 𝖯𝖴𝖡𝖫𝖨𝖢𝖮
║ ⚜️ *𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲*: ${totalCommands}
║ ⏱️ *𝖴𝖯𝖳𝖨𝖬𝖤*: ${uptime}
║ 👥 *𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖠𝖣𝖮𝖲*: ${totalreg}
╚════════════════════════╝

╔═══════⩽ ✧ 🪷 ✧ ⩾═══════╗
     「 𝖨 𝖭 𝖥 𝖮  𝖴 𝖲 𝖴 𝖠 𝖱 𝖨 𝖮 」
╚═══════⩽ ✧ 🪷 ✧ ⩾═══════╝
║ 👤 *𝖴𝖲𝖴𝖠𝖱𝖨𝖮*: ${name}
║ 🚀 *𝖤𝖷𝖯*: ${exp}
║ 💲 *𝖬𝖮𝖭𝖤𝖣𝖠𝖲*: ${coins}
║ 📊 *𝖭𝖨𝖵𝖤𝖫*: ${level}
║ 🏅 *𝖱𝖠𝖭𝖦𝖮*: ${role}
╚═══════════════════════╝

> ⚜️ 𝖴𝗌𝖺 *#𝗊𝗋* 𝗉𝖺𝗋𝖺 𝗌𝖾𝗋 𝖲𝗎𝖻-𝖡𝗈𝗍.

╔══⩽ ✧ ⛩️ ✧ ⩾══╗
   「 ${isOfficial ? '𝖡𝗈𝗍 𝖮𝖿𝗂𝖼𝗂𝖺𝗅' : '𝖲𝗎𝖻-𝖡𝗈𝗍'} 」
╚══⩽ ✧ ⛩️ ✧ ⩾══╝

*𝖫 𝖨 𝖲 𝖳 𝖠  𝖣 𝖤  𝖢 𝖮 𝖬 𝖠 𝖭 𝖣 𝖮 𝖲*

⛩️───・──・──・﹕₊˚ ✦・🪭
┣ 🪷 *#𝗁𝖾𝗅𝗉* > ✦ 𝖬𝗎𝖾𝗌𝗍𝗋𝖺 𝖾𝗅 𝗆𝖾𝗇𝗎́.
┣ 🪷 *#𝗎𝗉𝗍𝗂𝗆𝖾* > ✦ 𝖳𝗂𝖾𝗆𝗉𝗈 𝖺𝖼𝗍𝗂𝗏𝗈.
┣ 🪷 *#𝗌𝖼* > ✦ 𝖱𝖾𝗉𝗈𝗌𝗂𝗍𝗈𝗋𝗂𝗈.
┣ 🪷 *#𝗈wn𝖾𝗋* > ✦ 𝖢𝗈𝗇𝗍𝖺𝖼𝗍𝗈.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝
`.trim();

    // 6. Configuración de envío con Variables Globales
    let messageOptions = {
      caption: txt,
      contextInfo: {
        isForwarded: true,
        forwardingScore: 99,
        forwardedNewsletterMessageInfo: {
          newsletterJid: global.newsletterJid || '120363408182996815@newsletter',
          newsletterName: global.newsletterName || '⌜ ❀ 𝐇𝐢𝐫𝐮𝐤𝐚 ❀ 𝐂𝐞𝐥𝐞𝐬𝐭𝐢𝐚𝐥 𝐏𝐚𝐭𝐫𝐨𝐧 ⌟',
          serverMessageId: -1
        },
        externalAdReply: {
          title: '⛩️ 𝖧𝖨𝖱𝖴𝖪𝖠 𝖲𝖸𝖲𝖳𝖤𝖬',
          body: '🪷 𝖣𝖾𝗏𝖾𝗅𝗈𝗉𝖾𝖽 𝖻𝗒 ˚₊· ͟͟͞͞  ɪ ᴀᴍ ᴋᴀᴍᴇᴋɪ',
          thumbnailUrl: global.banner || 'https://telegra.ph/file/default.jpg', // Usa el banner global
          sourceUrl: global.rcanal || '', // Usa el canal global
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    };

    if (randomGif) {
      messageOptions.video = { url: randomGif };
      messageOptions.gifPlayback = true; // Activa el modo GIF para el video
    } else {
      // Fallback a imagen global si no hay videos en la carpeta
      messageOptions.image = { url: global.banner || 'https://telegra.ph/file/default.jpg' };
    }

    await conn.sendMessage(m.chat, messageOptions, { quoted: m });

  } catch (e) {
    console.error(e);
    conn.reply(m.chat, '⚜️ 𝖮𝖼𝗎𝗋𝗋𝗂𝗈́ 𝗎𝗇 𝖾𝗋𝗋𝗈𝗋 𝖾𝗇 𝖾𝗅 𝖿𝗅𝗎𝗃𝗈 𝖼𝖾𝗅𝖾𝗌𝗍𝗂𝖺𝗅 𝖺𝗅 𝗀𝖾𝗇𝖾𝗋𝖺𝗋 𝖾𝗅 𝗆𝖾𝗇𝗎́.', m);
  }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = ['menu', 'help', 'principal'];


export default handler;

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}
