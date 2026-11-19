// Auto-split from plugins/new-pack.js — category: image
// (shared imports/helpers copied at top, only "image" commands below)

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
    pattern: 'stickerpack',
    alias: ['stkpack'],
    desc: 'Image/video se sticker pack banao',
    category: 'image',
    react: '📦',
    use: '.stickerpack <pack_name> (reply on image)',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const quoted = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const img = quoted?.imageMessage || mek.message?.imageMessage;
    if (!img) return ctx.reply('❌ Image pe reply karo.');

    const packName = (ctx.q || config.BOT_NAME).slice(0, 30);
    try {
        await ctx.reply('📦 Sticker pack ban raha hai…');
        const filePath = await conn.downloadAndSaveMediaMessage({ msg: img, mtype: 'imageMessage' }, `./tmp/stkp_${Date.now()}`);
        const { Sticker, StickerTypes } = require('wa-sticker-formatter');
        const stk = new Sticker(filePath, {
            pack: packName,
            author: config.BOT_NAME || 'AMAN Mini Bot',
            type: StickerTypes.FULL,
            quality: 80
        });
        const buf = await stk.toBuffer();
        await conn.sendMessage(ctx.from, { sticker: buf }, { quoted: mek });
        await fs.remove(filePath).catch(() => {});
    } catch (e) { return ctx.reply('❌ ' + e.message); }
});

cmd({
    pattern: 'blur',
    alias: ['blurimg'],
    desc: 'Image ko blur karo',
    category: 'image',
    react: '🌫️',
    use: '.blur (reply on image)',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const quoted = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const img = quoted?.imageMessage || mek.message?.imageMessage;
    if (!img) return ctx.reply('❌ Image pe reply karo.');
    try {
        await ctx.reply('🌫️ Blur kar raha hun…');
        const filePath = await conn.downloadAndSaveMediaMessage({ msg: img, mtype: 'imageMessage' }, `./tmp/blur_${Date.now()}`);
        const sharp = require('sharp');
        const out = `./tmp/blurout_${Date.now()}.png`;
        await sharp(filePath).blur(15).png().toFile(out);
        await conn.sendMessage(ctx.from, { image: { url: out }, caption: '🌫️ Blurred' }, { quoted: mek });
        await fs.remove(filePath).catch(() => {});
        await fs.remove(out).catch(() => {});
    } catch (e) { return ctx.reply('❌ ' + e.message); }
});

cmd({
    pattern: 'sepia',
    alias: ['oldpic'],
    desc: 'Image ko sepia (purana look)',
    category: 'image',
    react: '🟤',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const quoted = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const img = quoted?.imageMessage || mek.message?.imageMessage;
    if (!img) return ctx.reply('❌ Image pe reply karo.');
    try {
        const filePath = await conn.downloadAndSaveMediaMessage({ msg: img, mtype: 'imageMessage' }, `./tmp/sepia_${Date.now()}`);
        const sharp = require('sharp');
        const out = `./tmp/sepiaout_${Date.now()}.png`;
        await sharp(filePath).modulate({ saturation: 0.5 }).tint({ r: 112, g: 66, b: 20 }).png().toFile(out);
        await conn.sendMessage(ctx.from, { image: { url: out }, caption: '🟤 Sepia' }, { quoted: mek });
        await fs.remove(filePath).catch(() => {});
        await fs.remove(out).catch(() => {});
    } catch (e) { return ctx.reply('❌ ' + e.message); }
});

cmd({
    pattern: 'flip',
    alias: ['mirror'],
    desc: 'Image ko hoamanntal/vertical flip',
    category: 'image',
    react: '🔄',
    use: '.flip h  OR  .flip v',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const quoted = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const img = quoted?.imageMessage || mek.message?.imageMessage;
    if (!img) return ctx.reply('❌ Image pe reply karo.');
    const mode = (ctx.q || 'h').trim().toLowerCase();
    try {
        const filePath = await conn.downloadAndSaveMediaMessage({ msg: img, mtype: 'imageMessage' }, `./tmp/flip_${Date.now()}`);
        const sharp = require('sharp');
        const out = `./tmp/flipout_${Date.now()}.png`;
        let pipeline = sharp(filePath);
        if (mode === 'v') pipeline = pipeline.flip();
        else pipeline = pipeline.flop();
        await pipeline.png().toFile(out);
        await conn.sendMessage(ctx.from, { image: { url: out }, caption: `🔄 Flipped (${mode})` }, { quoted: mek });
        await fs.remove(filePath).catch(() => {});
        await fs.remove(out).catch(() => {});
    } catch (e) { return ctx.reply('❌ ' + e.message); }
});

cmd({
    pattern: 'emojimix',
    alias: ['mix'],
    desc: 'Do emojis ko mix karke sticker banao',
    category: 'image',
    react: '🎭',
    use: '.emojimix 😀+😎',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const input = (ctx.q || '').replace(/\s/g, '');
    const parts = input.split('+');
    if (parts.length !== 2) return ctx.reply('Use: *.emojimix 😀+😎*');
    try {
        const url = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(parts[0])}_${encodeURIComponent(parts[1])}`;
        const r = await axios.get(url, { timeout: 10000 });
        if (!r.data?.results?.length) return ctx.reply('❌ Ye combination support nahi.');
        const imgUrl = r.data.results[0].url;
        await conn.sendMessage(ctx.from, { image: { url: imgUrl }, caption: '🎭 EmojiMix' }, { quoted: mek });
    } catch (e) { return ctx.reply('❌ ' + e.message); }
});
