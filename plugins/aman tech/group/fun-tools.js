// Auto-split from plugins/fun-tools.js — category: group
// (shared imports/helpers copied at top, only "group" commands below)

const { randomInt } = require('crypto');
const { cmd } = require('../arslan');
const jokes = [
  'Teacher: Homework kahan hai? Student: Sir, Wi-Fi nahi tha. Teacher: Homework online tha? Student: Nahi, excuse online dhoonda tha. 😅',
  'Phone ki battery ne charger se kaha: tum hamesha tab aate ho jab main bilkul khatam hoti hoon. 🔋',
  'Dost: Itni jaldi kyun so rahe ho? Main: Kal subah jaldi uthna hai. Dost: Alarm lagaya? Main: Nahi, umeed lagayi hai. 😄',
  'Programmer chai kyun peeta hai? Kyun ke uski life mein pehle hi bohat bugs hain. ☕'
];
function calculate(expression) {
  const source = String(expression || '').replace(/\s+/g, '');
  if (!source || source.length > 100 || !/^[0-9.+\-*/%^()]+$/.test(source)) {
    throw new Error('Sirf numbers aur + - * / % ^ ( ) use karein.');
  }

  const tokens = source.match(/(?:\d+(?:\.\d*)?|\.\d+)|[()+\-*/%^]/g) || [];
  if (tokens.join('') !== source) throw new Error('Expression ka format sahi nahi.');
  let index = 0;

  function primary() {
    const token = tokens[index++];
    if (token === '(') {
      const value = addSub();
      if (tokens[index++] !== ')') throw new Error('Closing bracket ) missing hai.');
      return value;
    }
    if (token === undefined || !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token)) {
      throw new Error('Number ya bracket expected tha.');
    }
    return Number(token);
  }

  function power() {
    const left = primary();
    if (tokens[index] === '^') {
      index++;
      return left ** unary();
    }
    return left;
  }

  function unary() {
    if (tokens[index] === '+') {
      index++;
      return unary();
    }
    if (tokens[index] === '-') {
      index++;
      return -unary();
    }
    return power();
  }

  function multiplyDivide() {
    let value = unary();
    while (['*', '/', '%'].includes(tokens[index])) {
      const operator = tokens[index++];
      const right = unary();
      if ((operator === '/' || operator === '%') && right === 0) {
        throw new Error('Zero se divide nahi kar sakte.');
      }
      if (operator === '*') value *= right;
      else if (operator === '/') value /= right;
      else value %= right;
    }
    return value;
  }

  function addSub() {
    let value = multiplyDivide();
    while (tokens[index] === '+' || tokens[index] === '-') {
      const operator = tokens[index++];
      const right = multiplyDivide();
      value = operator === '+' ? value + right : value - right;
    }
    return value;
  }

  const result = addSub();
  if (index !== tokens.length || !Number.isFinite(result)) {
    throw new Error('Expression incomplete hai ya result bohat bara hai.');
  }
  return Object.is(result, -0) ? 0 : Number(result.toPrecision(12));
}
function numberFromJid(jid) {
  return String(jid || '').split('@')[0].split(':')[0];
}

cmd({
  pattern: 'groupinfo',
  alias: ['ginfo', 'groupstats'],
  desc: 'Group ka naam, members aur description dekhein',
  category: 'group',
  react: '👥',
  filename: __filename
}, async (conn, mek, m, { from, isGroup, groupName, groupMetadata, participants, groupAdmins, reply }) => {
  if (!isGroup) return reply('Yeh command sirf group mein use hoti hai.');

  try {
    const metadata = groupMetadata || await conn.groupMetadata(from);
    const members = participants || metadata.participants || [];
    const adminJids = new Set(Array.isArray(groupAdmins) ? groupAdmins : []);
    const admins = members.filter(member =>
      member.admin === 'admin' || member.admin === 'superadmin' || adminJids.has(member.id)
    ).length;
    const createdAt = metadata.creation
      ? new Date(Number(metadata.creation) * 1000).toLocaleDateString('en-GB', { timeZone: 'Asia/Karachi' })
      : 'Maloom nahi';
    const description = String(metadata.desc || '').trim();
    const descriptionLine = description
      ? `\n📝 Description: ${description.slice(0, 240)}${description.length > 240 ? '…' : ''}`
      : '';

    return reply(
      `👥 *GROUP INFO*\n\n` +
      `📌 Naam: ${groupName || metadata.subject || 'Group'}\n` +
      `👤 Members: ${members.length}\n` +
      `🛡️ Admins: ${admins}\n` +
      `📅 Created: ${createdAt}${descriptionLine}`
    );
  } catch (_) {
    return reply('Group info nahi mil saki. Thori dair baad dobara try karein.');
  }
});

cmd({
  pattern: 'admins',
  alias: ['adminlist', 'gadmins'],
  desc: 'Group admins ki list dekhein',
  category: 'group',
  react: '🛡️',
  filename: __filename
}, async (conn, mek, m, { from, isGroup, groupAdmins, participants, reply }) => {
  if (!isGroup) return reply('Yeh command sirf group mein use hoti hai.');

  const adminJids = Array.isArray(groupAdmins) ? groupAdmins : [];
  const adminSet = new Set(adminJids);
  const admins = (participants || []).filter(member =>
    adminSet.has(member.id) || member.admin === 'admin' || member.admin === 'superadmin'
  );

  if (!admins.length) return reply('Admin list nahi mil saki; group info refresh karke dobara try karein.');

  const shown = admins.slice(0, 40);
  const lines = shown.map((member, index) => {
    const jid = member.id || '';
    const name = member.notify || member.name || `+${numberFromJid(jid)}`;
    const role = member.admin === 'superadmin' ? ' (owner)' : '';
    return `${index + 1}. @${numberFromJid(jid)}${role} — ${name}`;
  });
  const extra = admins.length > shown.length ? `\n…aur ${admins.length - shown.length} admins` : '';

  return conn.sendMessage(from, {
    text: `🛡️ *GROUP ADMINS (${admins.length})*\n\n${lines.join('\n')}${extra}`,
    mentions: shown.map(member => member.id).filter(Boolean)
  }, { quoted: mek });
});
