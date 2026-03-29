/**
 * RENGU — App UI Logic
 * Navigasi, preview, fitur toggle, summary
 */
;(function(){
'use strict'

// ── State ──────────────────────────────────────────────────
const state = {
  connectMethod: 'both',
  aiProvider:    'free',
  posterStyle:   'gradient',
  enabledFeats:  new Set(),
  menuCmds:      {},
}

// Init menu cmds dari defaults
for (const m of MENU_CATS) state.menuCmds[m.id] = m.defaultCmd

const MENU_CATS = [
  { id:'owner',      label:'Owner Menu',      icon:'👑', defaultCmd:'ownermenu',      color:'#f59e0b' },
  { id:'group',      label:'Group Menu',      icon:'👥', defaultCmd:'groupmenu',      color:'#3b82f6' },
  { id:'game',       label:'Game Menu',       icon:'🎮', defaultCmd:'gamemenu',       color:'#8b5cf6' },
  { id:'rpg',        label:'RPG Menu',        icon:'⚔️', defaultCmd:'rpgmenu',        color:'#ef4444' },
  { id:'ai',         label:'AI Menu',         icon:'🤖', defaultCmd:'aimenu',         color:'#06b6d4' },
  { id:'image',      label:'Image Menu',      icon:'🖼️', defaultCmd:'imagemenu',      color:'#ec4899' },
  { id:'sticker',    label:'Sticker Menu',    icon:'🎨', defaultCmd:'stickermenu',    color:'#f97316' },
  { id:'downloader', label:'Downloader Menu', icon:'⬇️', defaultCmd:'downloadermenu', color:'#10b981' },
  { id:'stalk',      label:'Stalk Menu',      icon:'🔍', defaultCmd:'stalkmenu',      color:'#64748b' },
  { id:'sound',      label:'Sound Menu',      icon:'🎵', defaultCmd:'soundmenu',      color:'#a855f7' },
  { id:'convert',    label:'Convert Menu',    icon:'🔄', defaultCmd:'convertmenu',    color:'#14b8a6' },
  { id:'other',      label:'Other Menu',      icon:'📦', defaultCmd:'othermenu',      color:'#6b7280' },
  { id:'all',        label:'All Menu',        icon:'📋', defaultCmd:'allmenu',        color:'#25D366' },
  { id:'info',       label:'Info Bot',        icon:'ℹ️', defaultCmd:'infobot',        color:'#0ea5e9' },
]

// ── DOMContentLoaded ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav()
  initMenuGrid()
  initFeatureGrid()
  initDashboard()
  initColorPickers()
  initLivePreview()
  updateSummary()
  updateFileTree()
  updateTopbar()
})

// ── Navigation ──────────────────────────────────────────────
function initNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const sec = item.dataset.section
      goTo(sec)
    })
  })
  document.getElementById('menu-toggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open')
  })
}

window.goTo = function(sec) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'))
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'))
  const navItem = document.querySelector(`.nav-item[data-section="${sec}"]`)
  if (navItem) navItem.classList.add('active')
  const section = document.getElementById('sec-' + sec)
  if (section) section.classList.add('active')
  document.getElementById('topbar-title').textContent = navItem?.querySelector('.nav-label')?.textContent || sec
  document.getElementById('sidebar').classList.remove('open')
  window.scrollTo(0,0)
}

// ── Live Preview (identitas) ────────────────────────────────
function initLivePreview() {
  const fields = ['botName','ownerName','watermark','prefix','description']
  fields.forEach(id => {
    const el = document.getElementById(id)
    if (!el) return
    el.addEventListener('input', updatePreviews)
  })
  updatePreviews()
}

function updatePreviews() {
  const name  = v('botName')  || 'NekoBot'
  const owner = v('ownerName')|| 'Owner'
  const wm    = v('watermark')|| '© Bot'
  const pfx   = v('prefix')   || '.'

  set('pc-name',  name)
  set('pc-owner', '👤 ' + owner)
  set('pc-wm',    wm)
  set('pd-name',  name)
  set('pd-owner', '👤 Owner: ' + owner)
  set('pd-wm',    wm)
  set('prev-prefix', pfx)
  set('tb-bot',   name)

  updateMenuPreview()
  updateSummary()
}

// ── Menu Grid ───────────────────────────────────────────────
function initMenuGrid() {
  const grid = document.getElementById('menu-grid')
  if (!grid) return
  grid.innerHTML = ''

  MENU_CATS.forEach(m => {
    const catFeats = window.RENGU_FEATURES?.filter(f => f.cat === m.id) || []
    const row = document.createElement('div')
    row.className = 'menu-row'
    row.innerHTML = `
      <div class="mr-icon" style="background:${m.color}22;border:1px solid ${m.color}44">${m.icon}</div>
      <div class="mr-info">
        <div class="mr-label">${m.label}</div>
        <div class="mr-count">${catFeats.length} perintah</div>
      </div>
      <div class="mr-prefix" id="pfx-${m.id}">.</div>
      <input class="mr-input" id="mcmd-${m.id}" value="${m.defaultCmd}"
        placeholder="${m.defaultCmd}"
        style="border-color:${m.color}33"
        oninput="onMenuCmdChange('${m.id}',this.value)"
        onfocus="this.style.borderColor='${m.color}'"
        onblur="this.style.borderColor='${m.color}33'"/>
    `
    grid.appendChild(row)
  })
  updateMenuPreview()
}

window.onMenuCmdChange = function(id, val) {
  state.menuCmds[id] = val || MENU_CATS.find(m=>m.id===id)?.defaultCmd || id
  updateMenuPreview()
}

function updateMenuPreview() {
  const pfx = v('prefix') || '.'
  MENU_CATS.forEach(m => {
    const el = document.getElementById('pfx-' + m.id)
    if (el) el.textContent = pfx
  })
  const lines = MENU_CATS.map(m => {
    const cmd = state.menuCmds[m.id] || m.defaultCmd
    return `${m.icon} ${m.label}\n└ ${pfx}${cmd}`
  })
  const el = document.getElementById('menu-preview-text')
  if (el) el.textContent = lines.join('\n\n')
}

// ── Feature Grid ─────────────────────────────────────────────
function initFeatureGrid() {
  const container = document.getElementById('feat-categories')
  if (!container || !window.RENGU_FEATURES) return

  // Enable all by default
  window.RENGU_FEATURES.forEach(f => state.enabledFeats.add(f.id))

  renderFeatureGrid(window.RENGU_FEATURES)
  updateFeatCount()

  // Total count
  const tc = document.getElementById('total-feat-count')
  if (tc) tc.textContent = window.RENGU_FEATURES.length.toLocaleString('id-ID') + '+ fitur'
  const nb = document.getElementById('feat-count')
  if (nb) nb.textContent = window.RENGU_FEATURES.length
}

function renderFeatureGrid(features) {
  const container = document.getElementById('feat-categories')
  if (!container) return
  container.innerHTML = ''

  const cats = window.RENGU_CATS || {}
  const grouped = {}
  features.forEach(f => {
    if (!grouped[f.cat]) grouped[f.cat] = []
    grouped[f.cat].push(f)
  })

  Object.entries(grouped).forEach(([cat, feats]) => {
    const meta = cats[cat] || { icon:'📦', label:cat, color:'#666' }
    const block = document.createElement('div')
    block.className = 'feat-cat-block'
    block.id = 'fcat-' + cat

    const enabledInCat = feats.filter(f => state.enabledFeats.has(f.id)).length
    const allOn = enabledInCat === feats.length

    block.innerHTML = `
      <div class="fcb-header fcb-open" onclick="toggleCatBlock('${cat}')">
        <div class="fcb-icon">${meta.icon}</div>
        <div class="fcb-name" style="color:${meta.color}">${meta.label}</div>
        <div class="fcb-count">${enabledInCat}/${feats.length}</div>
        <button class="fcb-all" onclick="event.stopPropagation();toggleCatAll('${cat}')" id="fcb-all-${cat}">${allOn ? 'Matikan Semua' : 'Aktifkan Semua'}</button>
        <div class="fcb-chevron">▶</div>
      </div>
      <div class="fcb-features" id="fcb-feats-${cat}">
        ${feats.map(f => `
          <div class="feat-item ${state.enabledFeats.has(f.id) ? 'on' : ''}" id="fi-${f.id}" onclick="toggleFeat(${f.id})">
            <div class="feat-toggle"></div>
            <div class="feat-cmd">${v('prefix')||'.'}${f.cmd}</div>
            <div class="feat-name" title="${f.desc}">${f.name}</div>
          </div>
        `).join('')}
      </div>
    `
    container.appendChild(block)
  })

  updateFeatCount()
}

window.toggleCatBlock = function(cat) {
  const header = document.querySelector(`#fcat-${cat} .fcb-header`)
  const feats  = document.getElementById('fcb-feats-' + cat)
  if (!header || !feats) return
  const isOpen = header.classList.contains('fcb-open')
  header.classList.toggle('fcb-open', !isOpen)
  feats.style.display = isOpen ? 'none' : 'grid'
}

window.toggleCatAll = function(cat) {
  const feats = window.RENGU_FEATURES.filter(f => f.cat === cat)
  const allOn = feats.every(f => state.enabledFeats.has(f.id))
  feats.forEach(f => {
    allOn ? state.enabledFeats.delete(f.id) : state.enabledFeats.add(f.id)
    const el = document.getElementById('fi-' + f.id)
    if (el) el.classList.toggle('on', !allOn)
  })
  const btn = document.getElementById('fcb-all-' + cat)
  if (btn) btn.textContent = allOn ? 'Aktifkan Semua' : 'Matikan Semua'
  updateCatCount(cat)
  updateFeatCount()
}

window.toggleFeat = function(id) {
  if (state.enabledFeats.has(id)) state.enabledFeats.delete(id)
  else state.enabledFeats.add(id)
  const el = document.getElementById('fi-' + id)
  if (el) el.classList.toggle('on', state.enabledFeats.has(id))
  const feat = window.RENGU_FEATURES.find(f => f.id === id)
  if (feat) updateCatCount(feat.cat)
  updateFeatCount()
}

function updateCatCount(cat) {
  const feats = window.RENGU_FEATURES.filter(f => f.cat === cat)
  const en = feats.filter(f => state.enabledFeats.has(f.id)).length
  const block = document.getElementById('fcat-' + cat)
  if (block) {
    const countEl = block.querySelector('.fcb-count')
    if (countEl) countEl.textContent = `${en}/${feats.length}`
  }
}

window.toggleAll = function(val) {
  window.RENGU_FEATURES.forEach(f => {
    val ? state.enabledFeats.add(f.id) : state.enabledFeats.delete(f.id)
    const el = document.getElementById('fi-' + f.id)
    if (el) el.classList.toggle('on', val)
  })
  const cats = [...new Set(window.RENGU_FEATURES.map(f => f.cat))]
  cats.forEach(c => updateCatCount(c))
  updateFeatCount()
}

function updateFeatCount() {
  const n = state.enabledFeats.size
  const el = document.getElementById('feat-active-num')
  if (el) el.textContent = n.toLocaleString('id-ID')
  const nb = document.getElementById('feat-count')
  if (nb) nb.textContent = n
  const dc = document.getElementById('dc-enabled')
  if (dc) dc.textContent = n.toLocaleString('id-ID')
  set('tb-feat', n.toLocaleString('id-ID') + ' fitur aktif')
}

window.filterFeatures = function(q) {
  const lower = q.trim().toLowerCase()
  if (!lower) { renderFeatureGrid(window.RENGU_FEATURES); return }
  const filtered = window.RENGU_FEATURES.filter(f =>
    f.name.toLowerCase().includes(lower) ||
    f.cmd.toLowerCase().includes(lower)  ||
    f.cat.toLowerCase().includes(lower)  ||
    (f.desc && f.desc.toLowerCase().includes(lower))
  )
  renderFeatureGrid(filtered)
}

// ── Conn select ─────────────────────────────────────────────
window.selectConn = function(el) {
  document.querySelectorAll('.conn-opt').forEach(o => o.classList.remove('active'))
  el.classList.add('active')
  state.connectMethod = el.dataset.method
  updateSummary()
}

// ── AI select ───────────────────────────────────────────────
window.selectAI = function(el) {
  document.querySelectorAll('.ai-opt').forEach(o => o.classList.remove('active'))
  el.classList.add('active')
  state.aiProvider = el.dataset.prov

  ;['groq','openai','gemini'].forEach(p => {
    const inp = document.getElementById(p + '-input')
    if (inp) inp.style.display = 'none'
  })
  const cur = document.getElementById(state.aiProvider + '-input')
  if (cur) cur.style.display = 'block'
  updateSummary()
}

// ── Poster select ────────────────────────────────────────────
window.selectPoster = function(el) {
  document.querySelectorAll('.ps-item').forEach(p => p.classList.remove('active'))
  el.classList.add('active')
  state.posterStyle = el.dataset.style
}

// ── Color pickers ─────────────────────────────────────────────
function initColorPickers() {
  const c1 = document.getElementById('color1')
  const c2 = document.getElementById('color2')
  if (c1) c1.addEventListener('input', e => {
    document.getElementById('color1-hex').value = e.target.value
    updatePosterDemo()
  })
  if (c2) c2.addEventListener('input', e => {
    document.getElementById('color2-hex').value = e.target.value
    updatePosterDemo()
  })
  updatePosterDemo()
}

function updatePosterDemo() {
  const c1 = document.getElementById('color1')?.value || '#25D366'
  const c2 = document.getElementById('color2')?.value || '#075E54'
  const demo = document.getElementById('poster-demo')
  if (demo) demo.style.background = `linear-gradient(135deg, ${c1}, ${c2})`
  const previewCard = document.getElementById('preview-card')
  if (previewCard) previewCard.style.background = `linear-gradient(135deg, ${c1}, ${c2})`
}

// ── Store toggle ─────────────────────────────────────────────
window.toggleStore = function() {
  document.getElementById('tog-store')?.classList.toggle('active')
}

// ── Dashboard ────────────────────────────────────────────────
function initDashboard() {
  if (!window.RENGU_FEATURES || !window.RENGU_CATS) return
  const cats = window.RENGU_CATS
  const container = document.getElementById('dash-cats')
  if (!container) return
  container.innerHTML = ''

  Object.entries(cats).slice(0, 12).forEach(([cat, meta]) => {
    const count = window.RENGU_FEATURES.filter(f => f.cat === cat).length
    const card  = document.createElement('div')
    card.className = 'dc-cat'
    card.innerHTML = `
      <div class="dc-cat-icon">${meta.icon}</div>
      <div class="dc-cat-name" style="color:${meta.color}">${meta.label}</div>
      <div class="dc-cat-count">${count} fitur</div>
    `
    card.onclick = () => goTo('fitur')
    container.appendChild(card)
  })

  const total = document.getElementById('dc-total')
  if (total) total.textContent = window.RENGU_FEATURES.length.toLocaleString('id-ID') + '+'
}

// ── Summary ───────────────────────────────────────────────────
function updateSummary() {
  const grid = document.getElementById('summary-grid')
  if (!grid) return
  const items = [
    ['Nama Bot',     v('botName')      || 'NekoBot'],
    ['Owner',        v('ownerName')    || 'Owner'],
    ['Nomor',        v('ownerNumber')  || '-'],
    ['Prefix',       v('prefix')       || '.'],
    ['Koneksi',      state.connectMethod.toUpperCase()],
    ['AI Provider',  state.aiProvider.toUpperCase()],
    ['Fitur Aktif',  state.enabledFeats.size.toLocaleString('id-ID')],
    ['Toko',         document.getElementById('tog-store')?.classList.contains('active') ? 'Aktif' : 'Nonaktif'],
    ['Premium',      document.getElementById('tog-premium')?.classList.contains('active') ? 'Aktif' : 'Nonaktif'],
    ['Poster Style', state.posterStyle],
    ['Total Menu',   '14 kategori'],
    ['Total File',   '30+ files'],
  ]
  grid.innerHTML = items.map(([k,v]) => `
    <div class="sb-row">
      <span class="sb-key">${k}</span>
      <span class="sb-val">${v}</span>
    </div>
  `).join('')
}

// ── File Tree ──────────────────────────────────────────────────
function updateFileTree() {
  const tree = document.getElementById('file-tree')
  if (!tree) return
  const botName = (v('botName') || 'mybot').toLowerCase().replace(/\s+/g,'-')
  const files = [
    'index.js — Entry point + QR/Pairing + HTTP',
    'config.js — Konfigurasi lengkap',
    'handler.js — Router semua perintah',
    'package.json — Dependencies',
    '.env — API keys template',
    '.gitignore',
    'database.json — Initial database',
    'README.md — Dokumentasi',
    'lib/functions.js — Utilities',
    'lib/database.js — DB manager',
    'lib/poster.js — SVG poster gen',
    'features/menu.js — 14 menu + poster',
    'features/info.js — Info & tools',
    'features/downloader.js — YT/TT/IG/FB...',
    'features/sticker.js — Stiker maker',
    'features/ai.js — AI chat & image',
    'features/games.js — Games & kuis',
    'features/rpg.js — RPG system',
    'features/group.js — Admin grup',
    'features/owner.js — Owner cmds',
    'features/store.js — Toko & payment',
    'features/stalk.js — Stalk sosmed',
    'features/sound.js — Audio',
    'features/convert.js — Konversi',
    'features/image.js — Edit gambar',
    'features/tools.js — Tools utility',
    'features/search.js — Search engine',
    'features/education.js — Edukasi',
    'features/islam.js — Islam & agama',
    'features/fun.js — Fun & random',
    'session/.gitkeep',
  ]
  tree.innerHTML = files.map(f => `<div class="ft-file"><span>✓</span> ${f}</div>`).join('')
}

// ── Topbar ────────────────────────────────────────────────────
function updateTopbar() {
  const botName = v('botName') || 'NekoBot'
  set('tb-bot', botName)
}

// ── Helpers ───────────────────────────────────────────────────
function v(id) {
  const el = document.getElementById(id)
  return el ? el.value : ''
}
function set(id, text) {
  const el = document.getElementById(id)
  if (el) el.textContent = text
}

// Listen to identity field changes to update topbar & summary
;['botName','ownerName','ownerNumber','prefix'].forEach(id => {
  const el = document.getElementById(id)
  if (el) el.addEventListener('input', () => {
    updateSummary()
    updateTopbar()
    updateMenuPreview()
    updateFileTree()
  })
})

})()
