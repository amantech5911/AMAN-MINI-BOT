// Auto-split from plugins/fresh-pack.js — category: image
// (shared imports/helpers copied at top, only "image" commands below)

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
    pattern: 'stickerinfo',
    alias: ['stkinfo'],
    desc: 'Sticker ki info',
    category: 'image',
    react: '📋',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const quoted = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const stk = quoted?.stickerMessage;
    if (!stk) return ctx.reply('❌ Sticker pe reply karo.');

    const size = (stk.fileLength || 0) / 1024;
    return ctx.reply([
        '📋 *STICKER INFO*',
        '',
        `📦 Size: *${size.toFixed(2)} KB*`,
        `📐 Dimensions: *${stk.width}x${stk.height}*`,
        `🎬 Animated: *${stk.isAnimated ? 'Yes' : 'No'}*`,
        `👤 Pack: *${stk.packName || 'N/A'}*`,
        `✏️ Author: *${stk.packId || 'N/A'}*`
    ].join('\n'));
});
