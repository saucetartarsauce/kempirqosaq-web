/* ===== Кемпірқосақ — app ===== */
const LANGS = ['kk','ru','en'];
const LOC = { kk:'kk-KZ', ru:'ru-RU', en:'en-US' };
const LNAME = { kk:'ҚАЗ', ru:'РУС', en:'ENG' };
const LFLAG = { kk:'KZ', ru:'RU', en:'GB' };

/* ---------- state ---------- */
const S = (() => {
  const d = { lang:'kk', name:'', tr:true, rate:0.8, all:false, stars:{}, voice:{}, coins:0, seen:{}, giftShown:0, stress:true };
  const j = Store.load(); if (j) Object.assign(d, j);
  return d;
})();
function save(){ Store.save(S); }
const LI = () => LANGS.indexOf(S.lang);
const tr = a => a[LI()];

/* ---------- helpers ---------- */
const $ = (s, r=document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rnd = n => Math.floor(Math.random()*n);
const shuffle = a => { a = a.slice(); for (let i=a.length-1;i>0;i--){ const j=rnd(i+1); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const pick = a => a[rnd(a.length)];
const fmt = (s, v={}) => s.replace(/\{(\w+)\}/g, (_,k) => v[k] ?? '');
const flagEmoji = c => String.fromCodePoint(...[...c].map(ch => 0x1F1E6 + ch.charCodeAt(0) - 65));
const cap1 = s => s.charAt(0).toUpperCase() + s.slice(1);
/* show stress marks on Russian words (like in Russian school primers) */
function stressToken(tok){
  const plain = tok.replace(/-/g, '').toLowerCase();
  const idx = STRESS_RU[plain];
  if (idx == null) return esc(tok);
  let k = -1, out = '';
  for (const ch of tok) { if (ch !== '-') k++; out += (ch !== '-' && k === idx) ? `<span class="st">${esc(ch)}</span>` : esc(ch); }
  return out;
}
function rt(text, lang = S.lang){
  text = String(text ?? '');
  if (lang !== 'ru' || !S.stress) return esc(text);
  let out = '', last = 0;
  text.replace(/[А-Яа-яЁё-]+/g, (m, off) => { out += esc(text.slice(last, off)) + stressToken(m); last = off + m.length; return m; });
  return out + esc(text.slice(last));
}
function rtParts(parts, lang = S.lang){
  if (lang !== 'ru' || !S.stress) return parts.map(esc);
  const idx = STRESS_RU[parts.join('').toLowerCase()]; let off = 0;
  return parts.map(p => { let h = ''; for (let i = 0; i < p.length; i++) h += (idx === off + i) ? `<span class="st">${esc(p[i])}</span>` : esc(p[i]); off += p.length; return h; });
}

/* ---------- UI strings [kk, ru, en] ---------- */
const UI = {
  sub:['мектепке дайындық','готовимся к школе','getting ready for school'],
  hi:['Сәлем, {n}!','Привет, {n}!','Hi, {n}!'],
  friend:['досым','друг','friend'],
  hiSub:['Бүгін не үйренеміз? Тақырыпты таңда!','Что будем учить сегодня? Выбери тему!','What shall we learn today? Pick a topic!'],
  secRead:['Оқу','Чтение','Reading'], secMath:['Математика','Математика','Math'], secWorld:['Қоршаған әлем','Мир вокруг','The world'], secKnow:['Дүниетану','Познание мира','Discover the world'],
  level:['Деңгей','Уровень','Level'], levels:['деңгей','уровней','levels'],
  learnHint:['Карточканы бас та, тыңда!','Нажимай на карточки и слушай!','Tap the cards and listen!'],
  playAll:['Барлығын тыңда','Слушать всё','Listen to all'],
  play:['Ойнаймыз!','Играем!',"Let's play!"],
  again:['Қайтадан','Ещё раз','Again'],
  next:['Келесі деңгей','Следующий уровень','Next level'],
  toTopic:['Деңгейлер','Уровни','Levels'],
  back:['Артқа','Назад','Back'],
  done:['Деңгей өтілді!','Уровень пройден!','Level complete!'],
  allDone:['Барлық деңгей өтілді! Енді басқа тілде байқап көр.','Все уровни пройдены! Попробуй на другом языке.','All levels done! Now try another language.'],
  locked:['Алдымен алдыңғы деңгейді өт!','Сначала пройди прошлый уровень!','Finish the previous level first!'],
  tryAgain:['Тағы байқап көр!','Попробуй ещё!','Try again!'],
  praise:[['Жарайсың!','Керемет!','Тамаша!','Бәрекелді!','Өте жақсы!'],['Молодец!','Отлично!','Супер!','Умница!','Здорово!'],['Well done!','Great!','Awesome!','Super!','Excellent!']],
  settings:['Ата-аналарға','Для родителей','For parents'],
  childName:['Баланың аты','Имя ребёнка',"Child's name"],
  showTr:['Аударманы басқа екі тілде көрсету','Показывать перевод на двух других языках','Show translation in the other two languages'],
  speed:['Дауыс жылдамдығы','Скорость голоса','Voice speed'],
  slow:['баяу','медленно','slow'], fast:['жылдам','быстро','fast'],
  unlock:['Барлық деңгейді бірден ашу','Открыть все уровни сразу','Unlock all levels at once'],
  voices:['Дауыстар','Голоса','Voices'],
  auto:['Автоматты','Автоматически','Automatic'],
  test:['Тыңдау','Прослушать','Test'],
  reset:['Прогресті өшіру','Сбросить прогресс','Reset progress'],
  resetSure:['Иә, барлық жұлдызды өшіру','Да, удалить все звёзды','Yes, delete all stars'],
  cancel:['Болдырмау','Отмена','Cancel'],
  close:['Дайын','Готово','Done'],
  noVoice:['дауыс жоқ','нет голоса','no voice'],
  kkNote:[
    'Бұл құрылғыда қазақ дауысы жоқ. Қазақ сөздерін {v} оқиды. Ең жақсы нұсқа — компьютерде Microsoft Edge браузері: онда Айгүл мен Дәулет есімді қазақ дауыстары бар.',
    'На этом устройстве нет казахского голоса. Казахские слова читает {v}. Лучший вариант — браузер Microsoft Edge на компьютере: там есть казахские голоса Айгуль и Даулет.',
    'This device has no Kazakh voice. Kazakh words are read by {v}. The best option is Microsoft Edge on a computer: it has the Kazakh voices Aigul and Daulet.'],
  viaTr:['түрік дауысы (ол қазақшаға ең жақын, екпіні дұрыс)','турецкий голос (он ближе всего к казахскому произношению и ставит ударение правильно)','a Turkish voice (the closest to Kazakh pronunciation)'],
  viaRu:['орыс дауысы (акцентпен). Құрылғыға түрік дауысын қосыңыз','русский голос (с акцентом). Добавьте на устройство турецкий голос','a Russian voice (with an accent). Add a Turkish voice to the device'],
  kkOk:['Қазақ дауысы бар: {v}','Казахский голос найден: {v}','Kazakh voice found: {v}'],
  kkRec:['Қазақ дауысы алдын ала жазылған ({n} фраза). Жүйелік дауыс тек жазбасы жоқ сөздерге (мысалы, баланың атына) керек.','Казахский голос записан заранее ({n} фраз). Системный голос нужен только для слов без записи (например, имени ребёнка).','Kazakh voice is pre-recorded ({n} phrases). The system voice is only used for words without a recording (e.g. the child’s name).'],
  hello:['Сәлем!','Привет!','Hi!'],
  ages:['5–9 жас','5–9 лет','ages 5–9'],
  fruit:['Жеміс','Фрукт','Fruit'], vegetable:['Көкөніс','Овощ','Vegetable'],
  allIn:['Барлығы','Всё вместе','All together'],
  stars:['жұлдыз','звёзд','stars'],
  coins:['ұпай','баллы','points'],
  gifts:['Менің сыйлықтарым','Мои подарки','My gifts'],
  giftNew:['Сыйлық! Жарайсың!','Подарок! Молодец!','A gift! Well done!'],
  toNext:['Келесі сыйлыққа дейін: {n}','До следующего подарка: {n}','Next gift in: {n}'],
  giftHint:['Әр дұрыс жауап үшін ұпай жина! Әр 100 ұпай — жаңа сыйлық.','Собирай баллы за каждое правильное слово! Каждые 100 баллов — новый подарок.','Collect points for every right answer! Every 100 points is a new gift.'],
  giftsGot:['Жиналды: {a} / {b}','Собрано: {a} из {b}','Collected: {a} of {b}'],
  bonus:['Сыйлық ұпай: +{n}','Бонус за уровень: +{n}','Level bonus: +{n}'],
  showStress:['Орыс сөздерінде екпінді көрсету','Показывать ударения в русских словах','Show stress marks in Russian words'],
  slowBtn:['Баяу','Медленно','Slowly'],
  iosTip:['iPhone-да дауыс анығырақ болуы үшін: Баптаулар → Арнайы мүмкіндіктер → Ауызша мазмұн → Дауыстар. «Жақсартылған» орыс және ағылшын дауыстарын жүктеп алыңыз.','Чтобы голос на iPhone звучал чётче: Настройки → Универсальный доступ → Устное содержимое → Голоса. Скачайте русский и английский голос с пометкой «улучшенный».','For a clearer voice on iPhone: Settings → Accessibility → Spoken Content → Voices. Download the Russian and English voices marked "Enhanced".'],
  progress:['Жұлдыздар әр тілде бөлек санайды.','Звёзды считаются отдельно для каждого языка.','Stars are counted separately for each language.']
};
const t = (k, v) => fmt(tr(UI[k]), v);

const P = {
  hearPick:['{w} қайда?','Где {w}?','Where is the {w}?'],
  what:['Бұл не?','Что это?','What is this?'],
  whatColor:['Бұл қандай түс?','Какой это цвет?','What color is this?'],
  objColor:['Бұл қандай түсті?','Какого это цвета?','What color is it?'],
  whatPlanet:['Бұл қай планета?','Какая это планета?','Which planet is this?'],
  findLetter:['{x} әрпін тап','Найди букву {x}','Find the letter {x}'],
  firstLetter:['Сөз қай әріптен басталады?','С какой буквы начинается слово?','Which letter does the word start with?'],
  findSyl:['{x} буынын тап','Найди слог {x}','Find the word {x}'],
  buildWord:['Сөзді құрастыр','Собери слово','Build the word'],
  readPick:['Оқы да, суретін тап','Прочитай и найди картинку','Read and find the picture'],
  listenPick:['Тыңда да, суретін тап','Послушай и найди картинку','Listen and find the picture'],
  buildSent:['Сөйлемді құрастыр','Собери предложение','Build the sentence'],
  howMany:['Нешеу? Санап көр!','Сколько? Посчитай!','How many? Count them!'],
  findNum:['{x} санын тап','Найди число {x}','Find the number {x}'],
  after:['{x} санынан кейін қай сан келеді?','Какое число идёт после {x}?','What number comes after {x}?'],
  eqQ:['{a} {op} {b} неше болады?','Сколько будет {a} {op} {b}?','What is {a} {op} {b}?'],
  eqSay:['{a} {op} {b} тең {c}','{a} {op} {b} равно {c}','{a} {op} {b} equals {c}'],
  missing:['{a} қосу қанша — {c} болады?','{a} плюс сколько будет {c}?','{a} plus what makes {c}?'],
  groups:['Барлығы нешеу? {a} {op} {b}','Сколько всего? {a} {op} {b}','How many in all? {a} {op} {b}'],
  share:['{n} затты {k} тәрелкеге тең бөл. Әр тәрелкеде нешеу?','Раздели {n} поровну на {k} тарелки. Сколько на каждой?','Share {n} equally on {k} plates. How many on each?'],
  flagPick:['{x} туын тап','Найди флаг: {x}','Find the flag: {x}'],
  flagWhose:['Бұл қай елдің туы?','Чей это флаг?','Whose flag is this?'],
  capital:['{x}: астанасы қай қала?','{x}: какая столица?','{x}: what is the capital?'],
  capOf:['Астанасы: {x}','Столица: {x}','Capital: {x}'],
  sort:['Жеміс пе, көкөніс пе?','Это фрукт или овощ?','Is it a fruit or a vegetable?'],
  odd:['Артығы қайсы?','Что здесь лишнее?','Which one does not belong?'],
  next:['Әрі қарай не тұрады?','Что будет дальше?','What comes next?'],
  more:['Қай жерде көп?','Где больше?','Where are there more?'],
  fewer:['Қай жерде аз?','Где меньше?','Where are there fewer?'],
  biggest:['Ең үлкені қайсы?','Кто самый большой?','Which one is the biggest?'],
  smallest:['Ең кішісі қайсы?','Кто самый маленький?','Which one is the smallest?'],
  then:['Одан кейін не болады?','Что будет потом?','What happens next?'],
  missNum:['Қай сан жетпейді?','Какое число пропущено?','Which number is missing?']
};
const OPS = { '+':['қосу','плюс','plus'], '−':['алу','минус','minus'], '×':['көбейту','умножить на','times'], '÷':['бөлу','разделить на','divided by'] };
const p = (k, v) => fmt(tr(P[k]), v);

/* ---------- speech ---------- */
let VOICES = [];
function loadVoices(){ try { VOICES = speechSynthesis.getVoices() || []; } catch(e) { VOICES = []; } }
if ('speechSynthesis' in window) { loadVoices(); speechSynthesis.onvoiceschanged = () => { loadVoices(); if (settingsOpen) renderSettings(); }; }
const vLang = v => (v.lang || '').replace('_','-').toLowerCase();
function voicesFor(l){ return VOICES.filter(v => vLang(v).startsWith(l)); }
function voiceFor(l){
  const list = voicesFor(l);
  if (S.voice[l]) { const v = list.find(v => v.name === S.voice[l]); if (v) return v; }
  const score = v => (/natural|neural/i.test(v.name) ? 5 : 0) + (/online|premium|enhanced|улучш|siri/i.test(v.name) ? 3 : 0) + (/google/i.test(v.name) ? 2 : 0) + (v.localService ? 0 : 1) - (/compact|espeak/i.test(v.name) ? 3 : 0)
    + (l === 'en' && /en-us/.test(vLang(v)) ? 1 : 0);
  return list.slice().sort((a,b) => score(b) - score(a))[0] || null;
}
const KK2TR = { 'а':'a','ә':'e','б':'b','в':'v','г':'g','ғ':'g','д':'d','е':'e','ё':'yo','ж':'j','з':'z','и':'i','й':'y','к':'k','қ':'k','л':'l','м':'m','н':'n','ң':'ng','о':'o','ө':'ö','п':'p','р':'r','с':'s','т':'t','у':'u','ұ':'u','ү':'ü','ф':'f','х':'h','һ':'h','ц':'ts','ч':'ç','ш':'ş','щ':'ş','ъ':'','ы':'ı','і':'i','ь':'','э':'e','ю':'yu','я':'ya' };
// Kazakh written in Turkish letters: Turkish is a related Turkic language with the same vowels (ө, ү, ы) and final-syllable stress
function kk2tr(text){
  return String(text).replace(/[А-Яа-яЁёӘәҒғҚқҢңӨөҰұҮүҺһІі]+/g, w => {
    let out = '';
    [...w].forEach((ch, i) => {
      const lo = ch.toLowerCase(); let m = KK2TR[lo]; if (m == null) { out += ch; return; }
      if (lo === 'е' && i === 0) m = 'ye';
      if (ch !== lo && m) m = m.charAt(0).toLocaleUpperCase('tr') + m.slice(1);
      out += m;
    });
    return out;
  });
}
const KK2RU = { 'ә':'э','Ә':'Э','ө':'ё','Ө':'Ё','ү':'ю','Ү':'Ю','ұ':'у','Ұ':'У','қ':'к','Қ':'К','ғ':'г','Ғ':'Г','ң':'нг','Ң':'НГ','і':'и','І':'И','һ':'х','Һ':'Х' };
const LETTER_SAY = { kk:{'ъ':'жуан белгі','ь':'жіңішке белгі'}, ru:{'ъ':'твёрдый знак','ь':'мягкий знак','й':'и краткое'} };
let audioUnlocked = false;
function unlockAudio(){
  if (audioUnlocked) return; audioUnlocked = true;
  try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch(e) {}
  try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
  Clips.unlock();
}
document.addEventListener('pointerdown', () => { try { if (AC && AC.state === 'suspended') AC.resume(); } catch(e) {} }, true);
// system voice — used only for phrases that have no pre-recorded clip (e.g. the child's name)
function ttsSay(text, l, onstart, opt = {}){
  return new Promise(done => {
    if (!('speechSynthesis' in window)) return done();
    let v = voiceFor(l), txt = String(text), lang = LOC[l];
    if (!v && l === 'kk') {
      const trv = voiceFor('tr');
      if (trv) { v = trv; lang = 'tr-TR'; txt = kk2tr(txt); }
      else { v = voiceFor('ru'); lang = 'ru-RU'; txt = txt.replace(/[әӘөӨүҮұҰқҚғҒңҢіІһҺ]/g, c => KK2RU[c]); }
    }
    const u = new SpeechSynthesisUtterance(txt);
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = lang;
    u.rate = speechRate(txt, opt); u.pitch = 1;
    if (onstart) u.onstart = onstart;
    // some engines never fire onend — don't let the queue hang
    const guard = setTimeout(done, 2500 + txt.length * 160 / u.rate);
    u.onend = u.onerror = () => { clearTimeout(guard); done(); };
    speechSynthesis.speak(u);
  });
}
// single words are read a little slower so every sound is clear; 🐢 / a second tap reads slower still
const speechRate = (text, opt = {}) => Math.max(0.5, S.rate * (/\s/.test(String(text).trim()) ? 1 : 0.92) * (opt.slow ? 0.7 : 1));
// list: [[text, lang, onstart?], ...] — played one after another; a new call interrupts the old one
let speakSeq = 0;
async function speak(list, opt = {}){
  if (!Array.isArray(list[0])) list = [list];
  const id = ++speakSeq;
  Clips.stop();
  try { speechSynthesis.cancel(); } catch(e) {}
  for (const [text, l0, onstart] of list) {
    if (id !== speakSeq) return;
    if (!text) continue;
    const l = l0 || S.lang;
    if (Clips.has(text, l) && await Clips.play(text, l, speechRate(text, opt), onstart)) continue;
    await ttsSay(text, l, onstart, opt);
  }
}
const say = (text, l) => speak([[text, l]]);

/* ---------- sound fx ---------- */
let AC = null;
function tone(freq, start, dur, type='sine', vol=0.18){
  if (!AC) return;
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, AC.currentTime + start);
  g.gain.exponentialRampToValueAtTime(vol, AC.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime + start + dur);
  o.connect(g).connect(AC.destination); o.start(AC.currentTime + start); o.stop(AC.currentTime + start + dur + 0.05);
}
const sfxOk = () => { tone(660,0,.15); tone(880,.1,.15); tone(1175,.2,.25); };
const sfxNo = () => { tone(240,0,.18,'triangle',.15); tone(190,.12,.22,'triangle',.12); };
const sfxWin = () => { [523,659,784,1047,1319].forEach((f,i) => tone(f, i*.11, .3, 'sine', .16)); };

/* ---------- confetti ---------- */
const RAINBOW = ['#FF4D5E','#FF9A1F','#FFD23F','#3DCB8A','#27BEF0','#5574F7','#A35BFF'];
function confetti(n=90){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const c = $('#fx2'); const x = c.getContext('2d');
  c.width = innerWidth * devicePixelRatio; c.height = innerHeight * devicePixelRatio;
  const parts = Array.from({length:n}, () => ({ x: innerWidth/2 + (Math.random()-.5)*innerWidth*.4, y: innerHeight*.45, vx:(Math.random()-.5)*14, vy: -Math.random()*14-4, r: Math.random()*6+4, c: pick(RAINBOW), a: Math.random()*6, s:(Math.random()-.5)*.3 }));
  let f = 0;
  (function tick(){
    x.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0); x.clearRect(0,0,innerWidth,innerHeight);
    for (const q of parts) { q.vy += .45; q.x += q.vx; q.y += q.vy; q.a += q.s; x.save(); x.translate(q.x,q.y); x.rotate(q.a); x.fillStyle = q.c; x.fillRect(-q.r,-q.r/2,q.r*2,q.r); x.restore(); }
    if (++f < 110) requestAnimationFrame(tick); else x.clearRect(0,0,innerWidth,innerHeight);
  })();
}

/* ---------- points, gifts, fireworks ---------- */
const GIFT_STEP = 100;
const STICKERS = ['🦄','🐶','🐱','🐼','🦊','🐯','🐸','🐵','🐧','🦉','🦋','🐬','🐳','🦖','🐉','🌈','⭐','🌙','☀️','🍭','🍦','🧁','🎈','🎀','👑','💎','🚀','🛸','🎠','🏰','🧸','🪁','🎨','🎹','🥁','⚽','🏆','🌸','🐞','🦜','🐢','🐙','🍉','🎂','🌻','🧚','🦕','🐠','🎁','🪅'];
function seenKey(c){ const w = c.w ? c.w[2] : (c.label || (c.pic && (c.pic.letter || c.pic.text)) || ''); return w ? S.lang + ':' + V_.topic + ':' + w : null; }
function addCoins(n, fromEl){
  if (!n) return;
  S.coins += n; save();
  const pill = $('.coinpill'), num = $('#coinN');
  const r = fromEl && fromEl.getBoundingClientRect ? fromEl.getBoundingClientRect() : { left: innerWidth/2, top: innerHeight/2, width: 0, height: 0 };
  const sx = r.left + r.width/2, sy = r.top + r.height/2;
  const f = document.createElement('div'); f.className = 'coinfly'; f.innerHTML = `+${n} <span class="emo">🪙</span>`;
  f.style.left = sx + 'px'; f.style.top = sy + 'px';
  document.body.appendChild(f);
  const tgt = pill ? pill.getBoundingClientRect() : { left: innerWidth - 90, top: -40, width: 60, height: 30 };
  requestAnimationFrame(() => requestAnimationFrame(() => {
    f.style.transform = `translate(calc(-50% + ${tgt.left + tgt.width/2 - sx}px), calc(-50% + ${tgt.top + tgt.height/2 - sy}px)) scale(.55)`;
    f.style.opacity = '0.15';
  }));
  setTimeout(() => {
    f.remove();
    if (num) { num.textContent = S.coins; pill.classList.remove('bump'); void pill.offsetWidth; pill.classList.add('bump'); }
    tone(1568, 0, .08, 'square', .04); tone(2093, .06, .14, 'square', .04);
  }, 800);
}
const giftsEarned = () => Math.min(STICKERS.length, Math.floor(S.coins / GIFT_STEP));
function showGiftIfAny(){
  if (S.giftShown >= giftsEarned()) return;
  const st = STICKERS[S.giftShown]; S.giftShown++; save();
  let g = $('#giftbox'); if (!g) { g = document.createElement('div'); g.id = 'giftbox'; document.body.appendChild(g); }
  g.innerHTML = `<div class="scrim" data-act="closegift"></div><div class="giftcard" role="dialog" aria-modal="true">
    <div class="box"><span class="emo lid">🎁</span><span class="emo prize">${st}</span></div>
    <h2>${esc(t('giftNew'))}</h2><button class="btn big go" data-act="closegift"><span class="emo">👍</span></button></div>`;
  g.hidden = false; fireworks(12); sfxWin(); say(t('giftNew'));
}
function renderGifts(){
  const got = giftsEarned(), left = GIFT_STEP - (S.coins % GIFT_STEP);
  app().innerHTML = header() + `<main class="wrap gifts">
    <div class="tophead"><button class="btn ghost" data-act="giftsback">← ${esc(t('back'))}</button><h1><span class="emo">🎁</span> ${esc(t('gifts'))}</h1></div>
    <section class="coinbank">
      <div class="bigcoin"><span class="emo">🪙</span><b>${S.coins}</b><small>${esc(t('coins'))}</small></div>
      <div class="nextg"><p>${esc(t('giftHint'))}</p>
        ${got < STICKERS.length ? `<div class="gbar"><i style="width:${(GIFT_STEP - left) / GIFT_STEP * 100}%"></i></div><p class="gnext">${esc(t('toNext', {n: left}))} <span class="emo">🪙</span></p>` : ''}
        <p class="gnext">${esc(t('giftsGot', {a: got, b: STICKERS.length}))}</p></div>
    </section>
    <div class="album">${STICKERS.map((e, i) => i < got ? `<button class="stk" data-sticker="${i}"><span class="emo">${e}</span></button>` : `<span class="stk lockd"><span class="emo">❔</span></span>`).join('')}</div>
  </main>`;
}

/* fireworks: rockets rise and burst into coloured sparks */
const FW = { parts: [], rockets: [], running: false };
function fwLoop(){
  const c = $('#fx'), x = c.getContext('2d');
  if (c.width !== Math.round(innerWidth * devicePixelRatio)) { c.width = Math.round(innerWidth * devicePixelRatio); c.height = Math.round(innerHeight * devicePixelRatio); }
  x.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  x.clearRect(0, 0, innerWidth, innerHeight);
  for (const r of FW.rockets) {
    r.y += r.vy; r.vy += 0.12; r.t--;
    r.trail.push([r.x, r.y]); if (r.trail.length > 8) r.trail.shift();
    r.trail.forEach(([tx, ty], i) => { x.globalAlpha = i / 10; x.fillStyle = '#FFB347'; x.beginPath(); x.arc(tx, ty, 2, 0, 7); x.fill(); });
    x.globalAlpha = 1; x.fillStyle = '#FFF3B0'; x.beginPath(); x.arc(r.x, r.y, 3, 0, 7); x.fill();
    if (r.vy >= -0.8 || r.t <= 0) { r.done = true; burst(r.x, r.y, 90); sfxPop(); }
  }
  FW.rockets = FW.rockets.filter(r => !r.done);
  for (const p of FW.parts) {
    p.vx *= 0.982; p.vy = p.vy * 0.982 + 0.055; p.x += p.vx; p.y += p.vy; p.life -= p.decay;
    x.globalAlpha = Math.max(0, p.life); x.fillStyle = p.c;
    x.beginPath(); x.arc(p.x, p.y, p.r * (0.5 + p.life * 0.7), 0, 7); x.fill();
    if (p.life > 0.5 && Math.random() < 0.08) { x.fillStyle = '#fff'; x.beginPath(); x.arc(p.x, p.y, 1.2, 0, 7); x.fill(); }
  }
  x.globalAlpha = 1;
  FW.parts = FW.parts.filter(p => p.life > 0);
  if (FW.parts.length || FW.rockets.length) requestAnimationFrame(fwLoop);
  else { FW.running = false; x.clearRect(0, 0, innerWidth, innerHeight); }
}
function fwStart(){ if (!FW.running) { FW.running = true; requestAnimationFrame(fwLoop); } }
function burst(cx, cy, n = 80, small = false){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const col = pick(RAINBOW), col2 = pick(RAINBOW), sp = small ? 3 : 5.5;
  for (let i = 0; i < n; i++) {
    const a = Math.PI * 2 * i / n + Math.random() * 0.2, v = sp * (0.45 + Math.random() * 0.75);
    FW.parts.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: small ? 2.3 : 3, c: Math.random() < 0.5 ? col : col2, life: 1, decay: 0.012 + Math.random() * 0.012 });
  }
  fwStart();
}
function fireworks(n = 8){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < n; i++) setTimeout(() => {
    FW.rockets.push({ x: innerWidth * (0.12 + Math.random() * 0.76), y: innerHeight + 10, vy: -Math.sqrt(2 * 0.12 * innerHeight * (0.45 + Math.random() * 0.3)), t: 160, trail: [] });
    fwStart();
  }, i * 280);
}
function sfxPop(){
  if (!AC) return;
  try {
    const len = Math.floor(AC.sampleRate * 0.35), b = AC.createBuffer(1, len, AC.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    const s = AC.createBufferSource(), g = AC.createGain(), f = AC.createBiquadFilter();
    f.type = 'lowpass'; f.frequency.value = 1800; g.gain.value = 0.2;
    s.buffer = b; s.connect(f).connect(g).connect(AC.destination); s.start();
  } catch(e) {}
}

/* ---------- items & pictures ---------- */
const item = (e, kk, ru, en, extra={}) => ({ pic:{e}, w:[kk,ru,en], key:en, ...extra });
const fromV = arr => arr.map(r => item(...r));
function picHTML(pc, cls=''){
  if (!pc) return '';
  if (pc.e) return `<span class="emo ${cls}">${pc.e}</span>`;
  if (pc.flag) return `<span class="emo flag ${cls}">${flagEmoji(pc.flag)}</span>`;
  if (pc.color) return `<span class="swatch ${cls}" style="--c:${pc.color}"></span>`;
  if (pc.planet) return `<span class="planet pl-${pc.planet} ${cls}"><i></i></span>`;
  if (pc.letter) return `<span class="bigletter ${cls}">${pc.letter}</span>`;
  if (pc.text) return `<span class="bigtext ${cls}">${rt(pc.text)}</span>`;
  if (pc.count) return `<span class="countbox ${cls}">${Array.from({length:pc.count}, () => `<span class="emo">${pc.ce}</span>`).join('')}</span>`;
  if (pc.num != null) return `<span class="numpic ${cls}"><b>${pc.num}</b>${pc.num>0 && pc.num<=10 ? `<span class="dots">${Array.from({length:pc.num},()=>`<span class="emo">${pc.ce}</span>`).join('')}</span>` : ''}</span>`;
  if (pc.eq) return eqHTML(pc.eq);
  if (pc.seq) return `<span class="seqrow ${cls}">${pc.seq.map(x => x == null ? '<span class="qbox">?</span>' : typeof x === 'number' ? `<b>${x}</b>` : `<span class="emo">${x}</span>`).join(pc.arrows ? '<span class="sarr">→</span>' : '')}</span>`;
  if (pc.groups) { const {a,b,ce} = pc.groups; return `<span class="eq"><span class="plates">${Array.from({length:a},()=>`<span class="plate">${Array.from({length:b},()=>`<span class="emo">${ce}</span>`).join('')}</span>`).join('')}</span><span class="eqline">${a} × ${b} = ${pc.groups.show ? a*b : '<span class="qbox">?</span>'}</span></span>`; }
  if (pc.share) { const {n,k,ce} = pc.share; return `<span class="eq"><span class="grp wide">${Array.from({length:n},()=>`<span class="emo">${ce}</span>`).join('')}</span><span class="arrow">⬇</span><span class="plates">${Array.from({length:k},()=>`<span class="plate">${pc.share.show ? Array.from({length:n/k},()=>`<span class="emo">${ce}</span>`).join('') : ''}</span>`).join('')}</span><span class="eqline">${n} ÷ ${k} = ${pc.share.show ? n/k : '<span class="qbox">?</span>'}</span></span>`; }
  return '';
}
function eqHTML(q){
  const g = (n, crossFrom=99) => `<span class="grp">${Array.from({length:n},(_,i)=>`<span class="emo ${i>=crossFrom?'x':''}">${q.ce}</span>`).join('')}</span>`;
  const ans = q.show ? `<b class="ans">${q.c}</b>` : '<span class="qbox">?</span>';
  if (q.op === '×' || q.op === '÷') return `<span class="eq numonly"><span class="eqline big">${q.a} ${q.op} ${q.b} = ${ans}</span></span>`;
  if (!q.pics) {
    if (q.missing) return `<span class="eq numonly"><span class="eqline big">${q.a} + <span class="qbox">?</span> = ${q.c}</span></span>`;
    return `<span class="eq numonly"><span class="eqline big">${q.a} ${q.op} ${q.b} = ${ans}</span></span>`;
  }
  if (q.missing) return `<span class="eq"><span class="row">${g(q.a)}<span class="op">+</span><span class="qbox">?</span><span class="op">=</span>${g(q.c)}</span><span class="eqline">${q.a} + ${q.show ? `<b class="ans">${q.b}</b>` : '?'} = ${q.c}</span></span>`;
  if (q.op === '−') return `<span class="eq"><span class="row">${g(q.a, q.a - q.b)}</span><span class="eqline">${q.a} − ${q.b} = ${ans}</span></span>`;
  return `<span class="eq"><span class="row">${g(q.a)}<span class="op">+</span>${g(q.b)}</span><span class="eqline">${q.a} + ${q.b} = ${ans}</span></span>`;
}

/* ---------- question builders ---------- */
const N_Q = 8;
function others(it, pool, n){
  const sameKey = o => o.key === it.key || (o.pic.e && o.pic.e === it.pic.e) || tr(o.w) === tr(it.w);
  return shuffle(pool.filter(o => !sameKey(o))).slice(0, n);
}
function optFrom(o, ok, mode){ return { pic: mode !== 'text' ? o.pic : null, label: mode !== 'pic' ? tr(o.w) : null, say: tr(o.w), ok }; }
function qHear(it, pool, n=4){
  const opts = shuffle([it, ...others(it, pool, n-1)]);
  const w = tr(it.w);
  return { prompt: p('hearPick', {w}), speak: p('hearPick', {w}), mode:'pic', options: opts.map(o => optFrom(o, o === it, 'pic')) };
}
function qSee(it, pool, n=4, key='what'){
  const opts = shuffle([it, ...others(it, pool, n-1)]);
  return { prompt: p(key), speak: p(key), pic: it.pic, mode:'text', options: opts.map(o => optFrom(o, o === it, 'text')) };
}
function qRiddle(r, pool){
  const it = pool.find(o => o.key === r[3]);
  const grp = pool.filter(o => o.grp === it.grp);
  const opts = shuffle([it, ...others(it, grp.length >= 4 ? grp : pool, 3)]);
  const q = tr(r);
  return { prompt: q, speak: q, mode:'both', options: opts.map(o => optFrom(o, o === it, 'both')) };
}
function vocabQuiz(items, pool, step){
  // step 0 = easiest (hear & pick, 3 options); later: mix with reading
  const sel = shuffle(items).slice(0, N_Q);
  return sel.map((it, i) => step === 0 ? qHear(it, pool, 3) : (i % 2 ? qSee(it, pool, 4) : qHear(it, pool, 4)));
}
function mixedQuiz(pool, n=10){
  return shuffle(pool).slice(0, n).map((it, i) => i % 2 ? qSee(it, pool, 4) : qHear(it, pool, 4));
}
const cardOf = it => ({ pic: it.pic, w: it.w, sub: it.sub, key: it.key });

/* simple vocab topic: groups -> levels + mixed level */
function vocabLevels(groups, opts={}){
  const pool = groups.flatMap((g, gi) => g.items.map(it => (it.grp = gi, it)));
  const lv = groups.map((g, gi) => ({
    t: g.t, learn: () => g.items.map(cardOf),
    quiz: () => g.quiz ? g.quiz(g.items, pool) : vocabQuiz(g.items, g.items.length >= 6 ? g.items : pool, gi === 0 ? 0 : 1)
  }));
  if (opts.extra) lv.push(...opts.extra(pool));
  if (opts.mixed !== false) lv.push({ t: opts.mixedT || UI.allIn, learn: null, quiz: () => opts.riddles ? shuffle(opts.riddles).slice(0, N_Q).map(r => qRiddle(r, pool)) : mixedQuiz(pool) });
  return lv;
}

/* ---------- topics ---------- */
const FRUIT_E = ['🍎','🍐','🍊','🍋','🍌','🍓','🍒','🥕','🍇','🥝','🍑','🥒'];
const TOPICS = [];
const T = (id, sec, e, name, levels) => TOPICS.push({ id, sec, e, name, levels });

/* Alphabet */
T('abc', 'read', '🔤', ['Әліппе','Азбука','Alphabet'], lang => {
  const A = ALPHA[lang];
  const sizes = { kk:[11,11,10,10], ru:[11,11,11], en:[9,9,8] }[lang];
  const lsay = L => (LETTER_SAY[lang] || {})[L.toLowerCase()] || (lang === 'en' ? L : L.toLowerCase());
  const okFirst = A.filter(a => a[3]);
  const firstQ = (a) => {
    const blank = '_' + a[1].slice(1);
    const opts = shuffle([a[0], ...shuffle(A.filter(b => b[0] !== a[0] && !/[ЪЬ]/.test(b[0]))).slice(0,3).map(b=>b[0])]);
    return { prompt: p('firstLetter'), speak: [[p('firstLetter'), lang],[a[1], lang]], pic:{e:a[2]}, caption: blank, mode:'letter',
      options: opts.map(L => ({ label: L, ok: L === a[0], say: lsay(L), sayAfter: a[1] })) };
  };
  const findQ = (a, chunk, n) => {
    const opts = shuffle([a, ...shuffle(chunk.filter(b => b !== a)).slice(0, n-1)]);
    const sp = p('findLetter', {x: lsay(a[0])});
    return { prompt: p('findLetter', {x: a[0]}), speak: sp, mode:'letter', options: opts.map(b => ({ label: b[0] + (lang==='en'? b[0].toLowerCase() : b[0].toLowerCase()), ok: b === a, say: lsay(b[0]) })) };
  };
  let i = 0; const lv = [];
  sizes.forEach((sz, ci) => {
    const chunk = A.slice(i, i + sz); i += sz;
    lv.push({ t: Array(3).fill(`${chunk[0][0]} – ${chunk[chunk.length-1][0]}`),
      learn: () => chunk.map(a => ({ pic:{letter: a[0] + a[0].toLowerCase()}, small: a[2], label: a[1], say: [[lsay(a[0]), lang], [a[1], lang]] })),
      quiz: () => shuffle(chunk).slice(0, N_Q).map((a, k) => (k % 2 && a[3]) ? firstQ(a) : findQ(a, chunk, ci === 0 ? 3 : 4)) });
  });
  lv.push({ t: UI.allIn, learn: null, quiz: () => shuffle(okFirst).slice(0, 10).map(firstQ) });
  return lv;
});

/* Syllables */
T('syl', 'read', '🧩', ['Буындар','Слоги','Syllables'], lang => {
  const D = SYL[lang];
  const word = s => s.replace(/-/g, '');
  const sylItems = D.s.map(s => ({ s, e: lang === 'en' ? SYL_EN_PICS[s] : null }));
  const w2 = D.w2.map(([s,e]) => ({ s, e })), w3 = D.w3.map(([s,e]) => ({ s, e }));
  const wcard = x => ({ pic:{e:x.e}, label: word(x.s), chips: x.s.split('-').map(c => ({ t:c, say:c })), say: [[word(x.s), lang]] });
  const buildQ = x => { const parts = x.s.split('-'); let pcs = shuffle(parts); if (new Set(parts).size > 1) while (pcs.join('') === parts.join('')) pcs = shuffle(parts);
    return { build:true, prompt: p('buildWord'), speak: [[p('buildWord'), lang],[word(x.s), lang]], pic:{e:x.e}, pieces: pcs, answer: parts, joiner:'', full: word(x.s) }; };
  const readQ = (x, pool) => { const opts = shuffle([x, ...shuffle(pool.filter(y => y.e !== x.e)).slice(0,3)]);
    return { prompt: p('readPick'), speak: p('readPick'), pic:{ text: x.s }, hint: word(x.s), mode:'pic', options: opts.map(y => ({ pic:{e:y.e}, ok: y === x, say: word(y.s) })) }; };
  return [
    { t: ['Буындар','Слоги','Short words'],
      learn: () => sylItems.map(x => ({ pic: x.e ? {e:x.e} : {text:x.s}, label: x.e ? x.s.toLowerCase() : null, say: [[x.s.toLowerCase(), lang]] })),
      quiz: () => shuffle(sylItems).slice(0, N_Q).map(x => { const opts = shuffle([x, ...shuffle(sylItems.filter(y => y !== x)).slice(0,3)]);
        return { prompt: p('findSyl', {x: x.s}), speak: p('findSyl', {x: x.s.toLowerCase()}), mode:'text', big:true, options: opts.map(y => ({ label: y.s, ok: y === x, say: y.s.toLowerCase() })) }; }) },
    { t: ['Екі буынды сөздер','Слова из двух слогов','Two-part words'], learn: () => w2.map(wcard), quiz: () => shuffle(w2).slice(0, N_Q).map(buildQ) },
    { t: ['Үш буынды сөздер','Слова из трёх слогов','Three-part words'], learn: () => w3.map(wcard), quiz: () => shuffle(w3).slice(0, N_Q).map(buildQ) },
    { t: ['Өзім оқимын','Читаю сам','I can read'], learn: null, quiz: () => shuffle([...w2, ...w3]).slice(0, N_Q).map(x => readQ(x, [...w2, ...w3])) }
  ];
});

/* Sentences */
T('sent', 'read', '📖', ['Сөйлемдер','Предложения','Sentences'], lang => {
  const li = LANGS.indexOf(lang);
  const items = SENT.map(r => ({ e: r[0], s: r[1+li], w: [r[1], r[2], r[3]], long: r[4] }));
  const short = items.filter(x => !x.long), long = items.filter(x => x.long);
  const words = s => s.replace(/[.!?]$/, '').split(' ');
  const card = x => ({ pic:{e:x.e}, label: null, sentence: true, w: x.w, chips: words(x.s).map(c => ({ t:c, say:c })), say: [[x.s, lang]] });
  const buildQ = x => { const parts = words(x.s); let pcs = shuffle(parts); if (new Set(parts).size > 1) while (pcs.join(' ') === parts.join(' ')) pcs = shuffle(parts);
    return { build:true, prompt: p('buildSent'), speak: [[p('buildSent'), lang],[x.s, lang]], pic:{e:x.e}, pieces: pcs, answer: parts, joiner:' ', full: x.s }; };
  const pickQ = (x, pool, read) => { const opts = shuffle([x, ...shuffle(pool.filter(y => y !== x)).slice(0,3)]);
    return { prompt: p(read ? 'readPick' : 'listenPick'), speak: read ? p('readPick') : [[p('listenPick'), lang],[x.s, lang]], pic: read ? {text: x.s} : null, hint: x.s, mode:'pic', options: opts.map(y => ({ pic:{e:y.e}, ok: y === x, say: y.s })) }; };
  return [
    { t: ['Қысқа сөйлемдер','Короткие предложения','Short sentences'], learn: () => short.map(card), quiz: () => shuffle(short).slice(0, N_Q).map(x => pickQ(x, short, false)) },
    { t: ['Сөйлем құрастыр','Собери предложение','Build a sentence'], learn: null, quiz: () => shuffle(short).slice(0, N_Q).map(buildQ) },
    { t: ['Ұзын сөйлемдер','Длинные предложения','Long sentences'], learn: () => long.map(card), quiz: () => shuffle(long).slice(0, N_Q).map(buildQ) },
    { t: ['Оқып, түсін','Читаю и понимаю','Read and understand'], learn: null, quiz: () => shuffle(items).slice(0, N_Q).map(x => pickQ(x, items, true)) }
  ];
});

/* Numbers */
function numOpts(ans, n, min=0, max=100, spread=3){
  const s = new Set([ans]); let guard = 0;
  while (s.size < n && guard++ < 200) { const v = ans + (rnd(spread*2+1) - spread); if (v >= min && v <= max) s.add(v); }
  return shuffle([...s]);
}
const numItem = n => ({ pic:{num:n, ce: FRUIT_E[n % FRUIT_E.length]}, w: LANGS.map(l => numWord(n, l)), key:'n'+n });
T('num', 'math', '🔢', ['Сандар','Цифры и счёт','Numbers'], () => {
  const countQ = (lo, hi, n) => { const k = lo + rnd(hi - lo + 1), ce = pick(FRUIT_E);
    return { prompt: p('howMany'), speak: p('howMany'), pic:{count:k, ce}, mode:'num', options: numOpts(k, n, Math.max(0, lo-1), hi+1, 2).map(v => ({ label: String(v), ok: v === k, say: numWord(v, S.lang) })) }; };
  const findQ = (k, n, spread) => ({ prompt: p('findNum', {x: numWord(k, S.lang)}), speak: p('findNum', {x: numWord(k, S.lang)}), mode:'num',
      options: numOpts(k, n, 0, 100, spread).map(v => ({ label: String(v), ok: v === k, say: numWord(v, S.lang) })) });
  const afterQ = k => ({ prompt: p('after', {x: k}), speak: p('after', {x: numWord(k, S.lang)}), mode:'num', options: numOpts(k+1, 4, 0, 100, 2).map(v => ({ label: String(v), ok: v === k+1, say: numWord(v, S.lang) })) });
  const range = (a, b) => Array.from({length: b-a+1}, (_, i) => a+i);
  return [
    { t: ['0 – 5','0 – 5','0 – 5'], learn: () => range(0,5).map(n => cardOf(numItem(n))), quiz: () => Array.from({length:N_Q}, () => countQ(1, 5, 3)) },
    { t: ['6 – 10','6 – 10','6 – 10'], learn: () => range(6,10).map(n => cardOf(numItem(n))), quiz: () => Array.from({length:N_Q}, () => countQ(3, 10, 4)) },
    { t: ['11 – 20','11 – 20','11 – 20'], learn: () => range(11,20).map(n => cardOf(numItem(n))), quiz: () => shuffle(range(11,20)).slice(0,N_Q).map(k => findQ(k, 4, 3)) },
    { t: ['10, 20 … 100','10, 20 … 100','10, 20 … 100'], learn: () => range(1,10).map(n => cardOf(numItem(n*10))), quiz: () => shuffle(range(1,10)).slice(0,N_Q).map(k => { const q = findQ(k*10, 1, 0); const o = new Set([k*10]); while (o.size < 4) o.add((1+rnd(10))*10); q.options = shuffle([...o]).map(v => ({ label:String(v), ok: v === k*10, say: numWord(v, S.lang) })); return q; }) },
    { t: ['100-ге дейін','До 100','Up to 100'], learn: () => [21,35,47,58,64,76,83,99].map(n => cardOf(numItem(n))), quiz: () => Array.from({length:N_Q}, (_, i) => i % 2 ? afterQ(10 + rnd(89)) : findQ(21 + rnd(79), 4, 11)) }
  ];
});

/* Plus / minus */
function eqQ(a, op, b, opts){
  const c = op === '+' ? a + b : a - b, ce = pick(FRUIT_E), L = S.lang;
  const v = { a: numWord(a, L), b: numWord(b, L), op: tr(OPS[op]) };
  const pc = { eq: { a, b, c, op, ce, pics: opts.pics, missing: opts.missing } };
  if (opts.missing) return { prompt: p('missing', {a, c: a + b}), speak: p('missing', {a: v.a, c: numWord(a + b, L)}), pic: { eq: { a, b, c: a + b, op:'+', ce, pics: opts.pics, missing:true } }, mode:'num',
      options: numOpts(b, opts.n, 0, 20, 2).map(x => ({ label:String(x), ok: x === b, say: numWord(x, L) })) };
  return { prompt: p('eqQ', {a, b, op}), speak: p('eqQ', v), pic: pc, mode:'num', options: numOpts(c, opts.n, 0, 40, 2).map(x => ({ label:String(x), ok: x === c, say: numWord(x, L) })) };
}
function eqCard(a, op, b, pics=true){
  const c = op === '+' ? a+b : op === '−' ? a-b : op === '×' ? a*b : a/b;
  const ce = pick(FRUIT_E);
  const pic = op === '×' ? { groups:{a, b, ce, show:true} } : op === '÷' ? { share:{n:a, k:b, ce, show:true} } : { eq:{ a, b, c, op, ce, pics, show:true } };
  return { pic, wide:true, label: '', say: [[fmt(tr(P.eqSay), { a: numWord(a,S.lang), b: numWord(b,S.lang), c: numWord(c,S.lang), op: tr(OPS[op]) })]] };
}
T('add', 'math', '➕', ['Қосу мен азайту','Сложение и вычитание','Plus and minus'], () => {
  const gen = (fn) => Array.from({length:N_Q}, fn);
  return [
    { t: ['Қосу: 5-ке дейін','Плюс: до 5','Plus up to 5'], learn: () => [eqCard(1,'+',1), eqCard(2,'+',1), eqCard(2,'+',3)],
      quiz: () => gen(() => { const a = 1 + rnd(4); return eqQ(a, '+', 1 + rnd(5 - a), { pics:true, n:3 }); }) },
    { t: ['Азайту: 5-ке дейін','Минус: до 5','Minus up to 5'], learn: () => [eqCard(3,'−',1), eqCard(5,'−',2), eqCard(4,'−',4)],
      quiz: () => gen(() => { const a = 2 + rnd(4); return eqQ(a, '−', 1 + rnd(a), { pics:true, n:3 }); }) },
    { t: ['Қосу мен азайту: 10','Плюс и минус: до 10','Plus and minus to 10'], learn: () => [eqCard(4,'+',3), eqCard(9,'−',4), eqCard(5,'+',5)],
      quiz: () => gen((_, i) => { if (i % 2) { const a = 3 + rnd(8); return eqQ(a, '−', 1 + rnd(a), { pics:true, n:4 }); } const a = 1 + rnd(9); return eqQ(a, '+', 1 + rnd(10 - a), { pics:true, n:4 }); }) },
    { t: ['20-ға дейін','До 20','Up to 20'], learn: () => [eqCard(12,'+',5,false), eqCard(18,'−',6,false), eqCard(9,'+',9,false)],
      quiz: () => gen((_, i) => { if (i % 2) { const a = 8 + rnd(13); return eqQ(a, '−', 1 + rnd(a - 2), { pics:false, n:4 }); } const a = 5 + rnd(11); return eqQ(a, '+', 1 + rnd(20 - a), { pics:false, n:4 }); }) },
    { t: ['Жетпейтін сан','Найди пропущенное','Missing number'], learn: null,
      quiz: () => gen((_, i) => { const a = 1 + rnd(6), b = 1 + rnd(9 - a); return eqQ(a, '+', b, { pics: i < 4, missing:true, n:4 }); }) }
  ];
});

/* Times / divide */
T('mul', 'math', '✖️', ['Көбейту мен бөлу','Умножение и деление','Times and divide'], () => {
  const L = () => S.lang;
  const grpQ = (a, b, n) => { const ce = pick(FRUIT_E), c = a*b;
    const sp = p('groups', { a: numWord(a, L()), b: numWord(b, L()), op: tr(OPS['×']) });
    return { prompt: p('groups', {a, b, op:'×'}), speak: sp, pic:{ groups:{a, b, ce} }, mode:'num', options: numOpts(c, n, 0, 30, 3).map(x => ({ label:String(x), ok:x===c, say:numWord(x, L()) })) }; };
  const shareQ = (k, per) => { const ce = pick(FRUIT_E), n = k*per;
    return { prompt: p('share', {n, k}), speak: p('share', { n: numWord(n, L()), k: numWord(k, L()) }), pic:{ share:{n, k, ce} }, mode:'num', options: numOpts(per, 4, 0, 12, 2).map(x => ({ label:String(x), ok:x===per, say:numWord(x, L()) })) }; };
  const tableQ = (i) => { const a = 2 + rnd(8), b = 2 + rnd(8);
    if (i % 2) { const n = a*b; return { prompt: p('eqQ', {a:n, b:a, op:'÷'}), speak: p('eqQ', {a:numWord(n, L()), b:numWord(a, L()), op:tr(OPS['÷'])}), pic:{ eq:{a:n, b:a, op:'÷', pics:false} }, mode:'num', options: numOpts(b, 4, 0, 12, 2).map(x => ({label:String(x), ok:x===b, say:numWord(x, L())})) }; }
    return { prompt: p('eqQ', {a, b, op:'×'}), speak: p('eqQ', {a:numWord(a, L()), b:numWord(b, L()), op:tr(OPS['×'])}), pic:{ eq:{a, b, op:'×', pics:false} }, mode:'num', options: numOpts(a*b, 4, 0, 100, 4).map(x => ({label:String(x), ok:x===a*b, say:numWord(x, L())})) }; };
  return [
    { t: ['Екіден көбейту','Умножаем на 2','Times 2'], learn: () => [eqCard(2,'×',1), eqCard(2,'×',3), eqCard(3,'×',2)],
      quiz: () => Array.from({length:N_Q}, (_, i) => i % 2 ? grpQ(1 + rnd(5), 2, 3) : grpQ(2, 1 + rnd(5), 3)) },
    { t: ['3, 4, 5-ке көбейту','Умножаем на 3, 4, 5','Times 3, 4, 5'], learn: () => [eqCard(3,'×',3), eqCard(4,'×',2), eqCard(2,'×',5)],
      quiz: () => Array.from({length:N_Q}, () => grpQ(2 + rnd(3), 2 + rnd(4), 4)) },
    { t: ['Тең бөлеміз','Делим поровну','Share equally'], learn: () => [eqCard(4,'÷',2), eqCard(6,'÷',3), eqCard(8,'÷',4)],
      quiz: () => Array.from({length:N_Q}, () => shareQ(2 + rnd(3), 1 + rnd(4))) },
    { t: ['Көбейту кестесі','Таблица умножения','Times table'], learn: null, quiz: () => Array.from({length:10}, (_, i) => tableQ(i)) }
  ];
});

/* Logic */
T('logic', 'math', '🧠', ['Логика','Логика','Logic'], () => {
  const G = Object.fromEntries(['fruit','veg','farm','wild','water','insects','products','room','kitchen','school','space','body1'].map(k => [k, fromV(V[k])]));
  // odd one out: [main group, group the odd item comes from]
  const FAR = [['fruit','farm'],['fruit','school'],['veg','wild'],['farm','kitchen'],['wild','fruit'],['insects','room'],['school','veg'],['kitchen','insects'],['room','fruit'],['space','farm'],['body1','veg'],['products','school']];
  const NEAR = [['fruit','veg'],['veg','fruit'],['farm','wild'],['wild','farm'],['insects','farm'],['school','kitchen'],['kitchen','school'],['room','kitchen']];
  const oddQ = ([a, b]) => {
    const main = shuffle(G[a]).slice(0, 3), odd = pick(G[b].filter(o => !main.some(m => m.pic.e === o.pic.e)));
    return { prompt: p('odd'), speak: p('odd'), mode:'pic', options: shuffle([...main, odd]).map(o => ({ pic: o.pic, ok: o === odd, say: tr(o.w) })) };
  };
  // patterns: 🍎🍌🍎🍌🍎 ?
  const PAT = { AB:[0,1], AAB:[0,0,1], ABB:[0,1,1], ABC:[0,1,2], AABB:[0,0,1,1] };
  const patQ = kinds => {
    const unit = PAT[pick(kinds)], n = Math.max(...unit) + 1;
    const els = shuffle(G[pick(['fruit','veg','farm','wild'])]).slice(0, n + 1);
    const len = unit.length * 2 + rnd(unit.length);
    const ans = els[unit[len % unit.length]];
    return { prompt: p('next'), speak: p('next'), pic:{ seq: [...Array.from({length: len}, (_, i) => els[unit[i % unit.length]].pic.e), null] }, mode:'pic',
      options: shuffle(els).map(o => ({ pic: o.pic, ok: o === ans, say: tr(o.w) })) };
  };
  // where are there more / fewer
  const cmpQ = n => {
    const more = rnd(2) === 0, ce = pick(FRUIT_E);
    const ks = shuffle(Array.from({length: 10}, (_, i) => i + 1)).slice(0, n);
    const target = more ? Math.max(...ks) : Math.min(...ks);
    return { prompt: p(more ? 'more' : 'fewer'), speak: p(more ? 'more' : 'fewer'), mode:'pic', options: ks.map(k => ({ pic:{count:k, ce}, ok: k === target, say: numWord(k, S.lang) })) };
  };
  // who is the biggest / smallest — [key, size tier]
  const SIZE = [['ant',0],['ladybug',0],['bee',0],['frog',1],['hen',2],['duck',2],['cat',2],['rabbit',2],['fox',3],['dog',3],['sheep',3],['goat',3],['wolf',3],['cow',4],['horse',4],['bear',4],['camel',4],['tiger',4],['elephant',5],['giraffe',5],['whale',6]];
  const ANIM = [...G.farm, ...G.wild, ...G.water, ...G.insects];
  const sizeQ = n => {
    const chosen = shuffle([...new Set(SIZE.map(s => s[1]))]).slice(0, n).map(tier => pick(SIZE.filter(s => s[1] === tier)));
    const big = rnd(2) === 0;
    const target = chosen.reduce((a, b) => (big ? b[1] > a[1] : b[1] < a[1]) ? b : a);
    return { prompt: p(big ? 'biggest' : 'smallest'), speak: p(big ? 'biggest' : 'smallest'), mode:'pic',
      options: chosen.map(c => { const o = ANIM.find(x => x.key === c[0]); return { pic: o.pic, ok: c === target, say: tr(o.w) }; }) };
  };
  // what happens next: life cycles, day, seasons (cyc = goes round)
  const CHAINS = [
    { cyc:0, it:[['🥚','жұмыртқа','яйцо','egg'],['🐣','балапан','цыплёнок','chick'],['🐔','тауық','курица','hen']] },
    { cyc:0, it:[['🌰','тұқым','семечко','seed'],['🌱','өскін','росток','sprout'],['🌳','ағаш','дерево','tree']] },
    { cyc:0, it:[['🐛','жұлдызқұрт','гусеница','caterpillar'],['🦋','көбелек','бабочка','butterfly']] },
    { cyc:0, it:[['👶','нәресте','малыш','baby'],['🧒','бала','ребёнок','child'],['🧑','ересек','взрослый','grown-up'],['👴','ата','дедушка','grandpa']] },
    { cyc:0, it:[['🌾','бидай','пшеница','wheat'],['🍞','нан','хлеб','bread']] },
    { cyc:0, it:[['🧱','кірпіш','кирпич','brick'],['🏠','үй','дом','house']] },
    { cyc:1, it:[['🌅','таң','утро','morning'],['☀️','күндіз','день','day'],['🌇','кеш','вечер','evening'],['🌙','түн','ночь','night']] },
    { cyc:1, it:[['🌷','көктем','весна','spring'],['🏖️','жаз','лето','summer'],['🍂','күз','осень','autumn'],['❄️','қыс','зима','winter']] }
  ];
  const chainCard = ch => ({ pic:{ seq: ch.it.map(r => r[0]), arrows:true }, wide:true, label: ch.it.map(r => r[1 + LI()]).join(' → '), say: ch.it.map(r => [r[1 + LI()]]) });
  const chainQ = () => {
    const ch = pick(CHAINS), items = ch.it.map(r => item(...r)), len = items.length;
    const start = ch.cyc ? rnd(len) : 0, shown = ch.cyc ? 1 + rnd(2) : 1 + rnd(len - 1);
    const seq = Array.from({length: shown}, (_, i) => items[(start + i) % len]), ans = items[(start + shown) % len];
    const same = shuffle(items.filter(x => x !== ans && !seq.includes(x))).slice(0, 1);
    const other = shuffle(CHAINS.filter(c => c !== ch).flatMap(c => c.it.map(r => item(...r))));
    const opts = shuffle([ans, ...[...same, ...other].slice(0, 2)]);
    return { prompt: p('then'), speak: p('then'), pic:{ seq: [...seq.map(x => x.pic.e), null], arrows:true }, mode:'pic', options: opts.map(o => ({ pic: o.pic, ok: o === ans, say: tr(o.w) })) };
  };
  // number patterns: [step, min start, max start]
  const numSeqQ = hard => {
    const [step, lo, hi] = pick(hard ? [[2,1,12],[5,0,20],[10,10,50],[-2,10,20],[3,0,9],[-10,50,100]] : [[1,0,12],[1,5,15],[-1,6,10],[2,0,2],[10,10,10]]);
    const start = step === 10 || step === -10 ? Math.round((lo + rnd(hi - lo + 1)) / 10) * 10 : lo + rnd(hi - lo + 1);
    const seq = Array.from({length: 5}, (_, i) => start + i * step), miss = hard ? 1 + rnd(4) : 4, ans = seq[miss];
    return { prompt: p('missNum'), speak: p('missNum'), pic:{ seq: seq.map((v, i) => i === miss ? null : v) }, mode:'num',
      options: numOpts(ans, 4, 0, 100, Math.max(2, Math.abs(step))).map(v => ({ label: String(v), ok: v === ans, say: numWord(v, S.lang) })) };
  };
  const gen = fn => Array.from({length: N_Q}, (_, i) => fn(i));
  return [
    { t: ['Артығы қайсы?','Что лишнее?','Odd one out'], learn: null, quiz: () => gen(() => oddQ(pick(FAR))) },
    { t: ['Қатарды жалғастыр','Продолжи ряд','What comes next?'], learn: null, quiz: () => gen(i => patQ(i < 4 ? ['AB'] : ['AB','AAB','ABB'])) },
    { t: ['Қайсысы көп?','Где больше?','More or fewer?'], learn: null, quiz: () => gen(i => cmpQ(i < 4 ? 2 : 3)) },
    { t: ['Үлкен және кіші','Большой и маленький','Big and small'], learn: null, quiz: () => gen(i => sizeQ(i < 4 ? 2 : 3)) },
    { t: ['Кейін не болады?','Что потом?','What happens next?'], learn: () => CHAINS.map(chainCard), quiz: () => gen(chainQ) },
    { t: ['Сандар қатары','Числовой ряд','Number patterns'], learn: null, quiz: () => gen(i => numSeqQ(i >= 4)) },
    { t: ['Қиын өрнектер','Сложные узоры','Tricky patterns'], learn: null, quiz: () => gen(() => patQ(['ABC','AAB','ABB','AABB'])) },
    { t: ['Артығы қайсы: қиын','Что лишнее: сложно','Odd one out: hard'], learn: null, quiz: () => gen(() => oddQ(pick(NEAR))) },
    { t: UI.allIn, learn: null, quiz: () => shuffle([oddQ(pick(NEAR)), patQ(['ABC','AAB']), cmpQ(3), sizeQ(3), chainQ(), numSeqQ(true), oddQ(pick(FAR)), patQ(['ABB','AABB']), numSeqQ(false), chainQ()]) }
  ];
});

/* Countries */
const CONT = {
  famous:['Танымал елдер','Известные страны','Famous countries'], as:['Азия','Азия','Asia'], eu:['Еуропа','Европа','Europe'],
  af:['Африка','Африка','Africa'], na:['Солтүстік Америка','Северная Америка','North America'], sa:['Оңтүстік Америка','Южная Америка','South America'], oc:['Австралия және Океания','Австралия и Океания','Australia and Oceania']
};
const FAMOUS = ['KZ','RU','CN','KG','UZ','TJ','TM','TR','US','GB','FR','DE','JP','KR','IT','ES'];
const CTRY = COUNTRIES.map(r => ({ pic:{flag:r[0]}, key:r[0], code:r[0], cont:r[1], w:[r[2], r[3], r[4]], cap: r[5] ? [r[5], r[6], r[7]] : null }));
function countryChunks(filter){
  const list = CTRY.filter(filter);
  const out = [{ t: CONT.famous, items: FAMOUS.map(c => list.find(x => x.code === c)).filter(Boolean) }];
  for (const c of ['as','eu','sa','na','af','oc']) {
    const rest = list.filter(x => x.cont === c && !FAMOUS.includes(x.code));
    const parts = Math.max(1, Math.round(rest.length / 13)), size = Math.ceil(rest.length / parts);
    for (let i = 0; i < parts; i++) out.push({ t: CONT[c].map(n => parts > 1 ? `${n} · ${i+1}` : n), items: rest.slice(i*size, (i+1)*size) });
  }
  return out;
}
T('flags', 'world', '🚩', ['Елдердің туы','Флаги стран','Flags'], () => countryChunks(() => true).map((ch, ci) => ({
  t: ch.t, learn: () => ch.items.map(cardOf),
  quiz: () => shuffle(ch.items).slice(0, N_Q).map((it, i) => {
    const pool = ch.items.length >= 6 ? ch.items : CTRY;
    if (i % 2) return qSee(it, pool, ci === 0 ? 3 : 4, 'flagWhose');
    const q = qHear(it, pool, ci === 0 ? 3 : 4); q.prompt = q.speak = p('flagPick', { x: tr(it.w) }); return q;
  })
})));
T('caps', 'world', '🏙️', ['Елдер мен астаналар','Страны и столицы','Countries and capitals'], () => countryChunks(x => !!x.cap).map(ch => ({
  t: ch.t, learn: () => ch.items.map(it => ({ ...cardOf(it), capital: it.cap })),
  quiz: () => shuffle(ch.items).slice(0, N_Q).map(it => {
    const pool = ch.items.length >= 6 ? ch.items : CTRY.filter(x => x.cap);
    const opts = shuffle([it, ...shuffle(pool.filter(o => o !== it)).slice(0,3)]);
    return { prompt: p('capital', {x: tr(it.w)}), speak: p('capital', {x: tr(it.w)}), pic: it.pic, mode:'text', options: opts.map(o => ({ label: tr(o.cap), ok: o === it, say: tr(o.cap) })) };
  })
})));

/* Seas */
T('seas', 'world', '🌊', ['Мұхиттар мен теңіздер','Моря и океаны','Seas and oceans'], () => {
  const items = SEAS.map(r => ({ pic:{e:r[0]}, w:[r[1],r[2],r[3]], key:r[3], sub:[r[4],r[5],r[6]], grp:r[7] }));
  const g = k => items.filter(x => x.grp === k);
  const rid = k => RIDDLES.seas.filter(r => items.find(x => x.key === r[3]).grp === k);
  const lvq = k => () => [...shuffle(g(k)).slice(0, 4).map(it => qHear(it, g(k), k ? 4 : 3)), ...shuffle(rid(k)).slice(0, 4).map(r => qRiddle(r, items))];
  return [
    { t: ['Мұхиттар','Океаны','Oceans'], learn: () => g(0).map(cardOf), quiz: lvq(0) },
    { t: ['Теңіздер мен көлдер','Моря и озёра','Seas and lakes'], learn: () => g(1).map(cardOf), quiz: lvq(1) },
    { t: ['Жұмбақтар','Загадки','Riddles'], learn: null, quiz: () => shuffle(RIDDLES.seas).slice(0, N_Q).map(r => qRiddle(r, items)) }
  ];
});

/* Space */
T('space', 'world', '🪐', ['Күн жүйесі','Солнечная система','Solar system'], () => {
  const obj = fromV(V.space).map(x => (x.grp = 0, x));
  const pl = PLANETS.map(r => ({ pic:{planet:r[0]}, w:[r[1],r[2],r[3]], key:r[3], sub:[r[4],r[5],r[6]], grp:1 }));
  const all = [...obj, ...pl];
  return [
    { t: ['Ғарыш','Космос','Space'], learn: () => obj.map(cardOf), quiz: () => vocabQuiz(obj, obj, 0) },
    { t: ['Планеталар','Планеты','Planets'], learn: () => pl.map(cardOf), quiz: () => shuffle(pl).map((it, i) => i % 2 ? qSee(it, pl, 4, 'whatPlanet') : qHear(it, pl, 4)) },
    { t: ['Жұмбақтар','Загадки','Riddles'], learn: null, quiz: () => shuffle(RIDDLES.space).map(r => qRiddle(r, all)) }
  ];
});

/* Animals */
T('animals', 'world', '🦁', ['Жануарлар','Животные','Animals'], () => vocabLevels([
  { t:['Үй жануарлары','Домашние животные','Farm animals'], items: fromV(V.farm) },
  { t:['Жабайы аңдар','Дикие животные','Wild animals'], items: fromV(V.wild) },
  { t:['Құстар мен су жануарлары','Птицы и водные жители','Birds and water animals'], items: fromV(V.water) },
  { t:['Жәндіктер','Насекомые','Insects'], items: fromV(V.insects) }
], { mixedT: ['Жұмбақтар','Загадки','Riddles'], riddles: RIDDLES.animals }));

/* Fruits & vegetables */
T('fv', 'world', '🍎', ['Жемістер мен көкөністер','Фрукты и овощи','Fruits and vegetables'], () => vocabLevels([
  { t:['Жемістер','Фрукты','Fruits'], items: fromV(V.fruit) },
  { t:['Көкөністер','Овощи','Vegetables'], items: fromV(V.veg) }
], { mixedT: ['Жеміс пе, көкөніс пе?','Фрукт или овощ?','Fruit or vegetable?'], extra: null, riddles: null, mixed: false })
  .concat([{ t: ['Жеміс пе, көкөніс пе?','Фрукт или овощ?','Fruit or vegetable?'], learn: null, quiz: () => {
    const f = fromV(V.fruit).map(x => (x.k = 'f', x)), v = fromV(V.veg).map(x => (x.k = 'v', x));
    return shuffle([...shuffle(f).slice(0,5), ...shuffle(v).slice(0,5)]).map(it => ({ prompt: p('sort'), speak: [[p('sort')],[tr(it.w)]], pic: it.pic, caption: tr(it.w), mode:'both',
      options: [{ pic:{e:'🍎'}, label: t('fruit'), ok: it.k === 'f', say: tr(it.w) }, { pic:{e:'🥕'}, label: t('vegetable'), ok: it.k === 'v', say: tr(it.w) }] }));
  } }]));

/* Food */
T('food', 'world', '🍞', ['Тағам','Еда и продукты','Food'], () => vocabLevels([
  { t:['Азық-түлік','Продукты','Groceries'], items: fromV(V.products) },
  { t:['Тағамдар мен сусындар','Блюда и напитки','Meals and drinks'], items: fromV(V.dishes) }
]));

/* Plants */
T('plants', 'world', '🌻', ['Өсімдіктер','Растения','Plants'], () => vocabLevels([
  { t:['Ағаштар мен шөптер','Деревья и травы','Trees and grass'], items: fromV(V.plants1) },
  { t:['Гүлдер мен өсімдіктер','Цветы и растения','Flowers and plants'], items: fromV(V.plants2) }
]));

/* Colors */
T('colors', 'world', '🎨', ['Түстер','Цвета','Colors'], () => {
  const cs = COLORS.map(r => ({ pic:{color:r[0]}, w:[r[1],r[2],r[3]], key:r[3] }));
  const a = cs.slice(0,6), b = cs.slice(6);
  const lq = (g, step) => () => shuffle(g).map((it, i) => step === 0 || i % 2 === 0 ? qHear(it, g, step ? 4 : 3) : qSee(it, cs, 4, 'whatColor'));
  return [
    { t:['Негізгі түстер','Основные цвета','Main colors'], learn: () => a.map(cardOf), quiz: lq(a, 0) },
    { t:['Тағы түстер','Ещё цвета','More colors'], learn: () => b.map(cardOf), quiz: lq(b, 1) },
    { t:['Қандай түсті?','Какого цвета?','What color?'], learn: null, quiz: () => shuffle(COLOR_OBJ).slice(0, N_Q).map(([e, k]) => {
      const it = cs.find(c => c.key === k); const opts = shuffle([it, ...others(it, cs, 3)]);
      return { prompt: p('objColor'), speak: p('objColor'), pic:{e}, mode:'both', options: opts.map(o => optFrom(o, o === it, 'both')) }; }) }
  ];
});

/* Body */
T('body', 'world', '🫀', ['Адам денесі','Тело человека','Human body'], () => vocabLevels([
  { t:['Дене мүшелері','Части тела','Body parts'], items: fromV(V.body1) },
  { t:['Денеміздің ішінде','Внутри нас','Inside the body'], items: fromV(V.body2) }
], { mixedT: ['Жұмбақтар','Загадки','Riddles'], riddles: RIDDLES.body }));

/* Home */
T('home', 'world', '🏠', ['Үй заттары','Предметы дома','Things at home'], () => vocabLevels([
  { t:['Бөлмеде','В комнате','In the room'], items: fromV(V.room) },
  { t:['Ас үйде','На кухне','In the kitchen'], items: fromV(V.kitchen) },
  { t:['Тазалық және құралдар','Чистота и инструменты','Cleaning and tools'], items: fromV(V.bath) },
  { t:['Мектеп заттары','Школьные вещи','School things'], items: fromV(V.school) }
]));

/* ===== Познание мира (Дүниетану) ===== */
const KP = {
  seasonOf:['{x} — жылдың қай мезгілі?','{x} — какое это время года?','{x} — which season is it?'],
  nextMonth:['{x} — келесі ай қайсы?','{x}. А какой месяц следующий?','What month comes after {x}?'],
  nextDay:['{x} — келесі күн қайсы?','{x}. А какой день следующий?','What day comes after {x}?'],
  ordMonth:['{o} ай','{o} месяц','the {o} month'],
  ordDay:['аптаның {o} күні','{o} день недели','the {o} day of the week']
};
const kp = (k, v) => fmt(tr(KP[k]), v);
const rich = r => ({ pic:{e:r[0]}, w:[r[1], r[2], r[3]], key:r[3], sub: r[4] ? [r[4], r[5], r[6]] : undefined });
// a text question with fixed answer and distractor labels
function qText(prompt, answer, wrong, extra = {}){
  const opts = shuffle([{ label: answer, ok: true, say: answer }, ...wrong.map(w => ({ label: w, ok: false, say: w }))]);
  return { prompt, speak: prompt, mode:'text', options: opts, ...extra };
}

T('seasons', 'know', '🍂', ['Жыл мезгілдері мен айлар','Времена года и месяцы','Seasons and months'], () => {
  const se = SEASONS.map(r => (x => (x.grp = 0, x))(rich(r)));
  const months = () => MONTHS[S.lang];
  const mCards = () => months().map((m, i) => ({ pic:{e: SEASONS[MONTH_SEASON[i]][0]}, w: LANGS.map(l => MONTHS[l][i]), sub: LANGS.map(l => fmt(KP.ordMonth[LANGS.indexOf(l)], { o: ORD[l][i] })) }));
  const seasonQ = i => { const it = se[MONTH_SEASON[i]], x = months()[i];
    return { prompt: kp('seasonOf', {x: cap1(x)}), speak: kp('seasonOf', {x}), mode:'both', options: shuffle(se).map(o => optFrom(o, o === it, 'both')) }; };
  const nextQ = i => { const M = months(), a = M[(i + 1) % 12];
    return qText(kp('nextMonth', {x: cap1(M[i])}), a, shuffle(M.filter(m => m !== a && m !== M[i])).slice(0, 3)); };
  const ridQ = r => { const M = months(); return qText(tr(r), M[r[3]], shuffle(M.filter((_, k) => k !== r[3])).slice(0, 3)); };
  const countQ = r => { const q = qText(tr(r), String(r[3]), r[4].filter(v => v !== r[3]).map(String)); q.mode = 'num'; q.options.forEach(o => o.say = numWord(+o.label, S.lang)); return q; };
  return [
    { t:['Жыл мезгілдері','Времена года','Seasons'], learn: () => se.map(cardOf), quiz: () => [...shuffle(se).map(it => qHear(it, se, 3)), ...shuffle(se).map(it => qSee(it, se, 4))] },
    { t:['Айлар','Месяцы','Months'], learn: mCards, quiz: () => shuffle([...Array(12).keys()]).slice(0, N_Q).map((i, k) => k % 2 ? nextQ(i) : seasonQ(i)) },
    { t:['Жұмбақтар','Загадки','Riddles'], learn: null, quiz: () => shuffle([...KRID.months.map(ridQ), ...KRID.counts.map(countQ)]) }
  ];
});

T('days', 'know', '📅', ['Апта күндері және тәулік','Дни недели и время суток','Days and times of day'], () => {
  const parts = DAYPARTS.map(r => (x => (x.grp = 0, x))(rich(r)));
  const D = () => DAYS[S.lang];
  const dCards = () => D().map((d, i) => ({ pic:{e: KEYCAPS[i]}, w: LANGS.map(l => DAYS[l][i]), sub: LANGS.map(l => fmt(KP.ordDay[LANGS.indexOf(l)], { o: ORD[l][i] })) }));
  const nextQ = i => { const W = D(), a = W[(i + 1) % 7]; return qText(kp('nextDay', {x: cap1(W[i])}), a, shuffle(W.filter(d => d !== a && d !== W[i])).slice(0, 3)); };
  const ridQ = r => { const W = D(); return qText(tr(r), W[r[3]], shuffle(W.filter((_, k) => k !== r[3])).slice(0, 3)); };
  return [
    { t:['Апта күндері','Дни недели','Days of the week'], learn: dCards, quiz: () => [...shuffle([...Array(7).keys()]).slice(0, 5).map(nextQ), ...shuffle(KRID.days).slice(0, 3).map(ridQ)] },
    { t:['Тәулік бөліктері','Время суток','Times of day'], learn: () => parts.map(cardOf), quiz: () => [...shuffle(parts).map(it => qHear(it, parts, 3)), ...KRID.dayparts.map(r => qRiddle(r, parts))] },
    { t:['Жұмбақтар','Загадки','Riddles'], learn: null, quiz: () => shuffle([...shuffle([...Array(7).keys()]).slice(0, 3).map(nextQ), ...KRID.days.map(ridQ), ...shuffle(KRID.dayparts).slice(0, 2).map(r => qRiddle(r, parts))]) }
  ];
});

T('weather', 'know', '🌦️', ['Ауа райы және киім','Погода и одежда','Weather and clothes'], () => vocabLevels([
  { t:['Ауа райы','Погода','Weather'], items: fromV(KNOW.weather) },
  { t:['Киім','Одежда','Clothes'], items: fromV(KNOW.clothes) }
], { mixedT: ['Не киеміз?','Что наденем?','What do we wear?'], riddles: KRID.clothes }));

T('family', 'know', '👨‍👩‍👧', ['Отбасы және сыпайы сөздер','Семья и вежливые слова','Family and polite words'], () => vocabLevels([
  { t:['Менің отбасым','Моя семья','My family'], items: fromV(KNOW.family) },
  { t:['Сыпайы сөздер','Вежливые слова','Polite words'], items: fromV(KNOW.polite) }
], { mixedT: ['Жұмбақтар','Загадки','Riddles'], riddles: KRID.family }));

T('jobs', 'know', '🧑‍🚒', ['Мамандықтар','Профессии','Jobs'], () => {
  const it = fromV(KNOW.jobs);
  return vocabLevels([
    { t:['Мамандықтар · 1','Профессии · 1','Jobs · 1'], items: it.slice(0, 7) },
    { t:['Мамандықтар · 2','Профессии · 2','Jobs · 2'], items: it.slice(7) }
  ], { mixedT: ['Жұмбақтар','Загадки','Riddles'], riddles: KRID.jobs });
});

T('road', 'know', '🚦', ['Көлік және жол ережесі','Транспорт и правила дороги','Transport and road rules'], () => {
  const trn = fromV(KNOW.transport).map(x => (x.grp = 0, x));
  const lights = LIGHTS.map(r => ({ pic:{color:r[0]}, w:[r[1], r[2], r[3]], key:r[4], grp:1 }));
  const road = [...fromV(KNOW.road).map(x => (x.grp = 1, x)), ...lights];
  const all = [...trn, ...road];
  return [
    { t:['Көлік · 1','Транспорт · 1','Transport · 1'], learn: () => trn.slice(0, 7).map(cardOf), quiz: () => vocabQuiz(trn.slice(0, 7), trn.slice(0, 7), 0) },
    { t:['Көлік · 2','Транспорт · 2','Transport · 2'], learn: () => trn.slice(7).map(cardOf), quiz: () => vocabQuiz(trn.slice(7), trn, 1) },
    { t:['Бағдаршам','Светофор','Traffic light'], learn: () => road.map(cardOf), quiz: () => shuffle(KRID.road).map(r => qRiddle(r, all)).concat(shuffle(lights).slice(0, 3).map(it => qHear(it, lights, 3))) },
    { t:['Жұмбақтар','Загадки','Riddles'], learn: null, quiz: () => shuffle([...KRID.transport, ...KRID.road]).slice(0, N_Q).map(r => qRiddle(r, all)) }
  ];
});

T('kz', 'know', '🇰🇿', ['Менің Отаным — Қазақстан','Моя Родина — Казахстан','My homeland — Kazakhstan'], () => {
  const flag = { pic:{flag:'KZ'}, w:['Қазақстан туы','флаг Казахстана','flag of Kazakhstan'], key:'flag', sub: FLAG_KZ_FACT, grp:0 };
  const a = [flag, ...KNOW.kz1.map(r => (x => (x.grp = 0, x))(rich(r)))];
  const b = KNOW.kz2.map(r => (x => (x.grp = 1, x))(rich(r)));
  const all = [...a, ...b];
  return [
    { t:['Рәміздер мен қалалар','Символы и города','Symbols and cities'], learn: () => a.map(cardOf), quiz: () => vocabQuiz(a, a, 0) },
    { t:['Салт-дәстүр','Традиции','Traditions'], learn: () => b.map(cardOf), quiz: () => vocabQuiz(b, b, 1) },
    { t:['Жұмбақтар','Загадки','Riddles'], learn: null, quiz: () => shuffle(KRID.kz).map(r => qRiddle(r, all)) }
  ];
});

const SECTIONS = [['read','secRead','🔤'],['math','secMath','🔢'],['know','secKnow','🧭'],['world','secWorld','🌍']];
const TCOL = { seasons:1, days:5, weather:4, family:0, jobs:2, road:3, kz:4, abc:0, syl:1, sent:2, num:3, add:4, mul:5, logic:6, flags:0, caps:1, seas:4, space:6, animals:2, fv:0, food:1, plants:3, colors:6, body:0, home:5 };

/* ---------- progress ---------- */
const lvKey = (tid, i) => `${S.lang}:${tid}:${i}`;
const starsOf = (tid, i) => S.stars[lvKey(tid, i)] || 0;
const levelCache = {};
function levelsOf(tp){ const k = tp.id + ':' + S.lang; return levelCache[k] || (levelCache[k] = tp.levels(S.lang)); }
const unlocked = (tid, i) => S.all || i === 0 || starsOf(tid, i - 1) > 0;
function topicStars(tp){ const L = levelsOf(tp); let s = 0; L.forEach((_, i) => s += starsOf(tp.id, i)); return [s, L.length * 3]; }
function totalStars(){ return Object.entries(S.stars).filter(([k]) => k.startsWith(S.lang + ':')).reduce((a, [,v]) => a + v, 0); }

/* ---------- views ---------- */
let V_ = { screen:'home' };
let settingsOpen = false;
const app = () => $('#app');

function header(){
  return `<header class="top">
    <button class="brand" data-act="home" aria-label="${esc(tr(UI.back))}">
      <svg viewBox="0 0 60 34" class="arc" aria-hidden="true">${RAINBOW.map((c, i) => `<path d="M${4+i*3} 32 A${26-i*3} ${26-i*3} 0 0 1 ${56-i*3} 32" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/>`).join('')}</svg>
      <span><b>Кемпірқосақ</b><small>${esc(t('sub'))}</small></span>
    </button>
    <div class="langs" role="group" aria-label="Language">${LANGS.map(l => `<button class="lang ${l === S.lang ? 'on' : ''}" data-lang="${l}"><span class="emo">${flagEmoji(LFLAG[l])}</span>${LNAME[l]}</button>`).join('')}</div>
    <div class="right"><span class="starpill" title="⭐"><span class="emo">⭐</span>${totalStars()}</span><button class="coinpill" data-act="gifts" title="${esc(t('gifts'))}"><span class="emo">🪙</span><b id="coinN">${S.coins}</b><span class="emo gb">🎁</span></button>
    <button class="gear" data-act="settings" aria-label="${esc(t('settings'))}" title="${esc(t('settings'))}"><span class="emo">⚙️</span></button></div>
  </header>`;
}

function renderHome(){
  const name = S.name.trim() || t('friend');
  let h = header() + `<main class="wrap home">
    <section class="hello"><div><h1>${esc(t('hi', {n: name}))}</h1><p>${esc(t('hiSub'))}</p></div>
    <div class="mascot" aria-hidden="true"><span class="emo">🦄</span></div></section>`;
  for (const [sec, key, e] of SECTIONS) {
    h += `<h2 class="sec"><span class="emo">${e}</span>${esc(t(key))}</h2><div class="tiles">`;
    for (const tp of TOPICS.filter(x => x.sec === sec)) {
      const [s, m] = topicStars(tp), n = levelsOf(tp).length;
      h += `<button class="tile c${TCOL[tp.id]}" data-topic="${tp.id}">
        <span class="ticon"><span class="emo">${tp.e}</span></span>
        <span class="tname">${esc(tr(tp.name))}</span>
        <span class="tmeta">${n} ${esc(t('levels'))} · <span class="emo">⭐</span> ${s}/${m}</span>
        <span class="tbar"><i style="width:${Math.round(s/m*100)}%"></i></span>
      </button>`;
    }
    h += `</div>`;
  }
  h += `<p class="foot">${esc(t('progress'))} · ${esc(t('ages'))}</p></main>`;
  app().innerHTML = h;
}

function renderTopic(){
  const tp = TOPICS.find(x => x.id === V_.topic), L = levelsOf(tp);
  const [s, m] = topicStars(tp);
  let h = header() + `<main class="wrap topic c${TCOL[tp.id]}">
    <div class="tophead"><button class="btn ghost" data-act="home">← ${esc(t('back'))}</button>
    <h1><span class="emo">${tp.e}</span> ${esc(tr(tp.name))}</h1><span class="starpill"><span class="emo">⭐</span>${s}/${m}</span></div>
    <ol class="path">`;
  L.forEach((lv, i) => {
    const st = starsOf(tp.id, i), open = unlocked(tp.id, i);
    const x = Math.round(Math.sin(i * 1.15) * 100) / 100;
    const cur = open && !st;
    h += `<li style="--x:${x}"><button class="node ${open ? '' : 'locked'} ${st ? 'done' : ''} ${cur ? 'cur' : ''}" data-level="${i}" ${open ? '' : 'aria-disabled="true"'}>
      <span class="circ">${open ? (i + 1) : '<span class="emo">🔒</span>'}</span>
      <span class="ninfo"><span class="ntitle">${esc(tr(lv.t))}</span><span class="nstars">${[1,2,3].map(k => `<span class="emo ${k <= st ? '' : 'dim'}">⭐</span>`).join('')}</span></span>
    </button></li>`;
  });
  h += `</ol></main>`;
  app().innerHTML = h;
  const cur = $('.node.cur'); if (cur) cur.scrollIntoView({ block:'center' });
}

function cardHTML(c, i){
  const main = c.label ?? (c.w ? tr(c.w) : '');
  const trs = (S.tr && c.w) ? LANGS.filter(l => l !== S.lang).map(l => `<span class="trw" data-say="${esc(c.w[LANGS.indexOf(l)])}" data-l="${l}"><span class="emo">${flagEmoji(LFLAG[l])}</span><span>${rt(c.w[LANGS.indexOf(l)], l)}</span></span>`).join('') : '';
  const sentTr = '';
  const chipHTML = c.chips ? (c.sentence ? c.chips.map(ch => rt(ch.t)) : rtParts(c.chips.map(ch => ch.t))) : null;
  const chips = c.chips ? `<span class="chips ${c.sentence ? 'words' : ''}">${c.chips.map((ch, k) => `<span class="chip" data-say="${esc(ch.say.toLowerCase())}" data-l="${S.lang}">${chipHTML[k]}</span>`).join(c.sentence ? '' : '<span class="dash">-</span>')}</span>` : '';
  const capital = c.capital ? `<span class="capline" data-say="${esc(tr(c.capital))}" data-l="${S.lang}"><span class="emo">🏙️</span>${esc(tr(c.capital))}</span>` : '';
  const sub = c.sub ? `<span class="fact">${rt(tr(c.sub))}</span>` : '';
  return `<div class="card ${c.wide ? 'wide' : ''} ${c.sentence ? 'sentcard' : ''} ${seenKey(c) && S.seen[seenKey(c)] ? '' : 'fresh'}" role="button" tabindex="0" data-card="${i}">
    <span class="cpic">${picHTML(c.pic)}</span>
    ${chips || (main ? `<span class="lbl ${main.length > 10 ? 'long' : ''}">${c.small ? `<span class="emo">${c.small}</span>` : ''}<span>${rt(main)}</span></span>` : '')}
    ${capital}${sub}
    ${trs || sentTr ? `<span class="trs">${trs}${sentTr}</span>` : ''}
  </div>`;
}
function cardSay(c){
  if (c.say) return c.say.map(x => [x[0], x[1] || S.lang]);
  const out = [[tr(c.w), S.lang]];
  if (c.capital) out.push([fmt(tr(P.capOf), { x: tr(c.capital) }), S.lang]);
  if (c.sub) out.push([tr(c.sub), S.lang]);
  return out;
}

function levelHead(tp, lv){
  const total = V_.qs ? V_.qs.length : 0;
  const prog = V_.phase === 'quiz' ? `<div class="prog" aria-label="progress">${Array.from({length: total}, (_, i) => `<i class="${i < V_.qi ? 'f' : ''} ${i === V_.qi ? 'now' : ''}"></i>`).join('')}</div>` : `<div class="lvtitle">${esc(t('level'))} ${V_.level + 1} · ${esc(tr(lv.t))}</div>`;
  return `<div class="lvhead"><button class="close" data-act="topic" aria-label="${esc(t('back'))}">✕</button>${prog}<span class="coinpill"><span class="emo">🪙</span><b id="coinN">${S.coins}</b></span></div>`;
}

function renderLearn(){
  const tp = TOPICS.find(x => x.id === V_.topic), lv = levelsOf(tp)[V_.level];
  V_.cards = lv.learn();
  let h = `<main class="wrap level c${TCOL[tp.id]}">${levelHead(tp, lv)}
    <div class="learnbar"><p>${esc(t('learnHint'))}</p><button class="btn soft" data-act="playall"><span class="emo">🔊</span> ${esc(t('playAll'))}</button></div>
    <div class="cards">${V_.cards.map(cardHTML).join('')}</div>
    <div class="bottombar"><button class="btn big go" data-act="startquiz">${esc(t('play'))} <span class="emo">▶️</span></button></div></main>`;
  app().innerHTML = h;
}

function startQuiz(){
  const tp = TOPICS.find(x => x.id === V_.topic), lv = levelsOf(tp)[V_.level];
  V_.phase = 'quiz'; V_.qs = lv.quiz(); V_.qi = 0; V_.mist = 0; renderQ();
}

function renderQ(){
  const tp = TOPICS.find(x => x.id === V_.topic), lv = levelsOf(tp)[V_.level];
  const q = V_.qs[V_.qi]; V_.lock = false; V_.built = []; V_.qm = 0;
  let body = '';
  if (q.build) {
    body = `<div class="qpic">${picHTML(q.pic)}</div>
      <div class="slots ${q.joiner === ' ' ? 'sentence' : ''}">${q.answer.map((_, i) => `<span class="slot" data-slot="${i}"></span>`).join('')}</div>
      <div class="bank">${q.pieces.map((pc, i) => `<button class="piece" data-piece="${i}">${q.joiner === ' ' ? rt(pc) : esc(pc)}</button>`).join('')}</div>`;
  } else {
    body = (q.pic ? `<div class="qpic ${q.pic.text ? 'textpic' : ''}">${picHTML(q.pic)}${q.caption ? `<div class="caption">${esc(q.caption)}</div>` : ''}</div>` : '')
      + `<div class="opts m-${q.mode} n${q.options.length} ${q.big ? 'bigtxt' : ''}">${q.options.map((o, i) => `<button class="opt" data-opt="${i}">${o.pic ? `<span class="opic">${picHTML(o.pic)}</span>` : ''}${o.label != null ? `<span class="olbl">${rt(o.label)}</span>` : ''}</button>`).join('')}</div>`;
  }
  app().innerHTML = `<main class="wrap level quiz c${TCOL[tp.id]}">${levelHead(tp, lv)}
    <div class="qprompt"><button class="spk" data-act="repeat" aria-label="🔊"><span class="emo">🔊</span></button><button class="spk slow" data-act="slow" aria-label="${esc(t('slowBtn'))}" title="${esc(t('slowBtn'))}"><span class="emo">🐢</span></button><h2>${rt(q.prompt)}</h2>${q.hint ? `<button class="btn soft hintb" data-act="hint"><span class="emo">💡</span></button>` : ''}</div>
    ${body}<div class="toast" id="toast"></div></main>`;
  setTimeout(() => speakQ(q), 250);
}
function speakQ(q, slow){ speak(Array.isArray(q.speak) ? q.speak.map(x => [x[0], x[1] || S.lang]) : [[q.speak, S.lang]], { slow }); }

function toast(msg, ok){ const el = $('#toast'); if (!el) return; el.textContent = msg; el.className = 'toast show ' + (ok ? 'ok' : 'no'); clearTimeout(toast._t); toast._t = setTimeout(() => el.className = 'toast', 1100); }

function answered(ok, sayWord, el){
  const praise = pick(tr(UI.praise));
  if (ok) {
    sfxOk(); toast(praise, true);
    const r = (el || $('.qprompt')).getBoundingClientRect();
    burst(r.left + r.width/2, r.top + r.height/2, 70); setTimeout(sfxPop, 120);
    addCoins(V_.qm ? 5 : 10, el);
    speak([[praise, S.lang], ...(sayWord ? [[sayWord, S.lang]] : [])]);
    V_.lock = true;
    setTimeout(() => { V_.qi++; if (V_.qi >= V_.qs.length) finish(); else renderQ(); }, sayWord && sayWord.length > 25 ? 2600 : 1500);
  } else {
    sfxNo(); V_.mist++; V_.qm++; toast(t('tryAgain'), false); say(t('tryAgain'));
  }
}

function onOpt(i, btn){
  if (V_.lock) return;
  const q = V_.qs[V_.qi], o = q.options[i];
  if (o.ok) { btn.classList.add('right'); answered(true, o.sayAfter || o.say, btn); }
  else { btn.classList.add('wrong'); btn.disabled = true; answered(false); }
}
function onPiece(i, btn){
  if (V_.lock) return;
  const q = V_.qs[V_.qi];
  if (V_.built.length >= q.answer.length) return;
  V_.built.push(i); btn.disabled = true; btn.classList.add('used');
  say(q.pieces[i].toLowerCase());
  const slot = $(`[data-slot="${V_.built.length - 1}"]`); slot.textContent = q.pieces[i]; slot.classList.add('filled'); slot.dataset.p = i;
  if (V_.built.length === q.answer.length) {
    const got = V_.built.map(k => q.pieces[k]);
    const slots = document.querySelectorAll('.slot');
    if (got.join('|') === q.answer.join('|')) { slots.forEach(s => s.classList.add('right')); answered(true, q.full, $('.slots')); }
    else {
      slots.forEach(s => s.classList.add('wrong')); answered(false);
      V_.lock = true;
      setTimeout(() => { V_.built = []; V_.lock = false; slots.forEach(s => { s.textContent = ''; s.className = 'slot'; }); document.querySelectorAll('.piece').forEach(b => { b.disabled = false; b.classList.remove('used'); }); }, 900);
    }
  }
}
function onSlot(i){
  if (V_.lock) return;
  // undo the last placed piece only (simple for kids)
  if (i !== V_.built.length - 1) return;
  const k = V_.built.pop(); const slot = $(`[data-slot="${i}"]`); slot.textContent = ''; slot.className = 'slot';
  const b = $(`[data-piece="${k}"]`); b.disabled = false; b.classList.remove('used');
}

function finish(){
  const st = V_.mist === 0 ? 3 : V_.mist <= 2 ? 2 : 1;
  const k = lvKey(V_.topic, V_.level);
  S.stars[k] = Math.max(S.stars[k] || 0, st); save();
  const tp = TOPICS.find(x => x.id === V_.topic), L = levelsOf(tp);
  const hasNext = V_.level + 1 < L.length;
  sfxWin(); fireworks(9); confetti(120);
  const praise = pick(tr(UI.praise));
  speak([[t('done'), S.lang], [praise, S.lang]]);
  V_.phase = 'done';
  const bonus = st * 10;
  app().innerHTML = `<main class="wrap level done c${TCOL[tp.id]}">
    <div class="lvhead"><button class="close" data-act="topic" aria-label="${esc(t('back'))}">✕</button><span class="lvtitle"></span><span class="coinpill"><span class="emo">🪙</span><b id="coinN">${S.coins}</b></span></div>
    <div class="result">
      <div class="bigstars">${[1,2,3].map(n => `<span class="emo ${n <= st ? 'on' : 'off'}" style="--d:${n*0.18}s">⭐</span>`).join('')}</div>
      <h1>${esc(t('done'))}</h1><p class="praise">${esc(praise)}</p>
      <p class="bonusline"><span class="emo">🪙</span> ${esc(t('bonus', {n: bonus}))}</p>
      ${!hasNext ? `<p>${esc(t('allDone'))}</p>` : ''}
      <div class="rbtns">
        <button class="btn soft" data-act="again"><span class="emo">🔁</span> ${esc(t('again'))}</button>
        <button class="btn soft" data-act="topic"><span class="emo">🗺️</span> ${esc(t('toTopic'))}</button>
        ${hasNext ? `<button class="btn big go" data-act="next">${esc(t('next'))} <span class="emo">▶️</span></button>` : `<button class="btn big go" data-act="home"><span class="emo">🏠</span></button>`}
      </div>
    </div></main>`;
  setTimeout(() => { addCoins(bonus, $('.bonusline')); setTimeout(showGiftIfAny, 900); }, 700);
}

function openLevel(i){
  const tp = TOPICS.find(x => x.id === V_.topic), lv = levelsOf(tp)[i];
  V_ = { screen:'level', topic: V_.topic, level: i, phase: 'learn' };
  if (lv.learn) renderLearn(); else startQuiz();
  scrollTo(0, 0);
}

/* ---------- settings ---------- */
function renderSettings(){
  settingsOpen = true;
  let m = $('#modal'); if (!m) { m = document.createElement('div'); m.id = 'modal'; document.body.appendChild(m); }
  const kv = voiceFor('kk'), kRec = Clips.count('kk');
  const vsel = l => { const list = voicesFor(l); return `<div class="vrow"><label for="v-${l}"><span class="emo">${flagEmoji(LFLAG[l])}</span> ${LNAME[l]}</label>
    <select id="v-${l}" data-voice="${l}"><option value="">${esc(t('auto'))}${list.length ? '' : ' — ' + esc(t('noVoice'))}</option>${list.map(v => `<option ${S.voice[l] === v.name ? 'selected' : ''}>${esc(v.name)}</option>`).join('')}</select>
    <button class="btn soft sm" data-test="${l}"><span class="emo">🔊</span> ${esc(t('test'))}</button></div>`; };
  m.innerHTML = `<div class="scrim" data-act="closeset"></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="set-h">
    <h2 id="set-h"><span class="emo">👨‍👩‍👧</span> ${esc(t('settings'))}</h2>
    <label class="fld" for="set-name">${esc(t('childName'))}<input id="set-name" type="text" maxlength="24" value="${esc(S.name)}" autocomplete="off"></label>
    <label class="tgl" for="set-tr"><input id="set-tr" type="checkbox" ${S.tr ? 'checked' : ''}> ${esc(t('showTr'))}</label>
    <label class="tgl" for="set-st"><input id="set-st" type="checkbox" ${S.stress ? 'checked' : ''}> <span>${esc(t('showStress'))} <span class="stdemo">(${rt('кошка, собака', 'ru')})</span></span></label>
    <label class="tgl" for="set-all"><input id="set-all" type="checkbox" ${S.all ? 'checked' : ''}> ${esc(t('unlock'))}</label>
    <label class="fld" for="set-rate">${esc(t('speed'))}<span class="rate"><small>${esc(t('slow'))}</small><input id="set-rate" type="range" min="0.6" max="1.15" step="0.05" value="${S.rate}"><small>${esc(t('fast'))}</small></span></label>
    <h3>${esc(t('voices'))}</h3>${LANGS.map(vsel).join('')}
    <p class="note ${kv || kRec ? 'ok' : ''}">${kRec ? esc(t('kkRec', {n: kRec})) : kv ? esc(t('kkOk', {v: kv.name})) : esc(t('kkNote', {v: voiceFor('tr') ? t('viaTr') : t('viaRu')}))}</p>
    ${kRec ? '' : `<p class="note">${esc(t('iosTip'))}</p>`}
    <div class="setbtns"><span id="resetzone"><button class="btn ghost danger" data-act="reset">${esc(t('reset'))}</button></span>
    <button class="btn go" data-act="closeset">${esc(t('close'))}</button></div></div>`;
  m.hidden = false;
}
function closeSettings(){ settingsOpen = false; const m = $('#modal'); if (m) m.hidden = true; rerender(); }

function rerender(){
  if (V_.screen === 'home') renderHome();
  else if (V_.screen === 'gifts') renderGifts();
  else if (V_.screen === 'topic') renderTopic();
  else if (V_.screen === 'level') { if (V_.phase === 'learn') renderLearn(); else if (V_.phase === 'quiz') startQuiz(); else renderTopic(); }
}

/* ---------- events ---------- */
document.addEventListener('pointerdown', unlockAudio, { once:false, capture:true });
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act],[data-lang],[data-topic],[data-level],[data-card],[data-opt],[data-piece],[data-slot],[data-say],[data-test],[data-sticker]');
  if (!el) return;
  unlockAudio();
  if (el.dataset.say != null) { e.stopPropagation(); el.classList.add('pop'); setTimeout(() => el.classList.remove('pop'), 300); say(el.dataset.say, el.dataset.l); return; }
  if (el.dataset.lang) { S.lang = el.dataset.lang; save(); if (V_.screen === 'level') V_ = { screen:'topic', topic: V_.topic }; rerender(); greet(); return; }
  if (el.dataset.topic) { V_ = { screen:'topic', topic: el.dataset.topic }; renderTopic(); scrollTo(0,0); const tp = TOPICS.find(x => x.id === el.dataset.topic); say(tr(tp.name)); return; }
  if (el.dataset.level != null) { const i = +el.dataset.level; if (!unlocked(V_.topic, i)) { say(t('locked')); el.classList.add('shake'); setTimeout(() => el.classList.remove('shake'), 500); return; } openLevel(i); return; }
  if (el.dataset.card != null) {
    const ci = +el.dataset.card, c = V_.cards[ci]; el.classList.add('pop'); setTimeout(() => el.classList.remove('pop'), 300);
    const now = Date.now(), again = V_.lastCard === ci && now - V_.lastCardT < 4000; V_.lastCard = ci; V_.lastCardT = now;
    speak(cardSay(c), { slow: again });
    const k = seenKey(c);
    if (k && !S.seen[k]) { S.seen[k] = 1; el.classList.remove('fresh'); const r = el.getBoundingClientRect(); burst(r.left + r.width/2, r.top + 40, 26, true); addCoins(1, el); }
    return; }
  if (el.dataset.sticker != null) { el.classList.add('pop'); setTimeout(() => el.classList.remove('pop'), 300); say(pick(tr(UI.praise))); return; }
  if (el.dataset.opt != null) return onOpt(+el.dataset.opt, el);
  if (el.dataset.piece != null) return onPiece(+el.dataset.piece, el);
  if (el.dataset.slot != null) return onSlot(+el.dataset.slot);
  if (el.dataset.test) { const l = el.dataset.test; say({ kk:'Сәлем! Мен қазақша сөйлеймін.', ru:'Привет! Я говорю по-русски.', en:'Hello! I speak English.' }[l], l); return; }
  const a = el.dataset.act;
  if (a === 'home') { V_ = { screen:'home' }; renderHome(); scrollTo(0,0); }
  else if (a === 'topic') { V_ = { screen:'topic', topic: V_.topic }; renderTopic(); }
  else if (a === 'settings') renderSettings();
  else if (a === 'closeset') closeSettings();
  else if (a === 'playall') {
    const cards = [...document.querySelectorAll('.card')];
    speak(V_.cards.flatMap((c, i) => { const s = cardSay(c).slice(0, c.say ? 2 : 1); s[0] = [s[0][0], s[0][1], () => { cards.forEach(x => x.classList.remove('lit')); cards[i].classList.add('lit'); cards[i].scrollIntoView({ block:'nearest', behavior:'smooth' }); }]; return s; }));
  }
  else if (a === 'startquiz') { startQuiz(); scrollTo(0,0); }
  else if (a === 'repeat') speakQ(V_.qs[V_.qi]);
  else if (a === 'slow') speakQ(V_.qs[V_.qi], true);
  else if (a === 'gifts') { if (V_.screen !== 'gifts') V_ = { screen:'gifts', back: V_ }; renderGifts(); scrollTo(0,0); }
  else if (a === 'giftsback') { V_ = V_.back && V_.back.screen !== 'level' ? V_.back : (V_.back && V_.back.topic ? { screen:'topic', topic: V_.back.topic } : { screen:'home' }); rerender(); }
  else if (a === 'closegift') { $('#giftbox').hidden = true; showGiftIfAny(); }
  else if (a === 'hint') say(V_.qs[V_.qi].hint);
  else if (a === 'again') openLevel(V_.level);
  else if (a === 'next') openLevel(V_.level + 1);
  else if (a === 'reset') { $('#resetzone').innerHTML = `<button class="btn danger" data-act="resetyes">${esc(t('resetSure'))}</button> <button class="btn ghost" data-act="resetno">${esc(t('cancel'))}</button>`; }
  else if (a === 'resetno') renderSettings();
  else if (a === 'resetyes') { S.stars = {}; save(); renderSettings(); }
});
document.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.card')) { e.preventDefault(); e.target.click(); } if (e.key === 'Escape' && settingsOpen) closeSettings(); });
document.addEventListener('input', e => {
  if (e.target.id === 'set-name') { S.name = e.target.value; save(); }
  if (e.target.id === 'set-rate') { S.rate = +e.target.value; save(); }
});
document.addEventListener('change', e => {
  if (e.target.id === 'set-tr') { S.tr = e.target.checked; save(); }
  if (e.target.id === 'set-all') { S.all = e.target.checked; save(); }
  if (e.target.id === 'set-st') { S.stress = e.target.checked; save(); renderSettings(); }
  if (e.target.dataset.voice) { S.voice[e.target.dataset.voice] = e.target.value; save(); renderSettings(); }
});

function greet(){
  const name = S.name.trim(), full = t('hi', { n: name || t('friend') });
  if (!name || Clips.has(full, S.lang)) say(full);
  else speak([[t('hello'), S.lang], [name, S.lang]]);
}

renderHome();
// iOS: bring progress back from native storage if the WebView storage was purged
Store.restore().then(j => { if (j) { Object.assign(S, j); save(); rerender(); } });
