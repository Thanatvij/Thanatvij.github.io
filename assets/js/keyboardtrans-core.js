/* keyboardTrans — Kedmanee ↔ QWERTY layout fixer.
   A line-by-line port of KeyboardTran.py from github.com/Thanatvij/keyboardTrans (mapping table, the
   number-row special cases, the real-English-word list and the 30 % rule are copied unchanged).
   Works in the browser (window.KeyboardTrans) and in Node (module.exports) so the 27 documented
   cases from accuracy_test.py can run against it. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.KeyboardTrans = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // EN key → Thai character (TIS 820-2531). An array of pairs, not an object: JS objects reorder
  // integer-like keys ("1", "2"…), and TH_TO_EN below is "first-seen wins" so insertion order matters.
  const EN_TO_TH_PAIRS = [
    ['`', '_'], ['1', 'ๅ'], ['2', '/'], ['3', '-'], ['4', 'ภ'], ['5', 'ถ'],
    ['6', 'ุ'], ['7', 'ึ'], ['8', 'ค'], ['9', 'ต'], ['0', 'จ'], ['-', 'ข'], ['=', 'ช'],
    ['~', '%'], ['!', '+'], ['@', '๑'], ['#', '๒'], ['$', '๓'], ['%', '๔'], ['^', 'ู'],
    ['&', '฿'], ['*', '๕'], ['(', '๖'], [')', '๗'], ['_', '๘'], ['+', '๙'],
    ['q', 'ๆ'], ['w', 'ไ'], ['e', 'ำ'], ['r', 'พ'], ['t', 'ะ'], ['y', 'ั'], ['u', 'ี'],
    ['i', 'ร'], ['o', 'น'], ['p', 'ย'], ['[', 'บ'], [']', 'ล'], ['\\', 'ฃ'],
    ['Q', '๐'], ['W', '"'], ['E', 'ฎ'], ['R', 'ฑ'], ['T', 'ธ'], ['Y', 'ํ'], ['U', '๊'],
    ['I', 'ณ'], ['O', 'ฯ'], ['P', 'ญ'], ['{', 'ฐ'], ['}', ','], ['|', '.'],
    ['a', 'ฟ'], ['s', 'ห'], ['d', 'ก'], ['f', 'ด'], ['g', 'เ'], ['h', '้'], ['j', '่'],
    ['k', 'า'], ['l', 'ส'], [';', 'ว'], ["'", 'ง'],
    ['A', 'ฤ'], ['S', 'ฆ'], ['D', 'ฏ'], ['F', 'โ'], ['G', 'ฌ'], ['H', '็'], ['J', '๋'],
    ['K', 'ษ'], ['L', 'ศ'], [':', 'ซ'], ['"', 'ฺ'],
    ['z', 'ผ'], ['x', 'ป'], ['c', 'แ'], ['v', 'อ'], ['b', 'ิ'], ['n', 'ื'], ['m', 'ท'],
    [',', 'ม'], ['.', 'ใ'], ['/', 'ฝ'],
    ['Z', 'ฉ'], ['X', 'ฮ'], ['V', 'ฒ'], ['B', '?'], ['N', '์'], ['M', 'ฬ'], ['<', 'ฦ'],
  ];
  const EN_TO_TH = new Map(EN_TO_TH_PAIRS);

  // Thai → EN key; first-seen wins (e.g. ',' is the key for 'ม' but '}' also produces ',').
  const TH_TO_EN = new Map();
  for (const [k, v] of EN_TO_TH_PAIRS) if (!TH_TO_EN.has(v)) TH_TO_EN.set(v, k);

  // English words that are left alone
  const REAL_EN = new Set([
    'a', 'i', 'ok', 'hi', 'no', 'go', 'do', 'up', 'in', 'on', 'at', 'by', 'to', 'or',
    'the', 'and', 'for', 'but', 'not', 'you', 'are', 'was', 'has', 'had', 'can',
    'will', 'did', 'get', 'got', 'let', 'put', 'set', 'use', 'see', 'say', 'he',
    'she', 'we', 'it', 'me', 'my', 'his', 'her', 'its', 'our', 'them', 'they',
    'who', 'why', 'how', 'what', 'when', 'where', 'which', 'all', 'any', 'few',
    'more', 'some', 'into', 'than', 'then', 'very', 'just', 'also', 'back',
    'well', 'even', 'much', 'too', 'both', 'each', 'here', 'there', 'after',
    'before', 'about', 'over', 'under', 'same', 'own', 'off', 'out', 'world',
    'meeting', 'hello', 'bye', 'yes', 'lol', 'omg', 'wtf', 'bro', 'sis',
    'love', 'like', 'follow', 'post', 'share', 'link', 'id', 'name', 'call',
    'chat', 'work', 'home', 'school', 'food', 'shop', 'free', 'new', 'hot',
    'live', 'online', 'app', 'web', 'site', 'page', 'group', 'team', 'game',
    'project', 'zoom', 'email', 'phone', 'number', 'pls', 'msg', 'tmr', 'thx',
    'tbh', 'ngl', 'imo', 'fyi', 'asap', 'etc', 'vs', 'ft', 'america', 'israel',
    'deploy', 'server', 'config', 'crash', 'code', 'push', 'fix', 'bug',
    'test', 'run', 'build', 'error', 'log', 'git', 'dev', 'claude', 'python',
  ]);

  const THAI_RE = /[฀-๿]/;
  const NUMBER_ROW_TH_TO_EN = { 'ๅ': '1', '/': '2', '-': '3', 'ภ': '4', 'ถ': '5', 'ุ': '6', 'ึ': '7', 'ค': '8', 'ต': '9', 'จ': '0' };
  const THAI_DIGIT_TO_ASCII = { '๐': '0', '๑': '1', '๒': '2', '๓': '3', '๔': '4', '๕': '5', '๖': '6', '๗': '7', '๘': '8', '๙': '9' };
  const NUMBER_SEQ_MAP = { '/': '2', '_': '3', '-': '4' };

  const hasThai = (text) => THAI_RE.test(text);

  function enToTh(text) {
    let out = '';
    for (const c of text) out += EN_TO_TH.has(c) ? EN_TO_TH.get(c) : c;
    return out;
  }

  function thToEn(text) {
    let out = '';
    for (const c of text) {
      if (c.codePointAt(0) < 128) out += c;                                   // ASCII passes through
      else if (Object.prototype.hasOwnProperty.call(NUMBER_ROW_TH_TO_EN, c)) out += NUMBER_ROW_TH_TO_EN[c];
      else if (Object.prototype.hasOwnProperty.call(THAI_DIGIT_TO_ASCII, c)) out += THAI_DIGIT_TO_ASCII[c];
      else out += TH_TO_EN.has(c) ? TH_TO_EN.get(c) : c;
    }
    return out;
  }

  function fixToken(token) {
    if (/^\s+$/.test(token)) return token;
    if (REAL_EN.has(token.toLowerCase())) return token;
    if (/^\p{Nd}+$/u.test(token)) return token;                               // Python's \d is Unicode-aware
    if (/^[\p{Nd}/_\-]+$/u.test(token)) {                                     // digits typed on the Thai number row
      let out = '';
      for (const c of token) out += Object.prototype.hasOwnProperty.call(NUMBER_SEQ_MAP, c) ? NUMBER_SEQ_MAP[c] : c;
      return out;
    }
    const chars = Array.from(token);
    let mappable = 0;
    for (const c of chars) if (EN_TO_TH.has(c)) mappable++;
    if (chars.length > 0 && mappable / chars.length > 0.3) return enToTh(token);
    return token;
  }

  function fixAsciiSegment(text) {
    return text.split(/(\s+)/).filter((t) => t !== '' && t !== undefined).map(fixToken).join('');
  }

  /** Fix text typed with the wrong keyboard layout (auto-detects the direction). */
  function fix(text) {
    if (!text.trim()) return text;
    if (hasThai(text)) {
      const parts = text.split(/([฀-๿]+(?:[/_\-]*[฀-๿]+|[/\-_\p{Nd}]*)?)/u);
      let result = '';
      for (const part of parts) {
        if (!part) continue;
        if (hasThai(part)) {
          let converted = thToEn(part);
          converted = converted.replace(/\//g, '2').replace(/_/g, '3').replace(/-/g, '4');
          result += converted;
        } else result += fixAsciiSegment(part);
      }
      return result;
    }
    return fixAsciiSegment(text);
  }

  return { fix, enToTh, thToEn, hasThai, EN_TO_TH_PAIRS };
});
