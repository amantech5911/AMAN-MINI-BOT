// Auto-split from plugins/welcome-pro.js — category: owner
// (shared imports/helpers copied at top, only "owner" commands below)

const { cmd } = require('../arslan');
const config = require('../config');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const W = require('../lib/welcome');
const botpic = require('../lib/botpic');
const P = () => config.PREFIX || '.';
const onOff = v => (/^(on|true|yes|1|enable|chalu)$/i.test(v) ? true : /^(off|false|no|0|disable|band)$/i.test(v) ? false : null);
const mark = b => (b ? '✅ ON' : '❌ OFF');
async function groupOnly(ctx) {
    if (!ctx.isGroup) { await ctx.reply('⛔ Ye command sirf group mein chalti hai.'); return false; }
    return true;
}
function panel(conn, groupJid) {
    const s = W.getSettings(conn, groupJid);
    const p = P();
    return (
`🌸 *WELCOME SETTINGS*

👋 Welcome: ${mark(s.welcome)}
🥀 Goodbye: ${mark(s.goodbye)}
🖼️ DP card: ${mark(s.pic)}
📜 Shayari: ${mark(s.shayari)}${s.shayariText ? ' (custom)' : ' (auto)'}
🔤 Font: ${s.font} — ${W.FONT_NAMES[s.font]?.[0] || 'Normal'}
✍️ Welcome text: ${s.wtext ? 'custom' : 'default'}
✍️ Goodbye text: ${s.gtext ? 'custom' : 'default'}

*Commands*
• ${p}welcome on/off  • ${p}goodbye on/off
• ${p}setwelcome <text>  • ${p}setgoodbye <text>
• ${p}welcomefont 1-7  • ${p}welcomepic on/off
• ${p}shayari on/off  • ${p}setshayari <text>
• ${p}testwelcome  • ${p}testgoodbye

*Text mein ye likh sakte hain:*
@user  @group  @count  @date  @time  @shayari`
    );
}
function pickImage(mek) {
    const ctxInfo = mek.message?.extendedTextMessage?.contextInfo
        || mek.message?.imageMessage?.contextInfo || null;
    return mek.message?.imageMessage
        || ctxInfo?.quotedMessage?.imageMessage
        || null;
}
async function downloadImage(imgMsg) {
    const stream = await downloadContentFromMessage(imgMsg, 'image');
    let buf = Buffer.from([]);
    for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
    return buf;
}
console.log('[AMAN Mini Bot] welcome-pro loaded');

cmd({
    pattern: 'setbotpic',
    alias: ['setmenupic', 'botimage', 'setbotimage', 'setbotpicture'],
    desc: 'Change the bot picture used in menu / alive (image reply, attach or link)',
    category: 'owner',
    react: '🖼️',
    use: '.setbotpic (image reply)  |  .setbotpic <image-link>',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    try {
        const url = ((ctx.q || '').match(/https?:\/\/\S+/) || [])[0];
        const imgMsg = pickImage(mek);
        if (!imgMsg && !url) {
            return ctx.reply(`🖼️ *BOT PICTURE*\n\n• Kisi photo ko reply karke ${P()}setbotpic\n• Ya photo bhejte waqt caption mein ${P()}setbotpic\n• Ya link: ${P()}setbotpic https://.../pic.jpg\n• Wapas default: ${P()}resetbotpic\n\n(WhatsApp ki apni profile photo ke liye ${P()}setpp use karein.)`);
        }
        await ctx.reply('⏳ Bot ki picture update ho rahi hai...');
        if (imgMsg) await botpic.setBotPicFromBuffer(conn, await downloadImage(imgMsg));
        else await botpic.setBotPicFromUrl(conn, url);
        await conn.sendMessage(ctx.from, { image: botpic.getBotPic(conn), caption: '✅ *Bot picture set ho gayi!*\nAb menu / alive mein yehi aayegi.' }, { quoted: mek });
    } catch (e) {
        return ctx.reply('❌ Picture set nahi hui: ' + String(e.message).slice(0, 160));
    }
});

cmd({
    pattern: 'resetbotpic',
    alias: ['defaultbotpic', 'delbotpic'],
    desc: 'Restore the default bot picture',
    category: 'owner',
    react: '♻️',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    botpic.resetBotPic(conn);
    return ctx.reply('✅ Bot picture default par wapas aa gayi.');
});

cmd({
    pattern: 'setownerpic',
    alias: ['setwelcomeowner', 'ownerpicset'],
    desc: 'Welcome/goodbye card par apni photo lagao (image reply, attach or link)',
    category: 'owner',
    react: '🖼️',
    use: '.setownerpic (image reply)  |  .setownerpic <image-link>',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!ctx.isCreator) return ctx.reply('⛔ Sirf bot owner.');
    try {
        const url = ((ctx.q || '').match(/https?:\/\/\S+/) || [])[0];
        const imgMsg = pickImage(mek);
        if (!imgMsg && !url) {
            return ctx.reply(`🖼️ *OWNER PHOTO (welcome card)*\n\n• Apni photo ko reply karke ${P()}setownerpic\n• Ya photo bhejte waqt caption mein ${P()}setownerpic\n• Ya link: ${P()}setownerpic https://.../photo.jpg\n\nOn/off: ${P()}ownerpic on / off\nHatana: ${P()}resetownerpic`);
        }
        await ctx.reply('⏳ Photo set ho rahi hai...');
        const buf = imgMsg ? await downloadImage(imgMsg) : await W.fetchBuffer(url);
        await W.setOwnerPic(conn, buf);
        return ctx.reply(`✅ *Owner photo set ho gayi!*\nAb har welcome / goodbye card par member ki DP ke saath aap ki photo bhi aayegi.\nDekhne ke liye group mein ${P()}testwelcome chalao.`);
    } catch (e) {
        return ctx.reply('❌ Photo set nahi hui: ' + String(e.message).slice(0, 160));
    }
});

cmd({
    pattern: 'ownerpic',
    alias: ['welcomeowner'],
    desc: 'Welcome card par owner photo on/off',
    category: 'owner',
    react: '🖼️',
    use: '.ownerpic on|off',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!ctx.isCreator) return ctx.reply('⛔ Sirf bot owner.');
    const v = onOff((ctx.args && ctx.args[0]) || '');
    if (!W.hasOwnerPic(conn)) return ctx.reply(`ℹ️ Pehle photo set karo: ${P()}setownerpic`);
    if (v === null) return ctx.reply(`🖼️ Owner photo: ${mark(W.ownerPicEnabled(conn))}\nSet: ${P()}ownerpic on / off`);
    W.setOwnerPicEnabled(conn, v);
    return ctx.reply(`✅ Owner photo ab ${mark(v)} hai.`);
});

cmd({
    pattern: 'resetownerpic',
    alias: ['delownerpic'],
    desc: 'Welcome card se owner photo hata do',
    category: 'owner',
    react: '♻️',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!ctx.isCreator) return ctx.reply('⛔ Sirf bot owner.');
    W.clearOwnerPic(conn);
    return ctx.reply('✅ Owner photo hata di.');
});
