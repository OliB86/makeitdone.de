/* Rechner: Lead-Bereich. Geschützte Fassung sperrt die Detailauswertung bis zur E-Mail-Eingabe,
   offene Fassung (Adresse endet auf -offen) zeigt alles.
   Absenden: Eingaben, Ergebnis und Herkunft gehen an Make (W | Rechner-Formular → Close). */
(function () {
  var HOOK = 'https://hook.eu1.make.com/nipjavwgvskhy3rlpsnpc2gey9daaid6';
  var root = document.documentElement;
  var open = /-offen(\.html)?$/.test(location.pathname);
  if (!open) root.classList.add('gate');
  try { if (sessionStorage.getItem('mid-lead')) root.classList.add('unlocked'); } catch (e) {}

  /* Herkunft (UTM) aus der Adresse merken, damit sie beim Absenden noch da ist */
  var UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  try {
    var q = new URLSearchParams(location.search);
    UTM.forEach(function (k) { if (q.get(k)) sessionStorage.setItem('mid-' + k, q.get(k)); });
  } catch (e) {}
  function utm(k) { try { return sessionStorage.getItem('mid-' + k) || ''; } catch (e) { return ''; } }

  function clean(t) { return (t || '').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim().slice(0, 4000); }
  function eingaben() {
    var out = [];
    document.querySelectorAll('#app input[type="range"], #app input[type="number"], #app [aria-pressed="true"], #app button.on, #app button.active').forEach(function (el) {
      var lab = el.getAttribute('aria-label') || '';
      if (!lab && el.id) { var l = document.querySelector('label[for="' + el.id + '"]'); if (l) lab = l.innerText; }
      if (!lab) { var p = el.closest('label, div'); if (p) lab = (p.innerText || '').split('\n')[0]; }
      out.push(clean(lab) + ': ' + (el.value !== undefined && el.tagName === 'INPUT' ? el.value : clean(el.innerText)));
    });
    return out.join('\n');
  }

  /* Telefonnummer einheitlich als +49… an Close geben */
  function telNorm(v) {
    v = (v || '').replace(/[^\d+]/g, '');
    if (v.indexOf('00') === 0) v = '+' + v.slice(2);
    else if (v.charAt(0) === '0') v = '+49' + v.slice(1);
    else if (v && v.charAt(0) !== '+') v = '+49' + v;
    return v;
  }

  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f.classList || !f.classList.contains('lead-form')) return;
    e.preventDefault();
    var mail = f.querySelector('input[type="email"]'), ok = f.querySelector('input[name="ok"]'),
        nl = f.querySelector('input[name="nl"]'), name = f.querySelector('input[name="name"]'), err = f.querySelector('.lead-err'),
        tel = f.querySelector('input[name="phone"]');
    var msg = '';
    if (!mail.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.value)) msg = 'Bitte gib eine gültige E-Mail-Adresse ein.';
    else if (tel && telNorm(tel.value).replace(/\D/g, '').length < 7) msg = 'Bitte gib deine Telefonnummer ein.';
    else if (ok && !ok.checked) msg = 'Bitte bestätige noch das Einverständnis.';
    if (err) err.textContent = msg;
    if (msg) return;

    var h1 = document.querySelector('#app h1');
    var gated = document.querySelector('#app .gated');
    var data = new URLSearchParams();
    data.set('calc', f.getAttribute('data-calc') || '');
    data.set('rechner', clean(h1 ? h1.innerText : document.title).split('\n')[0]);
    data.set('name', name ? name.value.trim() : '');
    data.set('email', mail.value.trim());
    data.set('phone', tel ? telNorm(tel.value) : '');
    data.set('nl', nl && nl.checked ? '1' : '0');
    data.set('seite', location.pathname);
    UTM.forEach(function (k) { data.set(k, utm(k)); });
    data.set('eingaben', eingaben());
    data.set('ergebnis', clean(gated ? gated.innerText : ''));
    /* Workbook: fertig formatierte Zahlen für die PDF-Vorlage (nur Rechner, die window.midWB setzen) */
    if (window.midWB) data.set('wb', JSON.stringify(window.midWB));
    try { fetch(HOOK, { method: 'POST', body: data, mode: 'no-cors', keepalive: true }); } catch (e3) {}

    root.classList.add('unlocked');
    try { sessionStorage.setItem('mid-lead', '1'); } catch (e2) {}
    window.dispatchEvent(new Event('scroll'));
  });
})();
