/* Shared text helpers: used by the page and by scripts/kazakh-phrases.mjs, so audio keys always match. */
const clipKey = s => String(s).trim().toLowerCase().replace(/\s+/g, ' ');
// Russian line as it is spoken: no notes in brackets, «/» read as a short pause
const ruSay = s => String(s).replace(/\s*\([^)]*\)/g, '').replace(/\s*\/\s*/g, ', ').replace(/[«»]/g, '').trim();
const KK_WORD = /[A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]+(?:-[A-Za-zА-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]+)*/g;
const kkWords = s => String(s).match(KK_WORD) || [];
