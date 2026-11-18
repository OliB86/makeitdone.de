/* Entwurf C: immer nur eine Kundengeschichte zeigen, Umschalter wechselt */
(function () {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  var root = document.documentElement;
  /* Nach dem Sprung verschieben sich Abschnitte darüber noch (Schriften, Bilder, mobile Leiste, gepinnte Abschnitte).
     Deshalb mehrmals nachjustieren, bis die Seite ruhig ist – aber sofort aufhören, sobald jemand selbst scrollt. */
  var timers = [], userMoved = false;
  function stop() { userMoved = true; timers.forEach(clearTimeout); timers = []; }
  ['touchstart', 'wheel', 'keydown', 'mousedown'].forEach(function (ev) { addEventListener(ev, stop, { passive: true }); });
  function settle(id) {
    userMoved = false; timers.forEach(clearTimeout); timers = [];
    function go() { if (userMoved) return; var el = document.getElementById(id); if (!el) return; var d = el.getBoundingClientRect().top - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0); if (Math.abs(d) > 2) el.scrollIntoView({ behavior: 'instant', block: 'start' }); }
    [30, 200, 500, 900, 1500, 2500].forEach(function (ms) { timers.push(setTimeout(go, ms)); });
    if (document.readyState !== 'complete') addEventListener('load', function () { timers.push(setTimeout(go, 50)); }, { once: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { timers.push(setTimeout(go, 30)); });
  }
  function show(b, scroll) {
    root.classList.toggle('show-b', b);
    if (scroll) settle(b ? 'story-b' : 'story-a');
    window.dispatchEvent(new Event('scroll'));
  }
  function fromHash(scroll) { var h = location.hash; if (/^#kunde-b/.test(h)) show(true, scroll); else if (/^#kunde-a/.test(h)) show(false, scroll); }
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href*="#kunde-"]') : null;
    if (!a || a.pathname !== location.pathname) return;
    e.preventDefault(); var b = /#kunde-b/.test(a.getAttribute('href'));
    history.replaceState(null, '', b ? '#kunde-b-0' : '#kunde-a-0'); show(b, true);
  });
  addEventListener('hashchange', function () { fromHash(true); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { fromHash(true); }); else fromHash(true);
})();
