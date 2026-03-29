/**
 * RENGU — Poster Preview (browser-side SVG)
 * Dipakai untuk preview live di UI, bukan di bot
 */
;(function(){
'use strict'

const CAT_COLORS = {
  owner:         ['#f59e0b','#92400e'],
  group:         ['#3b82f6','#1e3a8a'],
  game:          ['#8b5cf6','#4c1d95'],
  rpg:           ['#ef4444','#7f1d1d'],
  ai:            ['#06b6d4','#0c4a6e'],
  image:         ['#ec4899','#831843'],
  sticker:       ['#f97316','#7c2d12'],
  downloader:    ['#10b981','#064e3b'],
  stalk:         ['#64748b','#1e293b'],
  sound:         ['#a855f7','#581c87'],
  convert:       ['#14b8a6','#134e4a'],
  other:         ['#6b7280','#1f2937'],
  all:           ['#25D366','#075E54'],
  info:          ['#0ea5e9','#0c4a6e'],
  default:       ['#25D366','#075E54'],
}

/**
 * Buat SVG string untuk poster menu
 */
window.RENGU_makePosterSVG = function(opts) {
  const {
    category = 'default',
    title    = 'MENU',
    botName  = 'BotName',
    ownerName= 'Owner',
    cmdCount = 0,
    watermark= '',
    color1, color2
  } = opts

  const cols = (color1 && color2)
    ? [color1, color2]
    : (CAT_COLORS[category] || CAT_COLORS.default)

  const c1 = cols[0], c2 = cols[1]
  const icons = {
    owner:'👑', group:'👥', game:'🎮', rpg:'⚔️', ai:'🤖',
    image:'🖼', sticker:'🎨', downloader:'⬇️', stalk:'🔍',
    sound:'🎵', convert:'🔄', other:'📦', all:'📋', info:'ℹ️'
  }
  const icon = icons[category] || '📋'

  return `<svg width="600" height="220" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${c1}"/>
      <stop offset="100%" style="stop-color:${c2}"/>
    </linearGradient>
    <linearGradient id="card" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(255,255,255,0.10)"/>
      <stop offset="100%" style="stop-color:rgba(0,0,0,0.18)"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="rgba(0,0,0,0.4)"/></filter>
  </defs>
  <rect width="600" height="220" fill="url(#bg)" rx="16"/>
  <circle cx="520" cy="-15" r="100" fill="rgba(255,255,255,0.05)"/>
  <circle cx="580" cy="210" r="75" fill="rgba(255,255,255,0.04)"/>
  <circle cx="20" cy="200" r="55" fill="rgba(0,0,0,0.07)"/>
  <rect x="0" y="0" width="4" height="220" fill="rgba(255,255,255,0.4)" rx="2"/>
  <rect x="20" y="14" width="560" height="192" fill="url(#card)" rx="11"/>
  <rect x="34" y="26" width="82" height="22" rx="11" fill="rgba(0,0,0,0.22)"/>
  <text x="75" y="41" font-family="Arial,sans-serif" font-size="10" font-weight="700"
    fill="rgba(255,255,255,0.85)" text-anchor="middle" letter-spacing="1">MENU</text>
  <text x="34" y="88" font-family="Arial Black,Arial,sans-serif" font-size="28" font-weight="900"
    fill="white" filter="url(#shadow)">${escXml(title.toUpperCase())}</text>
  <text x="34" y="112" font-family="Arial,sans-serif" font-size="12" fill="rgba(255,255,255,0.7)">${cmdCount} perintah tersedia</text>
  <rect x="34" y="125" width="532" height="1" fill="rgba(255,255,255,0.18)"/>
  <text x="34" y="150" font-family="Arial,sans-serif" font-size="12" fill="rgba(255,255,255,0.65)">🤖 ${escXml(botName)}</text>
  <text x="34" y="170" font-family="Arial,sans-serif" font-size="12" fill="rgba(255,255,255,0.65)">👤 Owner: ${escXml(ownerName)}</text>
  <text x="564" y="204" font-family="Arial,sans-serif" font-size="9"
    fill="rgba(255,255,255,0.35)" text-anchor="end">${escXml(watermark)}</text>
</svg>`
}

function escXml(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
}

// Update live poster preview saat form berubah
function updateLivePoster() {
  const demo  = document.getElementById('poster-demo')
  if (!demo) return
  const c1 = document.getElementById('color1')?.value || '#25D366'
  const c2 = document.getElementById('color2')?.value || '#075E54'
  demo.style.background = `linear-gradient(135deg, ${c1}, ${c2})`
  const pdName  = document.getElementById('pd-name')
  const pdOwner = document.getElementById('pd-owner')
  const pdWm    = document.getElementById('pd-wm')
  const botName = document.getElementById('botName')?.value || 'NekoBot'
  const owner   = document.getElementById('ownerName')?.value || 'Owner'
  const wm      = document.getElementById('watermark')?.value || '© Bot'
  if (pdName)  pdName.textContent  = botName
  if (pdOwner) pdOwner.textContent = '👤 Owner: ' + owner
  if (pdWm)    pdWm.textContent    = wm
}

document.addEventListener('DOMContentLoaded', () => {
  ;['botName','ownerName','watermark','color1','color2'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateLivePoster)
  })
  updateLivePoster()
})

})()
