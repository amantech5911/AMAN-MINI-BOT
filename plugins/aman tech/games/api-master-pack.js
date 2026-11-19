// Auto-split from plugins/api-master-pack.js — category: games
// (shared imports/helpers copied at top, only "games" commands below)

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
    pattern: 'ff',
    alias: ['freefire'],
    desc: 'Free Fire player info',
    category: 'games',
    react: '🎮',
    use: '.ff 123456789',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const uid = (ctx.q || '').replace(/\D/g, '');
    if (!uid) return ctx.reply('Use: `.ff <player_uid>`');
    try {
        const r = await axios.get(`https://api.duniagames.co.id/api/transaction/v1/check-nickname?userId=${uid}&gameId=freefire`, { timeout: 10000 });
        if (r.data?.data?.userName) {
            return ctx.reply(`🎮 *FREE FIRE INFO*\n\n🆔 UID: *${uid}*\n👤 Username: *${r.data.data.userName}*`);
        }
    } catch (e) { /* continue */ }
    // Fallback
    return ctx.reply(`🎮 *FREE FIRE*\n\n🆔 UID: *${uid}*\n👤 Username: *Player_${uid.slice(-4)}*\n\n_Manual check karo: id.duniagames.co.id_`);
});

cmd({
    pattern: 'mlbb',
    alias: ['ml', 'mobilelegends'],
    desc: 'Mobile Legends player info',
    category: 'games',
    react: '⚔️',
    use: '.mlbb 123456 (1234)',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const match = (ctx.q || '').match(/(\d+)\s*\(?(\d+)?\)?/);
    if (!match) return ctx.reply('Use: `.mlbb 123456 (1234)`\n\nFormat: ID (Zone)');
    const uid = match[1];
    const zone = match[2] || '';
    try {
        const r = await axios.get(`https://api.isan.eu.org/nickname/ml?id=${uid}&zone=${zone}`, { timeout: 10000 });
        if (r.data?.name) {
            return ctx.reply(`⚔️ *MLBB INFO*\n\n🆔 ID: *${uid}*\n🌍 Zone: *${zone}*\n👤 Name: *${r.data.name}*`);
        }
    } catch (e) { /* continue */ }
    return ctx.reply(`⚔️ *MLBB*\n\n🆔 ID: *${uid}*\n🌍 Zone: *${zone}*\n\n_Manual check: id.duniagames.co.id_`);
});

cmd({
    pattern: 'mcserver',
    alias: ['minecraft'],
    desc: 'Minecraft server info',
    category: 'games',
    react: '⛏️',
    use: '.mcserver play.hypixel.net',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const host = (ctx.q || '').trim();
    if (!host) return ctx.reply('Use: `.mcserver play.hypixel.net`');
    try {
        const r = await axios.get(`https://api.mcsrvstat.us/3/${host}`, { timeout: 10000 });
        if (r.data?.online) {
            return ctx.reply([
                `⛏️ *MINECRAFT SERVER*`,
                '',
                `🌐 Host: *${host}*`,
                `✅ Status: *Online*`,
                `👥 Players: *${r.data.players?.online || 0}/${r.data.players?.max || 0}*`,
                `🎮 Version: *${r.data.version || 'N/A'}*`,
                r.data.motd?.clean ? `📝 MOTD: *${r.data.motd.clean.join(' ')}*` : ''
            ].filter(Boolean).join('\n'));
        }
        return ctx.reply('❌ Server offline ya not found.');
    } catch (e) { return ctx.reply('❌ Server info fail.'); }
});

cmd({
    pattern: 'steam',
    alias: ['steamgame'],
    desc: 'Steam game info',
    category: 'games',
    react: '🎮',
    use: '.steam GTA V',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const q = (ctx.q || '').trim();
    if (!q) return ctx.reply('Use: `.steam GTA V`');
    try {
        const r = await axios.get(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(q)}&cc=us`, { timeout: 10000 });
        if (r.data?.items?.length) {
            const game = r.data.items[0];
            const detail = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${game.id}`, { timeout: 10000 });
            const d = detail.data[game.id]?.data;
            return ctx.reply([
                `🎮 *STEAM GAME*`,
                '',
                `📌 Name: *${game.name}*`,
                d?.price_overview ? `💰 Price: *${d.price_overview.final_formatted}*` : '💰 Free',
                d?.release_date?.date ? `📅 Released: *${d.release_date.date}*` : '',
                d?.metacritic?.score ? `⭐ Metacritic: *${d.metacritic.score}*` : ''
            ].filter(Boolean).join('\n'));
        }
    } catch (e) { return ctx.reply('❌ Game not found.'); }
});

cmd({
    pattern: 'pokemon',
    alias: ['poke'],
    desc: 'Pokemon info',
    category: 'games',
    react: '⚡',
    use: '.pokemon pikachu',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const name = (ctx.q || 'pikachu').toLowerCase().trim();
    try {
        const r = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`, { timeout: 10000 });
        const p = r.data;
        const types = p.types.map(t => t.type.name).join(', ');
        return ctx.reply([
            `⚡ *POKEMON: ${p.name.toUpperCase()}*`,
            '',
            `🆔 ID: *${p.id}*`,
            `🔤 Types: *${types}*`,
            `📏 Height: *${p.height / 10} m*`,
            `⚖️ Weight: *${p.weight / 10} kg*`,
            `🎯 Abilities: *${p.abilities.map(a => a.ability.name).join(', ')}*`
        ].join('\n'));
    } catch (e) { return ctx.reply('❌ Pokemon not found.'); }
});
