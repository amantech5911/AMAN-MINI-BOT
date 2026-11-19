// Auto-split from plugins/power-pack.js — category: general
// (shared imports/helpers copied at top, only "general" commands below)

const { cmd } = require('../arslan');
const config = require('../config');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const axios = require('axios');
function cleanNumber(value) {
    let number = String(value || '').replace(/\D/g, '');
    if (number.startsWith('0')) number = `${config.DEFAULT_COUNTRY_CODE}${number.slice(1)}`;
    return number;
}
function isOwner(ctx) {
    return Boolean(ctx && (ctx.isOwner || ctx.isCreator || ctx.isMe)) ||
        Boolean(cleanNumber(ctx?.senderNumber) && cleanNumber(ctx.senderNumber) === cleanNumber(config.OWNER_NUMBER));
}
function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + ' MB';
    return (bytes / 1073741824).toFixed(2) + ' GB';
}
function formatUptime(seconds) {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
}

cmd({
    pattern: 'uptime',
    alias: ['runtime'],
    desc: 'Bot kitni der se chal raha',
    category: 'general',
    react: '⏱️',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const s = process.uptime();
    const mem = process.memoryUsage();
    return ctx.reply([
        '⏱️ *Bot Uptime*',
        '',
        `🕐 Uptime: *${formatUptime(s)}*`,
        `📊 Seconds: *${Math.floor(s)}*`,
        `💾 RAM: *${formatBytes(mem.rss)}*`,
        `🖥️ Platform: *${os.platform()} ${os.arch()}*`,
        `⚙️ Node: *${process.version}*`,
        `👑 Owner contact: *Private*`
    ].join('\n'));
});

cmd({
    pattern: 'userinfo',
    alias: ['whois', 'info'],
    desc: 'Kisi user ki WhatsApp info',
    category: 'general',
    react: '👤',
    use: '.userinfo @user (ya reply)',
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
        `🕐 Set at: *${status?.setAt ? new Date(status.setAt).toLocaleString() : 'N/A'}*`,
        `🖼️ Profile Pic: *${pp ? 'Available' : 'Hidden'}*`
    ].join('\n');

    if (pp) {
        await conn.sendMessage(ctx.from, { image: { url: pp }, caption: text }, { quoted: mek });
    } else {
        await ctx.reply(text);
    }
});
