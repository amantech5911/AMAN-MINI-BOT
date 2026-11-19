// Auto-split from plugins/fresh-pack.js — category: fun
// (shared imports/helpers copied at top, only "fun" commands below)

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
    pattern: 'zodiacsign',
    alias: ['zodiacinfo'],
    desc: 'Zodiac sign ki info',
    category: 'fun',
    react: '♈',
    use: '.zodiacsign aries',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const sign = (ctx.q || '').toLowerCase();
    const data = {
        aries: '♈ Aries (Mar 21 - Apr 19)\nElement: Fire 🔥\nRuling: Mars\nTraits: Bold, Ambitious, Confident',
        taurus: '♉ Taurus (Apr 20 - May 20)\nElement: Earth 🌍\nRuling: Venus\nTraits: Reliable, Patient, Devoted',
        gemini: '♊ Gemini (May 21 - Jun 20)\nElement: Air 💨\nRuling: Mercury\nTraits: Curious, Adaptable, Witty',
        cancer: '♋ Cancer (Jun 21 - Jul 22)\nElement: Water 💧\nRuling: Moon\nTraits: Caring, Loyal, Intuitive',
        leo: '♌ Leo (Jul 23 - Aug 22)\nElement: Fire 🔥\nRuling: Sun\nTraits: Confident, Brave, Generous',
        virgo: '♍ Virgo (Aug 23 - Sep 22)\nElement: Earth 🌍\nRuling: Mercury\nTraits: Analytical, Kind, Hardworking',
        libra: '♎ Libra (Sep 23 - Oct 22)\nElement: Air 💨\nRuling: Venus\nTraits: Balanced, Fair, Social',
        scorpio: '♏ Scorpio (Oct 23 - Nov 21)\nElement: Water 💧\nRuling: Pluto\nTraits: Passionate, Brave, Loyal',
        sagittarius: '♐ Sagittarius (Nov 22 - Dec 21)\nElement: Fire 🔥\nRuling: Jupiter\nTraits: Adventurous, Honest, Optimistic',
        capricorn: '♑ Capricorn (Dec 22 - Jan 19)\nElement: Earth 🌍\nRuling: Saturn\nTraits: Disciplined, Responsible, Ambitious',
        aquarius: '♒ Aquarius (Jan 20 - Feb 18)\nElement: Air 💨\nRuling: Uranus\nTraits: Progressive, Original, Independent',
        pisces: '♓ Pisces (Feb 19 - Mar 20)\nElement: Water 💧\nRuling: Neptune\nTraits: Compassionate, Artistic, Intuitive'
    };
    if (!sign || !data[sign]) {
        return ctx.reply('Use: `.zodiacsign <sign>`\n\nSigns: aries, taurus, gemini, cancer, leo, virgo, libra, scorpio, sagittarius, capricorn, aquarius, pisces');
    }
    return ctx.reply(data[sign]);
});

cmd({
    pattern: 'theme',
    alias: ['randomtheme'],
    desc: 'Random WhatsApp theme',
    category: 'fun',
    react: '🎨',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const themes = [
        '🌙 *Dark Mode* — Aankhon ke liye best!',
        '☀️ *Light Mode* — Din me best!',
        '🌸 *Pink Theme* — Cute look!',
        '💙 *Blue Theme* — Cool vibe!',
        '💚 *Green Theme* — Fresh look!',
        '🖤 *Black Theme* — Pro look!',
        '💜 *Purple Theme* — Royal!',
        '❤️ *Red Theme* — Bold!'
    ];
    return ctx.reply(`🎨 Aaj ka theme:\n\n${themes[crypto.randomInt(themes.length)]}`);
});

cmd({
    pattern: 'randompic',
    alias: ['rpic', 'wallpaper'],
    desc: 'Random wallpaper image',
    category: 'fun',
    react: '🖼️',
    use: '.randompic nature',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const query = (ctx.q || 'nature').trim();
    try {
        const img = await fetchKeywordImage(query);
        await conn.sendMessage(ctx.from, {
            image: img,
            caption: `🖼️ Random: *${query}*`
        }, { quoted: mek });
    } catch (e) { return ctx.reply('❌ Image fetch fail.'); }
});

cmd({
    pattern: 'dog',
    alias: ['dogpic', 'kutta'],
    desc: 'Random dog picture',
    category: 'fun',
    react: '🐕',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    try {
        const r = await axios.get('https://dog.ceo/api/breeds/image/random', { timeout: 10000 });
        if (r.data.status === 'success') {
            await conn.sendMessage(ctx.from, {
                image: { url: r.data.message },
                caption: '🐕 Random Dog!'
            }, { quoted: mek });
        }
    } catch (e) { return ctx.reply('❌ Dog fetch fail.'); }
});

cmd({
    pattern: 'cat',
    alias: ['catpic', 'billi'],
    desc: 'Random cat picture',
    category: 'fun',
    react: '🐈',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    try {
        const r = await axios.get('https://api.thecatapi.com/v1/images/search', { timeout: 10000 });
        if (r.data?.[0]?.url) {
            await conn.sendMessage(ctx.from, {
                image: { url: r.data[0].url },
                caption: '🐈 Random Cat!'
            }, { quoted: mek });
        }
    } catch (e) { return ctx.reply('❌ Cat fetch fail.'); }
});

cmd({
    pattern: 'fox',
    alias: ['foxpic'],
    desc: 'Random fox picture',
    category: 'fun',
    react: '🦊',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    try {
        const r = await axios.get('https://randomfox.ca/floof/', { timeout: 10000 });
        if (r.data?.image) {
            await conn.sendMessage(ctx.from, {
                image: { url: r.data.image },
                caption: '🦊 Random Fox!'
            }, { quoted: mek });
        }
    } catch (e) { return ctx.reply('❌ Fox fetch fail.'); }
});

cmd({
    pattern: 'panda',
    alias: ['pandapic'],
    desc: 'Random panda picture',
    category: 'fun',
    react: '🐼',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    try {
        const img = await fetchKeywordImage('panda');
        await conn.sendMessage(ctx.from, {
            image: img,
            caption: '🐼 Random Panda!'
        }, { quoted: mek });
    } catch (e) { return ctx.reply('❌ Panda fetch fail.'); }
});

cmd({
    pattern: 'advice',
    alias: ['adviceapi', 'salah'],
    desc: 'Random advice',
    category: 'fun',
    react: '💡',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    try {
        const r = await axios.get('https://api.adviceslip.com/advice', { timeout: 10000 });
        return ctx.reply(`💡 *ADVICE*\n\n${r.data.slip.advice}`);
    } catch (e) { return ctx.reply('❌ Advice fetch fail.'); }
});

cmd({
    pattern: 'chucknorris',
    alias: ['chuck', 'norris'],
    desc: 'Random Chuck Norris joke',
    category: 'fun',
    react: '🥋',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    try {
        const r = await axios.get('https://api.chucknorris.io/jokes/random', { timeout: 10000 });
        return ctx.reply(`🥋 *CHUCK NORRIS*\n\n${r.data.value}`);
    } catch (e) { return ctx.reply('❌ Joke fetch fail.'); }
});

cmd({
    pattern: 'yesno',
    alias: ['hannahl'],
    desc: 'Yes/No answer',
    category: 'fun',
    react: '❓',
    use: '.yesno Kya main jeetunga?',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const answers = [
        { yes: true, text: '✅ *YES!* Bilkul ho sakta hai!' },
        { yes: false, text: '❌ *NO!* Nahi hoga.' },
        { yes: true, text: '✅ *YES!* 100%' },
        { yes: false, text: '❌ *NO!* Bhool jao.' },
        { yes: true, text: '✅ *YES!* Chances high hain.' },
        { yes: false, text: '❌ *NO!* Time waste.' }
    ];
    const pick = answers[crypto.randomInt(answers.length)];
    return ctx.reply(`❓ *${ctx.q || 'Sawal'}*\n\n${pick.text}`);
});

cmd({
    pattern: 'rletter',
    alias: ['randomletter'],
    desc: 'Random letter',
    category: 'fun',
    react: '🔤',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return ctx.reply(`🔤 *Random Letter:* *${letters[crypto.randomInt(letters.length)]}*`);
});

cmd({
    pattern: 'color',
    alias: ['randomcolor'],
    desc: 'Random color',
    category: 'fun',
    react: '🎨',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const hex = '#' + crypto.randomBytes(3).toString('hex').toUpperCase();
    return ctx.reply(`🎨 *Random Color:* *${hex}*`);
});
