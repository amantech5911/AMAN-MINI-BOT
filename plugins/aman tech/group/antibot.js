// Auto-split from plugins/antibot.js — category: group
// (shared imports/helpers copied at top, only "group" commands below)

const { cmd } = require('../arslan');
const fs = require('fs-extra');
const path = require('path');
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'antibot.json');
fs.ensureDirSync(DATA_DIR);
let store = {};
try { if (fs.existsSync(DATA_FILE)) store = fs.readJsonSync(DATA_FILE) || {}; } catch (_) { store = {}; }
let saveTimer;
function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        try { fs.writeJsonSync(DATA_FILE, store, { spaces: 2 }); } catch (e) { console.error('[ANTIBOT] save failed:', e.message); }
    }, 150);
}
function getCfg(jid) {
    if (!store[jid]) store[jid] = { enabled: false, action: 'kick' };
    const c = store[jid];
    if (!['kick', 'delete'].includes(c.action)) c.action = 'kick';
    return c;
}
function botIdReason(id) {
    const s = String(id || '');
    if (!s) return null;
    if (/^BAE5/i.test(s) && s.length === 16) return 'Baileys-style ID (BAE5…)';
    if (/^3EB0/i.test(s) && (s.length === 22 || s.length === 40)) return `Baileys-style ID (3EB0…, ${s.length} chars)`;
    return null;
}
const recentlyActed = new Map();

cmd({
    pattern: 'antibot',
    alias: ['antibots', 'botblock'],
    desc: 'Group me doosre bots ko block karo (on/off/kick/delete/status/check)',
    category: 'group',
    react: '🤖',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const { from, args, reply, isGroup, isAdmins, isOwner } = ctx;
    if (!isGroup) return reply('❌ Ye command sirf group me chalti hai.');
    const c = getCfg(from);
    const sub = String(args[0] || '').toLowerCase();

    if (!sub || sub === 'status') {
        return reply(
`🤖 *AMAN-MD ANTIBOT*

• Status: *${c.enabled ? 'ON ✅' : 'OFF ❌'}*
• Action: *${c.action === 'kick' ? 'DELETE + KICK' : 'SIRF DELETE'}*

*Commands*
• .antibot on / off
• .antibot kick  → bot ka message delete + bot ko group se nikalo
• .antibot delete  → sirf bot ka message delete
• .antibot check  → kisi message par reply karke likho, ID check hoga

⚠️ Bot ko group admin banana zaroori hai. Admins aur owner par ye lagu nahi hota.`);
    }

    if (sub === 'check') {
        const msg = mek.message || {};
        const inner = msg[Object.keys(msg)[0]] || {};
        const qid = (inner.contextInfo && inner.contextInfo.stanzaId) || '';
        if (!qid) return reply('↩️ Kisi message par reply karke `.antibot check` likho.');
        const why = botIdReason(qid);
        return reply(`🔎 *Message ID:* ${qid}\n📏 Length: ${qid.length}\n${why ? `🤖 *Bot lagta hai:* ${why}` : '👤 Normal user lagta hai (antibot ise nahi pakdega).'}`);
    }

    if (!isOwner && !isAdmins) return reply('❌ Sirf group admins antibot ki setting badal sakte hain.');

    if (sub === 'on' || sub === 'enable') {
        c.enabled = true; save();
        return reply(`✅ *Antibot ON.*\nAb is group me doosre bots ke messages ${c.action === 'kick' ? 'delete honge aur wo bot group se nikal diya jayega' : 'delete honge'}.\n⚠️ Bot ko group admin banana na bhoolo.`);
    }
    if (sub === 'off' || sub === 'disable') {
        c.enabled = false; save();
        return reply('✅ *Antibot OFF.*');
    }
    if (sub === 'kick' || sub === 'delete') {
        c.action = sub; c.enabled = true; save();
        return reply(sub === 'kick'
            ? '✅ *Antibot ON — DELETE + KICK.*\nBot ka message delete hoga aur bot group se nikal diya jayega.'
            : '✅ *Antibot ON — SIRF DELETE.*\nBot ke messages delete honge, bot group me rahega.');
    }
    return reply('❌ Use: `.antibot on|off|kick|delete|status|check`');
});
