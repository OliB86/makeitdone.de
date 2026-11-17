/* Entwurf C: Linien füllen sich bei Abläufen beim Scrollen (.flow > .fl), auch rückwärts */
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('flow-static'); return;
  }
  function apply() {
    var vh = innerHeight;
    document.querySelectorAll('.flow').forEach(function (f) {
      var items = f.querySelectorAll('.fl'), rowTop = null, k = 0;
      items.forEach(function (el) {
        var t = el.getBoundingClientRect().top;
        if (rowTop === null || Math.abs(t - rowTop) > 20) { rowTop = t; k = 0; } else k++;
        el.style.setProperty('--fd', (k * 0.28) + 's');
        var on = t < vh * 0.78;
        if (el.classList.contains('on') !== on) el.classList.toggle('on', on);
      });
    });
  }
  var ticking = false;
  function tick() { if (ticking) return; ticking = true; requestAnimationFrame(function () { ticking = false; apply(); }); }
  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', tick);
  var prev = window.dcAfter;
  window.dcAfter = function () { if (prev) prev(); apply(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
  setTimeout(apply, 300);
})();
