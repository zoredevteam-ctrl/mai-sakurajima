// ❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎
// ✦ [ PROTOCOLO DE EXTRACCIÓN INSTAGRAM MULTI-API ]
// ⟡ Design & Control: Adrien | XLR4-Security

import fetch from 'node-fetch'

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
                return {
                    type: res.result.metadata?.isVideo ? 'video' : 'image',
                    url: mediaUrl,
                    usuario: res.result.metadata?.username || null,
                    caption: res.result.metadata?.caption || null
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
        }
    ];

    for (const { endpoint, extractor } of apis) {
        try {
            const res = await fetch(endpoint, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
            if (!res.ok) continue; 
            const data = await res.json();
            const result = extractor(data);
            if (result && result.url) return result;
        } catch (e) {
            console.log('❄︎ [ LOG ] Nodo de Instagram fallido, saltando...');
        }
        await new Promise(r => setTimeout(r, 500));
    }
    return null;
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const quotedText = m.quoted ? (m.quoted.text || m.quoted.body || '') : '';
    const url = args[0] || quotedText.trim();

    if (!url) {
        const warning = `❄︎  ──  H I Y U K I  S Y S T E M  ──  ❄︎\n\n✦ [ ERROR DE PARÁMETROS ]\n  ⟡ Ingrese o responda a un link de Instagram.\n  ⟡ Uso: *${usedPrefix + command} <link>*`
        return conn.sendMessage(m.chat, { text: warning }, { quoted: m });
    }

    if (!isInstagram(url)) {
        return conn.sendMessage(m.chat, { text: `❄︎ [ ERROR ] El enlace de Instagram no es válido.` }, { quoted: m });
    }

    await m.react('⏳');

    try {
        const media = await getInstagramMedia(url);

        if (!media) {
            await m.react('❌');
            return conn.sendMessage(m.chat, { text: `❄︎ [ FALLO ] No se pudo interceptar el video. APIs fuera de línea.` }, { quoted: m });
        }

        await m.react('⬇️');

        const caption = `> ⟪❄︎⟫ Extracción Exitosa\n\n` +
                        `✦ [ REPORTE TÉCNICO ]\n` +
                        (media.usuario ? `  ⟡ Autor: *@${media.usuario}*\n` : '') +
                        `  ⟡ Plataforma: *Instagram*\n` +
                        `  ⟡ Seguridad: *XLR4-Protocol*`

        if (media.type === 'video') {
            await conn.sendMessage(m.chat, {
                video: { url: media.url },
                caption,
                mimetype: 'video/mp4',
                fileName: 'hiyuki_ig.mp4'
            }, { quoted: m });
        } else {
            await conn.sendMessage(m.chat, {
                image: { url: media.url },
                caption
            }, { quoted: m });
        }

        await m.react('✅');

    } catch (e) {
        console.error('[IGDL ERROR]', e.message);
        await m.react('❌');
        conn.sendMessage(m.chat, { text: `❄︎ [ ERROR CRÍTICO ]\n⟡ Detalle: ${e.message.slice(0, 50)}` }, { quoted: m });
    }
}

// ✦ REGISTRO AUTORIZADO (ARRAY FORMAT)
handler.help = ['ig']
handler.tags = ['dl']
handler.command = ['ig', 'instagram', 'igdl']

export default handler
