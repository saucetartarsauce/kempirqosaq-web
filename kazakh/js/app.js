/* ===== Сөйле! — app ===== */

/* ---------- state ---------- */
const S = (() => {
  const d = { lv: 0, known: {}, fav: {}, rate: 1, hideRu: false, listenRu: true };
  try { Object.assign(d, JSON.parse(localStorage.getItem('soile1') || 'null') || {}); } catch (e) {}
  return d;
})();
const save = () => { try { localStorage.setItem('soile1', JSON.stringify(S)); } catch (e) {} };

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const plural = (n, one, few, many) => { const m = n % 10, h = n % 100; return m === 1 && h !== 11 ? one : m >= 2 && m <= 4 && (h < 12 || h > 14) ? few : many; };
const ICON = {
  play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z"/></svg>',
  next: '<svg viewBox="0 0 24 24"><path d="M6 5.5v13l9-6.5zM16 5h2.5v14H16z"/></svg>',
  prev: '<svg viewBox="0 0 24 24"><path d="M18 5.5v13l-9-6.5zM8 5H5.5v14H8z"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
  check: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.7 2.7L16.5 9"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>'
};

/* ---------- content index ---------- */
// every item gets: kk, ru, note, label, key, topic, group, lv
const ALL = [];
TOPICS.forEach(t => t.groups.forEach(g => g.items.forEach(([kk, ru, note, label]) => {
  ALL.push({ kk, ru, note: note || '', label: label || '', key: clipKey(kk) + '|' + clipKey(ru), topic: t, group: g, lv: g.lv });
})));
const lvOk = it => !S.lv || it.lv === S.lv;
const itemsOf = t => ALL.filter(it => it.topic === t && lvOk(it));
const lvName = lv => LEVELS.find(l => l.lv === lv).name;

/* ---------- audio: pre-recorded clips, system voice as a fallback ---------- */
const M = window.AUDIO_MANIFEST || { kk: {}, ru: {} };
const audio = new Audio();
audio.preload = 'auto';
let playId = 0;
function clipUrl(text, l){ const id = M[l] && M[l][clipKey(text)]; return id ? `audio/${l}/${id}.mp3` : null; }
// resolves when the phrase has finished (or could not be played)
function play(text, l = 'kk', slow = false){
  const id = ++playId;
  stopSound(false);
  const rate = S.rate * (slow ? 0.72 : 1);
  return new Promise(done => {
    const url = clipUrl(text, l);
    const fallback = () => {
      if (id !== playId || !('speechSynthesis' in window)) return done();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = l === 'kk' ? 'kk-KZ' : 'ru-RU'; u.rate = rate;
      u.onend = u.onerror = () => done();
      speechSynthesis.speak(u);
    };
    if (!url) return fallback();
    audio.onended = () => done();
    audio.onerror = () => fallback();
    audio.src = url;
    audio.preservesPitch = true;
    audio.playbackRate = rate;
    audio.play().catch(() => done());
  });
}
function stopSound(bump = true){
  if (bump) playId++;
  audio.onended = audio.onerror = null;
  audio.pause();
  try { speechSynthesis.cancel(); } catch (e) {}
}
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ---------- rendering pieces ---------- */
// Kazakh text with every word tappable
function kkHtml(kk){
  let out = '', last = 0;
  for (const m of kk.matchAll(KK_WORD)) {
    out += esc(kk.slice(last, m.index)) + `<span class="w" data-w="${esc(m[0])}">${esc(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  return out + esc(kk.slice(last));
}
function itemHtml(it){
  const i = ALL.indexOf(it);
  return `<div class="item ${S.known[it.key] ? 'known' : ''}" data-i="${i}">
    <p class="kk">${it.label ? `<span class="lab">${esc(it.label)}</span>` : ''}${kkHtml(it.kk)}</p>
    <p class="ru">${esc(it.ru)}</p>
    <div class="acts">
      <button class="ib play" data-act="play" aria-label="Слушать">${ICON.play}</button>
      <button class="ib" data-act="slow" aria-label="Медленно" title="Медленно"><span class="t">🐢</span></button>
      <button class="ib fav ${S.fav[it.key] ? 'on' : ''}" data-act="fav" aria-label="В избранное" title="В избранное">${ICON.star}</button>
      <button class="ib kn ${S.known[it.key] ? 'on' : ''}" data-act="known" aria-label="Выучено" title="Выучено">${ICON.check}</button>
    </div>
    ${it.note ? `<p class="note">${esc(it.note)}</p>` : ''}
  </div>`;
}
const listHtml = list => `<div class="items">${list.map(itemHtml).join('')}</div>`;
const badge = lv => `<span class="badge lv${lv}"><span class="dot"></span>${lvName(lv)}</span>`;
function levelChips(){
  const chip = (lv, name, hint) => `<button class="lvchip ${lv ? 'lv' + lv : ''} ${S.lv === lv ? 'on' : ''}" data-act="lv" data-lv="${lv}">
    <b>${lv ? '<span class="dot"></span>' : ''}${esc(name)}</b><small>${esc(hint)}</small></button>`;
  return `<div class="levels">${chip(0, 'Все уровни', 'Показать всё')}${LEVELS.map(l => chip(l.lv, `${l.lv}. ${l.name}`, l.hint)).join('')}</div>`;
}
const settingsHtml = () => `<section class="settings" aria-label="Настройки">
  <label>Скорость голоса <input id="rate" type="range" min="0.7" max="1.2" step="0.05" value="${S.rate}"> <span id="ratev">${Math.round(S.rate * 100)}%</span></label>
  <label><input id="hideru" type="checkbox" ${S.hideRu ? 'checked' : ''}> Прятать перевод (проверить себя; нажмите на перевод, чтобы увидеть)</label>
  <label><input id="listenru" type="checkbox" ${S.listenRu ? 'checked' : ''}> В режиме «Слушать подряд» читать и перевод</label>
</section>`;

/* ---------- views ---------- */
let view = { name: 'home' }, current = [];   // current: items on screen, in order (for the player)
const app = $('#app');

function dailyItem(){
  const pool = ALL.filter(it => kkWords(it.kk).length > 1);
  const d = new Date(), n = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate();
  return pool[(n * 7919) % pool.length];
}

function renderHome(){
  const total = ALL.filter(lvOk).length, known = ALL.filter(it => lvOk(it) && S.known[it.key]).length;
  const day = dailyItem();
  current = [day];
  app.innerHTML = `
    <section class="hero">
      <h1>Казахский для жизни</h1>
      <p>Работа, быт, гости, тосты — самые нужные фразы. Нажмите на любое слово, чтобы услышать его отдельно.</p>
      <div class="stats"><span><b>${known}</b>из ${total} фраз выучено</span><span><b>${TOPICS.length}</b>тем</span></div>
      <div class="bar"><i style="width:${total ? known / total * 100 : 0}%"></i></div>
    </section>
    <h2 class="sec">Уровень</h2>
    ${levelChips()}
    <div class="daily"><span class="lbl">Фраза дня</span><div class="${S.hideRu ? 'hide-ru' : ''}">${listHtml([day])}</div></div>
    <h2 class="sec">Темы</h2>
    <div class="tiles">${TOPICS.map(t => {
      const its = itemsOf(t); if (!its.length) return '';
      const k = its.filter(it => S.known[it.key]).length;
      return `<a class="tile" href="#/t/${t.id}"><span class="ic">${t.icon}</span><b>${esc(t.ru)}</b>
        <small>${esc(t.kk)} · ${its.length} ${plural(its.length, 'фраза', 'фразы', 'фраз')}</small>
        <span class="bar"><i style="width:${k / its.length * 100}%"></i></span></a>`;
    }).join('')}</div>
    ${settingsHtml()}
    <p class="foot">Озвучка: голос казахского диктора (ISSAI, Назарбаев Университет), русский — Irina. Работает без интернета после первого прослушивания.</p>`;
}

function renderTopic(t){
  const its = itemsOf(t);
  current = its;
  const groups = t.groups.filter(g => !S.lv || g.lv === S.lv);
  app.innerHTML = `
    <a class="back" href="#/">${ICON.back} Все темы</a>
    <div class="thead"><span class="ic">${t.icon}</span><div><h1>${esc(t.ru)}</h1><p>${esc(t.kk)}</p></div></div>
    ${levelChips()}
    <div class="tools">
      <button class="btn pri" data-act="listen">${ICON.play} Слушать подряд</button>
      <a class="btn gold" href="#/quiz/${t.id}">🎯 Тренировка</a>
      <label class="toggle"><input type="checkbox" data-act="hideru" ${S.hideRu ? 'checked' : ''}> Прятать перевод</label>
    </div>
    <div class="${S.hideRu ? 'hide-ru' : ''}">
    ${groups.length ? groups.map(g => `<section class="group">
      <div class="ghead"><h3>${esc(g.ru)}</h3>${badge(g.lv)}</div>
      ${g.hint ? `<p class="hint">${esc(g.hint)}</p>` : ''}
      ${listHtml(its.filter(it => it.group === g))}
    </section>`).join('') : `<p class="empty">На этом уровне в теме пока нет фраз — выберите другой уровень.</p>`}
    </div>`;
}

function renderList(title, list, emptyText, quizId){
  current = list;
  app.innerHTML = `
    <a class="back" href="#/">${ICON.back} Все темы</a>
    <div class="thead"><div><h1>${esc(title)}</h1><p>${list.length} ${plural(list.length, 'фраза', 'фразы', 'фраз')}</p></div></div>
    ${list.length ? `<div class="tools"><button class="btn pri" data-act="listen">${ICON.play} Слушать подряд</button>
      ${quizId && list.length >= 4 ? `<a class="btn gold" href="#/quiz/${quizId}">🎯 Тренировка</a>` : ''}</div>` : ''}
    <div class="${S.hideRu ? 'hide-ru' : ''}">${list.length ? listHtml(list) : `<p class="empty">${esc(emptyText)}</p>`}</div>`;
}

/* ---------- quiz ---------- */
let Q = null;
function startQuiz(id){
  const t = TOPICS.find(x => x.id === id);
  let pool = id === 'fav' ? ALL.filter(it => S.fav[it.key]) : t ? itemsOf(t) : [];
  if (!pool.length) { location.hash = '#/'; return; }
  // unknown phrases first, then the rest
  pool = [...shuffle(pool.filter(it => !S.known[it.key])), ...shuffle(pool.filter(it => S.known[it.key]))].slice(0, 10);
  const distract = t ? itemsOf(t) : ALL;
  Q = { id, title: t ? t.ru : 'Избранное', i: 0, right: 0, qs: pool.map((it, n) => {
    const mode = n % 2 ? 'ru2kk' : 'kk2ru';
    const field = mode === 'kk2ru' ? 'ru' : 'kk';
    // wrong answers from the same topic first, so the right one does not stand out
    const others = [...shuffle(distract), ...shuffle(ALL)].filter(o => o[field] !== it[field]);
    const uniq = [...new Map(others.map(o => [o[field], o])).values()].slice(0, 3);
    return { it, mode, opts: shuffle([it, ...uniq]), field };
  }) };
  renderQuiz();
}
function renderQuiz(){
  current = [];
  if (Q.i >= Q.qs.length) {
    const n = Q.qs.length, r = Q.right;
    app.innerHTML = `<a class="back" href="#/${Q.id === 'fav' ? 'fav' : 't/' + Q.id}">${ICON.back} ${esc(Q.title)}</a>
      <div class="result"><div class="score">${r} / ${n}</div>
      <p>${r === n ? 'Отлично! Жарайсыз! 🎉' : r >= n * 0.7 ? 'Хороший результат! Тамаша!' : 'Ничего страшного — послушайте фразы ещё раз и попробуйте снова.'}</p>
      <div class="tools"><a class="btn pri" href="#/quiz/${Q.id}?${Date.now()}">Ещё раз</a><a class="btn" href="#/${Q.id === 'fav' ? 'fav' : 't/' + Q.id}">К фразам</a></div></div>`;
    play(r === n ? 'Керемет!' : 'Жарайсыз!');
    return;
  }
  const q = Q.qs[Q.i];
  app.innerHTML = `
    <div class="quiz">
      <div class="qtop"><a class="ib" href="#/${Q.id === 'fav' ? 'fav' : 't/' + Q.id}" aria-label="Закрыть">${ICON.close}</a>
        <div class="qprog"><i style="width:${Q.i / Q.qs.length * 100}%"></i></div><small>${Q.i + 1}/${Q.qs.length}</small></div>
      <div class="qcard">
        <span class="ask">${q.mode === 'kk2ru' ? 'Что это значит?' : 'Как сказать по-казахски?'}</span>
        <div class="big">${q.mode === 'kk2ru' ? kkHtml(q.it.kk) : esc(q.it.ru)}</div>
        ${q.mode === 'kk2ru' ? `<button class="btn sm" data-act="qplay">${ICON.play} Ещё раз</button>` : ''}
      </div>
      <div class="opts">${q.opts.map((o, k) => `<button class="opt" data-act="ans" data-k="${k}">${esc(o[q.field])}</button>`).join('')}</div>
    </div>`;
  if (q.mode === 'kk2ru') play(q.it.kk);
}
function answer(k, btn){
  const q = Q.qs[Q.i], o = q.opts[k], ok = o === q.it;
  const box = btn.parentNode; box.classList.add('done');
  btn.classList.add(ok ? 'right' : 'wrong');
  if (!ok) box.children[q.opts.indexOf(q.it)].classList.add('right');
  if (ok) { Q.right++; S.known[q.it.key] = 1; save(); }
  // always let the learner hear the right Kazakh phrase
  play(q.it.kk).then(() => wait(ok ? 400 : 1200)).then(() => { if (Q && Q.qs[Q.i] === q) { Q.i++; renderQuiz(); } });
}

/* ---------- hands-free listening ---------- */
const P = { list: [], i: 0, on: false, run: 0 };
const player = $('#player');
function renderPlayer(){
  if (!P.list.length) { player.hidden = true; return; }
  const it = P.list[P.i];
  player.hidden = false;
  player.innerHTML = `<button class="ib" data-act="pprev" aria-label="Назад">${ICON.prev}</button>
    <button class="ib" data-act="ptoggle" aria-label="${P.on ? 'Пауза' : 'Играть'}">${P.on ? ICON.pause : ICON.play}</button>
    <button class="ib" data-act="pnext" aria-label="Дальше">${ICON.next}</button>
    <div class="pt"><b>${esc(it.kk)}</b><small>${esc(it.ru)} · ${P.i + 1}/${P.list.length}</small></div>
    <button class="ib x" data-act="pclose" aria-label="Закрыть">${ICON.close}</button>`;
  document.querySelectorAll('.item.now').forEach(e => e.classList.remove('now'));
  const el = document.querySelector(`.item[data-i="${ALL.indexOf(it)}"]`);
  if (el) { el.classList.add('now'); if (P.on) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
}
async function runPlayer(){
  const run = ++P.run;
  while (P.on && run === P.run && P.i < P.list.length) {
    renderPlayer();
    const it = P.list[P.i];
    await play(it.kk); if (run !== P.run) return;
    await wait(700); if (run !== P.run) return;
    if (S.listenRu) { await play(ruSay(it.ru), 'ru'); if (run !== P.run) return; await wait(700); if (run !== P.run) return; }
    await play(it.kk, 'kk', true); if (run !== P.run) return;
    await wait(1600); if (run !== P.run) return;
    P.i++;
  }
  if (run === P.run && P.i >= P.list.length) { P.on = false; P.i = P.list.length - 1; renderPlayer(); }
}
function startPlayer(list){ P.list = list; P.i = 0; P.on = true; runPlayer(); }
function playerAct(a){
  if (a === 'pclose') { P.on = false; P.run++; stopSound(); P.list = []; renderPlayer(); document.querySelectorAll('.item.now').forEach(e => e.classList.remove('now')); return; }
  if (a === 'ptoggle') { P.on = !P.on; if (P.on) { if (P.i >= P.list.length) P.i = 0; runPlayer(); } else { P.run++; stopSound(); renderPlayer(); } return; }
  P.i = Math.max(0, Math.min(P.list.length - 1, P.i + (a === 'pnext' ? 1 : -1)));
  if (P.on) runPlayer(); else { stopSound(); renderPlayer(); }
}

/* ---------- router ---------- */
function route(){
  const h = location.hash.replace(/^#\/?/, '').replace(/\?.*$/, '');
  const [a, b] = h.split('/');
  const q = $('#q').value.trim();
  if (a !== 'search' && q && !h.startsWith('search')) $('#q').value = '';
  if (a === 't' && TOPICS.find(t => t.id === b)) { view = { name: 'topic', id: b }; renderTopic(TOPICS.find(t => t.id === b)); }
  else if (a === 'fav') { view = { name: 'fav' }; renderList('Избранное', ALL.filter(it => S.fav[it.key]), 'Здесь появятся фразы, отмеченные звёздочкой ☆.', 'fav'); }
  else if (a === 'quiz') { view = { name: 'quiz' }; startQuiz(b); }
  else if (a === 'search') { view = { name: 'search' }; renderSearch(); }
  else { view = { name: 'home' }; renderHome(); }
  updateFavCount();
  if (P.list.length) renderPlayer();
}
function rerender(){ const y = scrollY; route(); scrollTo(0, y); }
function renderSearch(){
  const q = $('#q').value.trim().toLowerCase();
  const list = q.length < 2 ? [] : ALL.filter(it => it.kk.toLowerCase().includes(q) || it.ru.toLowerCase().includes(q));
  renderList(q ? `Поиск: «${$('#q').value.trim()}»` : 'Поиск', list, q.length < 2 ? 'Введите хотя бы две буквы — по-русски или по-казахски.' : 'Ничего не нашлось. Попробуйте другое слово.');
}
function updateFavCount(){ const n = Object.keys(S.fav).length; $('#favn').textContent = n || ''; }

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const w = e.target.closest('.w');
  if (w && !e.target.closest('.opt')) {
    document.querySelectorAll('.w.on').forEach(x => x.classList.remove('on'));
    w.classList.add('on');
    play(w.dataset.w.toLowerCase()).then(() => w.classList.remove('on'));
    return;
  }
  const ru = e.target.closest('.hide-ru .ru');
  if (ru) { ru.classList.toggle('show'); return; }
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act;
  const itemEl = b.closest('.item'), it = itemEl && ALL[+itemEl.dataset.i];
  if (a === 'play' && it) play(it.kk);
  else if (a === 'slow' && it) play(it.kk, 'kk', true);
  else if (a === 'fav' && it) { if (S.fav[it.key]) delete S.fav[it.key]; else S.fav[it.key] = 1; save(); b.classList.toggle('on'); updateFavCount(); }
  else if (a === 'known' && it) { if (S.known[it.key]) delete S.known[it.key]; else S.known[it.key] = 1; save(); b.classList.toggle('on'); itemEl.classList.toggle('known'); }
  else if (a === 'lv') { S.lv = +b.dataset.lv; save(); rerender(); }
  else if (a === 'listen') startPlayer(current);
  else if (a === 'qplay') play(Q.qs[Q.i].it.kk);
  else if (a === 'ans') answer(+b.dataset.k, b);
  else if (a[0] === 'p' && a !== 'play') playerAct(a);
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'hideru' || t.dataset.act === 'hideru') { S.hideRu = t.checked; save(); rerender(); }
  else if (t.id === 'listenru') { S.listenRu = t.checked; save(); }
});
document.addEventListener('input', e => {
  if (e.target.id === 'rate') { S.rate = +e.target.value; save(); $('#ratev').textContent = Math.round(S.rate * 100) + '%'; }
  if (e.target.id === 'q') {
    if (!location.hash.startsWith('#/search')) history.replaceState(null, '', '#/search');
    view = { name: 'search' }; renderSearch();
  }
});
$('#q').addEventListener('keydown', e => { if (e.key === 'Enter') e.target.blur(); });
addEventListener('hashchange', () => { if (view.name === 'quiz') Q = null; route(); scrollTo(0, 0); });
route();

/* ---------- offline ---------- */
if ('serviceWorker' in navigator && location.protocol === 'https:') addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
