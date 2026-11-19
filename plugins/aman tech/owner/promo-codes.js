// Auto-split from plugins/promo-codes.js — category: owner
// (shared imports/helpers copied at top, only "owner" commands below)

const { cmd } = require('../arslan');
const config = require('../config');
const {
    createPromoCode, redeemPromoCode, listPromoCodes, deletePromoCode, hasPromoPremium
} = require('../lib/database');
const { isOwner, isPremiumUser, cleanNumber } = require('../lib/premium-check');

cmd({
    pattern: 'promo',
    alias: ['createpromo', 'promocode', 'genpromo'],
    desc: 'Owner: create a premium access code',
    category: 'owner',
    react: '🎟️',
    use: '.promo <code> [maxUses=100] [expiresHours=24] [premiumDays=30]',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner only.');

    const args = (ctx.q || '').trim().split(/\s+/);
    const [code, maxUses = '100', expiresHours = '24', premiumDays = '30'] = args;
    if (!code) {
        return ctx.reply(
            `🎟️ *PREMIUM CODE*\n\n` +
            `Use: \`${config.PREFIX}promo <code> [maxUses=100] [expiresHours=24] [premiumDays=30]\`\n` +
            `Example: \`${config.PREFIX}promo MINI30 100 24 30\``
        );
    }

    try {
        const promo = await createPromoCode(
            code, Number(maxUses), cleanNumber(ctx.senderNumber), Number(expiresHours), Number(premiumDays)
        );
        return ctx.reply(
            `🎟️ *CODE CREATED*\n\n` +
            `🔑 Code: *${promo.code}*\n` +
            `👥 Uses: *${promo.maxUses}*\n` +
            `💎 Premium per use: *${promo.premiumDays} days*\n` +
            `📅 Expires: *${promo.expiresAt ? promo.expiresAt.toLocaleString() : 'Never'}*\n\n` +
            `Redeem with: \`${config.PREFIX}redeem ${promo.code}\``
        );
    } catch (e) { return ctx.reply(`❌ ${e.message}`); }
});

cmd({
    pattern: 'promolist',
    alias: ['listpromo', 'mycodes', 'codes'],
    desc: 'Owner: list your premium codes',
    category: 'owner',
    react: '📋',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner only.');
    try {
        const codes = await listPromoCodes(cleanNumber(ctx.senderNumber));
        if (!codes.length) return ctx.reply(`📋 Use: \`${config.PREFIX}promo <code>\``);
        const lines = codes.map((c, i) => {
            const status = c.usedCount >= c.maxUses ? 'FULL' :
                c.active && (!c.expiresAt || c.expiresAt > new Date()) ? 'Active' : 'Expired/inactive';
            return `${i + 1}. *${c.code}* — ${c.usedCount}/${c.maxUses} uses | ${c.premiumDays || 30} days | ${status}`;
        });
        return ctx.reply(`🎟️ *YOUR PREMIUM CODES (${codes.length})*\n\n${lines.join('\n')}`);
    } catch (e) { return ctx.reply(`❌ ${e.message}`); }
});

cmd({
    pattern: 'delpromo',
    alias: ['removepromo', 'delcode'],
    desc: 'Owner: delete a premium code',
    category: 'owner',
    react: '🗑️',
    use: '.delpromo <code>',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!isOwner(ctx)) return ctx.reply('⛔ Owner only.');
    const code = (ctx.q || '').trim().toUpperCase();
    if (!code) return ctx.reply(`Use: \`${config.PREFIX}delpromo <code>\``);
    try {
        const deleted = await deletePromoCode(code, cleanNumber(ctx.senderNumber));
        return ctx.reply(deleted ? `🗑️ Code *${code}* deleted.` : '❌ Code not found.');
    } catch (e) { return ctx.reply(`❌ ${e.message}`); }
});
