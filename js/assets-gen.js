/**
 * RENGU — Assets Generator
 * Generate sticker pack SVG, audio placeholders, fonts, images ke ZIP
 */
;(function(){
'use strict'

// ══════════════════════════════════════════════════════════════
// SVG STICKER PACK  (100 stiker emoji-style)
// ══════════════════════════════════════════════════════════════

const STICKER_PACK = [
  // emotions
  { id:'happy',     emoji:'😊', bg1:'#FFD93D', bg2:'#FF6B6B', label:'Happy'       },
  { id:'sad',       emoji:'😢', bg1:'#74b9ff', bg2:'#0984e3', label:'Sad'         },
  { id:'angry',     emoji:'😠', bg1:'#ff7675', bg2:'#d63031', label:'Angry'       },
  { id:'love',      emoji:'❤️', bg1:'#fd79a8', bg2:'#e84393', label:'Love'        },
  { id:'laugh',     emoji:'😂', bg1:'#fdcb6e', bg2:'#e17055', label:'Laugh'       },
  { id:'cry',       emoji:'😭', bg1:'#74b9ff', bg2:'#0652DD', label:'Cry'         },
  { id:'cool',      emoji:'😎', bg1:'#00b894', bg2:'#00cec9', label:'Cool'        },
  { id:'shocked',   emoji:'😱', bg1:'#a29bfe', bg2:'#6c5ce7', label:'Shocked'     },
  { id:'think',     emoji:'🤔', bg1:'#fab1a0', bg2:'#e17055', label:'Thinking'    },
  { id:'wink',      emoji:'😉', bg1:'#ffeaa7', bg2:'#fdcb6e', label:'Wink'        },
  { id:'kiss',      emoji:'😘', bg1:'#fd79a8', bg2:'#e84393', label:'Kiss'        },
  { id:'nerd',      emoji:'🤓', bg1:'#81ecec', bg2:'#00cec9', label:'Nerd'        },
  { id:'clown',     emoji:'🤡', bg1:'#ff7675', bg2:'#fdcb6e', label:'Clown'       },
  { id:'devil',     emoji:'😈', bg1:'#a29bfe', bg2:'#6c5ce7', label:'Devil'       },
  { id:'angel',     emoji:'😇', bg1:'#dfe6e9', bg2:'#b2bec3', label:'Angel'       },
  { id:'skull',     emoji:'💀', bg1:'#2d3436', bg2:'#636e72', label:'Skull'       },
  { id:'fire',      emoji:'🔥', bg1:'#e17055', bg2:'#d63031', label:'Fire'        },
  { id:'star',      emoji:'⭐', bg1:'#ffd32a', bg2:'#ffa801', label:'Star'        },
  { id:'rainbow',   emoji:'🌈', bg1:'#ff6b81', bg2:'#ffd32a', label:'Rainbow'     },
  { id:'sparkle',   emoji:'✨', bg1:'#f9f9f9', bg2:'#dfe6e9', label:'Sparkle'     },
  // actions
  { id:'thumbsup',  emoji:'👍', bg1:'#00b894', bg2:'#00cec9', label:'Good'        },
  { id:'thumbsdown',emoji:'👎', bg1:'#ff7675', bg2:'#d63031', label:'Bad'         },
  { id:'clap',      emoji:'👏', bg1:'#fdcb6e', bg2:'#e17055', label:'Clap'        },
  { id:'wave',      emoji:'👋', bg1:'#ffeaa7', bg2:'#fdcb6e', label:'Wave'        },
  { id:'peace',     emoji:'✌️', bg1:'#55efc4', bg2:'#00b894', label:'Peace'       },
  { id:'pray',      emoji:'🙏', bg1:'#fab1a0', bg2:'#e17055', label:'Pray'        },
  { id:'muscle',    emoji:'💪', bg1:'#fdcb6e', bg2:'#e17055', label:'Strong'      },
  { id:'point',     emoji:'👉', bg1:'#74b9ff', bg2:'#0984e3', label:'Point'       },
  { id:'ok',        emoji:'👌', bg1:'#55efc4', bg2:'#00b894', label:'OK'          },
  { id:'fist',      emoji:'✊', bg1:'#a29bfe', bg2:'#6c5ce7', label:'Fist'        },
  // objects
  { id:'phone',     emoji:'📱', bg1:'#636e72', bg2:'#2d3436', label:'Phone'       },
  { id:'laptop',    emoji:'💻', bg1:'#2d3436', bg2:'#636e72', label:'Laptop'      },
  { id:'camera',    emoji:'📷', bg1:'#2d3436', bg2:'#636e72', label:'Camera'      },
  { id:'music',     emoji:'🎵', bg1:'#a29bfe', bg2:'#6c5ce7', label:'Music'       },
  { id:'headphone', emoji:'🎧', bg1:'#2d3436', bg2:'#636e72', label:'Headphone'   },
  { id:'game',      emoji:'🎮', bg1:'#6c5ce7', bg2:'#2d3436', label:'Game'        },
  { id:'trophy',    emoji:'🏆', bg1:'#ffd32a', bg2:'#ffa801', label:'Trophy'      },
  { id:'crown',     emoji:'👑', bg1:'#ffd32a', bg2:'#e1b12c', label:'Crown'       },
  { id:'diamond',   emoji:'💎', bg1:'#74b9ff', bg2:'#0652DD', label:'Diamond'     },
  { id:'money',     emoji:'💰', bg1:'#00b894', bg2:'#00cec9', label:'Money'       },
  { id:'rocket',    emoji:'🚀', bg1:'#2d3436', bg2:'#636e72', label:'Rocket'      },
  { id:'alien',     emoji:'👽', bg1:'#00b894', bg2:'#55efc4', label:'Alien'       },
  { id:'robot',     emoji:'🤖', bg1:'#636e72', bg2:'#2d3436', label:'Robot'       },
  { id:'ghost',     emoji:'👻', bg1:'#dfe6e9', bg2:'#b2bec3', label:'Ghost'       },
  { id:'bomb',      emoji:'💣', bg1:'#2d3436', bg2:'#636e72', label:'Bomb'        },
  // nature
  { id:'sun',       emoji:'☀️', bg1:'#ffd32a', bg2:'#ffa801', label:'Sun'         },
  { id:'moon',      emoji:'🌙', bg1:'#2d3436', bg2:'#636e72', label:'Moon'        },
  { id:'earth',     emoji:'🌍', bg1:'#00b894', bg2:'#0984e3', label:'Earth'       },
  { id:'tree',      emoji:'🌳', bg1:'#00b894', bg2:'#55efc4', label:'Tree'        },
  { id:'flower',    emoji:'🌸', bg1:'#fd79a8', bg2:'#e84393', label:'Flower'      },
  { id:'cat',       emoji:'🐱', bg1:'#fdcb6e', bg2:'#e17055', label:'Cat'         },
  { id:'dog',       emoji:'🐶', bg1:'#fab1a0', bg2:'#e17055', label:'Dog'         },
  { id:'bear',      emoji:'🐻', bg1:'#b33000', bg2:'#6d1f00', label:'Bear'        },
  { id:'fox',       emoji:'🦊', bg1:'#e17055', bg2:'#d35400', label:'Fox'         },
  { id:'panda',     emoji:'🐼', bg1:'#dfe6e9', bg2:'#2d3436', label:'Panda'       },
  { id:'penguin',   emoji:'🐧', bg1:'#2d3436', bg2:'#636e72', label:'Penguin'     },
  { id:'shark',     emoji:'🦈', bg1:'#74b9ff', bg2:'#0652DD', label:'Shark'       },
  { id:'dragon',    emoji:'🐉', bg1:'#d63031', bg2:'#6c5ce7', label:'Dragon'      },
  // food
  { id:'burger',    emoji:'🍔', bg1:'#fdcb6e', bg2:'#e17055', label:'Burger'      },
  { id:'pizza',     emoji:'🍕', bg1:'#e17055', bg2:'#d63031', label:'Pizza'       },
  { id:'ramen',     emoji:'🍜', bg1:'#fdcb6e', bg2:'#e17055', label:'Ramen'       },
  { id:'sushi',     emoji:'🍣', bg1:'#ff7675', bg2:'#d63031', label:'Sushi'       },
  { id:'cake',      emoji:'🎂', bg1:'#fd79a8', bg2:'#e84393', label:'Cake'        },
  { id:'coffee',    emoji:'☕', bg1:'#b33000', bg2:'#6d1f00', label:'Coffee'      },
  { id:'boba',      emoji:'🧋', bg1:'#b33000', bg2:'#fdcb6e', label:'Boba'        },
  { id:'icecream',  emoji:'🍦', bg1:'#fd79a8', bg2:'#ffeaa7', label:'Ice Cream'   },
  { id:'watermelon',emoji:'🍉', bg1:'#00b894', bg2:'#d63031', label:'Watermelon'  },
  { id:'avocado',   emoji:'🥑', bg1:'#00b894', bg2:'#55efc4', label:'Avocado'     },
  // symbols
  { id:'check',     emoji:'✅', bg1:'#00b894', bg2:'#00cec9', label:'Check'       },
  { id:'cross',     emoji:'❌', bg1:'#ff7675', bg2:'#d63031', label:'Cross'       },
  { id:'warning',   emoji:'⚠️', bg1:'#ffd32a', bg2:'#ffa801', label:'Warning'     },
  { id:'info',      emoji:'ℹ️', bg1:'#74b9ff', bg2:'#0984e3', label:'Info'        },
  { id:'question',  emoji:'❓', bg1:'#a29bfe', bg2:'#6c5ce7', label:'Question'    },
  { id:'exclaim',   emoji:'❗', bg1:'#ff7675', bg2:'#d63031', label:'Exclaim'     },
  { id:'new',       emoji:'🆕', bg1:'#00b894', bg2:'#00cec9', label:'NEW'         },
  { id:'hot',       emoji:'🔥', bg1:'#e17055', bg2:'#d63031', label:'HOT'         },
  { id:'soon',      emoji:'🔜', bg1:'#74b9ff', bg2:'#0984e3', label:'SOON'        },
  { id:'top',       emoji:'🔝', bg1:'#ffd32a', bg2:'#ffa801', label:'TOP'         },
  // id/islamic
  { id:'merah_putih',emoji:'🇮🇩', bg1:'#d63031', bg2:'#ffffff', label:'Indonesia'  },
  { id:'bismillah', emoji:'☪️',  bg1:'#00b894', bg2:'#006266', label:'Bismillah'  },
  { id:'alhamdulillah',emoji:'🙏',bg1:'#00b894','bg2':'#006266',label:'Alhamdulillah'},
  { id:'salam',     emoji:'🕌', bg1:'#00b894', bg2:'#006266', label:'Assalamualaikum'},
  { id:'santuy',    emoji:'😌', bg1:'#55efc4', bg2:'#00b894', label:'Santuy'      },
  { id:'gaskeun',   emoji:'🚀', bg1:'#e17055', bg2:'#d63031', label:'Gas Keun!'   },
  { id:'anjay',     emoji:'😤', bg1:'#6c5ce7', bg2:'#a29bfe', label:'Anjay'       },
  { id:'mantap',    emoji:'👌', bg1:'#00b894', bg2:'#00cec9', label:'Mantap!'     },
  { id:'gokil',     emoji:'🤯', bg1:'#e17055', bg2:'#6c5ce7', label:'Gokil!'      },
  { id:'ngakak',    emoji:'🤣', bg1:'#fdcb6e', bg2:'#e17055', label:'Ngakak'      },
  // wa bot themed
  { id:'bot_online',emoji:'🟢', bg1:'#00b894', bg2:'#00cec9', label:'Bot Online'  },
  { id:'bot_busy',  emoji:'🔴', bg1:'#d63031', bg2:'#ff7675', label:'Bot Sibuk'   },
  { id:'premium',   emoji:'💎', bg1:'#ffd32a', bg2:'#e1b12c', label:'Premium'     },
  { id:'owner',     emoji:'👑', bg1:'#ffd32a', bg2:'#e1b12c', label:'Owner'       },
  { id:'banned',    emoji:'🚫', bg1:'#d63031', bg2:'#ff7675', label:'Banned'      },
  { id:'welcome_stk',emoji:'🎉',bg1:'#fd79a8', bg2:'#6c5ce7', label:'Welcome!'    },
  { id:'bye',       emoji:'👋', bg1:'#74b9ff', bg2:'#0984e3', label:'Bye!'        },
  { id:'loading',   emoji:'⏳', bg1:'#636e72', bg2:'#2d3436', label:'Loading...'  },
  { id:'done',      emoji:'✅', bg1:'#00b894', bg2:'#006266', label:'Done!'       },
  { id:'error',     emoji:'❌', bg1:'#d63031', bg2:'#ff0000', label:'Error!'      },
]

// Generate SVG sticker string
function makeStickerSVG(s) {
  return `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${s.bg1}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${s.bg2}" stop-opacity="0.95"/>
    </radialGradient>
    <radialGradient id="shine" cx="35%" cy="30%" r="60%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.25)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
  </defs>
  <!-- Background circle -->
  <circle cx="256" cy="256" r="240" fill="url(#bg)" filter="url(#shadow)"/>
  <!-- Shine overlay -->
  <circle cx="256" cy="256" r="240" fill="url(#shine)"/>
  <!-- Border -->
  <circle cx="256" cy="256" r="240" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="6"/>
  <!-- Emoji -->
  <text x="256" y="290" font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif"
    font-size="200" text-anchor="middle" dominant-baseline="middle">${s.emoji}</text>
  <!-- Label -->
  <rect x="106" y="400" width="300" height="44" rx="22" fill="rgba(0,0,0,0.3)"/>
  <text x="256" y="426" font-family="Arial Black,Arial,sans-serif" font-size="20" font-weight="900"
    fill="white" text-anchor="middle" letter-spacing="1">${s.label.toUpperCase()}</text>
</svg>`
}

// Generate welcome image SVG
function makeWelcomeImg(botName, themeColor) {
  return `<svg width="800" height="400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${themeColor}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.9"/>
    </linearGradient>
  </defs>
  <rect width="800" height="400" fill="url(#bg)" rx="20"/>
  <circle cx="700" cy="80" r="120" fill="rgba(255,255,255,0.05)"/>
  <circle cx="100" cy="320" r="80" fill="rgba(0,0,0,0.1)"/>
  <text x="400" y="140" font-family="Arial Black,Arial,sans-serif" font-size="48" font-weight="900"
    fill="white" text-anchor="middle">WELCOME!</text>
  <text x="400" y="195" font-family="Arial,sans-serif" font-size="24" fill="rgba(255,255,255,0.8)"
    text-anchor="middle">Selamat datang di grup kami 🎉</text>
  <rect x="150" y="225" width="500" height="2" fill="rgba(255,255,255,0.3)"/>
  <text x="400" y="270" font-family="Arial,sans-serif" font-size="18" fill="rgba(255,255,255,0.7)"
    text-anchor="middle">${botName}</text>
  <text x="400" y="350" font-family="Arial,sans-serif" font-size="14" fill="rgba(255,255,255,0.4)"
    text-anchor="middle">Rengu WA Bot Engine</text>
</svg>`
}

// Generate thumbnail/banner bot SVG
function makeBotBanner(botName, ownerName, themeColor) {
  return `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="60%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="${themeColor}" stop-opacity="0.4"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1050" cy="150" r="200" fill="${themeColor}" fill-opacity="0.08"/>
  <circle cx="150" cy="500" r="150" fill="${themeColor}" fill-opacity="0.05"/>
  <rect x="0" y="0" width="8" height="630" fill="${themeColor}"/>
  <text x="80" y="240" font-family="Arial Black,Arial,sans-serif" font-size="96" font-weight="900"
    fill="white">${botName}</text>
  <text x="84" y="310" font-family="Arial,sans-serif" font-size="32" fill="rgba(255,255,255,0.6)">
    WhatsApp MD Bot · 5000+ Fitur
  </text>
  <text x="84" y="370" font-family="Arial,sans-serif" font-size="24" fill="${themeColor}">
    Owner: ${ownerName}
  </text>
  <text x="84" y="560" font-family="Arial,sans-serif" font-size="18" fill="rgba(255,255,255,0.3)">
    Powered by Rengu WA Bot Engine
  </text>
</svg>`
}

// Generate font CSS (Google Fonts embed references)
function makeFontCss() {
  return `/* 
 * ==============================
 * RENGU Bot — Font Assets
 * ==============================
 * Font-font ini digunakan oleh poster generator (lib/poster.js)
 * untuk tampilan teks di gambar menu bot.
 *
 * Untuk custom font, ganti nama font di lib/poster.js
 * pada properti font-family di elemen SVG text.
 */

/* System fonts fallback chain untuk poster SVG */
:root {
  --font-heading: 'Arial Black', 'Arial Bold', 'Impact', sans-serif;
  --font-body:    'Arial', 'Helvetica Neue', 'Helvetica', sans-serif;
  --font-mono:    'Courier New', 'Consolas', 'Monaco', monospace;
  --font-emoji:   'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif;
}

/* 
 * Untuk menggunakan Google Fonts di web:
 * Import di file HTML: 
 *   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
 *
 * Recommended fonts untuk poster bot WA:
 * - Inter (modern, clean)
 * - Poppins (friendly, readable)
 * - Montserrat (bold headers)
 * - Source Code Pro (monospace)
 */

/* Sharp SVG font config:
 * Sharp menggunakan system font saat render SVG.
 * Di Pterodactyl (Ubuntu/Debian), install font dengan:
 *   apt-get install fonts-open-sans fonts-noto-color-emoji
 */
`
}

// Audio setup script
function makeAudioSetup() {
  return `#!/bin/bash
# ======================================
# RENGU Bot — Audio Assets Setup
# ======================================
# Jalankan script ini SEKALI setelah upload bot ke server
# untuk download file audio default.
#
# Usage:
#   chmod +x setup-assets.sh
#   ./setup-assets.sh

echo "======================================="
echo "  RENGU Bot — Setup Assets"
echo "======================================="

# Buat folder jika belum ada
mkdir -p assets/audio
mkdir -p assets/images

echo "[1/8] Download adzan subuh..."
curl -L -o assets/audio/adzan_subuh.mp3 \\
  "https://download.quranicaudio.com/quran/mishaari_raashid_al-3afaasee/001.mp3" \\
  --progress-bar || echo "Skip (tidak ada koneksi)"

echo "[2/8] Download adzan dzuhur..."
curl -L -o assets/audio/adzan_dzuhur.mp3 \\
  "https://www.islamicfinder.org/azaanTimings/audio/mecca.mp3" \\
  --progress-bar || echo "Skip"

echo "[3/8] Download suara notifikasi..."
curl -L -o assets/audio/notif.mp3 \\
  "https://www.soundjay.com/buttons/sounds/button-3.mp3" \\
  --progress-bar || echo "Skip"

echo "[4/8] Download suara level up..."
curl -L -o assets/audio/levelup.mp3 \\
  "https://www.soundjay.com/misc/sounds/win.mp3" \\
  --progress-bar || echo "Skip"

echo "[5/8] Download suara error..."
curl -L -o assets/audio/error.mp3 \\
  "https://www.soundjay.com/buttons/sounds/button-10.mp3" \\
  --progress-bar || echo "Skip"

echo "[6/8] Download suara success..."
curl -L -o assets/audio/success.mp3 \\
  "https://www.soundjay.com/misc/sounds/bell-ringing-01.mp3" \\
  --progress-bar || echo "Skip"

echo "[7/8] Download logo bot (SVG)..."
# Logo dibuat dari SVG di assets/images/logo.svg
echo "Logo sudah ada di assets/images/logo.svg"

echo "[8/8] Set permissions..."
chmod 644 assets/audio/* 2>/dev/null || true
chmod 644 assets/images/* 2>/dev/null || true

echo ""
echo "======================================="
echo "  Setup selesai!"
echo "  File audio ada di: assets/audio/"
echo "======================================="
`
}

// Audio README
function makeAudioReadme() {
  return `# Assets Audio — RENGU Bot

## Struktur Folder

\`\`\`
assets/audio/
├── adzan_subuh.mp3      ← Adzan waktu Subuh
├── adzan_dzuhur.mp3     ← Adzan waktu Dzuhur
├── adzan_ashar.mp3      ← Adzan waktu Ashar
├── adzan_magrib.mp3     ← Adzan waktu Maghrib
├── adzan_isya.mp3       ← Adzan waktu Isya
├── notif.mp3            ← Suara notifikasi bot
├── levelup.mp3          ← Suara level up RPG
├── success.mp3          ← Suara berhasil
├── error.mp3            ← Suara error
└── welcome.mp3          ← Suara sambutan
\`\`\`

## Cara Download Audio

Jalankan \`setup-assets.sh\` di server:

\`\`\`bash
chmod +x setup-assets.sh
./setup-assets.sh
\`\`\`

## Cara Pakai di Bot

File audio dipanggil oleh \`features/sound.js\` dan \`features/islam.js\`.

\`\`\`javascript
const fs = require('fs')
const path = require('path')

// Kirim adzan
const adzanBuf = fs.readFileSync(path.join(__dirname, '../assets/audio/adzan_subuh.mp3'))
await ctx.sendAud(adzanBuf)
\`\`\`

## Custom Audio

Kamu bisa ganti file audio sesuai keinginan.
Format yang didukung: MP3, AAC, OGG, M4A

Ukuran max yang direkomendasikan: **5MB per file**
`
}

// Expose to window
window.RENGU_ASSETS = {
  stickerPack:  STICKER_PACK,
  makeStickerSVG,
  makeWelcomeImg,
  makeBotBanner,
  makeFontCss,
  makeAudioSetup,
  makeAudioReadme,

  // Add all assets to ZIP
  addToZip: function(zip, botDir, cfg) {
    // ── Sticker Pack (100 SVG files) ──────────────────────────
    for (const s of STICKER_PACK) {
      zip.file(botDir + 'assets/stickers/' + s.id + '.svg', makeStickerSVG(s))
    }

    // ── Sticker pack info ──────────────────────────────────────
    zip.file(botDir + 'assets/stickers/pack-info.json', JSON.stringify({
      packName:   cfg.packName || 'Rengu Sticker Pack',
      author:     cfg.authorName || 'Rengu Engine',
      watermark:  cfg.watermarkStk || '© Rengu',
      total:      STICKER_PACK.length,
      categories: ['emotions','actions','objects','nature','food','symbols','indonesia','wabot'],
      stickers:   STICKER_PACK.map(s => ({ id:s.id, emoji:s.emoji, label:s.label }))
    }, null, 2))

    // ── Welcome image ──────────────────────────────────────────
    zip.file(botDir + 'assets/images/welcome.svg',
      makeWelcomeImg(cfg.botName, cfg.themeColor || '#25D366'))

    // ── Bot banner ─────────────────────────────────────────────
    zip.file(botDir + 'assets/images/banner.svg',
      makeBotBanner(cfg.botName, cfg.ownerName, cfg.themeColor || '#25D366'))

    // ── Default poster background ──────────────────────────────
    const posterBg = `<svg width="600" height="220" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${cfg.themeColor || '#25D366'}"/>
      <stop offset="100%" stop-color="${cfg.themeColor2 || '#075E54'}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="220" fill="url(#bg)" rx="16"/>
  <text x="300" y="120" font-family="Arial Black,sans-serif" font-size="32" font-weight="900"
    fill="white" text-anchor="middle">${cfg.botName}</text>
</svg>`
    zip.file(botDir + 'assets/images/poster-bg.svg', posterBg)

    // ── Default bot profile pic ────────────────────────────────
    const profileSvg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
  <circle cx="200" cy="200" r="200" fill="${cfg.themeColor || '#25D366'}"/>
  <text x="200" y="240" font-family="Arial Black,sans-serif" font-size="180" font-weight="900"
    fill="white" text-anchor="middle">${(cfg.botName||'B').charAt(0).toUpperCase()}</text>
</svg>`
    zip.file(botDir + 'assets/images/profile.svg', profileSvg)

    // ── Fonts ──────────────────────────────────────────────────
    zip.file(botDir + 'assets/fonts/fonts.css', makeFontCss())
    zip.file(botDir + 'assets/fonts/README.md', `# Fonts
\nFont SVG poster menggunakan system font (Arial Black, Arial).\n\nUntuk custom font:\n1. Download font TTF ke folder ini\n2. Update \`lib/poster.js\` font-family\n3. Install font di server: \`apt-get install fonts-noto-color-emoji\`\n`)

    // ── Audio ──────────────────────────────────────────────────
    zip.file(botDir + 'assets/audio/README.md', makeAudioReadme())
    zip.file(botDir + 'setup-assets.sh', makeAudioSetup())

    // ── Sticker lib helper ─────────────────────────────────────
    zip.file(botDir + 'lib/sticker-pack.js', `/**
 * Sticker Pack Manager
 * Mengelola stiker bawaan dari assets/stickers/
 */
'use strict'
const fs   = require('fs')
const path = require('path')
const sharp = require('sharp')

const STICKER_DIR = path.join(__dirname, '../assets/stickers')
const PACK_INFO   = require('../assets/stickers/pack-info.json')

/**
 * Ambil semua stiker yang tersedia
 */
exports.listStickers = function() {
  return PACK_INFO.stickers
}

/**
 * Kirim stiker dari pack ke chat
 * @param {Object} ctx - context handler
 * @param {string} id  - sticker ID
 */
exports.sendPackSticker = async function(ctx, id) {
  const stickerPath = path.join(STICKER_DIR, id + '.svg')
  if (!fs.existsSync(stickerPath)) {
    const list = PACK_INFO.stickers.filter(s => s.id === id)
    if (!list.length) return ctx.reply('❌ Stiker "' + id + '" tidak ditemukan')
  }

  const svgBuf = fs.readFileSync(stickerPath)
  const webp   = await sharp(svgBuf)
    .resize(512, 512)
    .webp({ quality: 80 })
    .toBuffer()

  await ctx.sock.sendMessage(ctx.from, {
    sticker: webp,
    stickerMetadata: { pack: ctx.cfg.packName, author: ctx.cfg.watermarkStk }
  }, { quoted: ctx.msg })
}

/**
 * Buat stiker dari gambar dengan custom watermark
 * @param {Buffer} imgBuf  - buffer gambar
 * @param {string} wmText  - teks watermark (kosong = tidak ada)
 * @param {Object} opts    - opsi: { packName, author, size }
 */
exports.makeSticker = async function(imgBuf, wmText, opts = {}) {
  const { packName = 'Bot Sticker', author = 'Bot', size = 512 } = opts

  let img = sharp(imgBuf)
  const meta = await img.metadata()

  // Resize ke 512x512 dengan padding transparan
  img = img.resize({
    width: size, height: size,
    fit: 'contain',
    background: { r:0, g:0, b:0, alpha:0 }
  })

  // Tambah watermark jika ada
  if (wmText && wmText.trim()) {
    const wmSvg = \`<svg width="\${size}" height="\${size}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="\${size-40}" width="\${size}" height="40" fill="rgba(0,0,0,0.5)" rx="0"/>
      <text x="\${size/2}" y="\${size-12}" font-family="Arial,sans-serif" font-size="18" font-weight="700"
        fill="white" text-anchor="middle" opacity="0.9">\${wmText.replace(/</g,'&lt;')}</text>
    </svg>\`

    const wmBuf = Buffer.from(wmSvg)
    const base  = await img.png().toBuffer()
    img = sharp(base).composite([{ input: wmBuf, blend: 'over' }])
  }

  const webp = await img.webp({ quality: 80 }).toBuffer()
  return { webp, packName, author }
}

/**
 * Random stiker dari pack
 */
exports.randomSticker = async function(ctx) {
  const list = PACK_INFO.stickers
  const rand = list[Math.floor(Math.random() * list.length)]
  await exports.sendPackSticker(ctx, rand.id)
  return rand
}
`)

    return STICKER_PACK.length // return count untuk info
  }
}

})()
