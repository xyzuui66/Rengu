/**
 * RENGU — Extra Features Generator
 * RVO, Sticker WM Custom, Group lengkap, Media
 */
;(function(){
'use strict'

// ════════════════════════════════════════════════════════════
// UPDATED INDEX.JS — dengan viewOnce intercept
// ════════════════════════════════════════════════════════════
window.RENGU_genIndexFull = function(c) {
  const isQR     = c.connectMethod !== 'pairing'
  const isPairing= c.connectMethod !== 'qr'

  return `/**
 * ${c.botName} — Entry Point
 * Dibuat dengan Rengu WA Bot Engine
 */
'use strict'
require('dotenv').config()
const { makeWASocket, useMultiFileAuthState, DisconnectReason,
  fetchLatestBaileysVersion, makeCacheableSignalKeyStore,
  downloadContentFromMessage } = require('@whiskeysockets/baileys')
const { Boom }    = require('@hapi/boom')
const pino        = require('pino')
const express     = require('express')
const cfg         = require('./config')
const handler     = require('./handler')
const { log, banner, fmtUptime } = require('./lib/functions')

// ── HTTP Health Check (Pterodactyl) ───────────────────────
const app = express()
app.get('/', (_, r) => r.json({ bot:cfg.botName, status:'online', uptime:Math.floor(process.uptime()) }))
app.get('/health', (_, r) => r.send('OK'))
app.listen(process.env.PORT || 3000, () => log('info', 'HTTP port ' + (process.env.PORT||3000)))

// ── Global ────────────────────────────────────────────────
global.botStart  = Date.now()
global.db        = require('./lib/database').load()
global.cfg       = cfg
global.spam      = {}
global.voStore   = {}   // View Once storage: { msgId: { type, message, from } }

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
    patchMessageBeforeSending: (msg) => {
      // Pastikan bot bisa reply dengan benar
      const requiresPatch = !!(msg.buttonsMessage || msg.templateMessage || msg.listMessage)
      if (requiresPatch) msg.messageContextInfo = { deviceListMetadataVersion:2, deviceListMetadata:{} }
      return msg
    }
  })
${isPairing ? `
  // ── Pairing Code ─────────────────────────────────────────
  if (['pairing','both'].includes(cfg.connectMethod) && !sock.authState.creds.registered) {
    const num = cfg.ownerNumber[0].replace(/\\D/g,'')
    log('info', 'Meminta pairing code untuk: ' + num)
    await new Promise(r => setTimeout(r, 3000))
    try {
      const code = await sock.requestPairingCode(num)
      log('success', '╔══════════════════════════════╗')
      log('success', '║  PAIRING CODE : ' + code + '  ║')
      log('success', '╚══════════════════════════════╝')
      log('info', 'WA > Perangkat Tertaut > Tautkan dengan kode telepon > Ketik kode di atas')
    } catch(e) { log('error', 'Gagal pairing code: ' + e.message) }
  }
` : ''}
  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'close') {
      const code = new Boom(lastDisconnect?.error)?.output?.statusCode
      log('warn', 'Koneksi tutup — kode: ' + code)
      if (code === DisconnectReason.loggedOut) {
        log('error', 'Logged out! Hapus folder session/ dan restart.')
        return process.exit(0)
      }
      retries++
      setTimeout(connect, Math.min(5000 * retries, 60000))
    }
    if (connection === 'open') { retries = 0; log('success', '✓ ' + cfg.botName + ' terhubung!') }
  })

  // ── Messages ─────────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return
    for (const msg of messages) {
      if (!msg.message) continue

      // ─ Intercept ViewOnce (1x lihat) ─────────────────────
      // Simpan media viewOnce sebelum WA menghapusnya
      const voKey   = msg.key.id
      const voInner = msg.message?.viewOnceMessage?.message ||
                      msg.message?.viewOnceMessageV2?.message ||
                      msg.message?.viewOnceMessageV2Extension?.message

      if (voInner) {
        let voType = null
        if (voInner.imageMessage) voType = 'image'
        else if (voInner.videoMessage) voType = 'video'
        else if (voInner.audioMessage) voType = 'audio'

        if (voType) {
          // Download dan simpan ke memory segera sebelum expired
          try {
            const stream  = await downloadContentFromMessage(voInner[voType + 'Message'], voType)
            const chunks  = []
            for await (const chunk of stream) chunks.push(chunk)
            const buf = Buffer.concat(chunks)

            global.voStore[voKey] = {
              type:    voType,
              buffer:  buf,
              caption: voInner[voType + 'Message']?.caption || '',
              from:    msg.key.remoteJid,
              sender:  msg.key.participant || msg.key.remoteJid,
              time:    Date.now(),
            }

            // Auto hapus dari memory setelah 10 menit
            setTimeout(() => { delete global.voStore[voKey] }, 10 * 60 * 1000)

            log('info', '[RVO] ViewOnce tersimpan: ' + voType + ' dari ' + (msg.key.participant || msg.key.remoteJid).split('@')[0])
          } catch (e) {
            log('warn', '[RVO] Gagal simpan viewOnce: ' + e.message)
          }
        }
      }

      if (msg.key.fromMe) continue

      try { await handler(sock, msg) }
      catch (e) { log('error', 'Handler: ' + e.message) }
    }
  })

  // ── Group events ──────────────────────────────────────────
  sock.ev.on('group-participants.update', async (ev) => {
    try { await require('./features/group').onGroupUpdate(sock, ev) } catch(_) {}
  })

  // ── Call protection ───────────────────────────────────────
  sock.ev.on('call', async (calls) => {
    for (const call of calls) {
      if (call.status === 'offer' && cfg.features.antiCall) {
        await sock.rejectCall(call.id, call.from).catch(() => {})
        await sock.sendMessage(call.from, { text: '❌ Maaf, bot tidak menerima panggilan.' }).catch(() => {})
      }
    }
  })

  return sock
}

connect().catch(e => { log('error', '[FATAL] ' + e.message); process.exit(1) })
`
}

// ════════════════════════════════════════════════════════════
// features/media.js — RVO + Sticker WM Custom + Media tools
// ════════════════════════════════════════════════════════════
window.RENGU_genMediaFeature = function() {
  return `/**
 * Media Features
 * - RVO: Reveal view-once media
 * - Stiker dengan watermark custom
 * - Konversi gambar/video ke stiker
 */
'use strict'
const sharp  = require('sharp')
const { downloadContentFromMessage } = require('@whiskeysockets/baileys')
const { dlBuffer } = require('../lib/functions')
const StickerPack  = require('../lib/sticker-pack')

async function downloadMsg(msg, type) {
  const mediaMsg = msg.message?.[type+'Message'] ||
    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.[type+'Message']
  if (!mediaMsg) return null
  const stream = await downloadContentFromMessage(mediaMsg, type)
  const chunks = []; for await (const c of stream) chunks.push(c)
  return Buffer.concat(chunks)
}

module.exports = [

  // ── RVO: Reveal View Once ───────────────────────────────
  {
    id: 'rvo',
    commands: ['rvo', 'viewonce', 'vo'],
    desc: 'Reveal media 1x lihat',
    handler: async (ctx) => {
      // Ambil ID pesan yang di-reply
      const quotedId = ctx.msg.message?.extendedTextMessage?.contextInfo?.stanzaId ||
                       ctx.msg.message?.imageMessage?.contextInfo?.stanzaId ||
                       ctx.msg.message?.videoMessage?.contextInfo?.stanzaId

      if (!quotedId) {
        return ctx.reply(
          '👁 *Cara Pakai RVO*\\n\\n' +
          'Reply pesan 1x lihat dengan:\\n' +
          ctx.cfg.prefix + 'rvo\\n\\n' +
          '_Bot akan kirim ulang media dalam kondisi utuh_\\n' +
          '_' + ctx.cfg.watermark + '_'
        )
      }

      const stored = global.voStore?.[quotedId]
      if (!stored) {
        return ctx.reply(
          '❌ *Media tidak ditemukan!*\\n\\n' +
          'Kemungkinan penyebab:\\n' +
          '• Media sudah expired (>10 menit)\\n' +
          '• Bukan pesan 1x lihat\\n' +
          '• Bot tidak menyimpannya (bot offline saat dikirim)\\n\\n' +
          '_' + ctx.cfg.watermark + '_'
        )
      }

      await ctx.react('👁')

      const cap = [
        '👁 *View Once Revealed*',
        '',
        '👤 Dari: @' + stored.sender.split('@')[0],
        stored.caption ? '📝 Caption: ' + stored.caption : '',
        '',
        '_' + ctx.cfg.watermark + '_'
      ].filter(Boolean).join('\\n')

      const mentions = [stored.sender]

      if (stored.type === 'image') {
        await ctx.sock.sendMessage(ctx.from, {
          image: stored.buffer,
          caption: cap,
          mentions
        }, { quoted: ctx.msg })
      } else if (stored.type === 'video') {
        await ctx.sock.sendMessage(ctx.from, {
          video: stored.buffer,
          caption: cap,
          mentions
        }, { quoted: ctx.msg })
      } else if (stored.type === 'audio') {
        await ctx.sock.sendMessage(ctx.from, {
          audio: stored.buffer,
          mimetype: 'audio/mpeg',
          ptt: false
        }, { quoted: ctx.msg })
        await ctx.reply(cap, { mentions })
      }

      // Hapus dari store setelah direveal
      delete global.voStore[quotedId]
    }
  },

  // ── Stiker dari gambar + WM custom ─────────────────────
  {
    id: 'sticker_wm',
    commands: ['swm', 'stickerwm', 'swatermark'],
    desc: 'Stiker dengan watermark custom',
    handler: async (ctx) => {
      const buf = await downloadMsg(ctx.msg, 'image')
      if (!buf) return ctx.reply(
        'Usage: *.swm [teks watermark]*\\n' +
        'Kirim/reply gambar dengan caption .swm NamaBotmu\\n\\n' +
        '_Kosongkan untuk pakai watermark default_'
      )

      await ctx.react('🎨')

      const wmText  = ctx.text || ctx.cfg.watermarkStk || ctx.cfg.watermark
      const { webp } = await StickerPack.makeSticker(buf, wmText, {
        packName: ctx.cfg.packName,
        author:   wmText,
      })

      await ctx.sock.sendMessage(ctx.from, {
        sticker: webp,
        stickerMetadata: { pack: ctx.cfg.packName, author: wmText }
      }, { quoted: ctx.msg })
    }
  },

  // ── Stiker dari video + WM ──────────────────────────────
  {
    id: 'sticker_vid',
    commands: ['sv', 'stikervid', 'svid'],
    desc: 'Stiker animasi dari video/GIF',
    handler: async (ctx) => {
      const vidMsg = ctx.msg.message?.videoMessage ||
        ctx.msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage
      if (!vidMsg) return ctx.reply('Kirim/reply video pendek (<10 detik) dengan .sv')

      if ((vidMsg.seconds || 0) > 10) return ctx.reply('❌ Video max 10 detik untuk stiker!')

      await ctx.react('⏳')
      const stream = await downloadContentFromMessage(vidMsg, 'video')
      const chunks = []; for await (const c of stream) chunks.push(c)
      const buf = Buffer.concat(chunks)

      const wmText = ctx.text || ctx.cfg.watermarkStk || ''
      const { webp } = await StickerPack.makeSticker(buf, wmText, { packName: ctx.cfg.packName, author: ctx.cfg.authorName })

      await ctx.sock.sendMessage(ctx.from, {
        sticker: webp,
        stickerMetadata: { pack: ctx.cfg.packName, author: wmText || ctx.cfg.authorName }
      }, { quoted: ctx.msg })
    }
  },

  // ── Stiker dari URL ─────────────────────────────────────
  {
    id: 'sticker_url',
    commands: ['surl', 'stickerurl'],
    desc: 'Stiker dari URL gambar',
    handler: async (ctx) => {
      const url = ctx.text
      if (!url?.startsWith('http')) return ctx.reply('Usage: .surl [url gambar]')
      await ctx.react('⏳')
      const buf = await dlBuffer(url)
      const { webp } = await StickerPack.makeSticker(buf, ctx.cfg.watermarkStk, {
        packName: ctx.cfg.packName, author: ctx.cfg.authorName
      })
      await ctx.sock.sendMessage(ctx.from, { sticker: webp, stickerMetadata: { pack: ctx.cfg.packName, author: ctx.cfg.authorName } }, { quoted: ctx.msg })
    }
  },

  // ── Kirim stiker dari pack bawaan ───────────────────────
  {
    id: 'packsticker',
    commands: ['ps', 'packsticker', 'spack'],
    desc: 'Stiker dari pack bawaan bot',
    handler: async (ctx) => {
      const id = ctx.args[0]?.toLowerCase()
      if (!id) {
        const { listStickers } = require('../lib/sticker-pack')
        const list = listStickers()
        const grouped = {}
        list.forEach(s => {
          const cat = s.id.includes('_') ? s.id.split('_')[0] : 'other'
          if (!grouped[cat]) grouped[cat] = []
          grouped[cat].push(ctx.cfg.prefix + 'ps ' + s.id + ' — ' + s.emoji + ' ' + s.label)
        })
        const lines = ['🎨 *Pack Stiker Bawaan*', '', 'Usage: ' + ctx.cfg.prefix + 'ps [id]', '']
        list.slice(0, 20).forEach(s => lines.push(s.emoji + ' \`' + s.id + '\` — ' + s.label))
        if (list.length > 20) lines.push('\\n...dan ' + (list.length - 20) + ' lainnya')
        lines.push('\\n_' + ctx.cfg.watermark + '_')
        return ctx.reply(lines.join('\\n'))
      }
      await StickerPack.sendPackSticker(ctx, id)
    }
  },

  // ── Random stiker dari pack ─────────────────────────────
  {
    id: 'randomsticker',
    commands:['rs','randomsticker','srand'],
    desc: 'Stiker random dari pack',
    handler: async (ctx) => {
      const stk = await StickerPack.randomSticker(ctx)
      await ctx.reply('🎲 Stiker random: ' + stk.emoji + ' ' + stk.label)
    }
  },

]
`
}

// ════════════════════════════════════════════════════════════
// features/group.js — Lengkap dengan custom welcome, swgroup
// ════════════════════════════════════════════════════════════
window.RENGU_genGroupFeature = function() {
  return `/**
 * Group Features — Lengkap
 * Hidetag, Kick, Add, Welcome Custom, SwGroup, dll
 */
'use strict'
const db = require('../lib/database')
const { sleep } = require('../lib/functions')
const fs   = require('fs')
const path = require('path')

// Default welcome template
const DEFAULT_WELCOME = \`🎉 *Selamat Datang!*

Halo @{{mention}}, selamat bergabung di *{{group}}*! 👋

📌 Baca rules grup ya
🤖 Bot: {{prefix}}menu untuk daftar perintah

_{{watermark}}_\`

const DEFAULT_GOODBYE = \`👋 *Sampai Jumpa!*

@{{mention}} telah meninggalkan *{{group}}*.
Semoga sukses selalu! 🙏

_{{watermark}}_\`

function fillTemplate(tmpl, data) {
  return tmpl
    .replace(/{{mention}}/g, data.mention || '')
    .replace(/{{group}}/g,   data.group   || '')
    .replace(/{{prefix}}/g,  data.prefix  || '.')
    .replace(/{{watermark}}/g, data.watermark || '')
    .replace(/{{member_count}}/g, data.memberCount || '0')
    .replace(/{{date}}/g,    new Date().toLocaleDateString('id-ID'))
    .replace(/{{time}}/g,    new Date().toLocaleTimeString('id-ID'))
}

const features = [

  // ── Hidetag ─────────────────────────────────────────────
  {
    id:'hidetag', commands:['hidetag','ht','tagall','tagmember'],
    desc:'Tag semua member (tersembunyi)', groupOnly:true,
    handler: async(ctx) => {
      const members  = ctx.groupMeta.participants.map(p => p.id)
      const text     = ctx.text || ('📢 Pengumuman dari @' + ctx.sNum)
      const tagText  = members.map(m => '@' + m.split('@')[0]).join(' ')
      await ctx.sock.sendMessage(ctx.from, {
        text:     text + '\\n\\n' + tagText,
        mentions: members,
      }, { quoted: ctx.msg })
    }
  },

  // ── Tag admin saja ──────────────────────────────────────
  {
    id:'tagadmin', commands:['tagadmin','ta'],
    desc:'Tag semua admin', groupOnly:true,
    handler: async(ctx) => {
      const admins = ctx.groupMeta.participants.filter(p => p.admin).map(p => p.id)
      if (!admins.length) return ctx.reply('Tidak ada admin di grup ini.')
      await ctx.sock.sendMessage(ctx.from, {
        text: (ctx.text || '📣 Dipanggil oleh anggota') + '\\n\\n' + admins.map(a => '@' + a.split('@')[0]).join(' '),
        mentions: admins
      }, { quoted: ctx.msg })
    }
  },

  // ── Kick member ─────────────────────────────────────────
  {
    id:'kick', commands:['kick','keluarkan'],
    desc:'Kick member', adminOnly:true, groupOnly:true,
    handler: async(ctx) => {
      if (!ctx.isBotAdmin) return ctx.reply('❌ Bot harus jadi admin!')
      if (!ctx.mentioned.length) return ctx.reply(
        'Usage: ' + ctx.cfg.prefix + 'kick @tag\\n' +
        'Bisa tag beberapa sekaligus'
      )
      await ctx.react('⏳')
      let kicked = 0, failed = 0
      for (const jid of ctx.mentioned) {
        try {
          await ctx.sock.groupParticipantsUpdate(ctx.from, [jid], 'remove')
          kicked++
        } catch(_) { failed++ }
        await sleep(500)
      }
      await ctx.reply(
        '✅ *Kick Selesai*\\n\\n' +
        '👢 Kicked: ' + kicked + ' member\\n' +
        (failed ? '❌ Gagal: ' + failed + '\\n' : '') +
        '_' + ctx.cfg.watermark + '_'
      )
    }
  },

  // ── Kick + ban (blacklist) ──────────────────────────────
  {
    id:'ban', commands:['ban'],
    desc:'Kick + blacklist member', adminOnly:true, groupOnly:true,
    handler: async(ctx) => {
      if (!ctx.isBotAdmin) return ctx.reply('❌ Bot harus jadi admin!')
      if (!ctx.mentioned.length) return ctx.reply('Usage: .ban @tag')
      for (const jid of ctx.mentioned) {
        await ctx.sock.groupParticipantsUpdate(ctx.from, [jid], 'remove').catch(()=>{})
        const grp = db.getGroup(ctx.from)
        grp.blacklist = grp.blacklist || []
        if (!grp.blacklist.includes(jid)) grp.blacklist.push(jid)
      }
      db.save()
      await ctx.reply('🚫 ' + ctx.mentioned.length + ' member dikick dan di-blacklist dari grup ini.\\n_' + ctx.cfg.watermark + '_')
    }
  },

  // ── Add member ──────────────────────────────────────────
  {
    id:'add', commands:['add','tambah'],
    desc:'Tambah member', adminOnly:true, groupOnly:true,
    handler: async(ctx) => {
      if (!ctx.isBotAdmin) return ctx.reply('❌ Bot harus jadi admin!')
      if (!ctx.args[0]) return ctx.reply('Usage: .add 628xxx\\nBisa tulis beberapa nomor dipisah spasi')
      await ctx.react('⏳')
      let added = 0, failed = 0
      for (const arg of ctx.args) {
        const jid = arg.replace(/\\D/g,'') + '@s.whatsapp.net'
        try {
          const res = await ctx.sock.groupParticipantsUpdate(ctx.from, [jid], 'add')
          added++
        } catch(_) { failed++ }
        await sleep(500)
      }
      await ctx.reply('✅ Ditambahkan: ' + added + ' | Gagal: ' + failed + '\\n_' + ctx.cfg.watermark + '_')
    }
  },

  // ── Promote & Demote ────────────────────────────────────
  {
    id:'promote', commands:['promote','jadikanadmin'],
    desc:'Promote ke admin', adminOnly:true, groupOnly:true,
    handler: async(ctx) => {
      if (!ctx.isBotAdmin) return ctx.reply('❌ Bot harus jadi admin!')
      if (!ctx.mentioned.length) return ctx.reply('Usage: .promote @tag')
      for (const jid of ctx.mentioned)
        await ctx.sock.groupParticipantsUpdate(ctx.from, [jid], 'promote')
      await ctx.sock.sendMessage(ctx.from, {
        text: '⬆️ ' + ctx.mentioned.map(j=>'@'+j.split('@')[0]).join(', ') + ' dipromote jadi admin!\\n_' + ctx.cfg.watermark + '_',
        mentions: ctx.mentioned
      }, { quoted: ctx.msg })
    }
  },
  {
    id:'demote', commands:['demote','turunkanadmin'],
    desc:'Demote dari admin', adminOnly:true, groupOnly:true,
    handler: async(ctx) => {
      if (!ctx.isBotAdmin) return ctx.reply('❌ Bot harus jadi admin!')
      if (!ctx.mentioned.length) return ctx.reply('Usage: .demote @tag')
      for (const jid of ctx.mentioned)
        await ctx.sock.groupParticipantsUpdate(ctx.from, [jid], 'demote')
      await ctx.sock.sendMessage(ctx.from, {
        text: '⬇️ ' + ctx.mentioned.map(j=>'@'+j.split('@')[0]).join(', ') + ' di-demote dari admin!\\n_' + ctx.cfg.watermark + '_',
        mentions: ctx.mentioned
      }, { quoted: ctx.msg })
    }
  },

  // ── Link & Revoke ───────────────────────────────────────
  {
    id:'link', commands:['link','gruplink'],
    desc:'Ambil link grup', groupOnly:true,
    handler: async(ctx) => {
      const code = await ctx.sock.groupInviteCode(ctx.from)
      await ctx.reply('🔗 *Link Grup*\\n\\nhttps://chat.whatsapp.com/' + code + '\\n\\n_' + ctx.cfg.watermark + '_')
    }
  },
  {
    id:'revoke', commands:['revoke','resetlink'],
    desc:'Reset link grup', adminOnly:true, groupOnly:true,
    handler: async(ctx) => {
      if (!ctx.isBotAdmin) return ctx.reply('❌ Bot harus jadi admin!')
      await ctx.sock.groupRevokeInvite(ctx.from)
      const code = await ctx.sock.groupInviteCode(ctx.from)
      await ctx.reply('✅ Link direset!\\n\\nhttps://chat.whatsapp.com/' + code + '\\n_' + ctx.cfg.watermark + '_')
    }
  },

  // ── Set nama & deskripsi ─────────────────────────────────
  {
    id:'setname', commands:['setname','namagrup'],
    desc:'Ubah nama grup', adminOnly:true, groupOnly:true,
    handler: async(ctx) => {
      if (!ctx.isBotAdmin) return ctx.reply('❌ Bot harus jadi admin!')
      if (!ctx.text) return ctx.reply('Usage: .setname [nama baru]')
      await ctx.sock.groupUpdateSubject(ctx.from, ctx.text)
      await ctx.reply('✅ Nama grup diubah ke: *' + ctx.text + '*')
    }
  },
  {
    id:'setdesc', commands:['setdesc','deskripsi'],
    desc:'Ubah deskripsi grup', adminOnly:true, groupOnly:true,
    handler: async(ctx) => {
      if (!ctx.isBotAdmin) return ctx.reply('❌ Bot harus jadi admin!')
      if (!ctx.text) return ctx.reply('Usage: .setdesc [deskripsi baru]')
      await ctx.sock.groupUpdateDescription(ctx.from, ctx.text)
      await ctx.reply('✅ Deskripsi grup diperbarui!')
    }
  },

  // ── Mute & Unmute grup ──────────────────────────────────
  {
    id:'mute', commands:['mute','kunci','closegroup'],
    desc:'Kunci grup (hanya admin)', adminOnly:true, groupOnly:true,
    handler: async(ctx) => {
      if (!ctx.isBotAdmin) return ctx.reply('❌ Bot harus jadi admin!')
      await ctx.sock.groupSettingUpdate(ctx.from, 'announcement')
      await ctx.reply('🔒 Grup dikunci! Hanya admin yang bisa kirim pesan.\\n_' + ctx.cfg.watermark + '_')
    }
  },
  {
    id:'unmute', commands:['unmute','buka','opengroup'],
    desc:'Buka kunci grup', adminOnly:true, groupOnly:true,
    handler: async(ctx) => {
      if (!ctx.isBotAdmin) return ctx.reply('❌ Bot harus jadi admin!')
      await ctx.sock.groupSettingUpdate(ctx.from, 'not_announcement')
      await ctx.reply('🔓 Grup dibuka! Semua member bisa kirim pesan.\\n_' + ctx.cfg.watermark + '_')
    }
  },

  // ── Welcome toggle & custom ─────────────────────────────
  {
    id:'welcome', commands:['welcome','welc'],
    desc:'Toggle/atur pesan sambutan', adminOnly:true, groupOnly:true,
    handler: async(ctx) => {
      const g   = db.getGroup(ctx.from)
      const arg = ctx.args[0]?.toLowerCase()
      if (arg === 'on')  { g.welcome = true;  db.save(); return ctx.reply('✅ Welcome message *aktif*!') }
      if (arg === 'off') { g.welcome = false; db.save(); return ctx.reply('✅ Welcome message *nonaktif*!') }
      if (arg === 'set') {
        const newMsg = ctx.args.slice(1).join(' ')
        if (!newMsg) return ctx.reply(
          '📝 *Custom Welcome Message*\\n\\n' +
          'Usage: .welcome set [pesan]\\n\\n' +
          'Variabel yang tersedia:\\n' +
          '{{mention}} — tag member baru\\n' +
          '{{group}} — nama grup\\n' +
          '{{prefix}} — prefix bot\\n' +
          '{{member_count}} — jumlah member\\n' +
          '{{date}} — tanggal hari ini\\n' +
          '{{time}} — jam sekarang\\n' +
          '{{watermark}} — watermark bot\\n\\n' +
          'Contoh:\\nSelamat datang @{{mention}} di {{group}}! 🎉'
        )
        g.welcomeMsg = newMsg
        g.welcome    = true
        db.save()
        return ctx.reply('✅ Welcome message diperbarui!\\n\\nPreview:\\n' + fillTemplate(newMsg, {
          mention:'contoh_user', group: ctx.groupMeta?.subject || 'Grup',
          prefix: ctx.cfg.prefix, watermark: ctx.cfg.watermark, memberCount: '100'
        }))
      }
      if (arg === 'reset') {
        g.welcomeMsg = null
        db.save()
        return ctx.reply('✅ Welcome message di-reset ke default.')
      }
      if (arg === 'show') {
        return ctx.reply(
          '📋 *Welcome Message Saat Ini*\\n\\n' +
          'Status: ' + (g.welcome ? '✅ Aktif' : '❌ Nonaktif') + '\\n\\n' +
          (g.welcomeMsg || DEFAULT_WELCOME) + '\\n\\n' +
          '_Gunakan .welcome set [pesan] untuk mengubah_'
        )
      }
      await ctx.reply(
        '📋 *Welcome Settings*\\n\\n' +
        'Status: ' + (g.welcome ? '✅ Aktif' : '❌ Nonaktif') + '\\n\\n' +
        '.welcome on — aktifkan\\n' +
        '.welcome off — nonaktifkan\\n' +
        '.welcome set [pesan] — atur pesan\\n' +
        '.welcome show — lihat pesan saat ini\\n' +
        '.welcome reset — reset ke default'
      )
    }
  },

  // ── Goodbye toggle & custom ─────────────────────────────
  {
    id:'goodbye', commands:['goodbye','bye','selamatjalan'],
    desc:'Toggle pesan perpisahan', adminOnly:true, groupOnly:true,
    handler: async(ctx) => {
      const g   = db.getGroup(ctx.from)
      const arg = ctx.args[0]?.toLowerCase()
      if (arg === 'on')  { g.goodbye = true;  db.save(); return ctx.reply('✅ Goodbye message *aktif*!') }
      if (arg === 'off') { g.goodbye = false; db.save(); return ctx.reply('✅ Goodbye message *nonaktif*!') }
      if (arg === 'set') {
        const newMsg = ctx.args.slice(1).join(' ')
        if (!newMsg) return ctx.reply('Usage: .bye set [pesan]\\n\\nVariabel: {{mention}} {{group}} {{watermark}} {{date}}')
        g.goodbyeMsg = newMsg
        g.goodbye    = true
        db.save()
        return ctx.reply('✅ Goodbye message diperbarui!')
      }
      await ctx.reply('Status: ' + (g.goodbye ? '✅ Aktif' : '❌ Nonaktif') + '\\n.bye on/off/set [pesan]')
    }
  },

  // ── Anti-link ───────────────────────────────────────────
  {
    id:'antilink', commands:['antilink','al'],
    desc:'Anti link otomatis', adminOnly:true, groupOnly:true,
    handler: async(ctx) => {
      const g = db.getGroup(ctx.from)
      const arg = ctx.args[0]?.toLowerCase()
      if (!['on','off'].includes(arg)) return ctx.reply('Usage: .antilink on/off')
      g.antilink = arg === 'on'
      db.save()
      await ctx.reply('🔗 Anti link *' + arg + '*!\\n_' + ctx.cfg.watermark + '_')
    }
  },

  // ── Anti spam ───────────────────────────────────────────
  {
    id:'antispam', commands:['antispam','as'],
    desc:'Anti spam di grup', adminOnly:true, groupOnly:true,
    handler: async(ctx) => {
      const g   = db.getGroup(ctx.from)
      const arg = ctx.args[0]?.toLowerCase()
      if (!['on','off'].includes(arg)) return ctx.reply('Usage: .antispam on/off')
      g.antispam = arg === 'on'
      db.save()
      await ctx.reply('🚫 Anti spam *' + arg + '*!')
    }
  },

  // ── Group info ──────────────────────────────────────────
  {
    id:'groupinfo', commands:['groupinfo','infogroup','gi'],
    desc:'Info detail grup', groupOnly:true,
    handler: async(ctx) => {
      const g      = ctx.groupMeta
      const admins = g.participants.filter(p => p.admin)
      const grpDb  = db.getGroup(ctx.from)
      await ctx.reply([
        '📋 *INFO GRUP*',
        '━━━━━━━━━━━━━━━━━━━━',
        '📌 Nama      : ' + g.subject,
        '👥 Member    : ' + g.participants.length + ' orang',
        '👑 Admin     : ' + admins.length + ' orang',
        '📅 Dibuat    : ' + new Date(g.creation * 1000).toLocaleDateString('id-ID'),
        '🔒 Restriksi : ' + (g.restrict ? 'Ya (hanya admin)' : 'Tidak'),
        '━━━━━━━━━━━━━━━━━━━━',
        '⚙️ Bot Settings:',
        '🔗 Anti Link : ' + (grpDb.antilink ? '✅' : '❌'),
        '👋 Welcome   : ' + (grpDb.welcome  ? '✅' : '❌'),
        '👋 Goodbye   : ' + (grpDb.goodbye  ? '✅' : '❌'),
        '🔇 Mute      : ' + (g.announce     ? '✅' : '❌'),
        '━━━━━━━━━━━━━━━━━━━━',
        '_' + ctx.cfg.watermark + '_'
      ].join('\\n'))
    }
  },

  // ── List grup ───────────────────────────────────────────
  {
    id:'listgroup', commands:['listgroup','listgrup','lg'],
    desc:'Semua grup yang diikuti bot', ownerOnly:true,
    handler: async(ctx) => {
      const groups = await ctx.sock.groupFetchAllParticipating()
      const list   = Object.values(groups)
      if (!list.length) return ctx.reply('Bot tidak ada di grup manapun.')
      const lines = ['📋 *List Grup Bot* (' + list.length + ' grup)\\n']
      list.forEach((g, i) => lines.push((i+1) + '. ' + g.subject + ' (' + g.participants.length + ' member)'))
      lines.push('\\n_' + ctx.cfg.watermark + '_')
      await ctx.reply(lines.join('\\n'))
    }
  },

  // ── SwGroup: Set welcome image dari gambar ──────────────
  {
    id:'swgroup', commands:['swgroup','setwelcomeimg','swelcimg'],
    desc:'Set gambar sambutan dari gambar yang dikirim', adminOnly:true, groupOnly:true,
    handler: async(ctx) => {
      const imgMsg = ctx.msg.message?.imageMessage ||
        ctx.msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage
      if (!imgMsg) return ctx.reply(
        '📸 Kirim/reply gambar dengan .swgroup untuk set foto sambutan grup.\\n\\n' +
        'Gambar ini akan dikirim saat ada member baru bergabung.'
      )
      const { downloadContentFromMessage } = require('@whiskeysockets/baileys')
      const stream = await downloadContentFromMessage(imgMsg, 'image')
      const chunks = []; for await (const c of stream) chunks.push(c)
      const buf = Buffer.concat(chunks)

      const g = db.getGroup(ctx.from)
      g.welcomeImg    = buf.toString('base64')
      g.welcomeImgSet = true
      db.save()
      await ctx.reply('✅ Foto sambutan diperbarui! Akan dikirim saat member baru bergabung.\\n_' + ctx.cfg.watermark + '_')
    }
  },

  // ── Warn system ─────────────────────────────────────────
  {
    id:'warn', commands:['warn'],
    desc:'Beri peringatan ke member', adminOnly:true, groupOnly:true,
    handler: async(ctx) => {
      const target = ctx.mentioned[0]
      if (!target) return ctx.reply('Usage: .warn @tag [alasan]')
      const reason = ctx.args.slice(1).join(' ') || 'Tidak ada alasan'
      const g = db.getGroup(ctx.from)
      g.warns = g.warns || {}
      g.warns[target] = (g.warns[target] || 0) + 1
      db.save()
      const warnCount = g.warns[target]
      const MAX_WARN  = 3
      await ctx.sock.sendMessage(ctx.from, {
        text: [
          '⚠️ *PERINGATAN*',
          '',
          '👤 User   : @' + target.split('@')[0],
          '📝 Alasan : ' + reason,
          '🔢 Warn   : ' + warnCount + '/' + MAX_WARN,
          '',
          warnCount >= MAX_WARN ? '🚨 BATAS WARN TERCAPAI! Auto-kick...' : '⚠️ Hati-hati ya!',
          '_' + ctx.cfg.watermark + '_'
        ].join('\\n'),
        mentions: [target]
      }, { quoted: ctx.msg })
      if (warnCount >= MAX_WARN && ctx.isBotAdmin) {
        await ctx.sock.groupParticipantsUpdate(ctx.from, [target], 'remove').catch(()=>{})
        delete g.warns[target]
        db.save()
      }
    }
  },

  // ── Member count ────────────────────────────────────────
  {
    id:'membercount', commands:['membercount','jmlanggota','mc'],
    desc:'Jumlah member grup', groupOnly:true,
    handler: async(ctx) => {
      const total  = ctx.groupMeta.participants.length
      const admins = ctx.groupMeta.participants.filter(p => p.admin).length
      await ctx.reply('👥 *Member Grup*\\n\\nTotal  : ' + total + ' orang\\nAdmin  : ' + admins + ' orang\\nMember : ' + (total - admins) + ' orang\\n_' + ctx.cfg.watermark + '_')
    }
  },

]

// ── Group Event Handler (welcome/goodbye) ─────────────────
features.onGroupUpdate = async function(sock, ev) {
  const { id, participants, action } = ev
  const g = db.getGroup(id)

  let groupMeta = null
  try { groupMeta = await sock.groupMetadata(id) } catch(_) {}
  const groupName = groupMeta?.subject || 'grup ini'

  for (const jid of participants) {
    const mention = jid.split('@')[0]
    const data = {
      mention,
      group:       groupName,
      prefix:      global.cfg?.prefix || '.',
      watermark:   global.cfg?.watermark || '',
      memberCount: String(groupMeta?.participants?.length || 0),
    }

    if (action === 'add' && g.welcome) {
      const tmpl = g.welcomeMsg || DEFAULT_WELCOME
      const text = fillTemplate(tmpl, data)

      // Kirim welcome image jika ada
      if (g.welcomeImg && g.welcomeImgSet) {
        try {
          const imgBuf = Buffer.from(g.welcomeImg, 'base64')
          await sock.sendMessage(id, {
            image:    imgBuf,
            caption:  text,
            mentions: [jid],
          })
          continue
        } catch(_) {}
      }

      // Kirim text saja
      await sock.sendMessage(id, { text, mentions:[jid] }).catch(()=>{})
    }

    if (action === 'remove' && g.goodbye) {
      const tmpl = g.goodbyeMsg || DEFAULT_GOODBYE
      const text = fillTemplate(tmpl, data)
      await sock.sendMessage(id, { text, mentions:[jid] }).catch(()=>{})
    }
  }
}

module.exports = features
`
}

})()
