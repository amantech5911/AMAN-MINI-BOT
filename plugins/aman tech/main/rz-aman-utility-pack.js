// Auto-split from plugins/rz-aman-utility-pack.js — category: main
// (shared imports/helpers copied at top, only "main" commands below)

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

cmd({ pattern:'owner', alias:['creator','dev'], desc:'Owner card with tappable links', category:'main', react:'👑', filename:__filename }, async (conn, mek, m, ctx) => {
  // Sab ke liye khula hai (info card ka "Owner" button bhi yahi chalata hai). Links: plugins/carousel-menu.js -> OWNER_LINKS
  const from = ctx.from || m.chat;
  const cm = require('./carousel-menu');
  const ok = await cm.sendOwnerCard(conn, from, mek);
  if (!ok) await conn.sendMessage(from, { text: cm.ownerCardText() }, { quoted: mek });
  await cm.sendOwnerContact(conn, from, mek);   // WhatsApp contact card (+923497081205) — "Message" button ke saath
});
