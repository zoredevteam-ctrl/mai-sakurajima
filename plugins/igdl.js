// plugins/igdl.js

// 1. Mejora en el Regex para aceptar links con "www." o sin "https://"
const isInstagram = url => /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel|share|tv|stories)\//i.test(url);

async function getInstagramMedia(url) {
    const apis = [
        {
            endpoint: `https://api.ryzendesu.vip/api/downloader/igdl?url=${encodeURIComponent(url)}`,
            extractor: res => {
                const item = res?.data?.[0];
                if (!item?.url) return null;
                return { type: item.url.includes('.mp4') ? 'video' : 'image', url: item.url };
            }
        },
        {
            endpoint: `https://nex-magical.vercel.app/download/instagram?url=${encodeURIComponent(url)}&apikey=NEX-D0E7E64C8F5E44E98F00D6B4`,
            extractor: res => {
                const item = res?.result?.[0] || res?.resultado?.[0];
                if (!item?.url) return null;
                return { type: item.type === 'video' ? 'video' : 'image', url: item.url };
            }
        },
        {
            endpoint: `https://api.nekorinn.my.id/downloader/instagram?url=${encodeURIComponent(url)}`,
            extractor: res => {
                if (!res.success || !res.result?.downloadUrl?.length) return null;
                const mediaUrl = res.result.downloadUrl[0];
                if (!mediaUrl) return null;
                return {
                    type:     res.result.metadata?.isVideo ? 'video' : 'image',
                    url:      mediaUrl,
                    usuario:  res.result.metadata?.username || null,
                    caption:  res.result.metadata?.caption  || null,
                    likes:    res.result.metadata?.like     || null,
                    comments: res.result.metadata?.comment  || null
                };
            }
        },
        {
            endpoint: `https://api.lolhuman.xyz/api/instagram2?apikey=nolimit&url=${encodeURIComponent(url)}`,
            extractor: res => {
                const item = res?.result?.[0];
                if (!item?.url) return null;
                return { type: item.type === 'video' ? 'video' : 'image', url: item.url };
            }
        },
        {
            endpoint: `https://api.tiklydown.eu.org/api/download/social?url=${encodeURIComponent(url)}`,
            extractor: res => {
                const item = res?.result?.medias?.[0];
                if (!item?.url) return null;
                return { type: item.type === 'video' ? 'video' : 'image', url: item.url };
            }
        }
    ];

    for (const { endpoint, extractor } of apis) {
        try {
            const res = await fetch(endpoint, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
            
            // 2. FIX CRÍTICO: fetch no arroja error si la API da 404 o 500. Esto obliga a saltar a la siguiente.
            if (!res.ok) continue; 
            
            const data = await res.json();
            const result = extractor(data);
            if (result && result.url) return result;
        } catch (e) {
            // Silenciado intencionalmente para que pase a la siguiente API del array
        }
        await new Promise(r => setTimeout(r, 500));
    }
    return null;
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // 3. FIX: Manejo más seguro del m.quoted para evitar TypeErrors
    const quotedText = m.quoted ? (m.quoted.text || m.quoted.body || '') : '';
    const url = args[0] || quotedText.trim();

    if (!url) return m.reply(
        `⟪❄︎⟫ Ingresa o responde a un link de Instagram\n✎ Uso: *${usedPrefix + command} <link>* ❄︎`
    );
    if (!isInstagram(url)) return m.reply(
        `⟪❄︎⟫ El link no es válido\n✎ Debe ser de Instagram (reel, post, stories) ❄︎`
    );

    await m.react('⏳');

    try {
        const media = await getInstagramMedia(url);

        if (!media) {
            await m.react('✗');
            return m.reply(`⟪❄︎⟫ No pude obtener el contenido\n✎ Puede ser privado o las APIs no responden ❄︎`);
        }

        await m.react('⬇');

        const caption =
            `⟪❄︎⟫ *Instagram*\n` +
            (media.usuario  ? `✎ Usuario: *${media.usuario}*\n`      : '') +
            (media.caption  ? `✎ Desc: ${media.caption.slice(0, 80)}...\n` : '') +
            (media.likes    ? `✎ Likes: *${media.likes}*\n`           : '') +
            (media.comments ? `✎ Comentarios: *${media.comments}*\n`  : '') +
            `✎ Descarga completada ❄︎`;

        if (media.type === 'video') {
            await conn.sendMessage(m.chat, {
                video:    { url: media.url },
                caption,
                mimetype: 'video/mp4',
                fileName: 'hiyuki_ig.mp4'
            }, { quoted: m });
        } else {
            await conn.sendMessage(m.chat, {
                image:   { url: media.url },
                caption
            }, { quoted: m });
        }

        await m.react('✓');

    } catch (e) {
        console.error('[IGDL ERROR]', e.message);
        await m.react('✗');
        await m.reply(`⟪❄︎⟫ Error: ${e.message.slice(0, 100)} ❄︎`);
    }
}

// 4. FIX PRINCIPAL: Cambio de Array a Regex para que el sistema lo registre correctamente
handler.command = /^(ig|instagram|igdl)$/i; 
handler.tags    = ['dl'];
handler.help    = ['ig']; // Añadido para que aparezca en el menú automático

export default handler;
