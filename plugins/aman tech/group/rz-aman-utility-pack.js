// Auto-split from plugins/rz-aman-utility-pack.js — category: group
// (shared imports/helpers copied at top, only "group" commands below)

const { cmd } = require('../arslan');
const { getUserConfigFromMongoDB } = require('../lib/database');
const os = require('os');
const config = require('../config');
const AMAN_STARTED_AT = Date.now();
function duration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400), h = Math.floor(total % 86400 / 3600);
  const m = Math.floor(total % 3600 / 60), s = total % 60;
  return [d && `${d}d`, h && `${h}h`, m && `${m}m`, `${s}s`].filter(Boolean).join(' ');
}
function safeCalculate(expression) {
  const value = String(expression || '').replace(/[×]/g, '*').replace(/[÷]/g, '/').trim();
  if (!value || value.length > 80 || !/^[0-9+\-*/().%\s]+$/.test(value)) return null;
  // No eval: parse only arithmetic with a small recursive-descent parser.
  let i = 0;
  function ws(){ while (/\s/.test(value[i] || '') && i < value.length) i++; }
  function factor(){ ws(); if(value[i]==='+'){i++;return factor()} if(value[i]==='-'){i++;return -factor()} if(value[i]==='('){i++;const n=expr();ws();if(value[i++]!==')')throw Error();return n} const m=value.slice(i).match(/^(?:\d+(?:\.\d*)?|\.\d+)/);if(!m)throw Error();i+=m[0].length;return Number(m[0]); }
  function term(){let n=factor();for(;;){ws();const op=value[i];if(!['*','/','%'].includes(op))return n;i++;const r=factor();if((op==='/'||op==='%')&&r===0)throw Error();n=op==='*'?n*r:op==='/'?n/r:n%r;}}
  function expr(){let n=term();for(;;){ws();const op=value[i];if(op!=='+'&&op!=='-')return n;i++;const r=term();n=op==='+'?n+r:n-r;}}
  try { const result=expr(); ws(); return i===value.length && Number.isFinite(result) ? result : null; } catch { return null; }
}

cmd({ pattern:'groupinfo', alias:['ginfo'], desc:'Current group details', category:'group', react:'👥', filename:__filename }, async (conn, mek, m, ctx) => {
  if (!ctx.isGroup) return ctx.reply('❌ Yeh command group mein use karo.');
  let metadata; try { metadata = await conn.groupMetadata(ctx.from); } catch { return ctx.reply('❌ Group details fetch nahi ho sake.'); }
  const admins = (metadata.participants || []).filter(p => p.admin).length;
  return ctx.reply(`👥 *GROUP INFO*\n\n📛 Name: ${metadata.subject || 'Unknown'}\n🆔 ID: ${ctx.from}\n👤 Members: ${(metadata.participants||[]).length}\n🛡️ Admins: ${admins}\n📅 Created: ${metadata.creation ? new Date(metadata.creation*1000).toLocaleDateString() : 'N/A'}`);
});

cmd({ pattern:'admins', alias:['listadmins','tagadminlist'], desc:'List group admins', category:'group', react:'🛡️', filename:__filename }, async (conn, mek, m, ctx) => {
  if (!ctx.isGroup) return ctx.reply('❌ Yeh command group mein use karo.');
  let metadata; try { metadata = await conn.groupMetadata(ctx.from); } catch { return ctx.reply('❌ Admin list nahi mil saki.'); }
  const admins = (metadata.participants || []).filter(p => p.admin);
  if (!admins.length) return ctx.reply('Is group mein admin list nahi mili.');
  return conn.sendMessage(ctx.from, { text:`🛡️ *${metadata.subject || 'GROUP'} ADMINS*\n\n${admins.map((p,i)=>`${i+1}. @${String(p.id).split('@')[0].split(':')[0]}`).join('\n')}`, mentions:admins.map(p=>p.id) }, { quoted:mek });
});
