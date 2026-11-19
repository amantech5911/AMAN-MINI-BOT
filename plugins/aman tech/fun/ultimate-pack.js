// Auto-split from plugins/ultimate-pack.js — category: fun
// (shared imports/helpers copied at top, only "fun" commands below)

const { cmd } = require('../arslan');
const config = require('../config');
const crypto = require('crypto');
const axios = require('axios');
const zikrData = new Map();

cmd({
    pattern: 'traveltip',
    alias: ['travel'],
    desc: 'Random travel tip',
    category: 'fun',
    react: '✈️',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const tips = [
        '✈️ Passport ki photocopy alag rakho',
        '💰 Local currency me paisa rakho, ATM card alag',
        '📱 Offline maps download karo',
        '🧳 Cabin bag me essentials rakho',
        '🛡️ Travel insurance lo',
        '💊 Basic medicines saath rakho',
        '📸 Local photos ka folder banao',
        '🌐 Local SIM ya eSIM lo',
        '🎒 Thoda space khali rakho shopping ke liye',
        '📝 Hotel address local language me likho'
    ];
    return ctx.reply(tips[crypto.randomInt(tips.length)]);
});

cmd({
    pattern: 'moon',
    alias: ['moonphase'],
    desc: 'Aaj ka moon phase',
    category: 'fun',
    react: '🌙',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const phases = ['🌑 New Moon', '🌒 Waxing Crescent', '🌓 First Quarter',
        '🌔 Waxing Gibbous', '🌕 Full Moon', '🌖 Waning Gibbous',
        '🌗 Last Quarter', '🌘 Waning Crescent'];
    const day = new Date().getDate();
    const phase = phases[day % 8];
    return ctx.reply(`🌙 *MOON PHASE TODAY*\n\n*${phase}*`);
});

cmd({
    pattern: 'abcd',
    alias: ['alphabet'],
    desc: 'ABCD for kids',
    category: 'fun',
    react: '🔤',
    use: '.abcd A',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const words = {
        A: 'Apple 🍎', B: 'Ball ⚽', C: 'Cat 🐱', D: 'Dog 🐕',
        E: 'Elephant 🐘', F: 'Fish 🐟', G: 'Goat 🐐', H: 'Horse 🐴',
        I: 'Ice cream 🍦', J: 'Jug 🏺', K: 'Kite 🪁', L: 'Lion 🦁',
        M: 'Mango 🥭', N: 'Nest 🪹', O: 'Orange 🍊', P: 'Pen 🖊️',
        Q: 'Queen 👑', R: 'Rabbit 🐰', S: 'Sun ☀️', T: 'Tree 🌳',
        U: 'Umbrella ☂️', V: 'Van 🚐', W: 'Watch ⌚', X: 'Xylophone 🎵',
        Y: 'Yo-yo 🪀', Z: 'Zebra 🦓'
    };
    const letter = (ctx.q || '').toUpperCase().trim();
    if (!letter || !words[letter]) {
        return ctx.reply('Use: `.abcd A`\n\nYa phir koi letter do A-Z me se.');
    }
    return ctx.reply(`🔤 *${letter}* for *${words[letter]}*`);
});

cmd({
    pattern: 'count123',
    alias: ['counting'],
    desc: '1-10 counting',
    category: 'fun',
    react: '🔢',
    use: '.count123 5',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const num = parseInt(ctx.q);
    if (!num || num < 1 || num > 10) return ctx.reply('Use: `.count123 5` (1-10)');

    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    const count = emojis.slice(0, num).join(' ');
    return ctx.reply(`🔢 *Counting ${num}:*\n\n${count}`);
});
