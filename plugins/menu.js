import moment from 'moment-timezone';
import fs from 'fs';
import { xpRange } from '../lib/levelling.js'; // Asegúrate de que la ruta sea correcta
import path from 'path';

const cwd = process.cwd();

let handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    // 1. Validar base de datos
    if (!global.db.data) await global.db.read();
    
    let userId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;
    let name = await conn.getName(userId);
    let user = global.db.data.users[userId];

    if (!user) return conn.reply(m.chat, '❌ El usuario no está registrado en mi base de datos.', m);

    // 2. Datos del usuario
    let { exp, level, role, money, limit } = user; // Usé money/limit que es lo estándar, cámbialo si usas .coin
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

    // 5. Verificación de Oficialidad (Mejorada)
    const isOfficial = conn.user.jid === global.conn?.user?.jid;

    let txt = `
🌌 ─── 𝖠𝖵𝖨𝖲𝖮 𝖣𝖤 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ─── 🌌
🐰 𝖧𝗈𝗅𝖺, ${name}. 𝖲𝗈𝗒 *Mai Sakurajima*...

╔═══════⩽ ✧ 🐰 ✧ ⩾═══════╗
       「 𝙄𝙉𝙁𝙊 𝘿𝙀 𝙇𝘼 𝘽𝙊𝙏 」
╚═══════⩽ ✧ 🐰 ✧ ⩾═══════╝
║ 🌌 *𝖳𝖬𝖠*: *𝖬𝖠𝖨 𝖲𝖠𝖪𝖴𝖱𝖠𝖩𝖨𝖬𝖠*
║ 🎭 *𝖬𝖮𝖣𝖮*: *𝖯𝖴𝖡𝖫𝖨𝖢𝖮*
║ 🌐 *𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲*: ${totalCommands}
║ ⏱️ *𝖴𝖯𝖳𝖨𝖬𝖤*: ${uptime}
║ 👥 *𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖠𝖣𝖮𝖲*: ${totalreg}
╚════════════════════════╝

╔═══════⩽ ✧ 🐰 ✧ ⩾═══════╗
     「 𝙄𝙉𝙁𝙊 𝘿𝙀𝙇 𝙐𝙎𝙐𝘼𝙍𝙄𝙊 」
╚═══════⩽ ✧ 🐰 ✧ ⩾═══════╝
║ 👤 *𝖴𝖲𝖴𝖠𝖱𝖨𝖮*: ${name}
║ 🚀 *𝖤𝖷𝖯*: ${exp}
║ 💲 *𝖬𝖮𝖭𝖤𝖣𝖠𝖲*: ${coins}
║ 📊 *𝖭𝖨𝖵𝖤𝖫*: ${level}
║ 🏅 *𝖱𝖠𝖭𝖦𝖮*: ${role}
╚═══════════════════════╝

> 🌌 𝖴𝗌𝖺 *#𝗊𝗋* 𝗉𝖺𝗋𝖺 𝗌𝖾𝗋 𝖲𝗎𝖻-𝖡𝗈𝗍.

╔══⩽ ✧ 🐰 ✧ ⩾══╗
   「 ${isOfficial ? '𝘽𝙤𝙩 𝙊𝙛𝙞𝙘𝙞𝙖𝙡' : '𝙎𝙪𝙗𝘽𝙤𝙩'} 」
╚══⩽ ✧ 🐰 ✧ ⩾══╝

*𝖫 𝖨 𝖲 𝖳 𝖠  𝖣 𝖤  𝖢 𝖮 𝖬 𝖠 𝖭 𝖣 𝖮 𝖲*

🌌───・──・──・﹕₊˚ ✦・🐰
┣ 🌌 *#𝗁𝖾𝗅𝗉* > ✦ 𝖬𝗎𝖾𝗌𝗍𝗋𝖺 𝖾𝗅 𝗆𝖾𝗇𝗎́.
┣ 🌌 *#𝗎𝗉𝗍𝗂𝗆𝖾* > ✦ 𝖳𝗂𝖾𝗆𝗉𝗈 𝖺𝖼𝗍𝗂𝗏𝗈.
┣ 🌌 *#𝗌𝖼* > ✦ 𝖱𝖾𝗉𝗈𝗌𝗂𝗍𝗈𝗋𝗂𝗈.
┣ 🌌 *#𝗈wn𝖾𝗋* > ✦ 𝖢𝗈𝗇𝗍𝖺𝖼𝗍𝗈.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝
`.trim();

    // 6. Envío del mensaje con fallback (si no hay video, manda imagen o solo texto)
    let messageOptions = {
      caption: txt,
      gifPlayback: true,
      contextInfo: {
        externalAdReply: {
          title: '𝗠𝗔𝗜 𝗦𝗔𝗞𝗨𝗥𝗔𝗝𝗜𝗠𝗔 𝗦𝗬𝗦𝗧𝗘𝗠',
          body: 'Developed by Aarom ✨',
          thumbnailUrl: 'https://qu.ax/STpE.jpg',
          sourceUrl: 'https://github.com/XLR4-Security',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    };

    if (randomGif) {
      messageOptions.video = { url: randomGif };
    } else {
      // Si no hay video, enviamos una imagen por defecto para que no de error
      messageOptions.image = { url: 'https://qu.ax/STpE.jpg' };
    }

    await conn.sendMessage(m.chat, messageOptions, { quoted: m });

  } catch (e) {
    console.error(e);
    conn.reply(m.chat, '❌ Ocurrió un error interno al generar el menú.', m);
  }
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = /^(menu|help|principal)$/i;

export default handler;

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}
