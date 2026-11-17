/* Entwurf C: kompakter Fragenbereich mit Rubriken und Pfeilen */
(function () {
  var state = {};
  function render() {
    document.querySelectorAll('.faqw').forEach(function (w, wi) {
      var id = w.id || ('faqw' + wi);
      var s = state[id] || (state[id] = { r: +(w.getAttribute('data-start') || 0), k: 0 });
      var qs = w.querySelectorAll('.faqw-q[data-r="' + s.r + '"]');
      if (s.k >= qs.length) s.k = 0;
      w.querySelectorAll('.faqw-tab').forEach(function (t) { var on = +t.getAttribute('data-r') === s.r; t.classList.toggle('on', on); t.setAttribute('aria-selected', on ? 'true' : 'false'); });
      w.querySelectorAll('.faqw-q').forEach(function (q) { q.classList.remove('on'); });
      if (qs[s.k]) qs[s.k].classList.add('on');
      var c = w.querySelector('.faqw-count'); if (c) c.textContent = (s.k + 1) + ' / ' + qs.length;
    });
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('.faqw-tab, .faqw-arrow') : null;
    if (!t) return;
    var w = t.closest('.faqw'), id = w.id; var s = state[id];
    if (t.classList.contains('faqw-tab')) { s.r = +t.getAttribute('data-r'); s.k = 0; }
    else { var n = w.querySelectorAll('.faqw-q[data-r="' + s.r + '"]').length; s.k = (s.k + (+t.getAttribute('data-dir')) + n) % n; }
    render();
  });
  var prev = window.dcAfter;
  window.dcAfter = function () { if (prev) prev(); render(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render); else render();
})();
