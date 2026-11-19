// Auto-split from plugins/useful-pack.js — category: islamic
// (shared imports/helpers copied at top, only "islamic" commands below)

const { cmd } = require('../arslan');
const config = require('../config');
const crypto = require('crypto');
const axios = require('axios');
const tasbeehCounts = new Map();

cmd({
    pattern: 'nextnamaz',
    alias: ['nextprayer'],
    desc: 'Agli namaz ka waqt',
    category: 'islamic',
    react: '🕌',
    use: '.nextnamaz Karachi',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const city = (ctx.q || 'Karachi').trim();
    try {
        const r = await axios.get(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Pakistan&method=1`, { timeout: 10000 });
        const t = r.data.data.timings;
        const now = new Date();
        const times = [
            { name: 'Fajr', time: t.Fajr },
            { name: 'Dhuhr', time: t.Dhuhr },
            { name: 'Asr', time: t.Asr },
            { name: 'Maghrib', time: t.Maghrib },
            { name: 'Isha', time: t.Isha }
        ];
        let next = times.find(x => {
            const [h, m_] = x.time.split(':').map(Number);
            const dt = new Date();
            dt.setHours(h, m_, 0);
            return dt > now;
        }) || times[0];

        return ctx.reply([
            `🕌 *NEXT NAMAZ — ${city.toUpperCase()}*`,
            '',
            `⏰ Next: *${next.name}* at *${next.time}*`,
            '',
            '*All Timings:*',
            ...times.map(x => `• ${x.name}: *${x.time}*`)
        ].join('\n'));
    } catch (e) { return ctx.reply('❌ Timings fetch fail.'); }
});

cmd({
    pattern: 'hijri',
    alias: ['islamicdate'],
    desc: 'Hijri (Islamic) date',
    category: 'islamic',
    react: '🌙',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    try {
        const r = await axios.get('https://api.aladhan.com/v1/gToH', { timeout: 10000 });
        const h = r.data.data.hijri;
        return ctx.reply([
            '🌙 *HIJRI DATE*',
            '',
            `📅 Date: *${h.day} ${h.month.en} ${h.year} AH*`,
            `📆 Month: *${h.month.ar}*`,
            `🌍 Weekday: *${h.weekday.en}*`,
            `📖 Hijri Year: *${h.year}*`
        ].join('\n'));
    } catch (e) { return ctx.reply('❌ Hijri date fail.'); }
});

cmd({
    pattern: 'islamicfact',
    alias: ['deeni-fact'],
    desc: 'Islamic fact',
    category: 'islamic',
    react: '📖',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const facts = [
        '📖 Quran me 114 Surahs hain, 6236 Ayat hain.',
        '🕌 Makkah me Kaaba ko Hazrat Ibrahim (AS) ne banaya.',
        '🌙 Ramadan Islami calendar ka 9th month hai.',
        '📿 Muslims 5 waqt namaz padhte hain.',
        '🕋 Hajj zindagi me ek baar farz hai (agar taqat ho).',
        '📚 Sahih Bukhari me 7000+ hadith hain.',
        '🌍 Islam 1.8 billion+ logon ka mazhab hai.',
        '🕌 Masjid-e-Nabvi Madinah me hai.'
    ];
    return ctx.reply(facts[crypto.randomInt(facts.length)]);
});

cmd({
    pattern: 'ayat',
    alias: ['dailyayat'],
    desc: 'Daily Quran ayat',
    category: 'islamic',
    react: '📖',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const ayats = [
        { ref: 'Surah Al-Baqarah 2:286', text: 'Allah does not burden a soul beyond that it can bear.' },
        { ref: 'Surah Ash-Sharh 94:5-6', text: 'For indeed, with hardship will be ease.' },
        { ref: 'Surah Ar-Ra\'d 13:28', text: 'Verily, in the remembrance of Allah do hearts find rest.' },
        { ref: 'Surah Al-Imran 3:139', text: 'Do not weaken and do not grieve.' },
        { ref: 'Surah At-Talaq 65:2-3', text: 'Whoever fears Allah — He will make a way out for him.' }
    ];
    const pick = ayats[crypto.randomInt(ayats.length)];
    return ctx.reply(`📖 *AYAT OF TODAY*\n\n📌 *${pick.ref}*\n\n💬 "${pick.text}"`);
});

cmd({
    pattern: 'dailyhadith',
    alias: ['hadithday'],
    desc: 'Daily hadith',
    category: 'islamic',
    react: '📜',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const hadiths = [
        { text: 'The best among you are those who learn the Quran and teach it.', source: 'Sahih al-Bukhari' },
        { text: 'None of you truly believes until he loves for his brother what he loves for himself.', source: 'Sahih al-Bukhari' },
        { text: 'The strong believer is better and more beloved to Allah than the weak believer.', source: 'Sahih Muslim' },
        { text: 'Make things easy and do not make them difficult.', source: 'Sahih al-Bukhari' },
        { text: 'He who does not thank people, does not thank Allah.', source: 'Sunan Abi Dawud' }
    ];
    const pick = hadiths[crypto.randomInt(hadiths.length)];
    return ctx.reply(`📜 *HADITH OF TODAY*\n\n💬 "${pick.text}"\n\n📖 *${pick.source}*`);
});

cmd({
    pattern: 'tasbeeh',
    alias: ['zikr', 'counter'],
    desc: 'Digital tasbeeh counter',
    category: 'islamic',
    react: '📿',
    use: '.tasbeeh start  |  .tasbeeh  |  .tasbeeh reset',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const action = (ctx.q || '').trim().toLowerCase();
    const key = ctx.sender;

    if (action === 'reset') {
        tasbeehCounts.set(key, 0);
        return ctx.reply('📿 *Tasbeeh reset: 0*');
    }
    if (action === 'start') {
        tasbeehCounts.set(key, 0);
        return ctx.reply('📿 *Tasbeeh started!*\n\nHar baar `.tasbeeh` likho — count barhega.\n\nReset: `.tasbeeh reset`');
    }

    const count = (tasbeehCounts.get(key) || 0) + 1;
    tasbeehCounts.set(key, count);

    const emojis = ['📿', '✨', '🌟', '💫', '⭐'];
    return ctx.reply(`${emojis[crypto.randomInt(emojis.length)]} *Tasbeeh Count: ${count}*\n\n_SubhanAllah, Alhamdulillah, Allahu Akbar_`);
});
