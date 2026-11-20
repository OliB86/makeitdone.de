/* Entwurf C: Google-Bewertungen als Laufband.
   Quelle: /bewertungen.json (wird von Make aus dem Google-Unternehmensprofil befüllt).
   Gezeigt werden alle Bewertungen mit 5 Sternen und Text, neueste zuerst,
   außer Einträge mit "anzeigen": false. Lange Texte sind gekürzt, "Mehr lesen" klappt sie auf. */
(function () {
  var DATA = null, OPEN = {};
  var STAR = '<span aria-hidden="true" style="color: #F1D734; -webkit-text-stroke: .6px #b39a00; font-size: 22px; letter-spacing: 3px; line-height: 1">★★★★★</span>';
  var CHK = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#141414" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"></path></svg>';

  function css() {
    if (document.getElementById('rvw-css')) return;
    var s = document.createElement('style'); s.id = 'rvw-css';
    s.textContent = '.vq{align-items:flex-start}.vq.hold{animation-play-state:paused !important}' +
      '.rvw-t{margin:0;font-size:17px;line-height:1.55;white-space:pre-line;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;overflow:hidden}' +
      '.rvw.open .rvw-t{display:block;-webkit-line-clamp:unset;overflow:visible}' +
      '.rvw-more{align-self:flex-start;background:none;border:0;padding:4px 0;font:inherit;font-size:15px;font-weight:600;color:#141414;text-decoration:underline;text-underline-offset:3px;cursor:pointer;min-height:32px}' +
      '.rvw-more[hidden]{display:none}';
    document.head.appendChild(s);
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function card(r, i) {
    return '<figure class="rvw" data-i="' + i + '" style="margin: 0; flex: 0 0 380px; display: flex; flex-direction: column; gap: 14px; padding: 30px; border-radius: 24px; background: #ffffff; box-shadow: 0 12px 40px rgba(0,0,0,.07)">' +
      '<span style="display: flex; justify-content: space-between; align-items: center; gap: 12px">' + STAR +
      '<span style="display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; background: #F1D734; color: #141414; border-radius: 999px; padding: 4px 10px; white-space: nowrap">' + CHK + 'Google-Bewertung</span></span>' +
      '<span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">5 von 5 Sternen</span>' +
      '<blockquote class="rvw-t">„' + esc(r.text) + '“</blockquote>' +
      '<button type="button" class="rvw-more" aria-expanded="false">Mehr lesen</button>' +
      '<figcaption style="display: flex; flex-direction: column; gap: 2px; font-size: 14px; color: #5c5c5c"><b style="color: #141414; font-size: 15px">' + esc(r.name) + '</b><span>' + (r.kontext ? esc(r.kontext) + ' · ' : '') + 'auf Google</span></figcaption></figure>';
  }
  function list() {
    return (DATA || []).filter(function (r) { return r.sterne === 5 && r.text && r.anzeigen !== false; })
      .sort(function (a, b) { return String(b.datum).localeCompare(String(a.datum)); });
  }
  function paint() {
    css();
    var L = list(), sig = L.length + ':' + (L[0] ? L[0].datum + L[0].name : '');
    document.querySelectorAll('[aria-label="Kundenstimmen"] .vq').forEach(function (vq) {
      if (DATA && vq.getAttribute('data-sig') !== sig) {
        var h = L.map(card).join('');
        vq.innerHTML = h + h; // doppelt für das endlose Laufband
        vq.setAttribute('data-sig', sig);
      }
      vq.querySelectorAll('.rvw').forEach(function (f) {
        var o = !!OPEN[f.getAttribute('data-i')];
        f.classList.toggle('open', o);
        var b = f.querySelector('.rvw-more'), t = f.querySelector('.rvw-t');
        if (!b || !t) return;
        b.textContent = o ? 'Weniger anzeigen' : 'Mehr lesen';
        b.setAttribute('aria-expanded', o ? 'true' : 'false');
        if (!o) b.hidden = t.scrollHeight <= t.clientHeight + 2;
      });
      vq.classList.toggle('hold', Object.keys(OPEN).some(function (k) { return OPEN[k]; }));
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.rvw-more') : null;
    if (!b) return;
    var i = b.closest('.rvw').getAttribute('data-i');
    OPEN[i] = !OPEN[i];
    paint();
  });
  var prev = window.dcAfter;
  window.dcAfter = function () { if (prev) prev(); paint(); };
  function load() {
    paint();
    fetch('/bewertungen.json', { cache: 'no-cache' }).then(function (r) { return r.json(); })
      .then(function (d) { DATA = d.bewertungen || []; paint(); }).catch(function () {});
    window.addEventListener('resize', paint);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(load, 0); });
  else setTimeout(load, 0);
})();
