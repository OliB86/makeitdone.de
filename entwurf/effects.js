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
    var vh = innerHeight, hd = document.querySelector('header');
    if (hd) { var hh = hd.getBoundingClientRect().bottom > 0 ? hd.offsetHeight + 'px' : '72px'; if (document.documentElement.style.getPropertyValue('--hh') !== hh) document.documentElement.style.setProperty('--hh', hh); }
    document.querySelectorAll('.words').forEach(function (p) {
      var r = p.getBoundingClientRect(), prog = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      var ws = p.querySelectorAll('.w'), k = Math.round(Math.max(0, Math.min(1, prog)) * ws.length);
      ws.forEach(function (w, i) { var on = i < k; if (w.classList.contains('on') !== on) w.classList.toggle('on', on); });
    });
    document.querySelectorAll('.sy').forEach(function (sy) {
      var steps = sy.querySelectorAll('.sy-step'), cur = 0, n = steps.length;
      var hz = sy.classList.contains('hz') && innerWidth > 860;
      if (hz) {
        var wrap = sy.querySelector('.hz-wrap'), pin = sy.querySelector('.hz-pin'), stage = sy.querySelector('.hz-stage');
        var ph = pin.offsetHeight, tp = Math.max(80, Math.round((vh - ph) / 2 + 36)) + 'px', wh = Math.round(ph + n * vh * 0.6) + 'px';
        if (pin.style.top !== tp) pin.style.top = tp;
        if (wrap.style.height !== wh) wrap.style.height = wh;
        var range = Math.max(1, wrap.offsetHeight - pin.offsetHeight);
        var prog = Math.max(0, Math.min(0.9999, (parseFloat(pin.style.top) - wrap.getBoundingClientRect().top) / range));
        cur = Math.floor(prog * n);
        var mh = 0; steps.forEach(function (el) { mh = Math.max(mh, el.offsetHeight); });
        var hs = (mh + 60) + 'px'; if (stage.style.height !== hs) stage.style.height = hs;
      } else {
        steps.forEach(function (el, i) {
          var t = el.getBoundingClientRect().top;
          if (t < vh * 0.55) cur = i;
          if (t < vh * 0.9 && !el.classList.contains('seen')) el.classList.add('seen');
        });
      }
      steps.forEach(function (el, i) {
        var a = i === cur; if (el.classList.contains('act') !== a) el.classList.toggle('act', a);
        if (hz && el.classList.contains('past') !== (i < cur)) el.classList.toggle('past', i < cur);
      });
      sy.querySelectorAll('.sy-nav a').forEach(function (a, i) {
        if (a.classList.contains('act') !== (i === cur)) a.classList.toggle('act', i === cur);
        if (a.classList.contains('done') !== (i < cur)) a.classList.toggle('done', i < cur);
      });
      if (sy.classList.contains('bk')) sy.querySelectorAll('[data-s],[data-u],[data-in]').forEach(function (el) {
        var d = el.dataset, on = (d.s == null || cur >= +d.s) && (d.u == null || cur <= +d.u) && (d.in == null || d.in.split(',').indexOf(String(cur)) > -1);
        if (el.classList.contains('on') !== on) el.classList.toggle('on', on);
      });
      var w = (n > 1 ? cur / (n - 1) : 1) * 100 + '%';
      sy.querySelectorAll('.sy-bar i').forEach(function (b) { if (b.style.width !== w) b.style.width = w; });
      sy.querySelectorAll('.sy-cur').forEach(function (c) { var t = String(cur + 1); if (c.textContent !== t) c.textContent = t; });
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
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('.hz .sy-nav a') : null;
    if (!a || innerWidth <= 860) return;
    var sy = a.closest('.hz'), wrap = sy.querySelector('.hz-wrap'), pin = sy.querySelector('.hz-pin');
    var links = Array.prototype.slice.call(sy.querySelectorAll('.sy-nav a')), i = links.indexOf(a), n = links.length;
    var range = wrap.offsetHeight - pin.offsetHeight, top = wrap.getBoundingClientRect().top + scrollY - (parseFloat(pin.style.top) || 72);
    e.preventDefault();
    scrollTo({ top: top + range * (i + 0.5) / n, behavior: 'smooth' });
  });
  window.dcAfter = function () { scan(); onScroll(); };
  scan(); onScroll();
})();
