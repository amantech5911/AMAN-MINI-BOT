// Auto-split from plugins/new-pack.js — category: islamic
// (shared imports/helpers copied at top, only "islamic" commands below)

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
    pattern: 'namaz',
    alias: ['prayer', 'salah'],
    desc: 'Namaz ke auqaat (city)',
    category: 'islamic',
    react: '🕌',
    use: '.namaz Lahore',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const city = (ctx.q || 'Karachi').trim();
    try {
        const r = await axios.get(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Pakistan&method=1`, { timeout: 10000 });
        const t = r.data.data.timings;
        return ctx.reply([
            `🕌 *Namaz Timings — ${city}*`,
            '',
            `🌅 Fajr: *${t.Fajr}*`,
            `🌄 Dhuhr: *${t.Dhuhr}*`,
            `🌇 Asr: *${t.Asr}*`,
            `🌆 Maghrib: *${t.Maghrib}*`,
            `🌙 Isha: *${t.Isha}*`
        ].join('\n'));
    } catch (e) { return ctx.reply('❌ Timings fetch fail.'); }
});

cmd({
    pattern: 'dua',
    alias: ['duain'],
    desc: 'Random Islamic dua',
    category: 'islamic',
    react: '🤲',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const duas = [
        '🤲 *Dua for knowledge:*\nرَبِّ زِدْنِي عِلْمًا\n"Rabbi zidni ilma"',
        '🤲 *Dua for protection:*\nبِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ',
        '🤲 *Morning dua:*\nاللَّهُمَّ بِكَ أَصْبَحْنَا',
        '🤲 *Dua for rizq:*\nاللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ'
    ];
    return ctx.reply(duas[crypto.randomInt(duas.length)]);
});
