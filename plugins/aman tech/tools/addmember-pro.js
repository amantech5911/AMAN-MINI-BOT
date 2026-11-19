// Auto-split from plugins/addmember-pro.js — category: tools
// (shared imports/helpers copied at top, only "tools" commands below)

const { cmd } = require('../arslan');
const config = require('../config');
const fs = require('fs-extra');
const path = require('path');

cmd({
    pattern: 'checknum',
    alias: ['checknum', 'isnumber'],
    desc: 'Check karo number WhatsApp pe exist karta hai ya nahi',
    category: 'tools',
    react: '🔍',
    use: '.checknum 923XXXXXXXXX',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    let number = (ctx.q || '').replace(/\D/g, '');
    if (number.startsWith('0')) number = `${config.DEFAULT_COUNTRY_CODE}${number.slice(1)}`;

    if (!number || number.length < 10) {
        return ctx.reply('Use: `.checknum 923XXXXXXXXX`');
    }

    try {
        const jid = `${number}@s.whatsapp.net`;
        const [check] = await conn.onWhatsApp(jid).catch(() => [null]);

        if (!check?.exists) {
            return ctx.reply(`❌ *+${number}* WhatsApp pe *exist nahi* karta.`);
        }

        // Try to get PP
        let pp = '';
        try { pp = await conn.profilePictureUrl(jid, 'image'); } catch {}

        return ctx.reply([
            '🔍 *NUMBER CHECK*',
            '',
            `📱 Number: *+${number}*`,
            `✅ WhatsApp: *Registered*`,
            `📛 JID: *${check.jid}*`,
            `🖼️ PP: *${pp ? 'Available' : 'Hidden'}*`,
            '',
            `💡 Ye number add ho sakta hai.`
        ].join('\n'));
    } catch (e) {
        return ctx.reply(`❌ Check fail: ${e.message}`);
    }
});
