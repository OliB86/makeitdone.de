/* Rechner: Lead-Bereich. Geschützte Fassung sperrt die Detailauswertung bis zur E-Mail-Eingabe,
   offene Fassung (Adresse endet auf -offen) zeigt alles. Anbindung an Close folgt. */
(function () {
  var root = document.documentElement;
  var open = /-offen(\.html)?$/.test(location.pathname);
  if (!open) root.classList.add('gate');
  try { if (sessionStorage.getItem('mid-lead')) root.classList.add('unlocked'); } catch (e) {}
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f.classList || !f.classList.contains('lead-form')) return;
    e.preventDefault();
    var mail = f.querySelector('input[type="email"]'), ok = f.querySelector('input[type="checkbox"]'), err = f.querySelector('.lead-err');
    var msg = '';
    if (!mail.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.value)) msg = 'Bitte gib eine gültige E-Mail-Adresse ein.';
    else if (!ok.checked) msg = 'Bitte bestätige noch das Einverständnis.';
    if (err) err.textContent = msg;
    if (msg) return;
    /* Hier wird später der Lead an Close übergeben: Rechner, Eingaben, Name, E-Mail. */
    root.classList.add('unlocked');
    try { sessionStorage.setItem('mid-lead', '1'); } catch (e2) {}
    window.dispatchEvent(new Event('scroll'));
  });
})();
