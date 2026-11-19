// Auto-split from plugins/channel-status.js — category: general
// (shared imports/helpers copied at top, only "general" commands below)

const { cmd } = require('../arslan');
const config = require('../config');
const {
    requirePremium,
    isOwner,
    isPremiumUser,
    cleanNumber
} = require('../lib/premium-check');

cmd({
    pattern: 'channelinfo',
    alias: ['chinfo', 'chstatcheck'],
    desc: 'Channel ki info aur status feature check',
    category: 'general',
    react: '📊',
    use: '.channelinfo <channel_jid>',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const channelJid = (ctx.args[0] || '').trim();
    if (!channelJid) return ctx.reply('❌ Channel JID do.\nExample: `.channelinfo 0029Vb...@newsletter`');

    try {
        const jid = channelJid.endsWith('@newsletter') ? channelJid : `${channelJid}@newsletter`;

        let metadata = null;
        if (typeof conn.newsletterMetadata === 'function') {
            metadata = await conn.newsletterMetadata('jid', jid).catch(() => null);
        }

        return ctx.reply([
            '📊 *CHANNEL INFO*',
            '',
            `🆔 JID: \`${jid}\``,
            `📛 Name: *${metadata?.name || 'N/A'}*`,
            `👥 Subscribers: *${metadata?.subscribers || 'N/A'}*`,
            `📝 Desc: *${(metadata?.description || 'N/A').slice(0, 100)}*`,
            '',
            '💡 *Channel Status* WhatsApp feature hai jo 24hr temporary updates allow karta hai.',
            `✅ Ye bot usse use karta hai \`${config.PREFIX}channelstatus\` command se.`
        ].join('\n'));
    } catch (e) {
        return ctx.reply('❌ Channel info fail: ' + e.message);
    }
});
