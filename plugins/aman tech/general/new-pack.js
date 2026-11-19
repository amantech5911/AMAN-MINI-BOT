// Auto-split from plugins/new-pack.js — category: general
// (shared imports/helpers copied at top, only "general" commands below)

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
    pattern: 'pings',
    alias: ['latency'],
    desc: 'Detailed ping',
    category: 'general',
    react: '📡',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const t1 = Date.now();
    await ctx.reply('📡 Checking…');
    const t2 = Date.now();
    const mem = process.memoryUsage();
    return ctx.reply([
        '📡 *Ping Details*',
        '',
        `⚡ Latency: *${t2 - t1}ms*`,
        `⏱️ Uptime: *${formatUptime(process.uptime())}*`,
        `💾 RAM: *${formatBytes(mem.rss)}*`,
        `🌐 Node: *${process.version}*`,
        `📱 Active sockets: *${global.activeSockets?.size || 0}*`
    ].join('\n'));
});

cmd({
    pattern: 'whois',
    alias: ['profile'],
    desc: 'Kisi user ki info dekho',
    category: 'general',
    react: '👤',
    use: '.whois @user',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const mentioned = mek.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target = mentioned[0] || mek.message?.extendedTextMessage?.contextInfo?.participant || ctx.sender;
    const num = target.split('@')[0];
    const [status] = await conn.fetchStatus(target).catch(() => [{}]);
    let pp = '';
    try { pp = await conn.profilePictureUrl(target, 'image'); } catch {}

    const text = [
        '👤 *User Info*',
        '',
        `📱 Number: *+${num}*`,
        `💬 About: *${status?.status || 'N/A'}*`,
        `🖼️ PP: *${pp ? 'Available' : 'Hidden'}*`
    ].join('\n');
    if (pp) await conn.sendMessage(ctx.from, { image: { url: pp }, caption: text }, { quoted: mek });
    else await ctx.reply(text);
});
