/* make it done – Herkunft (UTM) weiterreichen und Cookie-Einwilligung.
   1. Kommt jemand über eine Anzeige oder einen Link mit Kennung (utm_*, gclid, fbclid),
      merken wir uns die Kennung für die Sitzung und setzen sie in alle Termin- (Calendly)
      und WhatsApp-Links ein. So steht in Close, welche Anzeige den Kontakt gebracht hat.
   2. Cookie-Banner: Statistik/Marketing (Google-Tag, Meta-Pixel) laden erst nach Zustimmung.
      Die Kennungen trägst du unten in TAGS ein, solange sie leer sind, wird nichts geladen. */
(function () {
  var TAGS = { googleTagId: '', metaPixelId: '' };
  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'];
  var store = {};
  function get(k) { try { return sessionStorage.getItem('mid-' + k) || ''; } catch (e) { return ''; } }
  function put(k, v) { try { sessionStorage.setItem('mid-' + k, v); } catch (e) {} }

  /* ---------- 1. Kennung merken ---------- */
  try {
    var q = new URLSearchParams(location.search);
    var hasUtm = KEYS.some(function (k) { return q.get(k); });
    if (hasUtm) KEYS.forEach(function (k) { put(k, q.get(k) || ''); });
    else if (q.get('gclid')) { put('utm_source', 'google'); put('utm_medium', 'cpc'); put('utm_campaign', ''); put('utm_content', ''); }
    else if (q.get('fbclid')) { put('utm_source', 'meta'); put('utm_medium', 'paid-social'); put('utm_campaign', ''); put('utm_content', ''); }
  } catch (e) {}
  KEYS.forEach(function (k) { store[k] = get(k); });
  var active = !!store.utm_source && store.utm_source !== 'website';

  function rewrite(a) {
    if (!active || a.dataset.midUtm) return;
    var href = a.getAttribute('href') || '';
    try {
      if (href.indexOf('calendly.com/makeitdone') > -1) {
        var u = new URL(href);
        var page = u.searchParams.get('utm_campaign');           /* Seite, von der gebucht wird */
        KEYS.forEach(function (k) { if (store[k]) u.searchParams.set(k, store[k]); else u.searchParams.delete(k); });
        if (page) u.searchParams.set('utm_term', page);
        a.setAttribute('href', u.toString());
        a.dataset.midUtm = '1';
      } else if (href.indexOf('wa.me/') > -1) {
        var w = new URL(href), t = w.searchParams.get('text') || '';
        var tag = [store.utm_source, store.utm_campaign].filter(Boolean).join(' ');
        if (t.indexOf(')') > -1 && tag) w.searchParams.set('text', t.replace(/\)\s*$/, ' · ' + tag + ')'));
        a.setAttribute('href', w.toString());
        a.dataset.midUtm = '1';
      }
    } catch (e) {}
  }
  function scan(root) { (root || document).querySelectorAll('a[href*="calendly.com/makeitdone"], a[href*="wa.me/"]').forEach(rewrite); }
  if (active) {
    document.addEventListener('DOMContentLoaded', function () { scan(); });
    new MutationObserver(function () { scan(); }).observe(document.documentElement, { childList: true, subtree: true });
  }

  /* ---------- 2. Cookie-Einwilligung ---------- */
  var CKEY = 'mid-consent';
  function choice() { try { return JSON.parse(localStorage.getItem(CKEY) || 'null'); } catch (e) { return null; } }
  function save(all) { try { localStorage.setItem(CKEY, JSON.stringify({ all: all, at: new Date().toISOString(), v: 1 })); } catch (e) {} }

  function loadTags() {
    if (TAGS.googleTagId && !window.gtag) {
      var s = document.createElement('script'); s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + TAGS.googleTagId; document.head.appendChild(s);
      window.dataLayer = window.dataLayer || []; window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date()); window.gtag('config', TAGS.googleTagId, { anonymize_ip: true });
    }
    if (TAGS.metaPixelId && !window.fbq) {
      /* Meta-Pixel, Standard-Einbindung */
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
        if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0;
        t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', TAGS.metaPixelId); window.fbq('track', 'PageView');
    }
  }

  function banner() {
    if (document.getElementById('mid-cookie')) return;
    var d = document.createElement('div');
    d.id = 'mid-cookie'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Cookie-Einstellungen');
    d.style.cssText = 'position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:620px;margin:0 auto;background:#141414;color:#ffffff;border-radius:20px;padding:20px 22px;box-shadow:0 20px 60px rgba(0,0,0,.25);font-family:inherit;font-size:15px;line-height:1.55;display:flex;flex-direction:column;gap:14px';
    d.innerHTML = '<b style="font-size:16px">Cookies auf makeitdone.de</b>' +
      '<span style="color:#d4d4d4">Wir nutzen technisch notwendige Speicher, damit die Seite funktioniert. Mit deiner Zustimmung nutzen wir zusätzlich Statistik- und Marketing-Dienste (Google, Meta), um zu sehen, welche Anzeigen und Seiten hilfreich sind. Du kannst deine Wahl jederzeit unten über „Cookie-Einstellungen“ ändern. Mehr in der <a href="/datenschutz.html" style="color:#ffffff">Datenschutzerklärung</a>. <span style="font-size:12px;border:1px dashed #8a8a8a;border-radius:999px;padding:1px 8px">Text mit der Anwältin abstimmen</span></span>' +
      '<span style="display:flex;gap:10px;flex-wrap:wrap">' +
      '<button type="button" data-c="0" style="flex:1 1 180px;min-height:44px;border:1px solid #ffffff;border-radius:999px;background:transparent;color:#ffffff;font:inherit;font-weight:600;cursor:pointer">Nur notwendige</button>' +
      '<button type="button" data-c="1" style="flex:1 1 180px;min-height:44px;border:1px solid #ffffff;border-radius:999px;background:#ffffff;color:#141414;font:inherit;font-weight:600;cursor:pointer">Alle akzeptieren</button></span>';
    d.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-c]'); if (!b) return;
      var all = b.getAttribute('data-c') === '1'; save(all); d.remove(); if (all) loadTags();
    });
    document.body.appendChild(d);
  }

  /* ---------- 3. Newsletter-Anmeldung im Fußbereich ---------- */
  var NL_HOOK = 'https://hook.eu1.make.com/pnl3jns21hw48wkqlng9tzfdm5qpbyl8';
  function nlBox() {
    var f = document.querySelector('footer');
    if (!f || f.querySelector('#mid-nl') || /newsletter-bestaetigt/.test(location.pathname)) return;
    var d = document.createElement('div');
    d.id = 'mid-nl';
    d.style.cssText = 'max-width:1180px;margin:0 auto;padding:40px 24px 0 24px';
    d.innerHTML =
      '<div style="border:1px solid #333333;border-radius:20px;padding:24px;display:flex;gap:24px;flex-wrap:wrap;align-items:flex-end;justify-content:space-between">' +
      '<div style="flex:1 1 280px"><b style="font-family:\'Space Grotesk\',sans-serif;font-size:20px;color:#ffffff">Praxiswissen per E-Mail</b>' +
      '<p style="margin:6px 0 0 0;color:#d4d4d4;font-size:15px;line-height:1.55">Gelegentlich, ohne Werbeflut: Finanzen, Struktur und Steuern aus der Praxis. Jederzeit abbestellbar.</p></div>' +
      '<form style="flex:1 1 420px;display:flex;flex-direction:column;gap:10px" novalidate>' +
      '<span style="display:flex;gap:10px;flex-wrap:wrap">' +
      '<input name="name" type="text" autocomplete="given-name" placeholder="Vorname" aria-label="Vorname" style="flex:1 1 140px;min-height:44px;border-radius:999px;border:1px solid #555555;background:#1e1e1e;color:#ffffff;padding:0 16px;font:inherit">' +
      '<input name="email" type="email" required autocomplete="email" placeholder="E-Mail-Adresse" aria-label="E-Mail-Adresse" style="flex:2 1 200px;min-height:44px;border-radius:999px;border:1px solid #555555;background:#1e1e1e;color:#ffffff;padding:0 16px;font:inherit">' +
      '<button type="submit" style="flex:0 0 auto;min-height:44px;border:0;border-radius:999px;background:#F1D734;color:#141414;padding:0 22px;font:inherit;font-weight:600;cursor:pointer">Anmelden</button></span>' +
      '<label style="display:flex;gap:8px;align-items:flex-start;font-size:13px;line-height:1.5;color:#a8a8a8"><input name="ok" type="checkbox" required style="margin-top:3px">' +
      '<span>Ich möchte den Newsletter von make it done erhalten. Meine Daten werden nur dafür genutzt, Abmeldung jederzeit über den Link in jeder E-Mail. Details in der <a href="/datenschutz.html" style="color:#ffffff">Datenschutzerklärung</a>. <span style="font-size:12px;border:1px dashed #8a8a8a;border-radius:999px;padding:1px 8px">Text mit der Anwältin abstimmen</span></span></label>' +
      '<span data-msg style="font-size:14px;color:#F1D734" aria-live="polite"></span></form></div>';
    var form = d.querySelector('form'), msg = d.querySelector('[data-msg]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.email.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = 'Bitte gib eine gültige E-Mail-Adresse ein.'; return; }
      if (!form.ok.checked) { msg.textContent = 'Bitte setze den Haken, damit wir dir den Newsletter schicken dürfen.'; return; }
      var p = new URLSearchParams();
      p.set('name', form.name.value.trim()); p.set('email', email); p.set('quelle', 'Website-Fußbereich');
      p.set('seite', location.pathname);
      KEYS.forEach(function (k) { p.set(k, get(k)); });
      form.querySelector('button').disabled = true;
      fetch(NL_HOOK, { method: 'POST', mode: 'no-cors', body: p }).catch(function () {});
      form.innerHTML = '<p style="margin:0;color:#ffffff;font-size:15px;line-height:1.55"><b>Fast geschafft.</b> Wir haben dir gerade eine E-Mail geschickt. Bitte bestätige deine Anmeldung über den Link darin.</p>';
    });
    f.insertBefore(d, f.firstChild);
  }
  new MutationObserver(nlBox).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', nlBox); else nlBox();

  window.midConsent = { open: banner, state: choice };
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-cookie-settings]');
    if (a) { e.preventDefault(); banner(); }
  });
  function start() { var c = choice(); if (!c) banner(); else if (c.all) loadTags(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
