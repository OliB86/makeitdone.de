/* Entwurf C: Aussagen-Band ("Das hören wir von Unternehmern").
   Quelle: /aussagen.json. Neue Aussagen einfach dort ergänzen, mit "anzeigen": false ausblenden.
   Endloses Laufband, hält bei Maus darüber und solange eine Karte aufgeklappt ist. */
(function () {
  var DATA = null, OPEN = {};
  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function css() {
    if (document.getElementById('aq-css')) return;
    var s = document.createElement('style'); s.id = 'aq-css';
    s.textContent =
      '@keyframes aqm{to{transform:translateX(-50%)}}' +
      '.aq{display:flex;gap:22px;width:max-content;align-items:flex-start;animation:aqm 160s linear infinite}' +
      '.aq:hover,.aq.hold{animation-play-state:paused}' +
      '@media (prefers-reduced-motion: reduce){.aq{animation:none}.aq-wrap{overflow-x:auto !important}}' +
      '.aq-c{flex:0 0 360px;display:flex;flex-direction:column;gap:14px;padding:28px;border-radius:24px;background:#fff;box-shadow:0 12px 40px rgba(0,0,0,.07)}' +
      '.aq-k{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#5c5c5c}' +
      '.aq-a{font-family:"Space Grotesk",sans-serif;font-size:22px;font-weight:700;line-height:1.25}' +
      '.aq-r{font-size:16px;line-height:1.6;color:#141414;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}' +
      '.aq-c.open .aq-r{display:block;-webkit-line-clamp:unset;overflow:visible}' +
      '.aq-more{align-self:flex-start;background:none;border:0;padding:2px 0;font:inherit;font-size:15px;font-weight:600;color:#141414;text-decoration:underline;text-underline-offset:3px;cursor:pointer;min-height:32px}' +
      '.aq-more[hidden]{display:none}' +
      '.aq-d{display:flex;flex-direction:column;gap:6px;background:#F1D734;border-radius:16px;padding:16px 18px}' +
      '.aq-d span:last-child{font-family:"Instrument Serif",Georgia,serif;font-size:21px;line-height:1.35}';
    document.head.appendChild(s);
  }
  function card(r, i) {
    return '<article class="aq-c" data-i="' + i + '">' +
      '<span style="display:flex;justify-content:space-between;gap:10px;align-items:center"><span class="aq-k">Das hören wir oft</span>' +
      '<span style="font-size:12px;font-weight:600;border:1px solid #c8c8c8;border-radius:999px;padding:3px 10px;white-space:nowrap">' + esc(r.thema) + '</span></span>' +
      '<span class="aq-a">„' + esc(r.aussage) + '“</span>' +
      '<span style="display:flex;flex-direction:column;gap:4px;padding-top:12px;border-top:1px solid #e4e4e4"><span class="aq-k">Und dann kommt meist</span><span style="font-size:16px;color:#5c5c5c;font-style:italic">„' + esc(r.einwand) + '“</span></span>' +
      '<span style="display:flex;flex-direction:column;gap:4px"><span class="aq-k">Unsere Antwort</span><span class="aq-r">' + esc(r.antwort) + '</span></span>' +
      '<button type="button" class="aq-more" aria-expanded="false">Mehr lesen</button>' +
      '<span class="aq-d"><span class="aq-k" style="color:#3d3d3d">Wo du danach stehen kannst</span><span>' + esc(r.danach) + '</span></span>' +
      (r.link ? '<a href="' + esc(r.link) + '" style="font-weight:600;font-size:15px;color:#141414">' + esc(r.linktext || 'Mehr dazu') + ' →</a>' : '') +
      '</article>';
  }
  function list() { return (DATA || []).filter(function (r) { return r.aussage && r.anzeigen !== false; }); }
  function paint() {
    css();
    var L = list(), sig = String(L.length) + (L[0] ? L[0].aussage.slice(0, 20) : '');
    document.querySelectorAll('[data-aussagen] .aq').forEach(function (aq) {
      if (DATA && aq.getAttribute('data-sig') !== sig) {
        var h = L.map(card).join('');
        aq.innerHTML = h + h;
        aq.setAttribute('data-sig', sig);
      }
      aq.querySelectorAll('.aq-c').forEach(function (c) {
        var o = !!OPEN[c.getAttribute('data-i')];
        c.classList.toggle('open', o);
        var b = c.querySelector('.aq-more'), t = c.querySelector('.aq-r');
        if (!b || !t) return;
        b.textContent = o ? 'Weniger anzeigen' : 'Mehr lesen';
        b.setAttribute('aria-expanded', o ? 'true' : 'false');
        if (!o) b.hidden = t.scrollHeight <= t.clientHeight + 2;
      });
      aq.classList.toggle('hold', Object.keys(OPEN).some(function (k) { return OPEN[k]; }));
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.aq-more') : null;
    if (!b) return;
    var i = b.closest('.aq-c').getAttribute('data-i');
    OPEN[i] = !OPEN[i];
    paint();
  });
  var prev = window.dcAfter;
  window.dcAfter = function () { if (prev) prev(); paint(); };
  function load() {
    paint();
    fetch('/aussagen.json', { cache: 'no-cache' }).then(function (r) { return r.json(); })
      .then(function (d) { DATA = d.aussagen || []; paint(); }).catch(function () {});
    window.addEventListener('resize', paint);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(load, 0); });
  else setTimeout(load, 0);
})();
