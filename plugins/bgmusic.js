// plugins/bgmusic.js — OWNER: apni voice note ke peeche background music
//   .bgmusic on | off          → chalu / band
//   .bgmusic status            → haal
//   .bgmusic vol 5-60          → music ki awaaz (voice ke muqable me, default 20)
//   .bgmusic set               → kisi audio/gane ko reply karke likho: wohi music ban jaye
//   .bgmusic reset             → apni music hata kar default music
// ON hone par jab tum (bot ka account) voice note bhejte ho, bot usme music mix karke naya voice note bhejta hai
// aur asli voice note delete kar deta hai. Data: data/bgmusic/ (Railway par Volume + env BGMUSIC_DIR).

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFile } = require('child_process');
const { cmd } = require('../arslan');
const config = require('../config');

let FFMPEG = 'ffmpeg';
try { FFMPEG = require('@ffmpeg-installer/ffmpeg').path || 'ffmpeg'; } catch (_) {}

const DIR = process.env.BGMUSIC_DIR || path.join(__dirname, '..', 'data', 'bgmusic');
const STATE_FILE = path.join(DIR, 'state.json');
const DEFAULT_TRACK = path.join(DIR, 'default-pad.ogg');
const ID_PREFIX = 'AMANBGM';               // apne bheje hue voice notes ki pehchaan (dobara process na ho)
const MAX_VOICE_SECONDS = 180;
const busy = new Set();
const P = () => config.PREFIX || '.';

const readState = () => { try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) || {}; } catch (_) { return {}; } };
const getState = (bot) => ({ enabled: false, volume: 20, ...(readState()[bot] || {}) });
function setState(bot, patch) {
    const all = readState();
    all[bot] = { ...getState(bot), ...patch };
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(STATE_FILE, JSON.stringify(all, null, 2));
    return all[bot];
}
const trackPath = (bot) => path.join(DIR, `track-${bot}.mp3`);
const hasCustom = (bot) => fs.existsSync(trackPath(bot));

function ff(args, timeout = 90000) {
    return new Promise((resolve, reject) => {
        execFile(FFMPEG, ['-y', '-hide_banner', '-loglevel', 'error', ...args], { timeout }, (err, _o, stderr) => {
            if (err) reject(new Error(String(stderr || err.message).split('\n')[0].slice(0, 160))); else resolve();
        });
    });
}

// Default music: halka sa soft synth pad (asli gana lagana ho to .bgmusic set)
async function ensureDefaultTrack() {
    if (fs.existsSync(DEFAULT_TRACK)) return DEFAULT_TRACK;
    fs.mkdirSync(DIR, { recursive: true });
    const expr = '(sin(2*PI*220*t)+0.7*sin(2*PI*277.18*t)+0.6*sin(2*PI*329.63*t)+0.4*sin(2*PI*110*t))*0.22*(0.85+0.15*sin(2*PI*0.2*t))';
    await ff(['-f', 'lavfi', '-i', `aevalsrc=${expr}:s=48000:d=60`, '-af', 'lowpass=f=1400,afade=t=in:d=2', '-c:a', 'libopus', '-b:a', '48k', DEFAULT_TRACK]);
    return DEFAULT_TRACK;
}

// voice + music -> naya ogg/opus voice note (music voice khatam hote hi ruk jata hai)
async function mix(voicePath, musicPath, volumePercent, outPath) {
    const vol = Math.max(0.05, Math.min(0.6, (Number(volumePercent) || 20) / 100));
    const filter = `[0:a]aformat=sample_rates=48000:channel_layouts=mono[v];` +
        `[1:a]aformat=sample_rates=48000:channel_layouts=mono,volume=${vol},afade=t=in:d=0.6[m];` +
        `[v][m]amix=inputs=2:duration=first:dropout_transition=0,volume=2[a]`;
    await ff(['-i', voicePath, '-stream_loop', '-1', '-i', musicPath, '-filter_complex', filter,
        '-map', '[a]', '-c:a', 'libopus', '-b:a', '48k', '-ar', '48000', '-ac', '1', '-f', 'ogg', outPath]);
}

async function downloadBuffer(media, kind) {
    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
    const stream = await downloadContentFromMessage(media, kind);
    const chunks = [];
    for await (const c of stream) chunks.push(c);
    return Buffer.concat(chunks);
}

// main.js se har fromMe message par bulaya jata hai
async function maybeProcess(conn, mek, from, bot) {
    const am = mek && mek.message && mek.message.audioMessage;
    if (!am || !am.ptt || !mek.key || !mek.key.fromMe) return;
    const id = String(mek.key.id || '');
    if (id.startsWith(ID_PREFIX) || busy.has(id)) return;
    if (!getState(bot).enabled) return;
    const ts = Number(mek.messageTimestamp && mek.messageTimestamp.low !== undefined ? mek.messageTimestamp.low : mek.messageTimestamp || 0);
    if (ts && Date.now() / 1000 - ts > 120) return;             // purani/history messages nahi
    if ((am.seconds || 0) > MAX_VOICE_SECONDS) return;

    busy.add(id);
    const tmp = path.join(os.tmpdir(), `bgm-${crypto.randomBytes(6).toString('hex')}`);
    const inFile = `${tmp}-in.bin`, outFile = `${tmp}-out.ogg`;
    try {
        const st = getState(bot);
        const music = hasCustom(bot) ? trackPath(bot) : await ensureDefaultTrack();
        fs.writeFileSync(inFile, await downloadBuffer(am, 'audio'));
        await mix(inFile, music, st.volume, outFile);
        await conn.sendMessage(from, { audio: fs.readFileSync(outFile), mimetype: 'audio/ogg; codecs=opus', ptt: true },
            { messageId: ID_PREFIX + crypto.randomBytes(8).toString('hex').toUpperCase() });
        await conn.sendMessage(from, { delete: mek.key }).catch(() => {});   // asli (bina music) voice hata do
    } catch (e) {
        console.error('bgmusic error:', e && e.message);     // fail ho to asli voice note waise hi rehta hai
    } finally {
        busy.delete(id);
        for (const f of [inFile, outFile]) { try { fs.unlinkSync(f); } catch (_) {} }
    }
}

cmd({
    pattern: 'bgmusic', alias: ['bgm'], desc: 'Apni voice note me background music (owner)',
    use: '.bgmusic on|off|status|vol 20|set|reset', category: 'owner', react: '🎶', filename: __filename
}, async (conn, mek, m, { args, reply, botNumber }) => {
    const p = P();
    const bot = botNumber;
    const sub = String(args[0] || '').toLowerCase();
    const st = getState(bot);

    if (sub === 'on') {
        try { if (!hasCustom(bot)) await ensureDefaultTrack(); }
        catch (e) { return reply(`❌ Music tayyar nahi ho saka (ffmpeg): ${e.message}`); }
        setState(bot, { enabled: true });
        return reply(`🎶 *Background music ON*\nAb jab tum voice note bhejoge, usme music mix hokar naya voice note jayega.\n\n🎵 Music: ${hasCustom(bot) ? 'tumhari apni' : 'default (soft pad)'}\n🔊 Awaaz: ${st.volume}%\n\nApna gana lagane ke liye kisi audio ko reply karke ${p}bgmusic set likho.`);
    }
    if (sub === 'off') { setState(bot, { enabled: false }); return reply('🔇 *Background music OFF*'); }

    if (sub === 'vol' || sub === 'volume') {
        const v = parseInt(args[1], 10);
        if (!Number.isInteger(v) || v < 5 || v > 60) return reply(`🔊 Format: ${p}bgmusic vol 5-60\nAbhi: ${st.volume}%`);
        setState(bot, { volume: v });
        return reply(`🔊 Music ki awaaz ${v}% kar di.`);
    }

    if (sub === 'set') {
        const ci = mek.message && mek.message.extendedTextMessage && mek.message.extendedTextMessage.contextInfo;
        const qm = ci && ci.quotedMessage;
        const media = qm && (qm.audioMessage || (qm.documentMessage && /audio|video/i.test(qm.documentMessage.mimetype || '') ? qm.documentMessage : null) || qm.videoMessage);
        if (!media) return reply(`🎵 Kisi gane / audio ko *reply* karke likho: ${p}bgmusic set`);
        if ((Number(media.fileLength) || 0) > 25 * 1024 * 1024) return reply('❌ File 25MB se badi hai.');
        const tmp = path.join(os.tmpdir(), `bgm-set-${crypto.randomBytes(6).toString('hex')}.bin`);
        try {
            fs.mkdirSync(DIR, { recursive: true });
            const kind = qm.audioMessage ? 'audio' : qm.videoMessage ? 'video' : 'document';
            fs.writeFileSync(tmp, await downloadBuffer(media, kind));
            await ff(['-i', tmp, '-vn', '-t', '300', '-ar', '44100', '-ac', '1', '-b:a', '96k', trackPath(bot)]);
            return reply(`✅ Tumhari music set ho gayi (max 5 minute).\n${p}bgmusic on likho agar band hai.`);
        } catch (e) {
            return reply(`❌ Ye file music ke taur par nahi chali: ${e.message}`);
        } finally { try { fs.unlinkSync(tmp); } catch (_) {} }
    }

    if (sub === 'reset') {
        try { fs.unlinkSync(trackPath(bot)); } catch (_) {}
        return reply('♻️ Apni music hata di, ab default music chalegi.');
    }

    return reply(`🎶 *BG MUSIC* — ${st.enabled ? 'ON ✅' : 'OFF ❌'}\n🎵 Music: ${hasCustom(bot) ? 'tumhari apni' : 'default (soft pad)'}\n🔊 Awaaz: ${st.volume}%\n\n${p}bgmusic on / off\n${p}bgmusic vol 5-60\n${p}bgmusic set (audio ko reply karke)\n${p}bgmusic reset`);
});

module.exports = { maybeProcess, mix, ensureDefaultTrack };
