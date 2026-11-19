// Auto-split from plugins/promo-codes.js — category: general
// (shared imports/helpers copied at top, only "general" commands below)

const { cmd } = require('../arslan');
const config = require('../config');
const {
    createPromoCode, redeemPromoCode, listPromoCodes, deletePromoCode, hasPromoPremium
} = require('../lib/database');
const { isOwner, isPremiumUser, cleanNumber } = require('../lib/premium-check');

cmd({
    pattern: 'redeem',
    alias: ['promo-redeem', 'usecode', 'claimcode'],
    desc: 'Redeem a premium access code',
    category: 'general',
    react: '🎁',
    use: '.redeem <code>',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const code = (ctx.q || '').trim().toUpperCase();
    if (!code) return ctx.reply(`🎁 Use: \`${config.PREFIX}redeem <code>\``);
    if (isOwner(ctx)) return ctx.reply('👑 Owner has full access already.');

    try {
        const result = await redeemPromoCode(code, cleanNumber(ctx.senderNumber));
        if (!result.success) {
            const messages = {
                invalid_code: '❌ Code not found.',
                invalid_user: '❌ Your WhatsApp number could not be identified.',
                try_again: '⚠️ Redeem conflict; please try again.',
                inactive: '❌ This code is inactive.',
                expired: '⌛ This code has expired.',
                already_used_by_you: '⚠️ You already used this code.',
                limit_reached: '🚫 This code has no uses left.'
            };
            return ctx.reply(messages[result.reason] || '❌ Code could not be redeemed.');
        }
        return ctx.reply(
            `✅ *PREMIUM ACTIVATED*\n\n` +
            `🎟️ Code: *${code}*\n` +
            `💎 Added: *${result.premiumDays} days*\n` +
            `👥 Uses remaining: *${result.remaining}/${result.total}*`
        );
    } catch (e) { return ctx.reply(`❌ Redeem failed: ${e.message}`); }
});

cmd({
    pattern: 'premium',
    alias: ['mypremium', 'premiumstatus'],
    desc: 'Check premium status',
    category: 'general',
    react: '💎',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (isOwner(ctx)) return ctx.reply('👑 *OWNER STATUS*\n\nFull access is enabled.');
    const active = await isPremiumUser(ctx);
    if (!active) {
        return ctx.reply(
            `🔒 Premium is not active.\n\n` +
            `Ask the bot owner for a code, then use \`${config.PREFIX}redeem <code>\`.`
        );
    }
    let premium = null;
    try {
        const { PromoPremium } = require('../lib/database');
        premium = await PromoPremium.findOne({ number: cleanNumber(ctx.senderNumber) }).lean();
    } catch (_) {}
    return ctx.reply(
        `💎 *PREMIUM ACTIVE* ✅\n\n` +
        `📅 Expires: *${premium?.expiresAt ? new Date(premium.expiresAt).toLocaleString() : 'N/A'}*`
    );
});
