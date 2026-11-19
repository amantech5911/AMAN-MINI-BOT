// Auto-split from plugins/new-pack.js — category: fun
// (shared imports/helpers copied at top, only "fun" commands below)

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
    pattern: 'tagme',
    alias: ['mention'],
    desc: 'Khud ko tag karo',
    category: 'fun',
    react: '📣',
    use: '.tagme <message>',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const text = (ctx.q || '👋 Hello!') + ` @${ctx.senderNumber}`;
    await conn.sendMessage(ctx.from, { text, mentions: [ctx.sender] }, { quoted: mek });
});

cmd({
    pattern: 'random',
    alias: ['pickrandom'],
    desc: 'Comma-separated list me se random pick',
    category: 'fun',
    react: '🎲',
    use: '.random chai,coffee,juice',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const list = (ctx.q || '').split(',').map(x => x.trim()).filter(Boolean);
    if (list.length < 2) return ctx.reply('Use: *.random a,b,c*');
    const pick = list[crypto.randomInt(list.length)];
    return ctx.reply(`🎲 *Random pick:* ${pick}`);
});

cmd({
    pattern: 'nickname',
    alias: ['nick'],
    desc: 'Kisi ko nickname do',
    category: 'fun',
    react: '📝',
    use: '.nickname @user <name>',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const mentioned = mek.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (!mentioned[0]) return ctx.reply('❌ Kisi ko mention karo.');
    const name = (ctx.q || '').replace(/@\d+/g, '').trim() || 'Best Friend';
    const nicknames = ['👑 King', '🔥 Star', '⚡ Legend', '😎 Boss', '🌟 Hero'];
    const tag = nicknames[crypto.randomInt(nicknames.length)];
    await conn.sendMessage(ctx.from, {
        text: `📝 @${mentioned[0].split('@')[0]} ka naya naam: *${name}* ${tag}`,
        mentions: mentioned
    }, { quoted: mek });
});

cmd({
    pattern: 'ageguess',
    alias: ['agerandom'],
    desc: 'Random age guess',
    category: 'fun',
    react: '🎂',
    use: '.ageguess @user',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const age = crypto.randomInt(15, 60);
    const mentioned = mek.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned[0]) {
        await conn.sendMessage(ctx.from, {
            text: `🎂 @${mentioned[0].split('@')[0]} ki age: *${age}* saal`,
            mentions: mentioned
        }, { quoted: mek });
    } else {
        return ctx.reply(`🎂 Meri guess: *${age}* saal`);
    }
});

cmd({
    pattern: 'howgay',
    alias: ['gaymeter'],
    desc: 'Fun meter (mazak)',
    category: 'fun',
    react: '🌈',
    use: '.howgay @user',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const pct = crypto.randomInt(0, 101);
    const mentioned = mek.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const target = mentioned[0] ? `@${mentioned[0].split('@')[0]}` : 'Aap';
    const bar = '█'.repeat(Math.floor(pct / 10)) + '░'.repeat(10 - Math.floor(pct / 10));
    await conn.sendMessage(ctx.from, {
        text: `🌈 *HowGay Meter*\n\n${target}\n${bar} *${pct}%*`,
        mentions: mentioned
    }, { quoted: mek });
});

cmd({
    pattern: 'roast',
    alias: ['burn'],
    desc: 'Random roast',
    category: 'fun',
    react: '🔥',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const roasts = [
        'Tumhari shakal dekhi to mirror ne complaint file kar di 😂',
        'Tumhari intelligence Google bhi search nahi kar sakta 🔍',
        'Tum WhatsApp pe ho? Mujhe laga WhatsApp tum se pareshan hai 📱',
        'Tumhari photo dekhi, phone ne khud ko reboot kar liya 💀',
        'Tum ho ya WhatsApp ka bug? 🐛'
    ];
    return ctx.reply(`🔥 ${roasts[crypto.randomInt(roasts.length)]}`);
});

cmd({
    pattern: 'compliment',
    alias: ['tarif'],
    desc: 'Kisi ko compliment do',
    category: 'fun',
    react: '💐',
    use: '.compliment @user',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const list = [
        'Tum bahut acha insaan ho 🌟',
        'Tumhari smile sabko roshan karti hai 😊',
        'Tumhari baatein sun ke din ban jata hai ✨',
        'Tum waqai talented ho 🎯',
        'Tum jaisa koi nahi 💫'
    ];
    const pick = list[crypto.randomInt(list.length)];
    const mentioned = mek.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned[0]) {
        await conn.sendMessage(ctx.from, {
            text: `💐 @${mentioned[0].split('@')[0]} — ${pick}`,
            mentions: mentioned
        }, { quoted: mek });
    } else {
        return ctx.reply(`💐 ${pick}`);
    }
});

cmd({
    pattern: 'slogan',
    alias: ['tagline'],
    desc: 'Random WhatsApp slogan',
    category: 'fun',
    react: '💬',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const list = [
        'Always online, always ready! ⚡',
        'Connecting hearts since 2024 💗',
        'Your message, my priority 📬',
        'Fast, secure, reliable 🔐',
        'Making conversations easier 💬'
    ];
    return ctx.reply(`💬 ${list[crypto.randomInt(list.length)]}`);
});

cmd({
    pattern: 'livescore',
    alias: ['score', 'cricket'],
    desc: 'Live cricket score (best effort)',
    category: 'fun',
    react: '🏏',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    return ctx.reply('🏏 Live score API ke bina nahi mil sakti. Ye command demo hai.\n\n💡 Tip: *".score"* ke liye koi free API add karo.');
});
