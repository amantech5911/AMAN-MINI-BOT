// Auto-split from plugins/api-master-pack.js — category: tools
// (shared imports/helpers copied at top, only "tools" commands below)

const { cmd } = require('../arslan');
const config = require('../config');
const crypto = require('crypto');
const axios = require('axios');
const fs = require('fs-extra');
const animeApi = require('../lib/anime-api');
async function sendRandomAnime(conn, mek, ctx, category, caption) {
    const pick = await animeApi.randomImage(category);
    if (!pick || !pick.url) return ctx.reply('❌ Anime image servers abhi jawab nahi de rahe. `.nettest` chala kar internet check karein.');
    try {
        await conn.sendMessage(ctx.from, { image: { url: pick.url }, caption }, { quoted: mek });
    } catch (e1) {
        // WhatsApp could not fetch the URL itself -> download here and send as a file
        const r = await axios.get(pick.url, { responseType: 'arraybuffer', timeout: 20000, headers: { 'User-Agent': 'Mozilla/5.0' } });
        await conn.sendMessage(ctx.from, { image: Buffer.from(r.data), caption }, { quoted: mek });
    }
}

cmd({
    pattern: 'webshot',
    alias: ['ssweb2', 'screenshotweb'],
    desc: 'Website screenshot',
    category: 'tools',
    react: '📸',
    use: '.webshot https://google.com',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const url = (ctx.q || '').trim();
    if (!url || !/^https?:\/\//.test(url)) return ctx.reply('Use: `.webshot https://google.com`');
    try {
        const r = await axios.get(`https://image.thum.io/get/width/720/crop/1024/${url}`, {
            responseType: 'arraybuffer',
            timeout: 20000
        });
        await conn.sendMessage(ctx.from, {
            image: Buffer.from(r.data),
            caption: `📸 *Screenshot:* ${url}`
        }, { quoted: mek });
    } catch (e) { return ctx.reply('❌ Screenshot fail.'); }
});

cmd({
    pattern: 'ip2',
    alias: ['iplookup2'],
    desc: 'IP address info',
    category: 'tools',
    react: '🌐',
    use: '.ip2 8.8.8.8',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const ip = (ctx.q || '').trim();
    try {
        const r = await axios.get(`http://ip-api.com/json/${ip}`, { timeout: 10000 });
        const d = r.data;
        if (d.status === 'success') {
            return ctx.reply([
                `🌐 *IP INFO: ${d.query}*`,
                '',
                `🌍 Country: *${d.country}* (${d.countryCode})`,
                `🏙️ City: *${d.city}*`,
                `📡 ISP: *${d.isp}*`,
                `🕐 Timezone: *${d.timezone}*`
            ].join('\n'));
        }
    } catch (e) { return ctx.reply('❌ IP lookup fail.'); }
});

cmd({
    pattern: 'b64',
    alias: ['base64'],
    desc: 'Base64 encode/decode',
    category: 'tools',
    react: '🔢',
    use: '.b64 encode Hello',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const parts = (ctx.q || '').split(' ');
    const mode = parts.shift()?.toLowerCase();
    const text = parts.join(' ');
    if (!mode || !text) return ctx.reply('Use: `.b64 encode|decode <text>`');
    if (mode === 'encode') return ctx.reply(`🔢 ${Buffer.from(text).toString('base64')}`);
    if (mode === 'decode') return ctx.reply(`🔢 ${Buffer.from(text, 'base64').toString('utf8')}`);
    return ctx.reply('Use: encode ya decode');
});

cmd({
    pattern: 'short2',
    alias: ['tinyurl2'],
    desc: 'URL shortener',
    category: 'tools',
    react: '🔗',
    use: '.short2 https://example.com',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const url = (ctx.q || '').trim();
    if (!url) return ctx.reply('Use: `.short2 <url>`');
    try {
        const r = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`, { timeout: 10000 });
        return ctx.reply(`🔗 *Short URL:* ${r.data}`);
    } catch (e) { return ctx.reply('❌ Fail.'); }
});

cmd({
    pattern: 'genpass',
    alias: ['password'],
    desc: 'Password generator',
    category: 'tools',
    react: '🔐',
    use: '.genpass 16',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const len = Math.min(32, Math.max(8, parseInt(ctx.q) || 16));
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < len; i++) pass += chars[crypto.randomInt(chars.length)];
    return ctx.reply(`🔐 *Password (${len}):*\n\n\`${pass}\``);
});
