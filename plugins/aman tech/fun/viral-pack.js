// Auto-split from plugins/viral-pack.js — category: fun
// (shared imports/helpers copied at top, only "fun" commands below)

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
    pattern: 'typingtest',
    alias: ['speedtest', 'typing'],
    desc: 'Typing speed test',
    category: 'fun',
    react: '⌨️',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const sentences = [
        'The quick brown fox jumps over the lazy dog',
        'Pakistan is a beautiful country with rich culture',
        'WhatsApp is the most popular messaging app',
        'Coding is a skill that requires practice and patience',
        'Artificial intelligence is changing the world rapidly'
    ];
    const pick = sentences[crypto.randomInt(sentences.length)];
    typingTests.set(ctx.sender, { sentence: pick, start: Date.now() });

    return ctx.reply([
        '⌨️ *TYPING SPEED TEST*',
        '',
        '📝 Type this sentence *exactly:*',
        '',
        `> ${pick}`,
        '',
        '⏱️ Timer started — likho aur bhejo!',
        '',
        '💡 Send the exact sentence as your next message'
    ].join('\n'));
});

cmd({
    pattern: 'reactiontest',
    alias: ['reactime', 'quickreact'],
    desc: 'Reaction time test',
    category: 'fun',
    react: '⚡',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    await ctx.reply('⚡ *REACTION TEST*\n\n3 second baad "GO" likho...');
    await new Promise(r => setTimeout(r, 3000));
    reactionTests.set(ctx.sender, Date.now());
    return ctx.reply('🟢 *GO! Likho "GO"*');
});

cmd({
    pattern: 'mathspeed',
    alias: ['quickmath'],
    desc: 'Math speed test',
    category: 'fun',
    react: '🧮',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const a = crypto.randomInt(10, 50);
    const b = crypto.randomInt(10, 50);
    const ops = ['+', '-', '×'];
    const op = ops[crypto.randomInt(ops.length)];

    let answer;
    if (op === '+') answer = a + b;
    else if (op === '-') answer = a - b;
    else answer = a * b;

    mathTests.set(ctx.sender, { answer, start: Date.now() });
    return ctx.reply(`🧮 *MATH SPEED TEST*\n\n*${a} ${op} ${b} = ?*\n\n⏱️ Time: 10 seconds`);
});

cmd({
    pattern: 'memorygame',
    alias: ['memorytest'],
    desc: 'Memory test game',
    category: 'fun',
    react: '🧠',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const nums = Array.from({ length: 5 }, () => crypto.randomInt(1, 10)).join('');
    memoryGames.set(ctx.sender, { sequence: nums, start: Date.now() });

    await ctx.reply(`🧠 *MEMORY TEST*\n\nYaad karo: *${nums}*\n\n⏱️ 5 seconds...`);
    await new Promise(r => setTimeout(r, 5000));
    return ctx.reply('⏰ *Ab bhejo wo number!*');
});

cmd({
    pattern: 'trivia',
    alias: ['quizgame'],
    desc: 'Live trivia quiz',
    category: 'fun',
    react: '❓',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const questions = [
        { q: 'Pakistan ka capital?', opts: ['Karachi', 'Lahore', 'Islamabad', 'Peshawar'], a: 2 },
        { q: 'Sabse bara planet?', opts: ['Earth', 'Jupiter', 'Saturn', 'Mars'], a: 1 },
        { q: '2+2×2 = ?', opts: ['6', '8', '4', '10'], a: 0 },
        { q: 'K2 kis mulk me?', opts: ['India', 'Nepal', 'China', 'Pakistan'], a: 3 },
        { q: 'Sabse lambi nadi?', opts: ['Amazon', 'Nile', 'Indus', 'Yangtze'], a: 1 }
    ];
    const pick = questions[crypto.randomInt(questions.length)];
    triviaGames.set(ctx.sender, { q: pick, start: Date.now() });

    const opts = pick.opts.map((o, i) => `${i + 1}. ${o}`).join('\n');
    return ctx.reply(`❓ *TRIVIA*\n\n📌 *${pick.q}*\n\n${opts}\n\n💡 *Bhejo number (1-4)*`);
});
