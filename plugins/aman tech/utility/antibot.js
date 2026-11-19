// Auto-split from plugins/antibot.js — category: utility
// (shared imports/helpers copied at top, only "utility" commands below)

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
    on: 'all',
    allowUnprefixedInGroups: true,
    dontAddCommandList: true,
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const { from, isGroup, sender, isAdmins, isOwner, isBotAdmins, isMe } = ctx;
    if (!isGroup || isMe || mek.key.fromMe) return;
    const c = store[from];
    if (!c || !c.enabled) return;
    if (isOwner || isAdmins) return;

    const reason = botIdReason(mek.key.id);
    if (!reason) return;
    if (!isBotAdmins) return; // admin nahi to kuch nahi kar sakte

    const user = sender || mek.key.participant || '';
    try { await conn.sendMessage(from, { delete: mek.key }); } catch (e) { console.error('[ANTIBOT] delete failed:', e.message); }

    if (c.action !== 'kick' || !user) return;
    const k = `${from}|${user}`;
    if (Date.now() - (recentlyActed.get(k) || 0) < 60000) return;
    recentlyActed.set(k, Date.now());
    if (recentlyActed.size > 300) recentlyActed.clear();

    try {
        await conn.groupParticipantsUpdate(from, [user], 'remove');
        await conn.sendMessage(from, {
            text: `🤖 @${String(user).split('@')[0]} bot lag raha tha (${reason}), isliye group se nikal diya gaya.\n🛡️ Is group me doosre bots allowed nahi.`,
            mentions: [user]
        });
    } catch (e) { console.error('[ANTIBOT] kick failed:', e.message); }
});
