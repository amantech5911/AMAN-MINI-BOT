// Auto-split from plugins/new-pack.js — category: owner
// (shared imports/helpers copied at top, only "owner" commands below)

const { cmd } = require('../arslan');
const config = require('../config');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const axios = require('axios');
const {
    isOwner,
    isPremiumUser,
    requirePremium,
    cleanNumber
} = require('../lib/premium-check');
function formatBytes(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(2) + ' KB';
    if (b < 1073741824) return (b / 1048576).toFixed(2) + ' MB';
    return (b / 1073741824).toFixed(2) + ' GB';
}
function formatUptime(s) {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
}

cmd({
    pattern: 'botstats',
    alias: ['bstats', 'usage'],
    desc: 'Bot ke usage stats dekho',
    category: 'owner',
    react: '📊',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner only.');
    const { getStatsForNumber } = require('../lib/database');
    const num = conn.user.id.split(':')[0];
    try {
        const stats = await getStatsForNumber(num);
        if (!stats.length) return ctx.reply('❌ Koi stats nahi mile.');
        const lines = stats.slice(0, 10).map(s =>
            `📅 ${s.date}\n  💬 Msgs: ${s.messagesReceived} | ⚡ Cmds: ${s.commandsUsed}`
        );
        return ctx.reply(`📊 *Bot Stats (${num})*\n\n` + lines.join('\n'));
    } catch (e) { return ctx.reply('❌ ' + e.message); }
});
