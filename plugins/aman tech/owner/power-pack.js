// Auto-split from plugins/power-pack.js — category: owner
// (shared imports/helpers copied at top, only "owner" commands below)

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
    pattern: 'serverinfo',
    alias: ['sysinfo', 'host'],
    desc: 'Server ki info',
    category: 'owner',
    react: '🖥️',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner only.');
    const mem = process.memoryUsage();
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    return ctx.reply([
        '🖥️ *Server Info*',
        '',
        `🖥️ Platform: *${os.platform()} ${os.arch()}*`,
        `⚙️ Node: *${process.version}*`,
        `🧠 CPU: *${os.cpus()[0]?.model || 'N/A'}*`,
        `💾 RAM: *${formatBytes(used)} / ${formatBytes(total)}* (${((used/total)*100).toFixed(1)}%)`,
        `📊 Process RAM: *${formatBytes(mem.rss)}*`,
        `⏱️ Uptime: *${formatUptime(process.uptime())}*`,
        `📁 CWD: *${process.cwd()}*`,
        `👥 Active sessions: *${(global.activeSockets?.size || 0)}*`
    ].join('\n'));
});

cmd({
    pattern: 'say',
    alias: ['tell', 'msg'],
    desc: 'Kisi ko msg bhejo bot ke through',
    category: 'owner',
    react: '💬',
    use: '.say <number> <message>',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner only.');
    const parts = (ctx.q || '').split(' ');
    const num = cleanNumber(parts.shift());
    const msg = parts.join(' ');
    if (!num || !msg) return ctx.reply('Use: *.say <number> <message>*');
    try {
        await conn.sendMessage(num + '@s.whatsapp.net', { text: msg });
        return ctx.reply('✅ Message sent.');
    } catch (e) { return ctx.reply('❌ ' + e.message); }
});

cmd({
    pattern: 'lockgroup',
    alias: ['lock'],
    desc: 'Owner: Group ko lock karo',
    category: 'owner',
    react: '🔒',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner only.');
    if (!ctx.isGroup) return ctx.reply('❌ Group only.');
    try {
        await conn.groupSettingUpdate(ctx.from, 'announcement');
        return ctx.reply('🔒 Group locked. Sirf admins bol sakte hain.');
    } catch (e) { return ctx.reply('❌ ' + e.message); }
});

cmd({
    pattern: 'unlockgroup',
    alias: ['unlock'],
    desc: 'Owner: Group ko unlock karo',
    category: 'owner',
    react: '🔓',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner only.');
    if (!ctx.isGroup) return ctx.reply('❌ Group only.');
    try {
        await conn.groupSettingUpdate(ctx.from, 'not_announcement');
        return ctx.reply('🔓 Group unlocked. Sab bol sakte hain.');
    } catch (e) { return ctx.reply('❌ ' + e.message); }
});

cmd({
    pattern: 'setdesc',
    alias: ['gdesc'],
    desc: 'Owner: Group description change',
    category: 'owner',
    react: '📝',
    use: '.setdesc <new description>',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner only.');
    if (!ctx.isGroup) return ctx.reply('❌ Group only.');
    if (!ctx.q) return ctx.reply('Use: *.setdesc <text>*');
    try {
        await conn.groupUpdateDescription(ctx.from, ctx.q);
        return ctx.reply('✅ Description updated.');
    } catch (e) { return ctx.reply('❌ ' + e.message); }
});

cmd({
    pattern: 'setname',
    alias: ['gname'],
    desc: 'Owner: Group ka naam change',
    category: 'owner',
    react: '✏️',
    use: '.setname <new name>',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner only.');
    if (!ctx.isGroup) return ctx.reply('❌ Group only.');
    if (!ctx.q) return ctx.reply('Use: *.setname <name>*');
    try {
        await conn.groupUpdateSubject(ctx.from, ctx.q);
        return ctx.reply('✅ Group name updated.');
    } catch (e) { return ctx.reply('❌ ' + e.message); }
});
