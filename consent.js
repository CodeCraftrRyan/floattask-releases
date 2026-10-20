// Cookie choice for floattask.com.
// Visitors in Europe see a banner, and Google Analytics loads only after "Allow analytics".
// Elsewhere it loads by default; "No thanks" from Cookie settings turns it off.
// The choice is kept in this browser (localStorage 'ft-consent': 'granted' | 'denied').
// Any element with [data-cookie-settings] reopens the banner.
(function () {
  var GA_ID = 'G-B4QZBKSNK3';
  var KEY = 'ft-consent';

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  var loaded = false;
  function loadGA() {
    if (loaded) return;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  // Remove GA cookies after a visitor withdraws consent.
  function clearGA() {
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name === '_ga' || name.indexOf('_ga_') === 0) {
        var host = location.hostname.replace(/^www\./, '');
        ['', '; domain=' + host, '; domain=.' + host].forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
        });
      }
    });
  }

  var banner;
  function state() {
    banner.querySelector('.consent-state').textContent = loaded
      ? 'It is on now; choose No thanks to turn it off.'
      : 'It stays off unless you allow it.';
  }
  function show() {
    if (banner) { state(); banner.hidden = false; banner.querySelector('button').focus(); return; }
    banner = document.createElement('section');
    banner.className = 'consent';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie choice');
    banner.innerHTML =
      '<p class="consent-title">Analytics cookies</p>' +
      '<p>floattask.com can use Google Analytics to see which pages people read. ' +
      '<span class="consent-state"></span> It never touches the app. ' +
      '<a href="/privacy.html#analytics">Privacy</a></p>' +
      '<div class="consent-actions">' +
      '<button type="button" class="btn small primary" data-v="granted">Allow analytics</button>' +
      '<button type="button" class="btn small quiet" data-v="denied">No thanks</button>' +
      '</div>';
    banner.addEventListener('click', function (e) {
      var v = e.target.closest('button') && e.target.closest('button').dataset.v;
      if (!v) return;
      write(v);
      banner.hidden = true;
      if (v === 'granted') loadGA();
      else { clearGA(); if (loaded) location.reload(); }
    });
    document.body.appendChild(banner);
    state();
  }

  // Visitors whose time zone is in Europe (EU, EEA, UK, Switzerland) are asked first.
  // Everyone else gets analytics unless they turn it off from "Cookie settings".
  function inEurope() {
    var tz = '';
    try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
    return /^Europe\//.test(tz) ||
      /^(Atlantic\/(Reykjavik|Canary|Madeira|Azores|Faroe|Faeroe)|Asia\/(Nicosia|Famagusta)|Arctic\/Longyearbyen)$/.test(tz);
  }

  function init() {
    var choice = read();
    if (choice === 'granted') loadGA();
    else if (choice === 'denied') {}
    else if (inEurope()) show();
    else loadGA();
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-cookie-settings]');
      if (t) { e.preventDefault(); show(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
