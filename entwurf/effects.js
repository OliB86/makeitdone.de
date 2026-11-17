/* Effekte für Entwurf B: Einblenden, Hochzählen, Wort-für-Wort, aktive Phase, Kippen */
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('fx');
  var seen = new WeakSet();
  function count(root) {
    root.querySelectorAll('[data-count]').forEach(function (n) {
      if (n.__c) return; n.__c = 1;
      var to = +n.getAttribute('data-count'), plain = n.hasAttribute('data-plain'), t0 = null, d = 1800;
      function f(ts) {
        if (!t0) t0 = ts;
        var p = Math.min(1, (ts - t0) / d), v = Math.round(to * (1 - Math.pow(1 - p, 3)));
        n.textContent = plain ? String(v) : v.toLocaleString('de-DE');
        if (p < 1) requestAnimationFrame(f);
      }
      requestAnimationFrame(f);
    });
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      seen.add(e.target); e.target.classList.add('in'); count(e.target); io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  function scan() {
    document.querySelectorAll('.rv').forEach(function (el) {
      if (seen.has(el)) { if (!el.classList.contains('in')) el.classList.add('in'); }
      else if (!el.__obs) { el.__obs = 1; io.observe(el); }
    });
  }
  function onScroll() {
    var vh = innerHeight;
    document.querySelectorAll('.words').forEach(function (p) {
      var r = p.getBoundingClientRect(), prog = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      var ws = p.querySelectorAll('.w'), k = Math.round(Math.max(0, Math.min(1, prog)) * ws.length);
      ws.forEach(function (w, i) { var on = i < k; if (w.classList.contains('on') !== on) w.classList.toggle('on', on); });
    });
    var phs = document.querySelectorAll('.phase'), best = -1;
    phs.forEach(function (el, i) { if (el.getBoundingClientRect().top < vh * 0.62) best = i; });
    phs.forEach(function (el, i) { var a = i === best; if (el.classList.contains('act') !== a) el.classList.toggle('act', a); });
  }
  var ticking = false;
  function tick() { if (ticking) return; ticking = true; requestAnimationFrame(function () { ticking = false; scan(); onScroll(); }); }
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', tick);
  var app = document.getElementById('app');
  if (app) new MutationObserver(tick).observe(app, { subtree: true, attributes: true, attributeFilter: ['class'], childList: true });
  if (matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', function (e) {
      var t = e.target.closest ? e.target.closest('.tilt') : null;
      document.querySelectorAll('.tilt').forEach(function (el) { if (el !== t && el.style.transform) el.style.transform = ''; });
      if (!t) return;
      var r = t.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      t.style.transform = 'rotateY(' + (x * 8).toFixed(2) + 'deg) rotateX(' + (-y * 8).toFixed(2) + 'deg) translateY(-4px)';
    });
  }
  scan(); onScroll();
})();
