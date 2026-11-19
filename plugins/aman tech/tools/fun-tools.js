// Auto-split from plugins/fun-tools.js — category: tools
// (shared imports/helpers copied at top, only "tools" commands below)

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
  pattern: 'calc',
  alias: ['calculate', 'math'],
  desc: 'Safe calculator: + - * / % ^ aur brackets',
  category: 'tools',
  react: '🧮',
  use: '.calc (12 + 8) * 3',
  filename: __filename
}, async (conn, mek, m, { q, reply }) => {
  if (!q) return reply('Misal: *.calc (12 + 8) * 3*');
  try {
    return reply(`🧮 ${q} = *${calculate(q)}*`);
  } catch (error) {
    return reply(`Calculator: ${error.message}`);
  }
});
