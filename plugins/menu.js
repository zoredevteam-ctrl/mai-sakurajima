import moment from 'moment-timezone';
import fs from 'fs';
import { xpRange } from '../lib/levelling.js';
import path from 'path';

const cwd = process.cwd();

let handler = async (m, { conn, args }) => {
  let userId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;

  let name = await conn.getName(userId);
  let user = global.db.data.users[userId];
  let exp = user.exp || 0;
  let level = user.level || 0;
  let role = user.role || 'Sin Rango';
  let coins = user.coin || 0;

  let _uptime = process.uptime() * 1000;
  let uptime = clockString(_uptime);
  let totalreg = Object.keys(global.db.data.users).length;
  let totalCommands = Object.values(global.plugins).filter(v => v.help && v.tags).length;

  const gifVideosDir = path.join(cwd, 'src', 'menu');
  if (!fs.existsSync(gifVideosDir)) {
    console.error('El directorio no existe:', gifVideosDir);
    return;
  }

  const gifVideos = fs.readdirSync(gifVideosDir)
    .filter(file => file.endsWith('.mp4'))
    .map(file => path.join(gifVideosDir, file));

  const randomGif = gifVideos[Math.floor(Math.random() * gifVideos.length)];

  let txt = `
🌌 ─── 𝖠𝖵𝖨𝖲𝖮 𝖣𝖤 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 ─── 🌌
🐰 𝖧𝗈𝗅𝖺, ${name}. 𝖲𝗈𝗒 *Mai Sakurajima*... ¿𝖠𝗎𝗇 𝗉𝗎𝖾𝖽𝖾𝗌 𝗏𝖾𝗋𝗆𝖾? (⁠✿⁠^⁠‿⁠^⁠)

╔═══════⩽ ✧ 🐰 ✧ ⩾═══════╗
       「 𝙄𝙉𝙁𝙊 𝘿𝙀 𝙇𝘼 𝘽𝙊𝙏 」
╚═══════⩽ ✧ 🐰 ✧ ⩾═══════╝
║ 🌌 *𝖳𝖬𝖠*: *𝖬𝖠𝖨 𝖲𝖠𝖪𝖴𝖱𝖠𝖩𝖨𝖬𝖠*
║ 🎭 *𝖬𝖮𝖣𝖮*: *𝖯𝖴𝖡𝖫𝖨𝖢𝖮*
║ 🐇 *𝖡𝖠𝖨𝖫𝖤𝖸𝖲*: *𝖬𝖴𝖫𝖳𝖨 𝖣𝖤𝖵𝖨𝖢𝖤*
║ 🌐 *𝖢𝖮𝖬𝖠𝖭𝖣𝖮𝖲*: ${totalCommands}
║ ⏱️ *𝖴𝖯𝖳𝖨𝖬𝖤*: ${uptime}
║ 👥 *𝖱𝖤𝖦𝖨𝖲𝖳𝖱𝖠𝖣𝖮𝖲*: ${totalreg}
║ 👩‍💻 *𝖮𝖶𝖭𝖤𝖱*: Aarom
╚════════════════════════

╔═══════⩽ ✧ 🐰 ✧ ⩾═══════╗
     「 𝙄𝙉𝙁𝙊 𝘿𝙀𝙇 𝙐𝙎𝙐𝘼𝙍𝙄𝙊 」
╚═══════⩽ ✧ 🐰 ✧ ⩾═══════╝
║ 👤 *𝖴𝖲𝖴𝖠𝖱𝖨𝖮*: ${name}
║ 🚀 *𝖤𝖷𝖯𝖤𝖱𝖨𝖤𝖭𝖢𝖨𝖠*: ${exp}
║ 💲 *𝖬𝖮𝖭𝖤𝖣𝖠𝖲*: ${coins}
║ 📊 *𝖭𝖨𝖵𝖤𝖫*: ${level}
║ 🏅 *𝖱𝖠𝖭𝖦𝖮*: ${role}
╚═══════════════════════╝

> 🌌 𝖢𝗈𝗇𝗏𝗂𝖾́𝗋𝗍𝖾𝗍𝖾 𝖾𝗇 𝗎𝗇 *𝗌𝗎𝖻-𝖻𝗈𝗍* 𝗎𝗌𝖺𝗇𝖽𝗈 *#𝗊𝗋* 𝗈 *#𝖼𝗈𝖽𝖾*

╔══⩽ ✧ 🐰 ✧ ⩾══╗
   「 ${(conn.user.jid == global.conn.user.jid ? '𝘽𝙤𝙩 𝙊𝙛𝙞𝙘𝙞𝙖𝙡' : '𝙎𝙪𝙗𝘽𝙤𝙩')} 」
╚══⩽ ✧ 🐰 ✧ ⩾══╝

*𝖫 𝖨 𝖲 𝖳 𝖠  𝖣 𝖤  𝖢 𝖮 𝖬 𝖠 𝖭 𝖣 𝖮 𝖲*

🌌───・──・──・﹕₊˚ ✦・🐰
├┈ ↷ 𝗂𝗇𝖿𝗈
├• ✐; 𝖬𝖺𝗂 𝖲𝗒𝗌𝗍𝖾𝗆 .
┣ 🌌 *#𝗁𝖾𝗅𝗉 • #𝗆𝖾𝗇𝗎* > ✦ 𝖬𝗎𝖾𝗌𝗍𝗋𝖺 𝗅𝖺 𝖼𝖺 cartelera 𝖽𝖾 𝖿𝗎𝗇𝖼𝗂𝗈𝗇𝖾𝗌.  
┣ 🌌 *#𝗎𝗉𝗍𝗂𝗆𝖾 • #𝗋𝗎𝗇𝗍𝗂𝗆𝖾* > ✦ 𝖳𝗂𝖾𝗆𝗉𝗈 𝖽𝖾 𝖾𝗌𝖼𝖾𝗇𝖺 𝖽𝖾 𝗅𝖺 𝖡𝗈𝗍.  
┣ 🌌 *#𝗌𝖼 • #𝗌𝖼𝗋𝗂𝗉𝗍* > ✦ 𝖠𝖼𝖼𝖾𝗌𝗈 𝖺𝗅 𝗀𝗎𝗂𝗈𝗇 𝗈𝖿𝗂𝖼𝗂𝖺𝗅 (𝖱𝖾𝗉𝗈𝗌𝗂𝗍𝗈𝗋𝗂𝗈).
┣ 🌌 *#𝗌𝗍𝖺𝖿𝖿 • #𝖼𝗈𝗅𝖺𝖻𝗈𝗋𝖺𝖽𝗈𝗋𝖾𝗌* > ✦ 𝖤𝗅 𝖾𝗅𝖾𝗇𝖼𝗈 𝖽𝖾𝗍𝗋𝖺́𝗌 𝖽𝖾 𝖾𝗌𝗍𝖾 𝗉𝗋𝗈𝗖𝗎𝖾𝖼𝗍𝗈.  
┣ 🌌 *#𝗈𝗐𝗇𝖾𝗋* > ✦ 𝖢𝗈𝗇𝗍𝖺𝖼𝗍𝗈 𝖽𝗂𝗋𝖾𝖼𝗍𝗈 𝖼𝗈𝗇 𝖠𝖺𝗋𝗈𝗆.  
┣ 🌌 *#𝗉 • #𝗉𝗂𝗇𝗀* > ✦ 𝖵𝖾𝗅𝗈𝖼𝗂𝖽𝖺𝖽 𝖽𝖾 𝗋𝖾𝗌𝗉𝗎𝖾𝗌𝗍𝖺 𝖺𝖼𝗍𝗎𝖺𝗅.  
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝

🌌───・──・──・﹕₊˚ ✦・🐰
├┈ ↷ 𝖻𝗎𝗌𝗊𝗎𝖾𝖽𝖺𝗌
┣ 🌌 *#𝗍𝗂𝗄𝗍𝗈𝗄𝗌𝖾𝖺𝗋𝗀𝗁*
> ✦ 𝖡𝗎𝗌𝖼𝖺𝗋 𝗏𝗂𝖽𝖾𝗈𝗌 𝖾𝗇 𝗅𝖺 𝗋𝖾𝖽.
┣ 🌌 *#𝗉𝗂𝗇 • #𝗉𝗂𝗇𝗍𝖾𝗋𝖾𝗌𝗍*
> ✦ 𝖡𝗎𝗌𝖼𝖺𝗋 𝗂𝗆𝖺́𝗀𝖾𝗇𝖾𝗌 𝖾𝗌𝗍𝖾́𝗍𝗂𝖼𝖺𝗌.
┣ 🌌 *#𝗀𝗈𝗈𝗀𝗅𝖾*
> ✦ 𝖢𝗈𝗇𝗌𝗎𝗅𝗍𝖺𝗋 𝖼𝗎𝖺𝗅𝗊𝗎𝗂𝖾𝗋 𝖽𝖺𝗍𝗈.
┣ 🌌 *#𝖺𝗇𝗂𝗆𝖾𝗂𝗇𝖿𝗈*
> ✦ 𝖣𝖾𝗍𝖺𝗅𝗅𝖾𝗌 𝖽𝖾 𝗍𝗎𝗌 𝗌𝖾𝗋𝗂𝖾𝗌 𝖿𝖺𝗏𝗈𝗋𝗂𝗍𝖺𝗌.
╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝
`.trim();

  // Configuración del mensaje con video o imagen
  await conn.sendMessage(m.chat, { 
    video: { url: randomGif }, 
    caption: txt, 
    gifPlayback: true,
    contextInfo: {
      externalAdReply: {
        title: '𝗠𝗔𝗜 𝗦𝗔𝗞𝗨𝗥𝗔𝗝𝗜𝗠𝗔 𝗦𝗬𝗦𝗧𝗘𝗠',
        body: '𝖠𝖺𝗋𝗈𝗆 𝖣𝖾𝗏𝖾𝗅𝗈𝗉𝖾𝗋 ✨',
        thumbnailUrl: 'https://qu.ax/STpE.jpg', // Cambia por una imagen de Mai
        sourceUrl: 'https://github.com/XLR4-Security',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m });
};

handler.help = ['menu'];
handler.tags = ['main'];
handler.command = /^(menu|help|principal)$/i;

export default handler;

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
  return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}
