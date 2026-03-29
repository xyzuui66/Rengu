/**
 * RENGU — Bot ZIP Generator
 * Generate semua file bot WhatsApp MD siap pakai
 */
;(function(){
'use strict'

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

// ── Helpers ──────────────────────────────────────────────────
function gv(id)  { return (document.getElementById(id)?.value || '').trim() }
function gtog(id){ return document.getElementById(id)?.classList.contains('active') }
function getSel(cls) { return document.querySelector(cls + '.active')?.dataset }

function getConfig() {
  const menuCmds = {}
  MENU_CATS.forEach(m => {
    const el = document.getElementById('mcmd-' + m.id)
    menuCmds[m.id] = (el?.value || m.defaultCmd).trim()
  })
  return {
    botName:       gv('botName')       || 'NekoBot',
    ownerName:     gv('ownerName')     || 'Owner',
    ownerNumber:   gv('ownerNumber')   || '628123456789',
    prefix:        gv('prefix')        || '.',
    description:   gv('description')   || 'Bot WA MD',
    footer:        gv('footer')        || 'Powered by Rengu Engine',
    watermark:     gv('watermark')     || '© NekoBot',
    packName:      gv('packName')      || 'NekoBot Sticker',
    authorName:    gv('authorName')    || 'Creator',
    watermarkStk:  gv('watermarkStk')  || '© NekoBot',
    timezone:      gv('timezone')      || 'Asia/Jakarta',
    aiProvider:    getSel('.ai-opt')?.prov || 'free',
    groqKey:       gv('groqKey'),
    openaiKey:     gv('openaiKey'),
    geminiKey:     gv('geminiKey'),
    aiPersona:     gv('aiPersona')     || 'asisten WA yang ramah',
    aiLang:        gv('aiLang')        || 'id',
    connectMethod: getSel('.conn-opt')?.method || 'both',
    posterStyle:   getSel('.ps-item')?.style   || 'gradient',
    themeColor:    document.getElementById('color1')?.value || '#25D366',
    themeColor2:   document.getElementById('color2')?.value || '#075E54',
    enableStore:   gtog('tog-store'),
    enablePremium: gtog('tog-premium'),
    payment: {
      dana:    gv('pay-dana'),
      ovo:     gv('pay-ovo'),
      gopay:   gv('pay-gopay'),
      bca:     gv('pay-bca'),
      mandiri: gv('pay-mandiri'),
      bri:     gv('pay-bri'),
      qris:    gv('pay-qris'),
      bsi:     gv('pay-bsi'),
    },
    products: gv('products'),
    menuCmds,
    enabledCmds: [...(window._state?.enabledFeats || [])],
  }
}

// ════════════════════════════════════════════════════════════
// FILE GENERATORS
// ════════════════════════════════════════════════════════════

function genPackageJson(c) {
  const name = c.botName.toLowerCase().replace(/[^a-z0-9]+/g,'-')
  return JSON.stringify({
    name, version:'1.0.0',
    description: `${c.botName} — WhatsApp MD Bot by Rengu Engine`,
    main: 'index.js',
    scripts: { start:'node index.js', dev:'node --watch index.js' },
    engines: { node:'>=18.0.0' },
    keywords: ['whatsapp','bot','md','baileys','rengu'],
    dependencies: {
      '@whiskeysockets/baileys': '^6.7.18',
      '@hapi/boom':    '^10.0.1',
      'axios':         '^1.7.2',
      'express':       '^4.19.2',
      'pino':          '^9.2.0',
      'qrcode':        '^1.5.4',
      'sharp':         '^0.33.4',
      'ytdl-core':     '^4.11.5',
      'fluent-ffmpeg': '^2.1.2',
      'ffmpeg-static': '^5.2.0',
      'jimp':          '^0.22.12',
      'node-fetch':    '^2.7.0',
      'form-data':     '^4.0.0',
      'moment':        '^2.30.1',
      'moment-timezone':'^0.5.45',
      'cheerio':       '^1.0.0-rc.12',
      'dotenv':        '^16.4.5',
    }
  }, null, 2)
}

function genGitignore() {
  return `node_modules/\nsession/\n*.log\n.env\ndatabase.json\n`
}

function genEnv(c) {
  return `# Isi API key di sini (jangan di-upload ke GitHub!)
BOT_NAME="${c.botName}"
OWNER_NUMBER="${c.ownerNumber}"
GROQ_API_KEY=${c.groqKey || ''}
OPENAI_API_KEY=${c.openaiKey || ''}
GEMINI_API_KEY=${c.geminiKey || ''}
PORT=3000
`
}

function genConfig(c) {
  const owners = c.ownerNumber.split(',').map(n => `'${n.replace(/\D/g,'')}'`).join(', ')
  const products = (c.products || '').split('\n')
    .filter(l => l.trim())
    .map(l => {
      const [id, name, price, desc] = l.split('|')
      return `  { id:'${(id||'P001').trim()}', name:'${(name||'Produk').trim()}', price:${parseInt(price)||10000}, desc:'${(desc||'').trim()}' },`
    }).join('\n')

  const menuCmdsBlock = MENU_CATS.map(m =>
    `    ${m.id.padEnd(14)}: '${c.menuCmds[m.id] || m.defaultCmd}',`
  ).join('\n')

  return `/**
 * ╔══════════════════════════════════════════╗
 * ║  ${c.botName.padEnd(42)}║
 * ║  Dibuat dengan Rengu WA Bot Engine       ║
 * ╚══════════════════════════════════════════╝
 * Edit file ini untuk kustomisasi bot kamu!
 */
'use strict'
require('dotenv').config()

module.exports = {
  // ── Identitas ───────────────────────────────
  botName:     '${c.botName}',
  ownerName:   '${c.ownerName}',
  ownerNumber: [${owners}],
  prefix:      '${c.prefix}',
  description: '${c.description}',
  footer:      '${c.footer}',

  // ── Watermark ──────────────────────────────
  watermark:    '${c.watermark}',
  packName:     '${c.packName}',
  authorName:   '${c.authorName}',
  watermarkStk: '${c.watermarkStk}',

  // ── Koneksi: 'qr' | 'pairing' | 'both' ─────
  connectMethod: '${c.connectMethod}',

  // ── Poster & Tema ──────────────────────────
  themeColor:  '${c.themeColor}',
  themeColor2: '${c.themeColor2}',
  posterStyle: '${c.posterStyle}',

  // ── Menu Commands (bisa dicustom) ──────────
  menuCmds: {
${menuCmdsBlock}
  },

  // ── AI Settings ────────────────────────────
  aiProvider:  '${c.aiProvider}',  // 'free' | 'groq' | 'openai' | 'gemini'
  groqKey:     process.env.GROQ_API_KEY    || '${c.groqKey || ''}',
  openaiKey:   process.env.OPENAI_API_KEY  || '${c.openaiKey || ''}',
  geminiKey:   process.env.GEMINI_API_KEY  || '${c.geminiKey || ''}',
  aiModel:     '${c.aiProvider === 'groq' ? 'llama3-8b-8192' : c.aiProvider === 'openai' ? 'gpt-3.5-turbo' : 'gemini-1.5-flash'}',
  aiPersona:   '${c.aiPersona}',
  aiLang:      '${c.aiLang}',

  // ── Payment ────────────────────────────────
  payment: {
    dana:    '${c.payment.dana    || '-'}',
    ovo:     '${c.payment.ovo     || '-'}',
    gopay:   '${c.payment.gopay   || '-'}',
    bca:     '${c.payment.bca     || '-'}',
    mandiri: '${c.payment.mandiri || '-'}',
    bri:     '${c.payment.bri     || '-'}',
    qris:    '${c.payment.qris    || '-'}',
    bsi:     '${c.payment.bsi     || '-'}',
  },

  // ── Produk Toko ────────────────────────────
  products: [
${products}
  ],

  // ── Fitur Toggle ───────────────────────────
  features: {
    store:       ${c.enableStore   ? 'true' : 'false'},
    premium:     ${c.enablePremium ? 'true' : 'false'},
    antiSpam:    true,
    spamDelay:   2000,
    autoRead:    false,
    autoTyping:  true,
    autoOnline:  false,
    selfMode:    false,
    antiCall:    false,
    logChat:     false,
  },

  // ── Misc ───────────────────────────────────
  timezone:   '${c.timezone}',
  maxMediaMB: 50,
  rpg: {
    maxLevel: 100, xpPerLevel: 100,
    baseHp: 100, baseAtk: 10, baseDef: 5, startGold: 50,
  },
}
`
}

function genIndex(c) {
  const isQR     = c.connectMethod !== 'pairing'
  const isPairing= c.connectMethod !== 'qr'
  return `/**
 * ${c.botName} — Entry Point
 * Dibuat dengan Rengu WA Bot Engine
 */
'use strict'
require('dotenv').config()
const { makeWASocket, useMultiFileAuthState, DisconnectReason,
  fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys')
const { Boom }    = require('@hapi/boom')
const pino        = require('pino')
const express     = require('express')
const cfg         = require('./config')
const handler     = require('./handler')
const { log, banner, fmtUptime } = require('./lib/functions')

// ── HTTP Health Check (Pterodactyl) ────────────────────────
const app = express()
app.get('/',       (_, r) => r.json({ bot:cfg.botName, status:'online', uptime:Math.floor(process.uptime()) }))
app.get('/health', (_, r) => r.send('OK'))
app.listen(process.env.PORT || 3000, () => log('info', 'HTTP health check port ' + (process.env.PORT||3000)))

// ── Global ────────────────────────────────────────────────
global.botStart = Date.now()
global.db       = require('./lib/database').load()
global.cfg      = cfg
global.spam     = {}

let retries = 0

async function connect() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  const { version }          = await fetchLatestBaileysVersion()

  banner(cfg)

  const sock = makeWASocket({
    version,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level:'silent' })) },
    logger:              pino({ level:'silent' }),
    printQRInTerminal:   ${isQR},
    browser:             [cfg.botName, 'Chrome', '121.0.0'],
    syncFullHistory:     false,
    markOnlineOnConnect: cfg.features.autoOnline,
    getMessage: async () => ({ conversation:'' }),
  })

${isPairing ? `
  // ── Pairing Code ─────────────────────────────────────────
  if (['pairing','both'].includes(cfg.connectMethod) && !sock.authState.creds.registered) {
    const num = cfg.ownerNumber[0].replace(/\\D/g,'')
    log('info', 'Meminta pairing code untuk nomor ' + num + '...')
    await new Promise(r => setTimeout(r, 3000))
    try {
      const code = await sock.requestPairingCode(num)
      log('success', '╔══════════════════════════╗')
      log('success', '║  PAIRING CODE : ' + code + '  ║')
      log('success', '╚══════════════════════════╝')
      log('info',    'Buka WA > Perangkat Tertaut > Tautkan dengan kode telepon')
    } catch(e) { log('error', 'Gagal pairing code: ' + e.message) }
  }
` : ''}

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode
      log('warn', 'Koneksi tertutup — kode: ' + code)
      if (code === DisconnectReason.loggedOut) {
        log('error', 'Logged out! Hapus folder session/ dan restart.')
        return process.exit(0)
      }
      retries++
      const delay = Math.min(5000 * retries, 60000)
      log('info', 'Reconnect dalam ' + (delay/1000) + 's...')
      setTimeout(connect, delay)
    }
    if (connection === 'open') { retries = 0; log('success', '✓ ' + cfg.botName + ' terhubung!') }
  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue
      try { await handler(sock, msg) }
      catch (e) { log('error', 'Handler: ' + e.message) }
    }
  })

  sock.ev.on('group-participants.update', async (ev) => {
    try { await require('./features/group').onGroupUpdate(sock, ev) } catch(_) {}
  })

  sock.ev.on('call', async (calls) => {
    for (const call of calls) {
      if (call.status === 'offer' && cfg.features.antiCall)
        await sock.rejectCall(call.id, call.from).catch(() => {})
    }
  })

  return sock
}

connect().catch(e => { log('error', '[FATAL] ' + e.message); process.exit(1) })
`
}

function genHandler(c) {
  return `/**
 * ${c.botName} — Message Handler
 * Semua perintah diproses di sini
 */
'use strict'
const cfg = require('./config')
const { log, getBody, getQuoted, getMentions, getMediaType } = require('./lib/functions')

// Load semua feature files
const FEAT_FILES = [
  'menu','info','tools','downloader','sticker','ai',
  'games','rpg','group','owner','store','stalk',
  'sound','convert','image','search','education',
  'islam','fun',
]
const cmdMap = new Map()
for (const f of FEAT_FILES) {
  try {
    const feats = require('./features/' + f)
    const list  = Array.isArray(feats) ? feats : (feats.features || [])
    for (const feat of list) {
      if (!feat?.commands) continue
      for (const cmd of feat.commands)
        if (!cmdMap.has(cmd)) cmdMap.set(cmd, feat)
    }
  } catch(e) { log('warn', 'Load ' + f + ': ' + e.message) }
}
log('info', 'Commands loaded: ' + cmdMap.size)

module.exports = async function handler(sock, msg) {
  const body   = getBody(msg)
  const from   = msg.key.remoteJid
  const sender = msg.key.participant || msg.key.remoteJid
  const sNum   = sender.replace(/\\D/g,'')

  if (!body) return

  // Anti spam
  if (cfg.features.antiSpam) {
    const now = Date.now()
    if (global.spam[sNum] && now - global.spam[sNum] < cfg.features.spamDelay) return
    global.spam[sNum] = now
  }

  // Self mode
  if (cfg.features.selfMode && !cfg.ownerNumber.includes(sNum)) return

  // Prefix check
  if (!body.startsWith(cfg.prefix)) return

  const [rawCmd, ...argArr] = body.slice(cfg.prefix.length).trim().split(/\\s+/)
  const cmd  = rawCmd.toLowerCase()
  const args = argArr
  const text = args.join(' ')

  const isGroup    = from.endsWith('@g.us')
  const isOwner    = cfg.ownerNumber.includes(sNum)
  const isPremium  = global.db.premium?.includes(sNum) || isOwner
  const quoted     = getQuoted(msg)
  const mentioned  = getMentions(msg)
  const mediaType  = getMediaType(msg)

  let groupMeta = null, isAdmin = false, isBotAdmin = false
  if (isGroup) {
    try {
      groupMeta  = await sock.groupMetadata(from)
      const adms = groupMeta.participants.filter(p => p.admin).map(p => p.id)
      isAdmin    = adms.includes(sender)
      const botId= (sock.user?.id || '').split(':')[0] + '@s.whatsapp.net'
      isBotAdmin = adms.includes(botId)
    } catch(_) {}
  }

  if (cfg.features.autoTyping) await sock.sendPresenceUpdate('composing', from).catch(() => {})

  const ctx = {
    sock, msg, from, sender, sNum,
    isGroup, isOwner, isPremium, isAdmin, isBotAdmin,
    groupMeta, body, cmd, args, text, quoted, mentioned, mediaType, cfg,

    reply(content, opts = {}) {
      if (typeof content === 'string')
        return sock.sendMessage(from, { text: content }, { quoted: msg, ...opts })
      return sock.sendMessage(from, content, { quoted: msg, ...opts })
    },
    react(emoji) { return sock.sendMessage(from, { react:{ text:emoji, key:msg.key } }).catch(()=>{}) },
    sendImg(buf, cap='', opts={}) { return sock.sendMessage(from, { image:buf, caption:(cap||'')+('\\n\\n'+cfg.watermark), ...opts }, { quoted:msg }) },
    sendVid(buf, cap='', opts={}) { return sock.sendMessage(from, { video:buf, caption:cap, ...opts }, { quoted:msg }) },
    sendAud(buf, ptt=false)       { return sock.sendMessage(from, { audio:buf, mimetype:'audio/mpeg', ptt }, { quoted:msg }) },
    sendStk(buf)                  { return sock.sendMessage(from, { sticker:buf }, { quoted:msg }) },
    sendPoster(buf, cap)          { return sock.sendMessage(from, { image:buf, caption:cap }, { quoted:msg }) },
  }

  const feat = cmdMap.get(cmd)
  if (!feat) return

  if (feat.ownerOnly   && !isOwner)                        return ctx.reply('⛔ *Owner Only!*')
  if (feat.adminOnly   && isGroup && !isAdmin && !isOwner) return ctx.reply('⛔ *Admin Only!*')
  if (feat.groupOnly   && !isGroup)                        return ctx.reply('⚠️ *Khusus Grup!*')
  if (feat.privateOnly && isGroup)                         return ctx.reply('⚠️ *Khusus Private!*')
  if (feat.premiumOnly && !isPremium)                      return ctx.reply('💎 *Premium Only!* Ketik ' + cfg.prefix + cfg.menuCmds.other + ' untuk info beli.')

  try {
    await ctx.react('⏳')
    await feat.handler(ctx)
    await ctx.react('✅')
  } catch (e) {
    await ctx.react('❌')
    log('error', '[' + cmd + '] ' + e.message)
    await ctx.reply('❌ *Error:* ' + e.message)
  }
}
`
}

function genFunctions(c) {
  return `/**
 * Utility Functions
 */
'use strict'
const moment = require('moment-timezone')

exports.log = function(level, msg) {
  const t   = moment().tz('${c.timezone}').format('HH:mm:ss')
  const pre = { info:'\\x1b[36m[INFO]\\x1b[0m', warn:'\\x1b[33m[WARN]\\x1b[0m', error:'\\x1b[31m[ERR ]\\x1b[0m', success:'\\x1b[32m[OK  ]\\x1b[0m' }[level] || '[LOG]'
  console.log('\\x1b[90m' + t + '\\x1b[0m ' + pre + ' ' + msg)
}

exports.banner = function(cfg) {
  const ln = '═'.repeat(46)
  console.log('\\x1b[32m')
  console.log('╔' + ln + '╗')
  console.log('║' + ('  ' + cfg.botName).padEnd(46) + '║')
  console.log('║' + ('  Owner  : ' + cfg.ownerName).padEnd(46) + '║')
  console.log('║' + ('  Prefix : ' + cfg.prefix).padEnd(46) + '║')
  console.log('║' + ('  Koneksi: ' + cfg.connectMethod.toUpperCase()).padEnd(46) + '║')
  console.log('║' + ('  Rengu WA Bot Engine').padEnd(46) + '║')
  console.log('╚' + ln + '╝')
  console.log('\\x1b[0m')
}

exports.getBody = function(msg) {
  const m = msg.message
  return m?.conversation || m?.extendedTextMessage?.text ||
    m?.imageMessage?.caption || m?.videoMessage?.caption ||
    m?.documentMessage?.caption || m?.buttonsResponseMessage?.selectedButtonId ||
    m?.listResponseMessage?.singleSelectReply?.selectedRowId || ''
}

exports.getQuoted = function(msg) {
  const ctx = msg.message?.extendedTextMessage?.contextInfo ||
    msg.message?.imageMessage?.contextInfo || msg.message?.videoMessage?.contextInfo
  return ctx?.quotedMessage || null
}

exports.getMentions = function(msg) {
  return msg.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
    msg.message?.imageMessage?.contextInfo?.mentionedJid || []
}

exports.getMediaType = function(msg) {
  const m = msg.message
  if (m?.imageMessage)   return 'image'
  if (m?.videoMessage)   return 'video'
  if (m?.audioMessage)   return 'audio'
  if (m?.stickerMessage) return 'sticker'
  if (m?.documentMessage)return 'document'
  return null
}

exports.fmtUptime = function(ms) {
  const s = Math.floor(ms/1000), m = Math.floor(s/60), h = Math.floor(m/60), d = Math.floor(h/24)
  if (d > 0) return d + 'h ' + (h%24) + 'j ' + (m%60) + 'm'
  if (h > 0) return h + 'j ' + (m%60) + 'm ' + (s%60) + 'd'
  if (m > 0) return m + 'm ' + (s%60) + 'd'
  return s + 'd'
}

exports.fmtRupiah  = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')
exports.randId     = (pfx='ORD') => pfx + '-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase()
exports.sleep      = (ms) => new Promise(r => setTimeout(r, ms))
exports.pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)]
exports.dlBuffer   = async function(url, headers = {}) {
  const axios = require('axios')
  const res = await axios.get(url, { responseType:'arraybuffer', timeout:30000, headers })
  return Buffer.from(res.data)
}
exports.sanitizeCalc = (expr) => {
  if (!/^[0-9+\\-*/().,\\s%^]+$/.test(expr)) throw new Error('Ekspresi tidak valid')
  return Function('"use strict"; return (' + expr + ')')()
}
`
}

function genDatabase() {
  return `/**
 * Database Manager (JSON file-based)
 */
'use strict'
const fs   = require('fs')
const path = require('path')
const FILE = path.join(__dirname, '..', 'database.json')

const defaults = {
  users:{}, orders:{}, groups:{}, games:{},
  premium:[], banned:[], rpg:{}, votes:{}, notes:{},
}

exports.load = function() {
  try {
    if (fs.existsSync(FILE)) return { ...defaults, ...JSON.parse(fs.readFileSync(FILE,'utf-8')) }
  } catch(_) {}
  return { ...defaults }
}

exports.save = function() {
  try { fs.writeFileSync(FILE, JSON.stringify(global.db, null, 2)) }
  catch(e) { console.error('[DB] Save error:', e.message) }
}

setInterval(() => exports.save(), 60000)

exports.getUser  = function(num) {
  if (!global.db.users[num]) global.db.users[num] = { saldo:0, riwayat:[], premium:false }
  return global.db.users[num]
}
exports.getGroup = function(jid) {
  if (!global.db.groups[jid]) global.db.groups[jid] = { antilink:false, welcome:false, welcomeMsg:'', mute:false }
  return global.db.groups[jid]
}
exports.getRpg = function(num) {
  if (!global.db.rpg[num]) global.db.rpg[num] = {
    name:'Hero', level:1, xp:0, maxXp:100, hp:100, maxHp:100,
    atk:10, def:5, gold:50, inventory:[], equipped:{ weapon:null, armor:null }, wins:0, losses:0
  }
  return global.db.rpg[num]
}
`
}

function genPosterLib(c) {
  return `/**
 * Poster Generator (Sharp + SVG) untuk bot
 * Digunakan oleh features/menu.js
 */
'use strict'
const sharp = require('sharp')

const CAT_COLORS = {
  owner:['#f59e0b','#92400e'], group:['#3b82f6','#1e3a8a'], game:['#8b5cf6','#4c1d95'],
  rpg:['#ef4444','#7f1d1d'], ai:['#06b6d4','#0c4a6e'], image:['#ec4899','#831843'],
  sticker:['#f97316','#7c2d12'], downloader:['#10b981','#064e3b'],
  stalk:['#64748b','#1e293b'], sound:['#a855f7','#581c87'],
  convert:['#14b8a6','#134e4a'], other:['#6b7280','#1f2937'],
  all:['#25D366','#075E54'], info:['#0ea5e9','#0c4a6e'], default:['#25D366','#075E54'],
}

function escXml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') }

exports.createMenuPoster = async function(category, title, botName, ownerName, cmdCount, wm) {
  const cols = CAT_COLORS[category] || CAT_COLORS.default
  const c1   = cols[0], c2 = cols[1]
  const svg = \`<svg width="600" height="220" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:\${c1}"/>
      <stop offset="100%" style="stop-color:\${c2}"/>
    </linearGradient>
    <filter id="sh"><feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="rgba(0,0,0,0.4)"/></filter>
  </defs>
  <rect width="600" height="220" fill="url(#bg)" rx="16"/>
  <circle cx="520" cy="-15" r="100" fill="rgba(255,255,255,0.05)"/>
  <circle cx="20" cy="200" r="55" fill="rgba(0,0,0,0.07)"/>
  <rect x="0" y="0" width="4" height="220" fill="rgba(255,255,255,0.4)" rx="2"/>
  <rect x="34" y="26" width="82" height="22" rx="11" fill="rgba(0,0,0,0.22)"/>
  <text x="75" y="41" font-family="Arial,sans-serif" font-size="10" font-weight="700"
    fill="rgba(255,255,255,0.85)" text-anchor="middle">MENU</text>
  <text x="34" y="88" font-family="Arial Black,Arial,sans-serif" font-size="28" font-weight="900"
    fill="white" filter="url(#sh)">\${escXml(title.toUpperCase())}</text>
  <text x="34" y="112" font-family="Arial,sans-serif" font-size="12" fill="rgba(255,255,255,0.7)">\${cmdCount} perintah tersedia</text>
  <rect x="34" y="125" width="532" height="1" fill="rgba(255,255,255,0.18)"/>
  <text x="34" y="150" font-family="Arial,sans-serif" font-size="12" fill="rgba(255,255,255,0.65)">🤖 \${escXml(botName)}</text>
  <text x="34" y="170" font-family="Arial,sans-serif" font-size="12" fill="rgba(255,255,255,0.65)">👤 Owner: \${escXml(ownerName)}</text>
  <text x="564" y="204" font-family="Arial,sans-serif" font-size="9" fill="rgba(255,255,255,0.35)" text-anchor="end">\${escXml(wm||'')}</text>
</svg>\`
  return await sharp(Buffer.from(svg)).png().toBuffer()
}

exports.createInfoPoster = async function(botName, ownerName, uptime, ram, wm) {
  const svg = \`<svg width="600" height="220" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e3a5f"/>
    </linearGradient>
  </defs>
  <rect width="600" height="220" fill="url(#bg)" rx="16"/>
  <circle cx="550" cy="30" r="70" fill="rgba(37,211,102,0.07)"/>
  <rect x="0" y="0" width="4" height="220" fill="#25D366" rx="2"/>
  <text x="34" y="60" font-family="Arial Black,sans-serif" font-size="26" font-weight="900" fill="#25D366">\${escXml(botName)}</text>
  <rect x="34" y="72" width="532" height="1" fill="rgba(255,255,255,0.08)"/>
  <text x="34" y="98"  font-family="Arial,sans-serif" font-size="13" fill="#94a3b8">👤 Owner  : \${escXml(ownerName)}</text>
  <text x="34" y="120" font-family="Arial,sans-serif" font-size="13" fill="#94a3b8">⏱ Uptime : \${escXml(uptime)}</text>
  <text x="34" y="142" font-family="Arial,sans-serif" font-size="13" fill="#94a3b8">💾 RAM    : \${escXml(ram)} MB</text>
  <text x="34" y="164" font-family="Arial,sans-serif" font-size="13" fill="#25D366">● Online</text>
  <text x="564" y="204" font-family="Arial,sans-serif" font-size="9" fill="rgba(255,255,255,0.25)" text-anchor="end">\${escXml(wm||'')}</text>
</svg>\`
  return await sharp(Buffer.from(svg)).png().toBuffer()
}
`
}

function genReadme(c) {
  const menuTable = MENU_CATS.map(m =>
    `| ${m.icon} ${m.label.padEnd(16)} | \`${c.prefix}${c.menuCmds[m.id] || m.defaultCmd}\` |`
  ).join('\n')

  return `# ${c.botName}
> Dibuat dengan **Rengu WA Bot Engine** — WhatsApp MD Bot

## Tentang
${c.description}

**Owner:** ${c.ownerName}
**Prefix:** \`${c.prefix}\`
**Koneksi:** ${c.connectMethod.toUpperCase()}
**AI Provider:** ${c.aiProvider.toUpperCase()}

## Cara Install

\`\`\`bash
# 1. Ekstrak file ZIP ini
# 2. Masuk folder
cd ${c.botName.toLowerCase().replace(/\s+/g,'-')}-bot/

# 3. Install dependencies
npm install

# 4. Isi API key di .env (opsional)

# 5. Jalankan bot
npm start
\`\`\`

## Di Pterodactyl
1. Buat server baru (egg: Node.js)
2. Upload ZIP → Extract
3. Console → \`npm install\`
4. Start server → lihat console
${c.connectMethod !== 'pairing' ? '5. Scan QR code yang muncul' : '5. Masukkan pairing code yang muncul'}
6. Bot aktif!

## Menu Commands

| Menu | Perintah |
|------|----------|
${menuTable}

---
*Rengu WA Bot Engine*
`
}

function genMenuFeature(c) {
  const menuCmdsBlock = MENU_CATS.map(m => {
    const cmd = c.menuCmds[m.id] || m.defaultCmd
    const feats = window.RENGU_FEATURES?.filter(f => f.cat === m.id && state.enabledFeats?.has(f.id)) || []
    return `  {
    id:'${m.id}_menu', commands:['${cmd}'], desc:'${m.label}',
    handler: async(ctx) => {
      const poster = await Poster.createMenuPoster('${m.id}','${m.label}',ctx.cfg.botName,ctx.cfg.ownerName,${feats.length},ctx.cfg.watermark)
      const lines = [
        '${m.icon} *${m.label.toUpperCase()}*',
        '━━━━━━━━━━━━━━━━━━━━━━━━',
${feats.slice(0,30).map(f => `        '│ \${ctx.cfg.prefix}${f.cmd.padEnd(14)} — ${f.name}',`).join('\n')}
        '━━━━━━━━━━━━━━━━━━━━━━━━',
        \`_\${ctx.cfg.watermark}_\`
      ]
      await ctx.sendPoster(poster, lines.join('\\n'))
    }
  },`
  }).join('\n')

  return `/**
 * Menu System — Semua kategori menu dengan poster
 */
'use strict'
const Poster = require('../lib/poster')
const { fmtUptime } = require('../lib/functions')
const os = require('os')

const features = [
${menuCmdsBlock}

  // All Menu
  {
    id:'all_menu', commands:['${c.menuCmds.all || 'allmenu'}','menu','help'], desc:'Semua Menu',
    handler: async(ctx) => {
      const poster = await Poster.createMenuPoster('all','ALL MENU',ctx.cfg.botName,ctx.cfg.ownerName,0,ctx.cfg.watermark)
      const lines = [
        \`╔══ \${ctx.cfg.botName} ══╗\`,
        \`║ Prefix: \${ctx.cfg.prefix}  |  Owner: \${ctx.cfg.ownerName}\`,
        '╚══════════════════════════╝',
        '',
${MENU_CATS.filter(m => m.id !== 'all' && m.id !== 'info').map(m =>
`        \`${m.icon} *${m.label}* → \${ctx.cfg.prefix}\${ctx.cfg.menuCmds.${m.id}}\`,`
).join('\n')}
        '',
        \`ℹ️ Info Bot → \${ctx.cfg.prefix}\${ctx.cfg.menuCmds.info}\`,
        \`_\${ctx.cfg.watermark}_\`
      ]
      await ctx.sendPoster(poster, lines.join('\\n'))
    }
  },

  // Info Bot
  {
    id:'infobot', commands:['${c.menuCmds.info || 'infobot'}','botinfo'], desc:'Info Bot',
    handler: async(ctx) => {
      const uptime = fmtUptime(Date.now() - global.botStart)
      const ram    = (process.memoryUsage().heapUsed/1024/1024).toFixed(1)
      const poster = await Poster.createInfoPoster(ctx.cfg.botName,ctx.cfg.ownerName,uptime,ram,ctx.cfg.watermark)
      await ctx.sendPoster(poster, [
        \`🤖 *\${ctx.cfg.botName}*\`,
        '━━━━━━━━━━━━━━━━━━━━━━━',
        \`📛 Nama   : \${ctx.cfg.botName}\`,
        \`👤 Owner  : \${ctx.cfg.ownerName}\`,
        \`🔹 Prefix : \${ctx.cfg.prefix}\`,
        \`⏱ Uptime : \${uptime}\`,
        \`💾 RAM    : \${ram} MB\`,
        \`📦 Node   : \${process.version}\`,
        '━━━━━━━━━━━━━━━━━━━━━━━',
        \`_\${ctx.cfg.watermark}_\`
      ].join('\\n'))
    }
  },
]

module.exports = features
`
}

function genSimpleFeature(name, pairs) {
  // pairs = [[cmd, name, handler_body], ...]
  const items = pairs.map(([cmd, nm, body]) => `  {
    id:'${cmd}', commands:['${cmd}'], desc:'${nm}',
    handler: async(ctx) => {
      ${body}
    }
  }`).join(',\n')
  return `'use strict'\nconst axios = require('axios')\nconst { fmtRupiah, pickRandom, dlBuffer, fmtUptime, sanitizeCalc } = require('../lib/functions')\nconst db = require('../lib/database')\n\nmodule.exports = [\n${items}\n]\n`
}

// ════════════════════════════════════════════════════════════
// MAIN DOWNLOAD FUNCTION
// ════════════════════════════════════════════════════════════

window.generateAndDownload = async function() {
  const btn    = document.getElementById('btn-download')
  const pb     = document.getElementById('progress-box')
  const bar    = document.getElementById('pb-bar')
  const status = document.getElementById('pb-status')
  const suc    = document.getElementById('success-box')

  btn.disabled = true
  document.getElementById('btn-dl-text').textContent = 'Generating...'
  pb.style.display  = 'block'
  suc.style.display = 'none'

  const setProgress = (pct, msg) => {
    bar.style.width = pct + '%'
    status.textContent = msg
  }

  try {
    setProgress(5, 'Memuat JSZip...')
    await new Promise((res, rej) => {
      if (window.JSZip) return res()
      const s   = document.createElement('script')
      s.src     = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
      s.onload  = res; s.onerror = rej
      document.head.appendChild(s)
    })

    const cfg  = getConfig()
    const zip  = new window.JSZip()
    const bot  = cfg.botName.toLowerCase().replace(/\s+/g,'-') + '-bot/'

    setProgress(10, 'Generating package.json...')
    zip.file(bot + 'package.json',    genPackageJson(cfg))
    zip.file(bot + '.gitignore',      genGitignore())
    zip.file(bot + '.env',            genEnv(cfg))
    zip.file(bot + 'database.json',   JSON.stringify({ users:{}, orders:{}, groups:{}, games:{}, premium:[], banned:[], rpg:{}, notes:{} }, null, 2))

    setProgress(20, 'Generating config.js...')
    zip.file(bot + 'config.js',       genConfig(cfg))

    setProgress(30, 'Generating index.js...')
    // Pakai genIndexFull jika tersedia (dengan viewOnce intercept)
    const indexContent = (window.RENGU_genIndexFull ? window.RENGU_genIndexFull(cfg) : genIndex(cfg))
    zip.file(bot + 'index.js', indexContent)

    setProgress(38, 'Generating handler.js...')
    zip.file(bot + 'handler.js',      genHandler(cfg))

    setProgress(45, 'Generating lib files...')
    zip.file(bot + 'lib/functions.js',genFunctions(cfg))
    zip.file(bot + 'lib/database.js', genDatabase())
    zip.file(bot + 'lib/poster.js',   genPosterLib(cfg))

    setProgress(55, 'Generating features/menu.js...')
    zip.file(bot + 'features/menu.js', genMenuFeature(cfg))

    setProgress(62, 'Generating features...')

    zip.file(bot + 'features/info.js', genSimpleFeature('info', [
      ['ping','Ping',`const ms=Date.now(); await ctx.reply('_pong_'); await ctx.reply('🏓 *PONG!*\\n⚡ '+  (Date.now()-ms)+'ms\\n⏱ '+fmtUptime(Date.now()-global.botStart)+'\\n💾 '+(process.memoryUsage().heapUsed/1024/1024).toFixed(1)+'MB RAM\\n_'+ctx.cfg.watermark+'_')`],
      ['calc','Kalkulator',`if(!ctx.text) return ctx.reply('Usage: '+ctx.cfg.prefix+'calc [ekspresi]'); const r=sanitizeCalc(ctx.text); await ctx.reply('🔢 *Kalkulator*\\n\\n'+ctx.text+' = *'+r+'*\\n_'+ctx.cfg.watermark+'_')`],
      ['runtime','Runtime',`await ctx.reply('⏱ *Uptime*\\n\\n'+fmtUptime(Date.now()-global.botStart)+'\\n_'+ctx.cfg.watermark+'_')`],
    ]))

    zip.file(bot + 'features/tools.js', `'use strict'\nconst { pickRandom, sanitizeCalc, fmtUptime, randId } = require('../lib/functions')\nmodule.exports = [\n  { id:'random', commands:['random'], desc:'Angka random', handler: async(ctx) => { const [mn,mx]=[parseInt(ctx.args[0])||1, parseInt(ctx.args[1])||100]; await ctx.reply('🎲 Random '+mn+'-'+mx+': *'+( Math.floor(Math.random()*(mx-mn+1))+mn)+'*\\n_'+ctx.cfg.watermark+'_') } },\n  { id:'pilih', commands:['pilih'], desc:'Pilih acak', handler: async(ctx) => { if(!ctx.text) return ctx.reply('Usage: .pilih [a,b,c]'); const opts=ctx.text.split(',').map(s=>s.trim()); await ctx.reply('🎯 Pilihan: *'+pickRandom(opts)+'*\\n_'+ctx.cfg.watermark+'_') } },\n]\n`)

    zip.file(bot + 'features/ai.js', `'use strict'\nconst axios = require('axios')\nasync function askAI(prompt, cfg) {\n  if (cfg.aiProvider==='groq' && cfg.groqKey) {\n    const r = await axios.post('https://api.groq.com/openai/v1/chat/completions',{ model:cfg.aiModel, messages:[{role:'system',content:'Kamu adalah '+cfg.botName+', '+cfg.aiPersona+'. Jawab dalam Bahasa Indonesia.'},{role:'user',content:prompt}], max_tokens:800 },{ headers:{ Authorization:'Bearer '+cfg.groqKey } })\n    return r.data.choices[0].message.content\n  }\n  if (cfg.aiProvider==='openai' && cfg.openaiKey) {\n    const r = await axios.post('https://api.openai.com/v1/chat/completions',{ model:cfg.aiModel, messages:[{role:'user',content:prompt}], max_tokens:800 },{ headers:{ Authorization:'Bearer '+cfg.openaiKey } })\n    return r.data.choices[0].message.content\n  }\n  const r = await axios.get('https://text.pollinations.ai/'+encodeURIComponent(prompt)+'?system='+encodeURIComponent('Kamu asisten WA ramah. Jawab Bahasa Indonesia singkat.'),{ timeout:20000 })\n  return typeof r.data==='string' ? r.data : JSON.stringify(r.data)\n}\nmodule.exports = [\n  { id:'ai', commands:['ai','gpt','ask','tanya'], desc:'Chat AI', handler: async(ctx) => { if(!ctx.text) return ctx.reply('Usage: '+ctx.cfg.prefix+'ai [pertanyaan]'); await ctx.reply('🤖 Berpikir...'); const res=await askAI(ctx.text,ctx.cfg); await ctx.reply('🤖 *'+ctx.cfg.botName+' AI*\\n\\n'+res+'\\n_'+ctx.cfg.watermark+'_') } },\n  { id:'imagine', commands:['imagine','genimg'], desc:'AI Image', handler: async(ctx) => { if(!ctx.text) return ctx.reply('Usage: .imagine [deskripsi]'); await ctx.reply('🎨 Membuat gambar...'); const r=await axios.get('https://image.pollinations.ai/prompt/'+encodeURIComponent(ctx.text+', high quality, detailed'),{ responseType:'arraybuffer', timeout:30000 }); await ctx.sendImg(Buffer.from(r.data),'🎨 Prompt: '+ctx.text) } },\n  { id:'translate', commands:['tr','terjemah'], desc:'Terjemah', handler: async(ctx) => { if(ctx.args.length<2) return ctx.reply('Usage: .tr [lang] [teks]\\nContoh: .tr en halo'); const [lang,...w]=ctx.args; const r=await axios.get('https://api.mymemory.translated.net/get?q='+encodeURIComponent(w.join(' '))+'&langpair=auto|'+lang); await ctx.reply('🌐 *Terjemahan*\\n\\nAsli: '+w.join(' ')+'\\nHasil: *'+r.data.responseData.translatedText+'*\\n_'+ctx.cfg.watermark+'_') } },\n]\n`)

    zip.file(bot + 'features/downloader.js', `'use strict'\nconst axios=require('axios'), ytdl=require('ytdl-core')\nconst { dlBuffer } = require('../lib/functions')\nmodule.exports = [\n  { id:'ytmp3', commands:['ytmp3','yta'], desc:'YT MP3', handler: async(ctx) => { if(!ytdl.validateURL(ctx.text||'')) return ctx.reply('Usage: .ytmp3 [url YouTube]'); await ctx.reply('⬇️ Mengunduh...'); const info=await ytdl.getInfo(ctx.text); if(+info.videoDetails.lengthSeconds>600) return ctx.reply('❌ Maks 10 menit'); const chunks=[]; for await(const c of ytdl(ctx.text,{filter:'audioonly'})) chunks.push(c); await ctx.sendAud(Buffer.concat(chunks)); await ctx.reply('✅ *'+info.videoDetails.title+'*') } },\n  { id:'tt', commands:['tt','tiktok'], desc:'TikTok DL', handler: async(ctx) => { if(!ctx.text?.includes('tiktok')) return ctx.reply('Usage: .tt [url TikTok]'); await ctx.reply('⬇️ Mengunduh TikTok...'); const r=await axios.get('https://api.tiklydown.eu.org/api/download/v3?url='+encodeURIComponent(ctx.text),{timeout:15000}); if(!r.data?.video?.noWatermark) return ctx.reply('❌ Gagal'); await ctx.sendVid(await dlBuffer(r.data.video.noWatermark)) } },\n  { id:'ig', commands:['ig','igdl'], desc:'IG DL', handler: async(ctx) => { await ctx.reply('❌ Instagram DL memerlukan API key sendiri.\\nGunakan: https://instagrapi.vercel.app/') } },\n  { id:'ssweb', commands:['ss','ssweb'], desc:'Screenshot Web', handler: async(ctx) => { if(!ctx.text?.startsWith('http')) return ctx.reply('Usage: .ss [url]'); await ctx.reply('📸 Screenshot...'); const r=await axios.get('https://api.screenshotmachine.com/?url='+encodeURIComponent(ctx.text)+'&dimension=1280x900&format=png',{responseType:'arraybuffer',timeout:20000}); await ctx.sendImg(Buffer.from(r.data),'📸 '+ctx.text) } },\n]\n`)

    zip.file(bot + 'features/sticker.js', `'use strict'\nconst sharp=require('sharp')\nconst { downloadContentFromMessage }=require('@whiskeysockets/baileys')\nasync function getImg(msg) {\n  const m=msg.message?.imageMessage||msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage\n  if(!m) return null\n  const s=await downloadContentFromMessage(m,'image')\n  const chunks=[]; for await(const c of s) chunks.push(c); return Buffer.concat(chunks)\n}\nmodule.exports = [\n  { id:'sticker', commands:['s','sticker'], desc:'Buat Stiker', handler: async(ctx) => { const buf=await getImg(ctx.msg); if(!buf) return ctx.reply('Kirim/reply gambar dengan .s'); await ctx.reply('🎨 Membuat stiker...'); const webp=await sharp(buf).resize({width:512,height:512,fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).webp({quality:80}).toBuffer(); await ctx.sendStk(webp) } },\n  { id:'toimg', commands:['toimg'], desc:'Stiker ke Gambar', handler: async(ctx) => { const sm=ctx.msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage; if(!sm) return ctx.reply('Reply stiker dengan .toimg'); const s=await downloadContentFromMessage(sm,'sticker'); const chunks=[]; for await(const c of s) chunks.push(c); const png=await sharp(Buffer.concat(chunks)).png().toBuffer(); await ctx.sendImg(png,'✅ Konversi berhasil') } },\n]\n`)

    // ── Media: RVO + Stiker WM Custom ───────────────────────
    setProgress(67, 'Generating features/media.js (RVO + Stiker WM)...')
    if (window.RENGU_genMediaFeature) {
      zip.file(bot + 'features/media.js', window.RENGU_genMediaFeature())
    }

    // ── Group: Lengkap (hidetag, welcome custom, swgroup) ───
    setProgress(70, 'Generating features/group.js (lengkap)...')
    if (window.RENGU_genGroupFeature) {
      zip.file(bot + 'features/group.js', window.RENGU_genGroupFeature())
    }

    zip.file(bot + 'features/games.js', `'use strict'\nconst { pickRandom } = require('../lib/functions')\nconst TRUTHS=['Siapa orang yang paling kamu suka?','Apa kebohongan terbesar kamu?','Pernah nangis karena film? Judulnya apa?','Nomor siapa yang paling sering kamu buka?','Apa hal yang tidak mau kamu ceritakan ke orang tua?']\nconst DARES=['Kirim foto tanpa filter sekarang!','Voice note nyanyi 30 detik!','Ganti nama display jadi nama hewan 10 menit!','Tulis status WA memalukan selama 5 menit!']\nmodule.exports = [\n  { id:'truth', commands:['truth'], desc:'Truth', handler: async(ctx) => { await ctx.reply('💬 *TRUTH*\\n\\n"'+pickRandom(TRUTHS)+'"\\n_Jawab jujur!_\\n_'+ctx.cfg.watermark+'_') } },\n  { id:'dare',  commands:['dare'],  desc:'Dare',  handler: async(ctx) => { await ctx.reply('🔥 *DARE*\\n\\n"'+pickRandom(DARES)+'"\\n_Berani nggak?_\\n_'+ctx.cfg.watermark+'_') } },\n  { id:'8ball', commands:['8ball'], desc:'8-Ball', handler: async(ctx) => { if(!ctx.text) return ctx.reply('Usage: .8ball [pertanyaan]'); const ans=['Tentu saja!','Pasti iya!','Coba lagi nanti','Tidak pasti','Sangat meragukan','Tentu tidak!']; await ctx.reply('🎱 '+ctx.text+'\\n\\n*'+pickRandom(ans)+'*\\n_'+ctx.cfg.watermark+'_') } },\n  { id:'rps', commands:['rps','suit'], desc:'Rock Paper Scissors', handler: async(ctx) => { const m={'batu':0,'kertas':1,'gunting':2,'b':0,'k':1,'g':2}; const k=ctx.args[0]?.toLowerCase(); if(!k||!(k in m)) return ctx.reply('Usage: .rps batu/kertas/gunting'); const p=m[k], b=Math.floor(Math.random()*3); const c=['✊ Batu','✋ Kertas','✌ Gunting']; const r=(p===0&&b===2)||(p===1&&b===0)||(p===2&&b===1)?'🎉 Kamu MENANG!':p===b?'🤝 Seri!':'😢 Kamu KALAH!'; await ctx.reply('✊✋✌ *RPS*\\nKamu: '+c[p]+'\\nBot : '+c[b]+'\\n\\n*'+r+'*\\n_'+ctx.cfg.watermark+'_') } },\n]\n`)

    zip.file(bot + 'features/rpg.js',  `'use strict'\nconst db=require('../lib/database')\nconst { fmtRupiah }=require('../lib/functions')\nconst WEAPONS=[{id:'W01',name:'Pedang Kayu',atk:5,price:100},{id:'W02',name:'Pedang Besi',atk:15,price:500},{id:'W03',name:'Pedang Mithril',atk:30,price:2000}]\nconst ARMORS=[{id:'A01',name:'Baju Kulit',def:5,price:100},{id:'A02',name:'Baju Besi',def:15,price:600}]\nconst DUNGEONS=[{name:'Goa Goblin',minLv:1,xp:30,gold:20,hp:50},{name:'Hutan Hantu',minLv:5,xp:80,gold:50,hp:120},{name:'Kastil Iblis',minLv:15,xp:200,gold:150,hp:300}]\nfunction bars(v,m,l=10){return '█'.repeat(Math.round(v/m*l))+'░'.repeat(l-Math.round(v/m*l))}\nmodule.exports=[\n  {id:'profil',commands:['profil','stat'],desc:'Profil RPG',handler:async(ctx)=>{const r=db.getRpg(ctx.sNum);await ctx.reply(['⚔️ *PROFIL RPG*','━━━━━━━━━━━━━━━━',\`🏅 Level: \${r.level}\`,\`✨ XP   : \${r.xp}/\${r.level*100} [\${bars(r.xp,r.level*100)}]\`,\`❤️ HP   : \${r.hp}/\${r.maxHp} [\${bars(r.hp,r.maxHp)}]\`,\`⚔️ ATK  : \${r.atk}\`,\`🛡 DEF  : \${r.def}\`,\`💰 Gold : \${r.gold}\`,\`🏆 W/L  : \${r.wins}W / \${r.losses}L\`,'━━━━━━━━━━━━━━━━',\`_\${ctx.cfg.watermark}_\`].join('\\n'))}},\n  {id:'dungeon',commands:['dungeon','raid'],desc:'Dungeon',handler:async(ctx)=>{const r=db.getRpg(ctx.sNum);const ds=DUNGEONS.filter(d=>d.minLv<=r.level);const d=ds[ds.length-1];const win=Math.random()>0.4;if(win){r.xp+=d.xp;r.gold+=d.gold;r.wins++;while(r.xp>=r.level*100){r.xp-=r.level*100;r.level++;r.maxHp+=20;r.atk+=2;r.def++}}else{r.hp=Math.max(1,r.hp-20);r.losses++}db.save();await ctx.reply(['⚔️ *DUNGEON: '+d.name+'*','━━━━━━━━━━━━━━━━',win?\`✅ MENANG!\\n+\${d.xp}XP +\${d.gold}Gold\\nLevel: \${r.level}\`:\`❌ KALAH!\\nHP: \${r.hp}/\${r.maxHp}\`,'━━━━━━━━━━━━━━━━',\`_\${ctx.cfg.watermark}_\`].join('\\n'))}},\n]\n`)

    zip.file(bot + 'features/group.js', `'use strict'\nconst db=require('../lib/database')\nmodule.exports=[\n  {id:'kick',commands:['kick'],desc:'Kick',adminOnly:true,groupOnly:true,handler:async(ctx)=>{if(!ctx.isBotAdmin) return ctx.reply('❌ Bot harus admin!');for(const j of ctx.mentioned) await ctx.sock.groupParticipantsUpdate(ctx.from,[j],'remove');await ctx.reply('✅ Kicked '+ctx.mentioned.length+' member')}},\n  {id:'add',commands:['add'],desc:'Add',adminOnly:true,groupOnly:true,handler:async(ctx)=>{if(!ctx.args[0]) return ctx.reply('Usage: .add [nomor]');const j=ctx.args[0].replace(/\\D/g,'')+'@s.whatsapp.net';await ctx.sock.groupParticipantsUpdate(ctx.from,[j],'add');await ctx.reply('✅ Berhasil menambahkan!')}},\n  {id:'promote',commands:['promote'],desc:'Promote',adminOnly:true,groupOnly:true,handler:async(ctx)=>{if(!ctx.mentioned.length) return ctx.reply('Usage: .promote @tag');for(const j of ctx.mentioned) await ctx.sock.groupParticipantsUpdate(ctx.from,[j],'promote');await ctx.reply('✅ Promoted ke admin!')}},\n  {id:'demote',commands:['demote'],desc:'Demote',adminOnly:true,groupOnly:true,handler:async(ctx)=>{if(!ctx.mentioned.length) return ctx.reply('Usage: .demote @tag');for(const j of ctx.mentioned) await ctx.sock.groupParticipantsUpdate(ctx.from,[j],'demote');await ctx.reply('✅ Demoted dari admin!')}},\n  {id:'hidetag',commands:['hidetag','ht','tagall'],desc:'Tag All',groupOnly:true,handler:async(ctx)=>{const m=ctx.groupMeta.participants.map(p=>p.id);await ctx.sock.sendMessage(ctx.from,{text:(ctx.text||'Perhatian!')+' '+m.map(j=>'@'+j.split('@')[0]).join(' '),mentions:m},{quoted:ctx.msg})}},\n  {id:'groupinfo',commands:['groupinfo','gi'],desc:'Info Grup',groupOnly:true,handler:async(ctx)=>{const g=ctx.groupMeta;await ctx.reply(['📋 *INFO GRUP*','━━━━━━━━━━━━━━━━',\`📌 Nama: \${g.subject}\`,\`👥 Member: \${g.participants.length}\`,\`👑 Admin: \${g.participants.filter(p=>p.admin).length}\`,'━━━━━━━━━━━━━━━━',\`_\${ctx.cfg.watermark}_\`].join('\\n'))}},\n  {id:'antilink',commands:['antilink'],desc:'Anti Link',adminOnly:true,groupOnly:true,handler:async(ctx)=>{const s=ctx.args[0];if(!['on','off'].includes(s)) return ctx.reply('Usage: .antilink on/off');const g=db.getGroup(ctx.from);g.antilink=s==='on';db.save();await ctx.reply('✅ Anti link *'+s+'*!')}},\n  {id:'welcome',commands:['welcome'],desc:'Welcome',adminOnly:true,groupOnly:true,handler:async(ctx)=>{const s=ctx.args[0];if(!['on','off'].includes(s)) return ctx.reply('Usage: .welcome on/off');const g=db.getGroup(ctx.from);g.welcome=s==='on';db.save();await ctx.reply('✅ Welcome message *'+s+'*!')}},\n]\nmodule.exports.onGroupUpdate=async function(sock,ev){const{id,participants,action}=ev;const g=require('./features/group');const grp=require('./lib/database').getGroup(id);if(!grp.welcome) return;for(const jid of participants){const tag='@'+jid.split('@')[0];const text=action==='add'?'👋 Selamat datang '+tag+'! Semoga betah 😊':action==='remove'?'👋 Sampai jumpa '+tag+'!':'';if(text) await sock.sendMessage(id,{text:text,mentions:[jid]}).catch(()=>{})}}\n`)

    zip.file(bot + 'features/owner.js', `'use strict'\nconst db=require('../lib/database')\nconst {fmtRupiah,randId}=require('../lib/functions')\nmodule.exports=[\n  {id:'broadcast',commands:['broadcast','bc'],desc:'Broadcast',ownerOnly:true,handler:async(ctx)=>{if(!ctx.text) return ctx.reply('Usage: .bc [pesan]');const chats=Object.keys(ctx.sock.chats||{}).slice(0,100);let s=0;for(const j of chats){try{await ctx.sock.sendMessage(j,{text:'📢 *Broadcast*\\n\\n'+ctx.text+'\\n_'+ctx.cfg.watermark+'_'});s++}catch(_){}}await ctx.reply('✅ Terkirim ke '+s+' chat!')}},\n  {id:'restart',commands:['restart'],desc:'Restart',ownerOnly:true,handler:async(ctx)=>{await ctx.reply('🔄 Restart dalam 2 detik...');setTimeout(()=>process.exit(0),2000)}},\n  {id:'addpremium',commands:['addpremium','ap'],desc:'Add Premium',ownerOnly:true,handler:async(ctx)=>{const t=ctx.mentioned[0]?.split('@')[0]||ctx.args[0]?.replace(/\\D/g,'');if(!t) return ctx.reply('Usage: .ap @tag');if(!global.db.premium.includes(t)) global.db.premium.push(t);db.save();await ctx.reply('✅ @'+t+' ditambah premium!',{mentions:[t+'@s.whatsapp.net']})}},\n  {id:'delpremium',commands:['delpremium','dp'],desc:'Del Premium',ownerOnly:true,handler:async(ctx)=>{const t=ctx.mentioned[0]?.split('@')[0]||ctx.args[0]?.replace(/\\D/g,'');if(!t) return ctx.reply('Usage: .dp @tag');global.db.premium=global.db.premium.filter(n=>n!==t);db.save();await ctx.reply('✅ @'+t+' dihapus dari premium!',{mentions:[t+'@s.whatsapp.net']})}},\n  {id:'listpremium',commands:['listpremium','lp'],desc:'List Premium',ownerOnly:true,handler:async(ctx)=>{const l=global.db.premium;await ctx.reply(l.length?'💎 *List Premium*\\n\\n'+l.map((n,i)=>i+1+'. +'+n).join('\\n'):'Belum ada user premium.')}},\n  {id:'acc',commands:['acc'],desc:'Approve Order',ownerOnly:true,handler:async(ctx)=>{const id=ctx.args[0]?.toUpperCase();if(!id) return ctx.reply('Usage: .acc [order_id]');const o=global.db.orders[id];if(!o) return ctx.reply('❌ Order tidak ditemukan!');o.status='done';const u=db.getUser(o.userId);if(o.type==='topup'){u.saldo=(u.saldo||0)+o.amount;(u.riwayat=u.riwayat||[]).push({type:'topup',amount:o.amount,time:Date.now()})}if(o.type==='premium'&&!global.db.premium.includes(o.userId)) global.db.premium.push(o.userId);db.save();await ctx.sock.sendMessage(o.userId+'@s.whatsapp.net',{text:'✅ *Pembayaran Dikonfirmasi!*\\n🔖 '+id+'\\n💰 '+fmtRupiah(o.amount)+'\\n_'+ctx.cfg.watermark+'_'}).catch(()=>{});await ctx.reply('✅ Order '+id+' di-approve!')}},\n]\n`)

    zip.file(bot + 'features/store.js', `'use strict'\nconst {fmtRupiah,randId}=require('../lib/functions')\nconst db=require('../lib/database')\nfunction payText(cfg){const p=cfg.payment,l=[];if(p.dana!=='-')l.push('💙 Dana: '+p.dana);if(p.ovo!=='-')l.push('💜 OVO: '+p.ovo);if(p.gopay!=='-')l.push('💚 GoPay: '+p.gopay);if(p.bca!=='-')l.push('🏦 BCA: '+p.bca);if(p.bsi!=='-')l.push('🏦 BSI: '+p.bsi);if(p.qris!=='-')l.push('📱 QRIS: '+p.qris);return l.join('\\n')}\nmodule.exports=[\n  {id:'listproduk',commands:['listproduk','produk','toko'],desc:'List Produk',handler:async(ctx)=>{if(!ctx.cfg.features.store) return ctx.reply('❌ Toko tidak aktif.');const l=['🛒 *TOKO — '+ctx.cfg.botName+'*',''];for(const p of ctx.cfg.products)l.push('🏷️ *'+p.name+'* ('+p.id+')\\n   💰 '+fmtRupiah(p.price)+'\\n   '+p.desc+'\\n');l.push('> Beli: .beli [ID]','_'+ctx.cfg.watermark+'_');await ctx.reply(l.join('\\n'))}},\n  {id:'beli',commands:['beli','order'],desc:'Beli',handler:async(ctx)=>{if(!ctx.cfg.features.store) return ctx.reply('❌ Toko tidak aktif.');const id=ctx.args[0]?.toUpperCase();if(!id) return ctx.reply('Usage: .beli [ID]');const p=ctx.cfg.products.find(x=>x.id===id);if(!p) return ctx.reply('❌ Produk tidak ditemukan!');const oid=randId('ORD');global.db.orders[oid]={userId:ctx.sNum,type:'beli',amount:p.price,status:'pending',time:Date.now()};db.save();await ctx.reply(['🛍️ *ORDER DIBUAT*','━━━━━━━━━━━━━━━━',\`📦 \${p.name}\`,\`💰 \${fmtRupiah(p.price)}\`,\`🔖 Order: \\\`\${oid}\\\`\`,'━━━━━━━━━━━━━━━━',payText(ctx.cfg),'━━━━━━━━━━━━━━━━',\`Konfirmasi: .konfirmasi \${oid}\`,\`_\${ctx.cfg.watermark}_\`].join('\\n'))}},\n  {id:'saldo',commands:['saldo'],desc:'Saldo',handler:async(ctx)=>{const u=db.getUser(ctx.sNum);await ctx.reply('💰 *Saldo*\\n\\n'+fmtRupiah(u.saldo||0)+'\\n_'+ctx.cfg.watermark+'_')}},\n  {id:'konfirmasi',commands:['konfirmasi'],desc:'Konfirmasi Bayar',handler:async(ctx)=>{const oid=ctx.args[0]?.toUpperCase();if(!oid) return ctx.reply('Usage: .konfirmasi [order_id]');const o=global.db.orders[oid];if(!o) return ctx.reply('❌ Order tidak ditemukan!');if(o.userId!==ctx.sNum) return ctx.reply('❌ Bukan ordermu!');const ownerJid=ctx.cfg.ownerNumber[0].replace(/\\D/g,'')+'@s.whatsapp.net';await ctx.sock.sendMessage(ownerJid,{text:'🔔 *KONFIRMASI*\\n🔖 '+oid+'\\n👤 '+ctx.sNum+'\\n💰 '+fmtRupiah(o.amount)+'\\n\\n.acc '+oid+' untuk approve'}).catch(()=>{});o.status='waiting';db.save();await ctx.reply('✅ Konfirmasi terkirim ke owner! Tunggu verifikasi.\\n_'+ctx.cfg.watermark+'_')}},\n]\n`)

    zip.file(bot + 'features/stalk.js', `'use strict'\nconst axios=require('axios')\nmodule.exports=[\n  {id:'stalkgithub',commands:['gh','stalkgithub'],desc:'Stalk GitHub',handler:async(ctx)=>{const u=ctx.text?.replace('@','');if(!u) return ctx.reply('Usage: .gh [username]');const r=await axios.get('https://api.github.com/users/'+u,{timeout:8000});if(r.data.message) return ctx.reply('❌ User tidak ditemukan');const d=r.data;await ctx.reply(['🐙 *GitHub: @'+d.login+'*','━━━━━━━━━━━━━━━━',\`👤 Nama: \${d.name||'-'}\`,\`📖 Bio : \${(d.bio||'-').substring(0,80)}\`,\`📦 Repos: \${d.public_repos}\`,\`👥 Followers: \${d.followers}\`,'━━━━━━━━━━━━━━━━',\`_\${ctx.cfg.watermark}_\`].join('\\n'))}},\n  {id:'whois',commands:['whois'],desc:'IP/Domain Info',handler:async(ctx)=>{if(!ctx.text) return ctx.reply('Usage: .whois [ip/domain]');const r=await axios.get('https://ipapi.co/'+ctx.text+'/json/',{timeout:8000});if(r.data.error) return ctx.reply('❌ '+r.data.reason);const d=r.data;await ctx.reply(['🌐 *WHOIS: '+ctx.text+'*','━━━━━━━━━━━━━━━━',\`📍 Kota: \${d.city}, \${d.region}\`,\`🌍 Negara: \${d.country_name}\`,\`📡 ISP: \${d.org}\`,'━━━━━━━━━━━━━━━━',\`_\${ctx.cfg.watermark}_\`].join('\\n'))}},\n]\n`)

    zip.file(bot + 'features/sound.js', `'use strict'\nconst axios=require('axios')\nmodule.exports=[\n  {id:'tts',commands:['tts'],desc:'TTS',handler:async(ctx)=>{if(!ctx.text) return ctx.reply('Usage: .tts [teks]');const r=await axios.get('https://api.voicerss.org/?key=demo&hl=id-id&src='+encodeURIComponent(ctx.text.substring(0,200))+'&f=48khz_16bit_mono&c=mp3',{responseType:'arraybuffer',timeout:10000});await ctx.sendAud(Buffer.from(r.data))}},\n]\n`)

    zip.file(bot + 'features/convert.js', `'use strict'\nmodule.exports=[\n  {id:'tobase64',commands:['tobase64','b64e'],desc:'Encode Base64',handler:async(ctx)=>{if(!ctx.text) return ctx.reply('Usage: .b64e [teks]');await ctx.reply('🔐 *Base64*\\n\\n'+Buffer.from(ctx.text).toString('base64')+'\\n_'+ctx.cfg.watermark+'_')}},\n  {id:'frombase64',commands:['frombase64','b64d'],desc:'Decode Base64',handler:async(ctx)=>{if(!ctx.text) return ctx.reply('Usage: .b64d [base64]');try{await ctx.reply('🔓 *Decode*\\n\\n'+Buffer.from(ctx.text,'base64').toString('utf-8')+'\\n_'+ctx.cfg.watermark+'_')}catch{await ctx.reply('❌ Bukan Base64 valid')}}},\n  {id:'tohex',commands:['tohex'],desc:'Teks ke HEX',handler:async(ctx)=>{if(!ctx.text) return ctx.reply('Usage: .tohex [teks]');await ctx.reply('🔡 *HEX*\\n\\n'+Buffer.from(ctx.text).toString('hex')+'\\n_'+ctx.cfg.watermark+'_')}},\n]\n`)

    zip.file(bot + 'features/image.js', `'use strict'\nconst sharp=require('sharp')\nconst {downloadContentFromMessage}=require('@whiskeysockets/baileys')\nasync function getImg(msg){const m=msg.message?.imageMessage||msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;if(!m) return null;const s=await downloadContentFromMessage(m,'image');const c=[];for await(const b of s) c.push(b);return Buffer.concat(c)}\nmodule.exports=[\n  {id:'blur',commands:['blur'],desc:'Blur',handler:async(ctx)=>{const b=await getImg(ctx.msg);if(!b) return ctx.reply('Reply/kirim gambar dengan .blur [1-20]');const l=Math.min(Math.max(parseInt(ctx.args[0])||5,1),20);await ctx.sendImg(await sharp(b).blur(l).jpeg({quality:85}).toBuffer(),'🌫 Blur level '+l)}},\n  {id:'grayscale',commands:['grayscale','bw'],desc:'Grayscale',handler:async(ctx)=>{const b=await getImg(ctx.msg);if(!b) return ctx.reply('Reply/kirim gambar');await ctx.sendImg(await sharp(b).grayscale().jpeg({quality:90}).toBuffer(),'⚫ Grayscale')}},\n  {id:'rotate',commands:['rotate'],desc:'Rotate',handler:async(ctx)=>{const b=await getImg(ctx.msg);if(!b) return ctx.reply('Reply/kirim gambar dengan .rotate [derajat]');const a=parseInt(ctx.args[0])||90;await ctx.sendImg(await sharp(b).rotate(a).jpeg({quality:90}).toBuffer(),'🔄 Rotasi '+a+'°')}},\n  {id:'compress',commands:['compress'],desc:'Kompres Gambar',handler:async(ctx)=>{const b=await getImg(ctx.msg);if(!b) return ctx.reply('Reply/kirim gambar');const q=Math.min(Math.max(parseInt(ctx.args[0])||60,10),90);const r=await sharp(b).jpeg({quality:q}).toBuffer();await ctx.sendImg(r,'✅ Kompres '+Math.round(r.length/b.length*100)+'% dari ukuran asli')}},\n]\n`)

    zip.file(bot + 'features/search.js', `'use strict'\nconst axios=require('axios')\nmodule.exports=[\n  {id:'wiki',commands:['wiki'],desc:'Wikipedia',handler:async(ctx)=>{if(!ctx.text) return ctx.reply('Usage: .wiki [kata kunci]');const r=await axios.get('https://id.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(ctx.text),{timeout:8000});if(!r.data.extract) return ctx.reply('❌ Tidak ditemukan');await ctx.reply('📚 *'+r.data.title+'*\\n\\n'+(r.data.extract||'').substring(0,500)+'\\n\\n🔗 '+r.data.content_urls?.desktop?.page+'\\n_'+ctx.cfg.watermark+'_')}},\n  {id:'cuaca',commands:['cuaca','weather'],desc:'Cuaca',handler:async(ctx)=>{if(!ctx.text) return ctx.reply('Usage: .cuaca [kota]');const r=await axios.get('https://wttr.in/'+encodeURIComponent(ctx.text)+'?format=j1',{timeout:8000});const d=r.data,c=d.current_condition[0],a=d.nearest_area[0];await ctx.reply(['🌤 *Cuaca — '+a.areaName[0].value+', '+a.country[0].value+'*','━━━━━━━━━━━━━━━━',\`🌡 Suhu: \${c.temp_C}°C (terasa \${c.FeelsLikeC}°C)\`,\`💧 Kelembaban: \${c.humidity}%\`,\`💨 Angin: \${c.windspeedKmph} km/h\`,\`🌈 Kondisi: \${c.weatherDesc[0].value}\`,'━━━━━━━━━━━━━━━━',\`_\${ctx.cfg.watermark}_\`].join('\\n'))}},\n]\n`)

    zip.file(bot + 'features/education.js', `'use strict'\nmodule.exports=[{id:'pancasila',commands:['pancasila'],desc:'Pancasila',handler:async(ctx)=>{await ctx.reply(['📜 *PANCASILA*','━━━━━━━━━━━━━━━━','1. Ketuhanan Yang Maha Esa','2. Kemanusiaan yang Adil dan Beradab','3. Persatuan Indonesia','4. Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan','5. Keadilan Sosial bagi Seluruh Rakyat Indonesia','━━━━━━━━━━━━━━━━',\`_\${ctx.cfg.watermark}_\`].join('\\n'))}},{id:'planet',commands:['planet'],desc:'Planet',handler:async(ctx)=>{const p=ctx.text?.toLowerCase();const info={merkurius:'☿ Merkurius: Planet terkecil dan terdekat dari Matahari. Suhu 430°C siang, -180°C malam.',venus:'♀ Venus: Planet terpanas (465°C). Rotasi berlawanan arah.',bumi:'🌍 Bumi: Satu-satunya planet berpenghuni. Radius 6.371 km.',mars:'♂ Mars: Planet merah. 2 bulan: Phobos & Deimos.',yupiter:'♃ Yupiter: Planet terbesar. 79 bulan.',saturnus:'♄ Saturnus: Planet bercincin. Densitas terendah.',uranus:'⛢ Uranus: Planet paling dingin (-224°C). Berotasi miring.',neptunus:'♆ Neptunus: Planet terjauh. Angin tercepat 2100 km/jam.'};if(p&&info[p]) return ctx.reply(info[p]+'\\n_'+ctx.cfg.watermark+'_');await ctx.reply('🌌 *Planet Tata Surya*\\n\\n'+Object.values(info).join('\\n\\n')+'\\n_'+ctx.cfg.watermark+'_')}}]\n`)

    zip.file(bot + 'features/islam.js', `'use strict'\nconst axios=require('axios')\nmodule.exports=[\n  {id:'quran',commands:['quran','q'],desc:'Al-Quran',handler:async(ctx)=>{const[s,a]=(ctx.text||'1:1').split(':').map(Number);if(!s) return ctx.reply('Usage: .quran [surah]:[ayat]\\nContoh: .quran 1:1');const r=await axios.get('https://equran.id/api/v2/surat/'+s,{timeout:8000});const sura=r.data.data;const ayat=a?sura.ayat.find(x=>x.nomorAyat===a):sura.ayat[0];if(!ayat) return ctx.reply('❌ Ayat tidak ditemukan');await ctx.reply(['📖 *'+sura.namaLatin+' ('+sura.nama+')* Ayat '+ayat.nomorAyat,'━━━━━━━━━━━━━━━━',ayat.teksArab,'',ayat.teksLatin,'','🇮🇩 '+ayat.teksIndonesia,'━━━━━━━━━━━━━━━━',\`_\${ctx.cfg.watermark}_\`].join('\\n'))}},\n  {id:'doa',commands:['doa'],desc:'Doa Harian',handler:async(ctx)=>{const doas={'makan':'Bismillahirahmanirahim\\n(Dengan nama Allah yang Maha Pengasih lagi Maha Penyayang)\\nAllahuma baarik lanaa fiimaa razaqtanaa waqinaa adzaa ban naar','tidur':'Bismikallaahumma amuutu wa ahyaa\\n(Dengan nama-Mu ya Allah, aku mati dan aku hidup)','bangun':'Alhamdulilaahil ladzii ahyaanaa ba\'da maa amaatanaa wailaihin nusyuur\\n(Segala puji bagi Allah yang telah menghidupkan kami)','belajar':'Rabbi zidnii \'ilmaa warzuqnii fahmaa\\n(Ya Allah, tambahkanlah ilmuku dan anugerahkanlah aku pemahaman)'};const key=ctx.text?.toLowerCase();if(key&&doas[key]) return ctx.reply('🤲 *Doa '+key.charAt(0).toUpperCase()+key.slice(1)+'*\\n\\n'+doas[key]+'\\n_'+ctx.cfg.watermark+'_');await ctx.reply('🤲 *Daftar Doa*\\n\\nGunakan: .doa [nama]\\n\\n'+Object.keys(doas).map((k,i)=>i+1+'. '+k).join('\\n')+'\\n_'+ctx.cfg.watermark+'_')}},\n]\n`)

    zip.file(bot + 'features/fun.js', `'use strict'\nconst { pickRandom } = require('../lib/functions')\nconst JOKES=['Kenapa programmer tidak suka alam? Karena banyak bug! 🐛','Kenapa komputer selalu salah? Karena manusia yang memprogramnya! 😅','Apa bedanya WiFi sama cinta? WiFi kadang bisa disconnect, cinta nggak perlu password! ❤️','Kenapa hacker tidak bisa tidur? Karena tidur itu offline! 💤','Apa makanan favorit programmer? Spam! 🍖']\nconst FAKTA=['Gurita memiliki 3 jantung dan darahnya berwarna biru 🐙','Pisang secara teknis adalah buah beri, tapi stroberi bukan 🍌','Semut tidak pernah tidur sepanjang hidupnya 🐜','Warna biru tidak ada dalam bahasa Jepang kuno 🔵','Manusia adalah satu-satunya hewan yang bisa tertawa geli 😄']\nconst QUOTES=['Jangan pernah menyerah, karena hari yang buruk pun akan berakhir - Unknown','Kesuksesan adalah buah dari kerja keras dan ketekunan - Anonymous','Hidup terlalu singkat untuk menyesali hal yang sudah berlalu - Unknown']\nmodule.exports=[\n  {id:'joke',commands:['joke','jokes'],desc:'Jokes',handler:async(ctx)=>{await ctx.reply('😄 *Jokes*\\n\\n'+pickRandom(JOKES)+'\\n_'+ctx.cfg.watermark+'_')}},\n  {id:'fakta',commands:['fakta'],desc:'Fakta Random',handler:async(ctx)=>{await ctx.reply('💡 *Fakta Random*\\n\\n'+pickRandom(FAKTA)+'\\n_'+ctx.cfg.watermark+'_')}},\n  {id:'quote',commands:['quote','quotes'],desc:'Quotes',handler:async(ctx)=>{await ctx.reply('✨ *Quote*\\n\\n'+pickRandom(QUOTES)+'\\n_'+ctx.cfg.watermark+'_')}},\n  {id:'gombal',commands:['gombal'],desc:'Kata Gombal',handler:async(ctx)=>{const g=['Kamu seperti kopi, bikin aku susah tidur memikirkanmu ☕','Kalau kamu bintang, aku mau jadi langit supaya selalu bisa bersamamu 🌟','Kamu tahu kenapa HP-ku selalu low battery? Karena kamu menguras tenagaku untuk senyum 😊'];await ctx.reply('💕 *Kata Gombal*\\n\\n'+pickRandom(g)+'\\n_'+ctx.cfg.watermark+'_')}},\n]\n`)

    setProgress(90, 'Generating README & assets...')
    zip.file(bot + 'README.md',       genReadme(cfg))
    zip.file(bot + 'session/.gitkeep','')

    // ── Assets: Stiker pack + gambar + audio + font ─────────
    setProgress(93, 'Generating assets (sticker pack, images, audio, fonts)...')
    if (window.RENGU_ASSETS) {
      const stickerCount = window.RENGU_ASSETS.addToZip(zip, bot, cfg)
      console.log('Assets added: ' + stickerCount + ' stickers')
    }

    // ── Update handler.js agar load media.js ───────────────
    const handlerWithMedia = genHandler(cfg).replace(
      "const FEAT_FILES = [\n  'menu','info','tools','downloader','sticker','ai',\n  'games','rpg','group','owner','store','stalk',\n  'sound','convert','image','search','education',\n  'islam','fun',\n]",
      "const FEAT_FILES = [\n  'menu','info','tools','media','downloader','sticker','ai',\n  'games','rpg','group','owner','store','stalk',\n  'sound','convert','image','search','education',\n  'islam','fun',\n]"
    )
    zip.file(bot + 'handler.js', handlerWithMedia)

    setProgress(95, 'Packaging ZIP...')
    const blob = await zip.generateAsync({ type:'blob', compression:'DEFLATE', compressionOptions:{ level:6 } })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = cfg.botName.replace(/\s+/g,'-') + '-bot.zip'
    a.click()
    URL.revokeObjectURL(url)

    setProgress(100, '✓ Selesai!')
    suc.style.display = 'block'
    setTimeout(() => { pb.style.display = 'none' }, 2000)

  } catch(e) {
    alert('Error: ' + e.message)
    setProgress(0, 'Error: ' + e.message)
  }

  btn.disabled = false
  document.getElementById('btn-dl-text').textContent = 'Generate & Download ZIP'
}

// expose state ref
window._state = window._state || {}

})()
