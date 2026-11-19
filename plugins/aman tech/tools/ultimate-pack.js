// Auto-split from plugins/ultimate-pack.js — category: tools
// (shared imports/helpers copied at top, only "tools" commands below)

const { cmd } = require('../arslan');
const config = require('../config');
const crypto = require('crypto');
const axios = require('axios');
const zikrData = new Map();

cmd({
    pattern: 'timezone',
    alias: ['tz', 'clock'],
    desc: 'Kisi bhi timezone ka time',
    category: 'tools',
    react: '🕐',
    use: '.timezone America/New_York',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const tz = (ctx.q || 'Asia/Karachi').trim();
    try {
        const time = new Date().toLocaleString('en-GB', { timeZone: tz });
        return ctx.reply(`🕐 *TIME — ${tz}*\n\n*${time}*`);
    } catch (e) { return ctx.reply('❌ Invalid timezone.'); }
});

cmd({
    pattern: 'capital',
    alias: ['capitals'],
    desc: 'Country ka capital',
    category: 'tools',
    react: '🏛️',
    use: '.capital Pakistan',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const country = (ctx.q || '').trim();
    if (!country) return ctx.reply('Use: `.capital Pakistan`');
    try {
        const r = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`, { timeout: 10000 });
        const c = r.data[0];
        return ctx.reply([
            `🏛️ *${c.name.common}*`,
            '',
            `🏛️ Capital: *${c.capital?.[0]}*`,
            `👥 Population: *${c.population.toLocaleString()}*`,
            `🌐 Region: *${c.region}*`,
            `🗣️ Languages: *${Object.values(c.languages || {}).slice(0, 3).join(', ')}*`
        ].join('\n'));
    } catch (e) { return ctx.reply('❌ Country not found.'); }
});

cmd({
    pattern: 'flag',
    alias: ['countryflag'],
    desc: 'Country ka flag',
    category: 'tools',
    react: '🚩',
    use: '.flag Pakistan',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const flags = {
        pakistan: '🇵🇰', india: '🇮🇳', usa: '🇺🇸', uk: '🇬🇧',
        china: '🇨🇳', japan: '🇯🇵', germany: '🇩🇪', france: '🇫🇷',
        saudi: '🇸🇦', uae: '🇦🇪', turkey: '🇹🇷', iran: '🇮🇷',
        russia: '🇷🇺', brazil: '🇧🇷', australia: '🇦🇺', canada: '🇨🇦'
    };
    const country = (ctx.q || '').toLowerCase().trim();
    if (!country || !flags[country]) {
        return ctx.reply(`Use: \`.flag <country>\`\n\nAvailable: ${Object.keys(flags).join(', ')}`);
    }
    return ctx.reply(`${flags[country]} *${country.toUpperCase()}*`);
});

cmd({
    pattern: 'population',
    alias: ['pop'],
    desc: 'Country ki population',
    category: 'tools',
    react: '👥',
    use: '.population India',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const country = (ctx.q || '').trim();
    if (!country) return ctx.reply('Use: `.population India`');
    try {
        const r = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`, { timeout: 10000 });
        const c = r.data[0];
        return ctx.reply(`👥 *${c.name.common}*\n\n📊 Population: *${c.population.toLocaleString()}*`);
    } catch (e) { return ctx.reply('❌ Country not found.'); }
});

cmd({
    pattern: 'languages',
    alias: ['countrylang'],
    desc: 'Country ki languages',
    category: 'tools',
    react: '🗣️',
    use: '.languages India',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const country = (ctx.q || '').trim();
    if (!country) return ctx.reply('Use: `.languages India`');
    try {
        const r = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`, { timeout: 10000 });
        const c = r.data[0];
        const langs = Object.values(c.languages || {}).join(', ');
        return ctx.reply(`🗣️ *${c.name.common}*\n\n📝 Languages: *${langs}*`);
    } catch (e) { return ctx.reply('❌ Country not found.'); }
});

cmd({
    pattern: 'airport',
    alias: ['airportinfo'],
    desc: 'Airport ki info',
    category: 'tools',
    react: '🛫',
    use: '.airport KHI',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const code = (ctx.q || '').toUpperCase().trim();
    const airports = {
        KHI: { name: 'Jinnah International', city: 'Karachi' },
        LHE: { name: 'Allama Iqbal International', city: 'Lahore' },
        ISB: { name: 'Islamabad International', city: 'Islamabad' },
        DXB: { name: 'Dubai International', city: 'Dubai' },
        DOH: { name: 'Hamad International', city: 'Doha' },
        JED: { name: 'King Abdulaziz International', city: 'Jeddah' },
        LHR: { name: 'Heathrow', city: 'London' },
        JFK: { name: 'John F. Kennedy', city: 'New York' }
    };

    if (!code || !airports[code]) {
        return ctx.reply(`Use: \`.airport <code>\`\n\nCodes: ${Object.keys(airports).join(', ')}`);
    }

    const a = airports[code];
    return ctx.reply(`🛫 *${code}*\n\n🏢 ${a.name}\n🏙️ ${a.city}`);
});

cmd({
    pattern: 'weatherweek',
    alias: ['weekweather'],
    desc: '7-day weather forecast',
    category: 'tools',
    react: '🌤️',
    use: '.weatherweek Lahore',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const city = (ctx.q || 'Karachi').trim();
    try {
        const r = await axios.get(`https://wttr.in/${encodeURIComponent(city)}?format=j1`, { timeout: 15000 });
        const d = r.data.weather.slice(0, 7);
        const lines = d.map(day =>
            `📅 ${day.date}\n🌡️ ${day.mintempC}°C - ${day.maxtempC}°C\n☁️ ${day.hourly[0].weatherDesc[0].value}`
        );
        return ctx.reply(`🌤️ *7-DAY FORECAST — ${city}*\n\n${lines.join('\n\n')}`);
    } catch (e) { return ctx.reply('❌ Forecast fail.'); }
});

cmd({
    pattern: 'sunriseset',
    alias: ['sun'],
    desc: 'Sunrise/sunset time',
    category: 'tools',
    react: '🌅',
    use: '.sunriseset Karachi',
    filename: __filename
}, async (conn, mek, m, ctx) => {
    const city = (ctx.q || 'Karachi').trim();
    try {
        const r = await axios.get(`https://api.sunrise-sunset.org/json?lat=24.86&lng=67.01`, { timeout: 10000 });
        const d = r.data.results;
        return ctx.reply([
            `🌅 *SUNRISE/SUNSET — ${city}*`,
            '',
            `🌅 Sunrise: *${new Date(d.sunrise).toLocaleTimeString('en-GB')}*`,
            `🌇 Sunset: *${new Date(d.sunset).toLocaleTimeString('en-GB')}*`,
            `🌞 Day Length: *${(d.day_length / 3600).toFixed(1)} hours*`
        ].join('\n'));
    } catch (e) { return ctx.reply('❌ Sunrise fail.'); }
});
