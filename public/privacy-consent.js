/* No optional network requests until a current, explicit marketing consent. */
(function (w, d) {
  'use strict';
  var KEY = 'budimse_privacy_v2';
  var VERSION = 2;
  var MAX_AGE = 180 * 24 * 60 * 60 * 1000;
  var PIXEL = '4301270050128677';
  var loaded = false;
  var consent = null;
  var publicPages = /^\/(?:author|sources|step-[1-5]|news(?:\/[^/]+)?|terms|privacy|testimonials)?\/?$/;

  function safePage() {
    return publicPages.test(w.location.pathname) && !w.location.search && !w.location.hash;
  }
  function readStored() {
    try {
      var value = JSON.parse(w.localStorage.getItem(KEY) || 'null');
      var now = Date.now();
      if (value && value.version === VERSION && typeof value.marketing === 'boolean'
        && Number.isFinite(value.updated_at) && value.updated_at <= now
        && now - value.updated_at < MAX_AGE) return value;
      w.localStorage.removeItem(KEY);
    } catch (_) { /* Storage disabled or invalid: keep optional tracking off. */ }
    return null;
  }
  function clearOptionalCookies() {
    var names = d.cookie.split(';').map(function (entry) { return entry.trim().split('=')[0]; });
    var host = w.location.hostname;
    var domains = ['', host, '.' + host, '.budimse.online'];
    names.forEach(function (name) {
      if (!/^(_fbp|_fbc|_ga(?:_|$)|_gid$|_gat(?:_|$)|_gcl_)/.test(name)) return;
      domains.forEach(function (domain) {
        d.cookie = name + '=; Max-Age=0; path=/; SameSite=Lax' + (domain ? '; domain=' + domain : '');
      });
    });
  }
  function loadMarketing() {
    if (loaded || !consent || !consent.marketing || !safePage()) return;
    loaded = true;
    var queue = function () { queue.callMethod ? queue.callMethod.apply(queue, arguments) : queue.queue.push(arguments); };
    queue.queue = []; queue.push = queue; queue.loaded = true; queue.version = '2.0';
    queue.disablePushState = true;
    w.fbq = queue;
    queue('consent', 'revoke');
    queue('set', 'autoConfig', false, PIXEL);
    queue('init', PIXEL);
    queue('consent', 'grant');
    queue('track', 'PageView');
    var script = d.createElement('script');
    script.async = true; script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.referrerPolicy = 'no-referrer';
    d.head.appendChild(script);
  }
  function stopMarketing() {
    if (w.fbq) w.fbq('consent', 'revoke');
    clearOptionalCookies();
    // Removing a script element does not unload its code. Reload with denied
    // consent so it cannot keep running after withdrawal or on a private page.
    if (loaded) w.location.reload();
  }
  consent = readStored();
  if (!consent || !consent.marketing) clearOptionalCookies();
  try { w.localStorage.removeItem('cookie_consent'); } catch (_) {}
  w.BudimPrivacy = {
    get: function () { return consent ? Object.assign({}, consent) : null; },
    save: function (marketing) {
      consent = { version: VERSION, marketing: marketing === true, updated_at: Date.now() };
      try { w.localStorage.setItem(KEY, JSON.stringify(consent)); } catch (_) {}
      w.dispatchEvent(new CustomEvent('budimse:privacy-changed'));
      if (consent.marketing) loadMarketing(); else stopMarketing();
    },
    open: function () { w.dispatchEvent(new CustomEvent('budimse:privacy-open')); },
    route: function () {
      if (consent && Date.now() - consent.updated_at >= MAX_AGE) {
        consent = null;
        try { w.localStorage.removeItem(KEY); } catch (_) {}
        w.dispatchEvent(new CustomEvent('budimse:privacy-changed'));
        stopMarketing(); return;
      }
      if (!safePage()) { if (loaded) stopMarketing(); }
      else loadMarketing();
    }
  };
  // A changed choice in another tab must also stop an already loaded pixel.
  w.addEventListener('storage', function (event) {
    if (event.key !== KEY && event.key !== null) return;
    consent = readStored();
    w.dispatchEvent(new CustomEvent('budimse:privacy-changed'));
    if (!consent || !consent.marketing) stopMarketing(); else loadMarketing();
  });
  loadMarketing();
})(window, document);
