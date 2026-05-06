<div align="center">
  <img src='https://causas-files.vercel.app/fl/jwlr.jpg' alt="Hiyuki Celestial MD" width="100%"/>

  <h1>❄︎ Hiyuki Celestial MD</h1>
  <p><i>WhatsApp Bot Premium — Z0RT SYSTEMS</i></p>

  ![Version](https://img.shields.io/badge/version-1.0.0-blue?style=flat-square)
  ![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square)
  ![License](https://img.shields.io/badge/license-MIT-purple?style=flat-square)
  ![Status](https://img.shields.io/badge/status-active-cyan?style=flat-square)
</div>

---

## ✿ Requisitos

- Node.js `v18+`
- Git
- FFmpeg (para comandos de audio/video)

---

## ✿ Instalación

```bash
git clone https://github.com/Zoredevteam-ctrl/hiyuki-celestial-md
cd hiyuki-celestial-md
npm install
```

---

## ✿ Iniciar

```bash
# Con código QR
node index.js --qr

# Con código de 8 dígitos
node index.js --code

# Menú interactivo
node index.js
```

---

## ✿ Características

| Feature | Estado |
|---|---|
| 🤖 Multi-plugin | ✅ |
| 🛡️ Antibot & Antilink | ✅ |
| 👤 Sistema de perfiles | ✅ |
| 💰 Economía completa | ✅ |
| 🎭 Reacciones anime | ✅ |
| 💞 Sistema social | ✅ |
| 🎮 Juegos y trivia | ✅ |
| 🎵 Descargas (Spotify, YT, IG) | ✅ |
| 🤖 Sub-Bot system | ✅ |
| 🎂 Cumpleaños | ✅ |
| 🔄 Auto-reconexión | ✅ |
| 📌 Pinterest downloader | ✅ |
| ❄︎ Waifu claim system | ✅ |

---

## ✿ Estructura

```
hiyuki-celestial-md/
├── index.js          # Núcleo del bot
├── handler.js        # Manejador de comandos
├── settings.js       # Configuración global
├── plugins/          # Comandos del bot
├── events/           # Eventos automáticos
├── lib/
│   └── database.js   # Base de datos
└── Sessions/         # Sesión de WhatsApp
```

---

## ✿ Configuración

Edita `settings.js` para personalizar:

```js
global.botName        = 'Hiyuki Celestial MD'
global.prefix         = '#'
global.icono          = 'url_del_icono'
global.banner         = 'url_del_banner'
global.rcanal         = 'url_del_canal'
global.newsletterJid  = 'jid_del_canal'
global.newsletterName = 'nombre_del_canal'
global.owner          = [
  ['tunumero', 'tu nombre', true]
]
```

---

## ✿ Comandos principales

| Categoría | Comandos |
|---|---|
| General | `#ping` `#menu` `#reg` `#owner` |
| Economía | `#bal` `#chamba` `#daily` `#robar` `#top` |
| Social | `#casar` `#divorcio` `#adoptar` |
| Juegos | `#8ball` `#dado` `#ruleta` `#trivia` |
| Anime | `#kiss` `#hug` `#pat` `#cry` `#neko` |
| Grupo | `#kick` `#ban` `#promote` `#tagall` `#antilink` |
| Descargas | `#play` `#spotify` `#ig` `#pin` |
| Sub-Bot | `#jadibot` `#code` `#bots` `#setprimary` |
| Waifu | `#c` `#rw` |

---

<div align="center">
  <p>
    <b>⟪❄︎⟫ Hecho con amor por <a href="https://github.com/Zoredevteam-ctrl">˚₊· ͟͟͞͞  ɪ ᴀᴍ  Aᴅʀɪᴇɴ</a> — Z0RT SYSTEMS</b>
  </p>
</div>
