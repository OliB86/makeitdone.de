/* Entwurf C: Aussagen-Band ("Das hören wir von Unternehmern").
   Quelle: /aussagen.json (neue Aussagen dort ergänzen, mit "anzeigen": false ausblenden).
   Themen-Knöpfe wählen das Band; jede Aussage ist eine gleich hohe Spalte ohne Kasten.
   "Antwort lesen" zeigt Einwand, Antwort und Link in einem Bereich unter dem Band. */
(function () {
  var DATA = null, THEMA = 'Alle', SEL = -1;
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var HL = 'background:linear-gradient(transparent 58%, #F1D734 58%, #F1D734 94%, transparent 94%);-webkit-box-decoration-break:clone;box-decoration-break:clone;padding:0 .08em';
  function css() {
    if (document.getElementById('aq-css')) return;
    var s = document.createElement('style'); s.id = 'aq-css';
    s.textContent =
      '@keyframes aqm{to{transform:translateX(-50%)}}' +
      '.aq{display:flex;width:max-content;animation:aqm var(--aqd,120s) linear infinite}' +
      '.aq:hover,.aq.hold{animation-play-state:paused}' +
      '@media (prefers-reduced-motion: reduce){.aq{animation:none}.aq-wrap{overflow-x:auto !important}}' +
      '.aq-i{flex:0 0 380px;box-sizing:border-box;padding:12px 36px 12px 28px;border-left:1px solid rgba(20,20,20,.18);display:flex;flex-direction:column;gap:22px}' +
      '.aq-a{font-family:"Space Grotesk",sans-serif;font-size:22px;font-weight:700;line-height:1.3;display:-webkit-box;-webkit-line-clamp:7;-webkit-box-orient:vertical;overflow:hidden;margin:0}' +
      '.aq-d{font-family:"Instrument Serif",Georgia,serif;font-size:20px;line-height:1.5;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;margin:0}' +
      '.aq-b{margin-top:auto;padding-top:18px !important;align-self:flex-start;background:none;border:0;padding:0;font:inherit;font-size:15px;font-weight:600;color:#141414;text-decoration:underline;text-underline-offset:4px;cursor:pointer;min-height:32px}' +
      '.aq-i.sel .aq-b{text-decoration-color:#F1D734;text-decoration-thickness:3px}' +
      '.aq-tab{border:1px solid #c8c8c8;background:transparent;color:#141414;border-radius:999px;padding:9px 16px;font:inherit;font-size:15px;font-weight:600;cursor:pointer;min-height:44px}' +
      '.aq-tab.on{background:#141414;border-color:#141414;color:#fff}' +
      '.aq-tab:focus-visible,.aq-b:focus-visible{outline:3px solid #F1D734;outline-offset:3px}' +
      '.aq-det{display:none}.aq-det.on{display:grid}';
    document.head.appendChild(s);
  }
  function list() {
    return (DATA || []).filter(function (r) { return r.aussage && r.anzeigen !== false && (THEMA === 'Alle' || r.thema === THEMA); });
  }
  function item(r, i) {
    return '<div class="aq-i' + (i === SEL ? ' sel' : '') + '" data-i="' + i + '">' +
      '<p class="aq-a">„' + esc(r.aussage) + '“</p>' +
      '<p class="aq-d"><span style="' + HL + '">' + esc(r.danach) + '</span></p>' +
      '<button type="button" class="aq-b" aria-expanded="' + (i === SEL) + '">Unsere Antwort lesen →</button></div>';
  }
  function detail(r) {
    if (!r) return '';
    return '<div style="display:flex;flex-direction:column;gap:10px"><span style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#5c5c5c">' + esc(r.thema) + '</span>' +
      '<p style="margin:0;font-family:\'Space Grotesk\',sans-serif;font-size:28px;font-weight:700;line-height:1.2">„' + esc(r.aussage) + '“</p>' +
      '<p style="margin:0;font-size:17px;color:#5c5c5c;font-style:italic">Und dann kommt meist: „' + esc(r.einwand) + '“</p></div>' +
      '<div style="display:flex;flex-direction:column;gap:14px"><span style="font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#5c5c5c">Unsere Antwort</span>' +
      '<p style="margin:0;font-size:18px;line-height:1.65">' + esc(r.antwort) + '</p>' +
      '<p style="margin:0;font-family:\'Instrument Serif\',Georgia,serif;font-size:22px;line-height:1.4"><span style="' + HL + '">' + esc(r.danach) + '</span></p>' +
      '<span style="display:flex;gap:22px;flex-wrap:wrap;align-items:center">' +
      (r.link ? '<a href="' + esc(r.link) + '" style="font-weight:600;font-size:15px;color:#141414">' + esc(r.linktext || 'Mehr dazu') + ' →</a>' : '') +
      '<button type="button" class="aq-x" style="background:none;border:0;padding:0;font:inherit;font-size:15px;color:#5c5c5c;text-decoration:underline;cursor:pointer;min-height:32px">Schließen</button></span></div>';
  }
  function fit(aq) {
    var els = aq.querySelectorAll('.aq-i'), m = 0;
    els.forEach(function (e) { e.style.height = 'auto'; });
    els.forEach(function (e) { m = Math.max(m, e.offsetHeight); });
    els.forEach(function (e) { e.style.height = m + 'px'; });
  }
  function refit() { document.querySelectorAll('[data-aussagen] .aq').forEach(fit); }
  function paint() {
    css();
    document.querySelectorAll('[data-aussagen]').forEach(function (root) {
      if (!DATA) return;
      var L = list();
      // Themen-Knöpfe
      var themes = ['Alle'];
      DATA.forEach(function (r) { if (r.aussage && r.anzeigen !== false && themes.indexOf(r.thema) < 0) themes.push(r.thema); });
      var tabs = root.querySelector('.aq-tabs');
      var tsig = themes.join('|') + '#' + THEMA;
      if (tabs && tabs.getAttribute('data-sig') !== tsig) {
        tabs.innerHTML = themes.map(function (t) { return '<button type="button" class="aq-tab' + (t === THEMA ? ' on' : '') + '" aria-pressed="' + (t === THEMA) + '" data-t="' + esc(t) + '">' + esc(t) + '</button>'; }).join('');
        tabs.setAttribute('data-sig', tsig);
      }
      // Band: so oft wiederholen, dass es breiter als der Bildschirm ist, dann verdoppeln
      var aq = root.querySelector('.aq');
      var sig = THEMA + '#' + L.length + '#' + SEL;
      if (aq && aq.getAttribute('data-sig') !== sig) {
        var rep = Math.max(1, Math.ceil(2200 / (Math.max(L.length, 1) * 380)));
        var one = ''; for (var k = 0; k < rep; k++) one += L.map(item).join('');
        aq.innerHTML = one + one;
        aq.style.setProperty('--aqd', Math.max(40, L.length * rep * 9) + 's');
        aq.setAttribute('data-sig', sig);
        fit(aq);
      }
      if (aq) aq.classList.toggle('hold', SEL >= 0);
      var det = root.querySelector('.aq-det');
      if (det) {
        det.classList.toggle('on', SEL >= 0);
        det.innerHTML = SEL >= 0 ? detail(L[SEL]) : '';
      }
    });
  }
  document.addEventListener('click', function (e) {
    if (!e.target.closest) return;
    var t = e.target.closest('.aq-tab');
    if (t) { THEMA = t.getAttribute('data-t'); SEL = -1; paint(); return; }
    var b = e.target.closest('.aq-b');
    if (b) {
      var i = +b.closest('.aq-i').getAttribute('data-i');
      SEL = SEL === i ? -1 : i; paint();
      var det = b.closest('[data-aussagen]').querySelector('.aq-det');
      if (SEL >= 0 && det) det.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    if (e.target.closest('.aq-x')) { SEL = -1; paint(); }
  });
  var prev = window.dcAfter;
  window.dcAfter = function () { if (prev) prev(); paint(); };
  function load() {
    css();
    fetch('/aussagen.json', { cache: 'no-cache' }).then(function (r) { return r.json(); })
      .then(function (d) { DATA = d.aussagen || []; paint(); }).catch(function () {});
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refit);
    window.addEventListener('load', refit);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(load, 0); });
  else setTimeout(load, 0);
})();
