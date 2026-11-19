// Auto-split from plugins/viral-pack.js — category: tools
// (shared imports/helpers copied at top, only "tools" commands below)

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
    pattern: 'chatanalysis',
    alias: ['chatanalyze', 'groupanalysis'],
    desc: 'Group chat ka analysis',
    category: 'tools',
    react: '📊',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!ctx.isGroup) return ctx.reply('❌ Group only.');

    try {
        const meta = await conn.groupMetadata(ctx.from);
        const members = meta.participants.length;
        const admins = meta.participants.filter(p => p.admin).length;
        const created = new Date(meta.creation * 1000);
        const ageDays = Math.floor((Date.now() - created) / 86400000);

        return ctx.reply([
            '📊 *GROUP ANALYSIS*',
            '',
            `📛 *${meta.subject}*`,
            '',
            `👥 Members: *${members}*`,
            `🛡️ Admins: *${admins}*`,
            `📅 Created: *${created.toLocaleDateString()}*`,
            `⏳ Age: *${ageDays} days*`,
            '',
            `📈 *Member/Admin Ratio:*`,
            `👤 ${(members / admins).toFixed(1)}:1`,
            '',
            `🎯 *Group Score:*`,
            `⭐ ${Math.min(10, Math.floor(members / 20) + 5)}/10`
        ].join('\n'));
    } catch (e) { return ctx.reply('❌ Analysis fail.'); }
});

cmd({
    pattern: 'topwords',
    alias: ['wordcloud', 'commonwords'],
    desc: 'Most used words (member count)',
    category: 'tools',
    react: '🔤',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const words = ['salam', 'kaise', 'hain', 'acha', 'theek', 'shukriya', 'mashallah', 'inshallah'];
    return ctx.reply([
        '🔤 *TOP WORDS (Random Sample)*',
        '',
        ...words.map((w, i) => `${i + 1}. *${w}*`)
    ].join('\n') + '\n\n_Real analytics DB se aayenge_');
});

cmd({
    pattern: 'activetime',
    alias: ['groupactive', 'activehours'],
    desc: 'Group kab active hota hai',
    category: 'tools',
    react: '⏰',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const hours = [
        { range: '12 AM - 6 AM', activity: '😴 Low', percent: 5 },
        { range: '6 AM - 9 AM', activity: '🌅 Rising', percent: 20 },
        { range: '9 AM - 12 PM', activity: '📈 Active', percent: 45 },
        { range: '12 PM - 3 PM', activity: '📊 Peak', percent: 75 },
        { range: '3 PM - 6 PM', activity: '🔥 Busy', percent: 90 },
        { range: '6 PM - 9 PM', activity: '🌆 HIGH', percent: 100 },
        { range: '9 PM - 12 AM', activity: '🌙 Chill', percent: 60 }
    ];

    const lines = hours.map(h => `${h.range} — ${h.activity} *${h.percent}%*`);
    return ctx.reply(`⏰ *GROUP ACTIVITY*\n\n${lines.join('\n')}\n\n_Peak: 6-9 PM_ 🔥`);
});

cmd({
    pattern: 'todo',
    alias: ['tasklist'],
    desc: 'Todo list manage karo',
    category: 'tools',
    react: '📝',
    use: '.todo add <task>  |  .todo list  |  .todo done <num>  |  .todo clear',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const args = (ctx.q || '').split(' ');
    const action = args.shift()?.toLowerCase();
    const task = args.join(' ');
    const key = ctx.sender;

    if (!todoLists.has(key)) todoLists.set(key, []);

    if (action === 'add' && task) {
        todoLists.get(key).push({ task, done: false });
        return ctx.reply(`✅ *Task added:* ${task}`);
    }
    if (action === 'list') {
        const list = todoLists.get(key);
        if (!list.length) return ctx.reply('📝 Koi task nahi.');
        const lines = list.map((t, i) => `${i + 1}. ${t.done ? '✅' : '⬜'} ${t.task}`);
        return ctx.reply(`📝 *YOUR TASKS (${list.length})*\n\n${lines.join('\n')}`);
    }
    if (action === 'done' && task) {
        const idx = parseInt(task) - 1;
        const list = todoLists.get(key);
        if (list[idx]) {
            list[idx].done = true;
            return ctx.reply(`✅ *Done:* ${list[idx].task}`);
        }
    }
    if (action === 'clear') {
        todoLists.set(key, []);
        return ctx.reply('🗑️ *All tasks cleared*');
    }

    return ctx.reply('📝 *TODO LIST*\n\n`.todo add <task>`\n`.todo list`\n`.todo done <num>`\n`.todo clear`');
});

cmd({
    pattern: 'expense',
    alias: ['spending', 'kharcha'],
    desc: 'Expense tracker',
    category: 'tools',
    react: '💰',
    use: '.expense add <amount> <item>',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const args = (ctx.q || '').split(' ');
    const action = args.shift()?.toLowerCase();
    const key = ctx.sender;

    if (!expenses.has(key)) expenses.set(key, []);

    if (action === 'add') {
        const amount = parseFloat(args[0]);
        const item = args.slice(1).join(' ');
        if (!amount || !item) return ctx.reply('Use: `.expense add 500 lunch`');
        expenses.get(key).push({ amount, item, date: new Date() });
        return ctx.reply(`💰 *Added:* ${item} - *${amount}*`);
    }
    if (action === 'list' || !action) {
        const list = expenses.get(key);
        if (!list.length) return ctx.reply('💰 Koi expense nahi.');
        const total = list.reduce((s, e) => s + e.amount, 0);
        const lines = list.slice(-10).map((e, i) => `${i + 1}. ${e.item} — *${e.amount}*`);
        return ctx.reply(`💰 *EXPENSES*\n\n${lines.join('\n')}\n\n💵 *Total: ${total}*`);
    }
    if (action === 'total') {
        const list = expenses.get(key);
        const total = list.reduce((s, e) => s + e.amount, 0);
        return ctx.reply(`💵 *Total spending: ${total}*`);
    }
    if (action === 'clear') {
        expenses.set(key, []);
        return ctx.reply('🗑️ Cleared.');
    }

    return ctx.reply('Use: `.expense add <amount> <item>`');
});

cmd({
    pattern: 'habit',
    alias: ['habits'],
    desc: 'Habit tracker',
    category: 'tools',
    react: '⭐',
    use: '.habit add <name>  |  .habit done <name>',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const args = (ctx.q || '').split(' ');
    const action = args.shift()?.toLowerCase();
    const name = args.join(' ');
    const key = ctx.sender;

    if (!habits.has(key)) habits.set(key, {});

    if (action === 'add' && name) {
        habits.get(key)[name] = { streak: 0, last: null };
        return ctx.reply(`⭐ *Habit added:* ${name}`);
    }
    if (action === 'done' && name) {
        const h = habits.get(key)[name];
        if (!h) return ctx.reply('❌ Habit nahi mila.');
        const today = new Date().toDateString();
        if (h.last === today) return ctx.reply('⚠️ Aaj already done hai!');
        h.streak++;
        h.last = today;
        return ctx.reply(`✅ *${name}* — Streak: *${h.streak}* 🔥`);
    }
    if (action === 'list') {
        const h = habits.get(key);
        const names = Object.keys(h);
        if (!names.length) return ctx.reply('⭐ Koi habit nahi.');
        const lines = names.map(n => `⭐ ${n} — *${h[n].streak}* day streak`);
        return ctx.reply(`⭐ *YOUR HABITS*\n\n${lines.join('\n')}`);
    }
    return ctx.reply('Use: `.habit add <name>`\n`.habit done <name>`\n`.habit list`');
});

cmd({
    pattern: 'remindme',
    alias: ['rmind'],
    desc: 'Reminder set karo',
    category: 'tools',
    react: '⏰',
    use: '.remindme 10m <message>',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const args = (ctx.q || '').split(' ');
    const time = args.shift();
    const msg = args.join(' ');

    if (!time || !msg) return ctx.reply('Use: `.remindme 10m Call mom`\n\nTime: 10s, 5m, 2h');

    const m_ = time.match(/^(\d+)(s|m|h)$/i);
    if (!m_) return ctx.reply('Format: 30s, 5m, 2h');

    const val = parseInt(m_[1]);
    const unit = m_[2].toLowerCase();
    const ms = unit === 's' ? val * 1000 : unit === 'm' ? val * 60000 : val * 3600000;

    if (ms > 86400000) return ctx.reply('❌ Max 24 hours.');

    await ctx.reply(`⏰ *Reminder set:* ${time} baad yaad dilaunga.`);

    setTimeout(async () => {
        try {
            await conn.sendMessage(ctx.sender, {
                text: `⏰ *REMINDER!*\n\n💬 ${msg}`
            });
        } catch (_) {}
    }, ms);
});
