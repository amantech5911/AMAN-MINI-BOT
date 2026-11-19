// Auto-split from plugins/fresh-pack.js — category: tools
// (shared imports/helpers copied at top, only "tools" commands below)

const { cmd } = require('../arslan');
const config = require('../config');
const crypto = require('crypto');
const axios = require('axios');
async function fetchKeywordImage(keyword) {
    const kw = encodeURIComponent(String(keyword || 'nature').trim().replace(/\s+/g, ','));
    const urls = [
        `https://loremflickr.com/800/600/${kw}?lock=${Date.now() % 100000}`,
        `https://picsum.photos/800/600?random=${Date.now()}`
    ];
    let last;
    for (const u of urls) {
        try {
            const r = await axios.get(u, { responseType: 'arraybuffer', timeout: 15000, maxRedirects: 5 });
            if (r.data && r.data.length > 3000) return Buffer.from(r.data);
        } catch (e) { last = e; }
    }
    throw last || new Error('IMAGE_FETCH_FAILED');
}

cmd({
    pattern: 'fakechat',
    alias: ['chatmaker'],
    desc: 'Fake WhatsApp chat screenshot banao',
    category: 'tools',
    react: '💬',
    use: '.fakechat Name1|msg1|Name2|msg2',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const parts = (ctx.q || '').split('|').map(x => x.trim()).filter(Boolean);
    if (parts.length < 4 || parts.length % 2 !== 0) {
        return ctx.reply('📝 Use: `.fakechat Name1|msg1|Name2|msg2`\n\nExample:\n`.fakechat Ali|Hello!|Sara|Hi, kya haal?|Ali|Theek hun`');
    }
    let text = '💬 *FAKE CHAT*\n\n';
    for (let i = 0; i < parts.length; i += 2) {
        text += `👤 *${parts[i]}:* ${parts[i + 1]}\n\n`;
    }
    return ctx.reply(text);
});

cmd({
    pattern: 'count',
    alias: ['cd'],
    desc: 'Custom countdown',
    category: 'tools',
    react: '⏳',
    use: '.count 5',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const sec = Math.min(10, Math.max(3, parseInt(ctx.q) || 5));
    await ctx.reply(`⏳ *Countdown: ${sec}*`);
    for (let i = sec; i > 0; i--) {
        await new Promise(r => setTimeout(r, 1000));
        await conn.sendMessage(ctx.from, { text: `*${i}*` }, { quoted: mek });
    }
    await conn.sendMessage(ctx.from, { text: '🎉 *Time up!*' }, { quoted: mek });
});

cmd({
    pattern: 'worldtime',
    alias: ['timezones'],
    desc: 'Different timezones ka time',
    category: 'tools',
    react: '🌍',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const moment = require('moment-timezone');
    const zones = [
        { name: '🇵🇰 Pakistan', tz: 'Asia/Karachi' },
        { name: '🇮🇳 India', tz: 'Asia/Kolkata' },
        { name: '🇦🇪 Dubai', tz: 'Asia/Dubai' },
        { name: '🇬🇧 London', tz: 'Europe/London' },
        { name: '🇺🇸 New York', tz: 'America/New_York' },
        { name: '🇸🇦 Makkah', tz: 'Asia/Riyadh' }
    ];
    const lines = zones.map(z => `${z.name}: *${moment().tz(z.tz).format('HH:mm')}*`);
    return ctx.reply(`🌍 *WORLD TIME*\n\n${lines.join('\n')}`);
});

cmd({
    pattern: 'dayinfo',
    alias: ['today'],
    desc: 'Aaj ka din ki info',
    category: 'tools',
    react: '📅',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const moment = require('moment-timezone');
    const now = moment().tz('Asia/Karachi');
    const dayOfYear = now.dayOfYear();
    const weekNum = now.week();
    return ctx.reply([
        '📅 *TODAY INFO*',
        '',
        `🗓️ Date: *${now.format('dddd, MMMM Do YYYY')}*`,
        `📆 Day of year: *${dayOfYear}*`,
        `🔢 Week: *${weekNum}*`,
        `⏰ Time: *${now.format('HH:mm:ss')}*`,
        `🌙 Month: *${now.format('MMMM')}*`,
        `📊 Year: *${now.format('YYYY')}*`
    ].join('\n'));
});

cmd({
    pattern: 'countryinfo',
    alias: ['country'],
    desc: 'Country ki info',
    category: 'tools',
    react: '🌍',
    use: '.countryinfo Pakistan',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const country = (ctx.q || '').trim();
    if (!country) return ctx.reply('Use: `.countryinfo Pakistan`');
    try {
        const r = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`, { timeout: 10000 });
        const c = r.data[0];
        return ctx.reply([
            `🌍 *${c.name.common}*`,
            '',
            `🏛️ Capital: *${c.capital?.[0] || 'N/A'}*`,
            `👥 Population: *${c.population.toLocaleString()}*`,
            `🗺️ Region: *${c.region}*`,
            `💰 Currency: *${Object.values(c.currencies || {})[0]?.name || 'N/A'}*`,
            `🗣️ Language: *${Object.values(c.languages || {})[0] || 'N/A'}*`,
            `🌐 Code: *${c.cca2}*`
        ].join('\n'));
    } catch (e) { return ctx.reply('❌ Country nahi mila.'); }
});

cmd({
    pattern: 'github',
    alias: ['ghuser'],
    desc: 'GitHub user info',
    category: 'tools',
    react: '🐙',
    use: '.github torvalds',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const user = (ctx.q || '').trim();
    if (!user) return ctx.reply('Use: `.github <username>`');
    try {
        const r = await axios.get(`https://api.github.com/users/${user}`, { timeout: 10000 });
        const d = r.data;
        return ctx.reply([
            `🐙 *${d.login}*`,
            '',
            `📛 Name: *${d.name || 'N/A'}*`,
            `📝 Bio: *${(d.bio || 'N/A').slice(0, 100)}*`,
            `📍 Location: *${d.location || 'N/A'}*`,
            `📦 Repos: *${d.public_repos}*`,
            `👥 Followers: *${d.followers}*`,
            `⭐ Following: *${d.following}*`,
            `🔗 ${d.html_url}`
        ].join('\n'));
    } catch (e) { return ctx.reply('❌ User nahi mila.'); }
});

cmd({
    pattern: 'rnum',
    alias: ['randnum'],
    desc: 'Random number generate',
    category: 'tools',
    react: '🔢',
    use: '.rnum 1 100',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const args = (ctx.q || '').split(/\s+/);
    const min = parseInt(args[0]) || 1;
    const max = parseInt(args[1]) || 100;

    if (min >= max) return ctx.reply('❌ Min max se chota hona chahiye.');

    const num = crypto.randomInt(min, max + 1);
    return ctx.reply(`🔢 *Random (${min} - ${max}):*\n\n*${num}*`);
});

cmd({
    pattern: 'password2',
    alias: ['strongpass'],
    desc: 'Strong password',
    category: 'tools',
    react: '🔐',
    use: '.password2 16',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const len = Math.min(32, Math.max(8, parseInt(ctx.q) || 16));
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.?';
    let pass = '';
    for (let i = 0; i < len; i++) pass += chars[crypto.randomInt(chars.length)];
    return ctx.reply(`🔐 *Password (${len} chars):*\n\n\`${pass}\``);
});

