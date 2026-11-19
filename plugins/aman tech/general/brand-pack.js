// Auto-split from plugins/brand-pack.js — category: general
// (shared imports/helpers copied at top, only "general" commands below)

const { cmd } = require('../arslan');
const config = require('../config');
const fs = require('fs-extra');
const path = require('path');
const { requirePremium, isOwner, isPremiumUser } = require('../lib/premium-check');

cmd({
    pattern: 'botinfo',
    alias: ['aboutbot', 'mybot', 'botprofile'],
    desc: 'Bot ki poori info dekho',
    category: 'general',
    react: '🤖',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    let pp = '';
    try { pp = await conn.profilePictureUrl(conn.user.id, 'image'); } catch {}

    const [status] = await conn.fetchStatus(conn.user.id).catch(() => [{}]);

    const text = [
        `🤖 *${config.BOT_NAME || 'AMAN Mini Bot'} BOT INFO*`,
        '',
        `📛 Name: *${config.BOT_NAME}*`,
        `👑 Owner: *Private*`,
        `🔧 Prefix: *${config.PREFIX}*`,
        `⚙️ Mode: *${config.WORK_TYPE || 'public'}*`,
        `💬 About: *${status?.status || 'N/A'}*`,
        `🖼️ PP: *${pp ? 'Available' : 'Hidden'}*`,
        '',
        `📢 Channel: ${config.CHANNEL_LINK}`,
        `© Powered by ${config.BOT_NAME || 'AMAN Mini Bot'}`
    ].join('\n');

    if (pp) {
        await conn.sendMessage(ctx.from, { image: { url: pp }, caption: text }, { quoted: mek });
    } else {
        await ctx.reply(text);
    }
});
