// Auto-split from plugins/viral-pack.js — category: system
// (shared imports/helpers copied at top, only "system" commands below)

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
    on: 'body',
    allowUnprefixedInGroups: true,
    pattern: 'typingcheck',
    desc: 'Typing check',
    category: 'system',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!typingTests.has(ctx.sender)) return;
    const test = typingTests.get(ctx.sender);
    const typed = (ctx.body || '').trim();
    if (typed.toLowerCase() === test.sentence.toLowerCase()) {
        const time = ((Date.now() - test.start) / 1000).toFixed(2);
        const wpm = Math.round((test.sentence.split(' ').length / time) * 60);
        typingTests.delete(ctx.sender);
        return ctx.reply(`✅ *Correct!*\n\n⏱️ Time: *${time}s*\n⚡ WPM: *${wpm}*\n\n${wpm > 60 ? '🚀 Speed coder!' : wpm > 40 ? '👍 Good!' : '💪 Practice karo!'}`);
    }
});

cmd({
    on: 'body',
    allowUnprefixedInGroups: true,
    pattern: 'reactioncheck',
    desc: 'Reaction check',
    category: 'system',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!reactionTests.has(ctx.sender)) return;
    const body = (ctx.body || '').trim().toUpperCase();
    if (body === 'GO') {
        const time = Date.now() - reactionTests.get(ctx.sender);
        reactionTests.delete(ctx.sender);
        return ctx.reply(`⚡ *Reaction: ${time}ms*\n\n${time < 200 ? '🏆 Insane!' : time < 400 ? '⭐ Excellent!' : time < 600 ? '👍 Good!' : '💪 Practice!'}`);
    }
});

cmd({
    on: 'body',
    allowUnprefixedInGroups: true,
    pattern: 'mathcheck',
    desc: 'Math check',
    category: 'system',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!mathTests.has(ctx.sender)) return;
    const test = mathTests.get(ctx.sender);
    const answer = parseInt(ctx.body);
    if (answer === test.answer) {
        const time = ((Date.now() - test.start) / 1000).toFixed(2);
        mathTests.delete(ctx.sender);
        return ctx.reply(`✅ *Correct!*\n\n⏱️ Time: *${time}s*\n🎯 Answer: *${test.answer}*`);
    } else if (answer) {
        mathTests.delete(ctx.sender);
        return ctx.reply(`❌ *Wrong!*\n\n✅ Answer: *${test.answer}*`);
    }
});

cmd({
    on: 'body',
    allowUnprefixedInGroups: true,
    pattern: 'memorycheck',
    desc: 'Memory check',
    category: 'system',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!memoryGames.has(ctx.sender)) return;
    const game = memoryGames.get(ctx.sender);
    const typed = (ctx.body || '').trim();
    if (/^\d+$/.test(typed)) {
        memoryGames.delete(ctx.sender);
        if (typed === game.sequence) {
            return ctx.reply(`🧠 *PERFECT MEMORY!* ✅\n\n🎯 Correct: *${game.sequence}*`);
        } else {
            return ctx.reply(`❌ *Wrong!*\n\n✅ Correct: *${game.sequence}*\n❌ Your: *${typed}*`);
        }
    }
});

cmd({
    on: 'body',
    allowUnprefixedInGroups: true,
    pattern: 'triviacheck',
    desc: 'Trivia check',
    category: 'system',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    if (!triviaGames.has(ctx.sender)) return;
    const game = triviaGames.get(ctx.sender);
    const answer = parseInt(ctx.body);
    if (answer >= 1 && answer <= 4) {
        triviaGames.delete(ctx.sender);
        if (answer - 1 === game.q.a) {
            return ctx.reply(`✅ *CORRECT!* 🎉\n\n🎯 Answer: *${game.q.opts[game.q.a]}*`);
        } else {
            return ctx.reply(`❌ *Wrong!*\n\n✅ Correct: *${game.q.opts[game.q.a]}*`);
        }
    }
});
