// Auto-split from plugins/extra-pack.js — category: general
// (shared imports/helpers copied at top, only "general" commands below)

const { cmd } = require('../arslan');
const config = require('../config');
const crypto = require('crypto');
const axios = require('axios');

cmd({
    pattern: 'ping2',
    alias: ['speedtest2'],
    desc: 'Advanced ping',
    category: 'general',
    react: '📡',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const t1 = Date.now();
    await ctx.reply('📡 Testing…');
    const t2 = Date.now();
    const mem = process.memoryUsage();
    return ctx.reply([
        '📡 *PING DETAILS*',
        '',
        `⚡ Latency: *${t2 - t1}ms*`,
        `⏱ Uptime: *${Math.floor(process.uptime() / 60)}m*`,
        `💾 RAM: *${(mem.rss / 1048576).toFixed(2)} MB*`,
        `🌐 Node: *${process.version}*`,
        `📱 Sockets: *${global.activeSockets?.size || 0}*`,
        `🖥 Platform: *${require('os').platform()}*`
    ].join('\n'));
});

cmd({
    pattern: 'server',
    alias: ['serverinfo'],
    desc: 'Server info',
    category: 'general',
    react: '🖥️',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const os = require('os');
    const mem = process.memoryUsage();
    const total = os.totalmem() / 1048576;
    const free = os.freemem() / 1048576;
    const used = total - free;

    return ctx.reply([
        '🖥️ *SERVER INFO*',
        '',
        `🖥 Platform: *${os.platform()}*`,
        `⚙ CPU: *${os.cpus()[0]?.model?.slice(0, 30) || 'N/A'}*`,
        `🧠 Cores: *${os.cpus().length}*`,
        `💾 RAM: *${used.toFixed(0)}/${total.toFixed(0)} MB*`,
        `📊 Process: *${(mem.rss / 1048576).toFixed(0)} MB*`,
        `⏱ Uptime: *${Math.floor(os.uptime() / 3600)}h*`
    ].join('\n'));
});

cmd({
    pattern: 'date',
    alias: ['time'],
    desc: 'Current date and time',
    category: 'general',
    react: '📅',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const moment = require('moment-timezone');
    const time = moment().tz('Asia/Karachi').format('HH:mm:ss');
    const date = moment().tz('Asia/Karachi').format('dddd, MMMM Do YYYY');
    const hijri = moment().tz('Asia/Karachi').format('DD-MM-YYYY');

    return ctx.reply([
        '📅 *DATE & TIME*',
        '',
        `🕐 Time: *${time}*`,
        `📆 Date: *${date}*`,
        `🌙 Timezone: *Asia/Karachi (PKT)*`,
        `📅 Year: *${new Date().getFullYear()}*`
    ].join('\n'));
});
