// Auto-split from plugins/viral-pack.js — category: image
// (shared imports/helpers copied at top, only "image" commands below)

const { cmd } = require('../arslan');
const config = require('../config');
const crypto = require('crypto');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const typingTests = new Map();
const reactionTests = new Map();
const mathTests = new Map();
const memoryGames = new Map();
const triviaGames = new Map();
const todoLists = new Map();
const expenses = new Map();
const habits = new Map();
const reminders = new Map();

cmd({
    pattern: 'mememaker',
    alias: ['creatememe'],
    desc: 'Meme banao (image + text)',
    category: 'image',
    react: '😂',
    use: '.mememaker <top text> | <bottom text> (image reply)',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const quoted = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const img = quoted?.imageMessage || mek.message?.imageMessage;
    if (!img) return ctx.reply('❌ Image pe reply karo.');

    const parts = (ctx.q || '').split('|').map(x => x.trim());
    const topText = parts[0] || '';
    const bottomText = parts[1] || '';

    try {
        const filePath = await conn.downloadAndSaveMediaMessage(
            { msg: img, mtype: 'imageMessage' },
            `./tmp/meme_${Date.now()}`
        );

        await conn.sendMessage(ctx.from, {
            image: { url: filePath },
            caption: [
                topText ? `⬆️ ${topText}` : '',
                bottomText ? `⬇️ ${bottomText}` : '',
                '',
                `😂 Meme by ${ctx.senderNumber}`
            ].filter(Boolean).join('\n')
        }, { quoted: mek });

        fs.remove(filePath).catch(() => {});
    } catch (e) { return ctx.reply('❌ ' + e.message); }
});

cmd({
    pattern: 'watermark',
    alias: ['wm'],
    desc: 'Image pe watermark lagao',
    category: 'image',
    react: '💧',
    use: '.watermark <text> (image reply)',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const quoted = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const img = quoted?.imageMessage || mek.message?.imageMessage;
    if (!img) return ctx.reply('❌ Image pe reply karo.');

    const text = (ctx.q || 'AMAN-MD').slice(0, 50);
    try {
        await ctx.reply(`💧 *Watermark lag raha hai:* ${text}`);
        const filePath = await conn.downloadAndSaveMediaMessage(
            { msg: img, mtype: 'imageMessage' },
            `./tmp/wm_${Date.now()}`
        );

        const sharp = require('sharp');
        const buf = await fs.readFile(filePath);
        const meta = await sharp(buf).metadata();

        const svg = Buffer.from(`<svg width="${meta.width}" height="${meta.height}">
            <text x="50%" y="95%" font-size="${Math.floor(meta.width / 20)}" 
                  fill="white" text-anchor="middle" 
                  font-weight="bold" opacity="0.7">${text}</text>
        </svg>`);

        const out = `./tmp/wm_out_${Date.now()}.png`;
        await sharp(buf).composite([{ input: svg, gravity: 'southeast' }]).png().toFile(out);

        await conn.sendMessage(ctx.from, { image: { url: out }, caption: `💧 ${text}` }, { quoted: mek });
        fs.remove(filePath).catch(() => {});
        fs.remove(out).catch(() => {});
    } catch (e) { return ctx.reply('❌ ' + e.message); }
});
