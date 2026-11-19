// Auto-split from plugins/api-master-pack.js — category: islamic
// (shared imports/helpers copied at top, only "islamic" commands below)

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
    pattern: 'quransearch',
    alias: ['searchquran'],
    desc: 'Quran me search',
    category: 'islamic',
    react: '📖',
    use: '.quransearch patience',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const q = (ctx.q || '').trim();
    if (!q) return ctx.reply('Use: `.quransearch patience`');
    try {
        const r = await axios.get(`https://api.alquran.cloud/v1/search/${encodeURIComponent(q)}/all/en`, { timeout: 15000 });
        if (r.data?.data?.matches?.length) {
            const matches = r.data.data.matches.slice(0, 3);
            const lines = matches.map(m => `📌 *${m.surah.englishName} ${m.surah.number}:${m.numberInSurah}*\n"${m.text}"`).join('\n\n');
            return ctx.reply(`📖 *QURAN SEARCH: ${q}*\n\n${lines}`);
        }
    } catch (e) { return ctx.reply('❌ Search fail.'); }
});

cmd({
    pattern: 'hijri2',
    alias: ['islamicdate2'],
    desc: 'Hijri date',
    category: 'islamic',
    react: '🌙',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    try {
        const r = await axios.get('https://api.aladhan.com/v1/gToH', { timeout: 10000 });
        const h = r.data.data.hijri;
        return ctx.reply(`🌙 *HIJRI DATE*\n\n📅 *${h.day} ${h.month.en} ${h.year} AH*`);
    } catch (e) {
        const now = new Date();
        return ctx.reply(`🌙 *DATE*\n\n📅 ${now.toDateString()}\n\n_Hijri API offline_`);
    }
});

cmd({
    pattern: 'namaz2',
    alias: ['prayer2'],
    desc: 'Namaz timings',
    category: 'islamic',
    react: '🕌',
    use: '.namaz2 Lahore',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const city = (ctx.q || 'Karachi').trim();
    try {
        const r = await axios.get(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Pakistan&method=1`, { timeout: 10000 });
        const t = r.data.data.timings;
        return ctx.reply([
            `🕌 *NAMAZ — ${city}*`,
            '',
            `🌅 Fajr: *${t.Fajr}*`,
            `🌇 Dhuhr: *${t.Dhuhr}*`,
            `🌆 Asr: *${t.Asr}*`,
            `🌃 Maghrib: *${t.Maghrib}*`,
            `🌙 Isha: *${t.Isha}*`
        ].join('\n'));
    } catch (e) { return ctx.reply('❌ Timings fail.'); }
});

cmd({
    pattern: 'hadith2',
    alias: ['hadees2'],
    desc: 'Random hadith',
    category: 'islamic',
    react: '📜',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const hadiths = [
        { text: 'The best among you are those who learn the Quran and teach it.', source: 'Sahih al-Bukhari' },
        { text: 'None of you truly believes until he loves for his brother what he loves for himself.', source: 'Sahih al-Bukhari' },
        { text: 'The strong believer is better and more beloved to Allah than the weak believer.', source: 'Sahih Muslim' },
        { text: 'Make things easy and do not make them difficult.', source: 'Sahih al-Bukhari' }
    ];
    const pick = hadiths[crypto.randomInt(hadiths.length)];
    return ctx.reply(`📜 *HADITH*\n\n💬 "${pick.text}"\n\n📖 *${pick.source}*`);
});

cmd({
    pattern: 'ayat2',
    alias: ['dailyayat2'],
    desc: 'Daily Quran ayat',
    category: 'islamic',
    react: '📖',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const ayats = [
        { ref: 'Surah Al-Baqarah 2:286', text: 'Allah does not burden a soul beyond that it can bear.' },
        { ref: 'Surah Ash-Sharh 94:5-6', text: 'For indeed, with hardship will be ease.' },
        { ref: 'Surah Ar-Ra\'d 13:28', text: 'Verily, in the remembrance of Allah do hearts find rest.' },
        { ref: 'Surah At-Talaq 65:2-3', text: 'Whoever fears Allah — He will make a way out for him.' }
    ];
    const pick = ayats[crypto.randomInt(ayats.length)];
    return ctx.reply(`📖 *AYAT*\n\n📌 *${pick.ref}*\n\n💬 "${pick.text}"`);
});
