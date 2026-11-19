// Auto-split from plugins/api-master-pack.js — category: anime
// (shared imports/helpers copied at top, only "anime" commands below)

const { cmd } = require('../arslan');
const config = require('../config');
const crypto = require('crypto');
const axios = require('axios');
const fs = require('fs-extra');
const animeApi = require('../lib/anime-api');
async function sendRandomAnime(conn, mek, ctx, category, caption) {
    const pick = await animeApi.randomImage(category);
    if (!pick || !pick.url) return ctx.reply('❌ Anime image servers abhi jawab nahi de rahe. `.nettest` chala kar internet check karein.');
    try {
        await conn.sendMessage(ctx.from, { image: { url: pick.url }, caption }, { quoted: mek });
    } catch (e1) {
        // WhatsApp could not fetch the URL itself -> download here and send as a file
        const r = await axios.get(pick.url, { responseType: 'arraybuffer', timeout: 20000, headers: { 'User-Agent': 'Mozilla/5.0' } });
        await conn.sendMessage(ctx.from, { image: Buffer.from(r.data), caption }, { quoted: mek });
    }
}

cmd({
    pattern: 'animewall',
    alias: ['animewallpaper', 'awall'],
    desc: 'Anime wallpaper fetch',
    category: 'anime',
    react: '🎌',
    use: '.animewall naruto',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const query = (ctx.q || 'anime').trim();
    try {
        const r = await axios.get(`https://api.waifu.pics/sfw/waifu`, { timeout: 10000 });
        if (r.data?.url) {
            await conn.sendMessage(ctx.from, {
                image: { url: r.data.url },
                caption: `🎌 *Anime Wallpaper*\n🔍 ${query}`
            }, { quoted: mek });
        }
    } catch (e) {
        // Fallback
        try {
            const r2 = await axios.get(`https://nekos.best/api/v2/neko`, { timeout: 10000 });
            if (r2.data?.results?.[0]?.url) {
                await conn.sendMessage(ctx.from, {
                    image: { url: r2.data.results[0].url },
                    caption: '🎌 Anime image'
                }, { quoted: mek });
            }
        } catch (e2) { return ctx.reply('❌ Image fetch fail.'); }
    }
});

cmd({
    pattern: 'waifu',
    alias: ['animegirl'],
    desc: 'Random waifu image',
    category: 'anime',
    react: '💖',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    try { await sendRandomAnime(conn, mek, ctx, 'waifu', '💖 Random Waifu'); }
    catch (e) { return ctx.reply('❌ Waifu nahi aayi: ' + String(e.message).slice(0, 120)); }
});

cmd({
    pattern: 'neko',
    alias: ['nekopic'],
    desc: 'Random neko image',
    category: 'anime',
    react: '🐱',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    try { await sendRandomAnime(conn, mek, ctx, 'neko', '🐱 Random Neko'); }
    catch (e) { return ctx.reply('❌ Neko nahi aayi: ' + String(e.message).slice(0, 120)); }
});

cmd({
    pattern: 'animequote',
    alias: ['aniquote'],
    desc: 'Random anime quote',
    category: 'anime',
    react: '💬',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    try {
        const r = await axios.get('https://animechan.io/api/v1/quotes/random', { timeout: 10000 });
        if (r.data?.data) {
            return ctx.reply(`💬 *ANIME QUOTE*\n\n"${r.data.data.content}"\n\n— *${r.data.data.character.name}* (${r.data.data.anime.name})`);
        }
    } catch (e) {
        // Fallback — hardcoded
        const quotes = [
            { q: 'I will become the Pirate King!', c: 'Monkey D. Luffy', a: 'One Piece' },
            { q: 'Believe it!', c: 'Naruto Uzumaki', a: 'Naruto' },
            { q: 'Power comes in response to a need, not a desire.', c: 'Goku', a: 'Dragon Ball Z' },
            { q: 'Whatever you lose, you will find it again.', c: 'Kenshin Himura', a: 'Rurouni Kenshin' },
            { q: 'It\'s not the face that makes someone a monster.', c: 'Naruto Uzumaki', a: 'Naruto' }
        ];
        const pick = quotes[crypto.randomInt(quotes.length)];
        return ctx.reply(`💬 *ANIME QUOTE*\n\n"${pick.q}"\n\n— *${pick.c}* (${pick.a})`);
    }
});

cmd({
    pattern: 'animesearch',
    alias: ['anisearch'],
    desc: 'Anime search',
    category: 'anime',
    react: '🔍',
    use: '.animesearch naruto',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const q = (ctx.q || '').trim();
    if (!q) return ctx.reply('Use: `.animesearch naruto`');
    try {
        const r = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=3`, { timeout: 10000 });
        if (r.data?.data?.length) {
            const lines = r.data.data.map((a, i) =>
                `${i + 1}. *${a.title}*\n   ⭐ ${a.score || 'N/A'} | 📺 ${a.episodes || '?'} eps | 📅 ${a.year || '?'}`
            ).join('\n\n');
            return ctx.reply(`🔍 *ANIME SEARCH: ${q}*\n\n${lines}`);
        }
    } catch (e) { return ctx.reply('❌ Search fail.'); }
});
