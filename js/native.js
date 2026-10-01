/* ===== Native shell glue: progress storage + pre-recorded voice clips =====
   Runs the same in a browser, in Tauri (Windows) and in Capacitor (iOS). */

const SHELL = (() => {
  const cap = window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform();
  if (cap) return 'ios';
  if (window.__TAURI_INTERNALS__ || window.__TAURI__) return 'windows';
  return 'web';
})();

/* ---------- storage ----------
   localStorage is read synchronously at start-up. On iOS the OS may purge WKWebView
   storage, so every save is mirrored to Capacitor Preferences (UserDefaults) and
   restored from there if localStorage comes back empty. */
const Store = {
  key: 'kq1',
  load(){ try { return JSON.parse(localStorage.getItem(this.key) || 'null'); } catch(e) { return null; } },
  save(obj){
    const s = JSON.stringify(obj);
    try { localStorage.setItem(this.key, s); } catch(e) {}
    const P = SHELL === 'ios' && window.Capacitor.Plugins && window.Capacitor.Plugins.Preferences;
    if (P) P.set({ key: this.key, value: s }).catch(() => {});
  },
  // resolves with the saved object if native storage has progress that localStorage lost
  async restore(){
    const P = SHELL === 'ios' && window.Capacitor.Plugins && window.Capacitor.Plugins.Preferences;
    if (!P || this.load()) return null;
    try { const r = await P.get({ key: this.key }); return r && r.value ? JSON.parse(r.value) : null; } catch(e) { return null; }
  }
};

/* ---------- pre-recorded clips ----------
   audio/manifest.js sets window.AUDIO_MANIFEST = { rate, voices, kk:{key:file}, ru:{…}, en:{…} }.
   Keys are normalised phrase text; files live in audio/<lang>/<file>.mp3 */
const clipKey = s => String(s).trim().toLowerCase().replace(/\s+/g, ' ');
const Clips = {
  m: window.AUDIO_MANIFEST || null,
  el: null,
  has(text, l){ return !!(this.m && this.m[l] && this.m[l][clipKey(text)]); },
  url(text, l){ return `audio/${l}/${this.m[l][clipKey(text)]}.mp3`; },
  count(l){ return this.m && this.m[l] ? Object.keys(this.m[l]).length : 0; },
  // one reused element: once unlocked by a tap, iOS lets it play later without a gesture
  audio(){
    if (!this.el) { this.el = new Audio(); this.el.preload = 'auto'; }
    return this.el;
  },
  // first tap: play any clip silently so the element is "user-activated"
  unlock(){
    const a = this.audio();
    if (a.src || !this.m) return;
    const l = ['kk','ru','en'].find(x => this.count(x));
    if (!l) return;
    a.src = `audio/${l}/${Object.values(this.m[l])[0]}.mp3`;
    a.volume = 0; a.play().then(() => { a.pause(); a.volume = 1; }).catch(() => { a.volume = 1; });
  },
  // resolves true when the clip played, false if it could not (missing file, blocked) — caller then uses the system voice
  play(text, l, rate, onstart){
    return new Promise(done => {
      const a = this.audio();
      a.onended = () => done(true);
      a.onerror = () => done(false);
      a.src = this.url(text, l);
      a.preservesPitch = true;
      a.playbackRate = Math.max(0.5, Math.min(2, rate / ((this.m && this.m.rate) || 0.85)));
      a.volume = 1;
      const p = a.play();
      if (p) p.then(() => onstart && onstart()).catch(() => done(false)); else if (onstart) onstart();
    });
  },
  stop(){ if (this.el) { this.el.onended = this.el.onerror = null; this.el.pause(); } }
};

/* ---------- website: offline cache ---------- */
if (SHELL === 'web' && 'serviceWorker' in navigator && location.protocol === 'https:') {
  addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
