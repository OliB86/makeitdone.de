/* Entwurf C: immer nur eine Kundengeschichte zeigen, Umschalter wechselt */
(function () {
  var root = document.documentElement;
  function show(b, scroll) {
    root.classList.toggle('show-b', b);
    if (scroll) { var el = document.getElementById(b ? 'story-b' : 'story-a'); if (el) setTimeout(function () { el.scrollIntoView({ behavior: 'instant', block: 'start' }); }, 30); }
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
