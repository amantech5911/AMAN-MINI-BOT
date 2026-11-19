// Auto-split from plugins/ultimate-pack.js — category: islamic
// (shared imports/helpers copied at top, only "islamic" commands below)

const { cmd } = require('../arslan');
const config = require('../config');
const crypto = require('crypto');
const axios = require('axios');
const zikrData = new Map();

cmd({
    pattern: 'surah',
    alias: ['quraninfo', 'surahinfo'],
    desc: 'Quran Surah ki info',
    category: 'islamic',
    react: '📖',
    use: '.surah 2',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const num = parseInt(ctx.q);
    if (!num || num < 1 || num > 114) return ctx.reply('Use: `.surah <1-114>`\n\nExample: `.surah 2`');

    try {
        const r = await axios.get(`https://api.alquran.cloud/v1/surah/${num}`, { timeout: 10000 });
        const s = r.data.data;
        return ctx.reply([
            `📖 *SURAH ${s.number}: ${s.name}*`,
            '',
            `🌐 English: *${s.englishName}*`,
            `💬 Meaning: *${s.englishNameTranslation}*`,
            `📌 Revelation: *${s.revelationType}*`,
            `📊 Total Ayahs: *${s.numberOfAyahs}*`,
            '',
            `💡 Recite daily for blessings!`
        ].join('\n'));
    } catch (e) { return ctx.reply('❌ Surah info fail.'); }
});

cmd({
    pattern: 'allahname',
    alias: ['asmaulhusna'],
    desc: 'Allah ka 99 naam',
    category: 'islamic',
    react: '✨',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const names = [
        { ar: 'الرَّحْمَنُ', eng: 'Ar-Rahman', meaning: 'The Most Merciful' },
        { ar: 'الرَّحِيمُ', eng: 'Ar-Raheem', meaning: 'The Most Compassionate' },
        { ar: 'الْمَلِكُ', eng: 'Al-Malik', meaning: 'The King' },
        { ar: 'الْقُدُّوسُ', eng: 'Al-Quddus', meaning: 'The Most Holy' },
        { ar: 'السَّلَامُ', eng: 'As-Salam', meaning: 'The Source of Peace' },
        { ar: 'الْعَزِيزُ', eng: 'Al-Aziz', meaning: 'The Almighty' },
        { ar: 'الْخَالِقُ', eng: 'Al-Khaliq', meaning: 'The Creator' },
        { ar: 'الْغَفَّارُ', eng: 'Al-Ghaffar', meaning: 'The Ever-Forgiving' },
        { ar: 'الرَّزَّاقُ', eng: 'Ar-Razzaq', meaning: 'The Provider' },
        { ar: 'الْعَلِيمُ', eng: 'Al-Aleem', meaning: 'The All-Knowing' }
    ];
    const pick = names[crypto.randomInt(names.length)];
    return ctx.reply([
        `✨ *ALLAH'S NAME*`,
        '',
        `📖 Arabic: *${pick.ar}*`,
        `💬 English: *${pick.eng}*`,
        `📌 Meaning: *${pick.meaning}*`
    ].join('\n'));
});

cmd({
    pattern: 'ramadancount',
    alias: ['ramadanleft'],
    desc: 'Ramadan kitna door',
    category: 'islamic',
    react: '🌙',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const now = new Date();
    const year = now.getFullYear();
    // Approximate Ramadan dates
    const ramadanStart = new Date(year, 1, 18); // Feb 18 approx

    if (now > ramadanStart) {
        const nextRamadan = new Date(year + 1, 1, 8);
        const days = Math.ceil((nextRamadan - now) / (1000 * 60 * 60 * 24));
        return ctx.reply(`🌙 *Ramadan in ${days} days* (approx)\n\n📅 Next: *${nextRamadan.toDateString()}*`);
    }

    const days = Math.ceil((ramadanStart - now) / (1000 * 60 * 60 * 24));
    return ctx.reply(`🌙 *Ramadan in ${days} days!*\n\n📅 Start: *${ramadanStart.toDateString()}*`);
});

cmd({
    pattern: 'allnamaz',
    alias: ['prayerall'],
    desc: '5 waqt ki namaz ek saath',
    category: 'islamic',
    react: '🕌',
    use: '.allnamaz Lahore',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const city = (ctx.q || 'Karachi').trim();
    try {
        const r = await axios.get(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=Pakistan&method=1`, { timeout: 10000 });
        const t = r.data.data.timings;
        return ctx.reply([
            `🕌 *NAMAZ TIMES — ${city.toUpperCase()}*`,
            '',
            `🌅 Fajr: *${t.Fajr}*`,
            `🌄 Sunrise: *${t.Sunrise}*`,
            `🌇 Dhuhr: *${t.Dhuhr}*`,
            `🌆 Asr: *${t.Asr}*`,
            `🌃 Maghrib: *${t.Maghrib}*`,
            `🌙 Isha: *${t.Isha}*`,
            '',
            `📅 ${new Date().toDateString()}`
        ].join('\n'));
    } catch (e) { return ctx.reply('❌ Timings fail.'); }
});

cmd({
    pattern: 'duacat',
    alias: ['duacategory'],
    desc: 'Category se dua',
    category: 'islamic',
    react: '🤲',
    use: '.duacat health',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const cat = (ctx.q || '').toLowerCase();
    const duas = {
        health: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي — "O Allah, grant me health in my body"',
        rizq: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ — "O Allah, suffice me with halal"',
        knowledge: 'رَبِّ زِدْنِي عِلْمًا — "My Lord, increase me in knowledge"',
        family: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ — "Grant us comfort in spouses and children"',
        protection: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ — "In Allah\'s name, nothing harms"',
        anxiety: 'حَسْبِيَ اللَّهُ وَنِعْمَ الْوَكِيلُ — "Allah is sufficient for me"'
    };

    if (!cat || !duas[cat]) {
        return ctx.reply('Use: `.duacat <category>`\n\nCategories: health, rizq, knowledge, family, protection, anxiety');
    }

    return ctx.reply(`🤲 *DUA — ${cat.toUpperCase()}*\n\n${duas[cat]}`);
});

cmd({
    pattern: 'zikrstart',
    alias: ['startzikr'],
    desc: 'Zikr counter start karo',
    category: 'islamic',
    react: '📿',
    use: '.zikrstart 100',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const target = parseInt(ctx.q) || 33;
    const key = ctx.sender;
    zikrData.set(key, { count: 0, target });
    return ctx.reply(`📿 *Zikr started!*\n\n🎯 Target: *${target}*\n\nHar baar `.zikr` likho — count barhega.`);
});

cmd({
    pattern: 'zikr',
    alias: ['zikrcount'],
    desc: 'Zikr count karo',
    category: 'islamic',
    react: '📿',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const key = ctx.sender;
    if (!zikrData.has(key)) return ctx.reply('Pehle `.zikrstart 33` chalao.');

    const data = zikrData.get(key);
    data.count++;

    if (data.count >= data.target) {
        zikrData.delete(key);
        return ctx.reply(`🎉 *MUBARAK! ${data.target}/${data.target} complete!*\n\n💫 Allah accept kare!`);
    }

    const remaining = data.target - data.count;
    return ctx.reply(`📿 *Zikr: ${data.count}/${data.target}*\n\n⏳ Remaining: *${remaining}*`);
});

cmd({
    pattern: 'islamquiz',
    alias: ['deeni-sawal'],
    desc: 'Islamic quiz',
    category: 'islamic',
    react: '❓',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const qs = [
        { q: 'Quran ka pehla Surah?', a: 'Al-Fatihah' },
        { q: 'Quran me total kitne Surah?', a: '114' },
        { q: 'Pehla Khalifa?', a: 'Abu Bakr (RA)' },
        { q: 'Hajj kis mahine me?', a: 'Dhul Hijjah' },
        { q: 'Jumma ka din ki fazilat?', a: 'Best day of week' }
    ];
    const pick = qs[crypto.randomInt(qs.length)];
    return ctx.reply(`❓ *ISLAMIC QUIZ*\n\n📌 ${pick.q}\n\n💡 ||${pick.a}||`);
});

cmd({
    pattern: 'kalima',
    alias: ['kalimas'],
    desc: '6 Kalimas',
    category: 'islamic',
    react: '🕋',
    use: '.kalima 1-6',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const num = parseInt(ctx.q);
    const kalimas = {
        1: 'لَا إِلَٰهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ\n\n"La ilaha illallahu Muhammadur Rasulullah"',
        2: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
        3: 'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَٰهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ',
        4: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
        5: 'أَسْتَغْفِرُ اللَّهَ رَبِّي مِنْ كُلِّ ذَنْبٍ',
        6: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ'
    };

    if (!num || num < 1 || num > 6) {
        return ctx.reply('Use: `.kalima <1-6>`\n\n6 Kalimas available');
    }

    return ctx.reply(`🕋 *KALIMA ${num}*\n\n${kalimas[num]}`);
});

cmd({
    pattern: 'namemeaning',
    alias: ['naam'],
    desc: 'Islamic naam ka meaning',
    category: 'islamic',
    react: '📝',
    use: '.namemeaning Ali',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const names = {
        ali: 'علي — High, Exalted, Noble',
        ahmed: 'أحمد — Most Praised',
        muhammad: 'محمد — Praiseworthy',
        fatima: 'فاطمة — Prophet\'s daughter, Chaste',
        aisha: 'عائشة — Alive, Living',
        hassan: 'حسن — Beautiful, Good',
        hussain: 'حسين — Beautiful, Good',
        omar: 'عمر — Flourishing, Long-lived',
        khadija: 'خديجة — Prophet\'s first wife',
        zainab: 'زينب — Fragrant flower'
    };
    const name = (ctx.q || '').toLowerCase().trim();
    if (!name || !names[name]) {
        return ctx.reply(`Use: \`.namemeaning <name>\`\n\nAvailable: ${Object.keys(names).join(', ')}`);
    }
    return ctx.reply(`📝 *${name.toUpperCase()}*\n\n${names[name]}`);
});

cmd({
    pattern: 'islamicevent',
    alias: ['islamicevents'],
    desc: 'Islamic events',
    category: 'islamic',
    react: '🌙',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const events = [
        '🌙 *Ramadan* — 9th month, fasting',
        '🕋 *Hajj* — 12th month, Dhul Hijjah 8-13',
        '🎉 *Eid ul-Fitr* — 1st Shawwal',
        '🐐 *Eid ul-Adha* — 10th Dhul Hijjah',
        '🌸 *Muharram* — 1st month, Islamic new year',
        '💫 *Mawlid* — 12th Rabi al-Awwal',
        '🌃 *Shab-e-Miraj* — 27th Rajab',
        '📿 *Shab-e-Barat* — 15th Shaban'
    ];
    return ctx.reply(`🌙 *ISLAMIC EVENTS*\n\n${events.join('\n')}`);
});
