// Auto-split from plugins/extra-pack.js — category: tools
// (shared imports/helpers copied at top, only "tools" commands below)

const { cmd } = require('../arslan');
const config = require('../config');
const crypto = require('crypto');
const axios = require('axios');

cmd({
    pattern: 'calc',
    alias: ['calculator', 'math'],
    desc: 'Calculator',
    category: 'tools',
    react: '🧮',
    use: '.calc 5 + 3 * 2',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const expr = (ctx.q || '').replace(/[^0-9+\-*/.()% ]/g, '');
    if (!expr) return ctx.reply('Use: *.calc 5+3*');

    try {
        const result = Function(`"use strict"; return (${expr})`)();
        return ctx.reply(`🧮 *${expr} = ${result}*`);
    } catch (e) {
        return ctx.reply('❌ Invalid expression.');
    }
});

cmd({
    pattern: 'reverse',
    alias: ['revtext'],
    desc: 'Text ko reverse karo',
    category: 'tools',
    react: '🔄',
    use: '.reverse hello',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!ctx.q) return ctx.reply('Use: *.reverse hello*');
    return ctx.reply(`🔄 ${ctx.q.split('').reverse().join('')}`);
});

cmd({
    pattern: 'uppercase',
    alias: ['upper'],
    desc: 'Text uppercase',
    category: 'tools',
    react: '🔠',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!ctx.q) return ctx.reply('Use: *.uppercase hello*');
    return ctx.reply(`🔠 ${ctx.q.toUpperCase()}`);
});

cmd({
    pattern: 'lowercase',
    alias: ['lower'],
    desc: 'Text lowercase',
    category: 'tools',
    react: '🔡',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!ctx.q) return ctx.reply('Use: *.lowercase HELLO*');
    return ctx.reply(`🔡 ${ctx.q.toLowerCase()}`);
});

cmd({
    pattern: 'length',
    alias: ['count'],
    desc: 'Text ki length',
    category: 'tools',
    react: '📏',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!ctx.q) return ctx.reply('Use: *.length hello*');
    return ctx.reply([
        `📏 *TEXT STATS*`,
        '',
        `📝 Text: ${ctx.q}`,
        `🔢 Characters: *${ctx.q.length}*`,
        `📄 Words: *${ctx.q.split(/\s+/).length}*`,
        `📃 Lines: *${ctx.q.split('\n').length}*`
    ].join('\n'));
});

cmd({
    pattern: 'tobin',
    alias: ['text2bin'],
    desc: 'Text to binary',
    category: 'tools',
    react: '💻',
    use: '.tobin hi',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!ctx.q) return ctx.reply('Use: *.tobin hello*');
    const binary = ctx.q.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
    return ctx.reply(`💻 ${binary}`);
});

cmd({
    pattern: 'frombin',
    alias: ['bin2text'],
    desc: 'Binary to text',
    category: 'tools',
    react: '💬',
    use: '.frombin 01001000 01101001',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!ctx.q) return ctx.reply('Use: *.frombin 01001000 01101001*');
    try {
        const text = ctx.q.split(/\s+/).map(b => String.fromCharCode(parseInt(b, 2))).join('');
        return ctx.reply(`💬 ${text}`);
    } catch (e) { return ctx.reply('❌ Invalid binary.'); }
});
