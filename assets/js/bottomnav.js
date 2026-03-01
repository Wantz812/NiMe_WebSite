/**
 * NiMe — Bottom Sheet Navigation  (Self-Contained Edition)
 * assets/js/bottomnav.js
 *
 * ✅ CSS-i özü inject edir — hər HTML-ə YALNIZ bir sətir kifayətdir:
 *    <script src="assets/js/bottomnav.js"></script>
 *
 * ⚡ Əgər app.js artıq BSN nav-ını qurubsa (window.__BSN_INITIALIZED__ === true),
 *    bu fayl heç nə etmir — dublikat nav olmur.
 */

(function () {
  'use strict';

  /* ── app.js-dən BSN artıq init edilibsə, çıx ────────────────── */
  function shouldSkip() {
    return window.__BSN_INITIALIZED__ === true;
  }

  /* ══════════════════════════════════════════════════════
     CSS — dinamik inject
  ══════════════════════════════════════════════════════ */
  var CSS = `
/* ── Köhnə nav-ı gizlət ─────────────────────────────── */
.bottomNav,.cartoonNav{display:none!important}

/* ── Səhifəyə altdan boşluq ─────────────────────────── */
body{padding-bottom:86px!important}

/* ── Overlay ─────────────────────────────────────────── */
.bsn-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);z-index:900;opacity:0;pointer-events:none;transition:opacity .3s ease}
.bsn-overlay.open{opacity:1;pointer-events:all}

/* ── Trigger ─────────────────────────────────────────── */
.bsn-trigger{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);z-index:910;display:flex;align-items:center;gap:10px;padding:13px 24px;background:rgba(15,15,22,.88);border:1px solid rgba(255,255,255,.13);backdrop-filter:blur(24px) saturate(180%);-webkit-backdrop-filter:blur(24px) saturate(180%);border-radius:60px;cursor:pointer;color:#fff;font-family:inherit;font-size:13px;font-weight:600;letter-spacing:.04em;box-shadow:0 8px 32px rgba(0,0,0,.45),0 2px 8px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.08);transition:background .25s ease,box-shadow .25s ease,border-color .25s ease,opacity .25s ease,transform .25s ease;-webkit-tap-highlight-color:transparent;user-select:none;white-space:nowrap}
.bsn-trigger:hover{background:rgba(25,25,38,.95);box-shadow:0 12px 44px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.1);border-color:rgba(255,255,255,.2)}
.bsn-trigger:active{transform:translateX(-50%) scale(.96)}
.bsn-trigger.open{opacity:0;pointer-events:none;transform:translateX(-50%) scale(.85)}

/* ── Hamburger ───────────────────────────────────────── */
.bsn-ham{width:19px;height:13px;display:flex;flex-direction:column;justify-content:space-between;flex-shrink:0}
.bsn-ham span{display:block;height:1.8px;background:currentColor;border-radius:2px;transform-origin:center;transition:transform .38s cubic-bezier(.68,-.6,.32,1.6),opacity .22s ease,width .28s ease}
.bsn-ham span:nth-child(1){width:100%}
.bsn-ham span:nth-child(2){width:68%;align-self:flex-end}
.bsn-ham span:nth-child(3){width:45%}
.bsn-trigger.open .bsn-ham span:nth-child(1){transform:translateY(5.6px) rotate(45deg);width:100%}
.bsn-trigger.open .bsn-ham span:nth-child(2){opacity:0;transform:scaleX(0)}
.bsn-trigger.open .bsn-ham span:nth-child(3){transform:translateY(-5.6px) rotate(-45deg);width:100%}
.bsn-trigger-lbl{transition:opacity .2s ease}
.bsn-trigger.open .bsn-trigger-lbl{opacity:.65}

/* ── Sheet ───────────────────────────────────────────── */
.bsn-sheet{position:fixed;bottom:0;left:0;right:0;z-index:905;background:rgba(10,10,16,.97);backdrop-filter:blur(30px) saturate(160%);-webkit-backdrop-filter:blur(30px) saturate(160%);border-top:1px solid rgba(255,255,255,.09);border-radius:22px 22px 0 0;padding-bottom:max(20px,env(safe-area-inset-bottom,0px));box-shadow:0 -16px 60px rgba(0,0,0,.55),0 -1px 0 rgba(255,255,255,.05);transform:translateY(100%);transition:transform .44s cubic-bezier(.32,.72,0,1)}
.bsn-sheet.open{transform:translateY(0)}

/* ── Grip ────────────────────────────────────────────── */
.bsn-grip{width:30px;height:3px;background:rgba(255,255,255,.15);border-radius:2px;margin:10px auto 0}
.bsn-inner{padding:14px 14px 4px;max-width:520px;margin:0 auto}

/* ── Grid — 8 items ──────────────────────────────────── */
.bsn-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:4px}
@media(max-width:480px){.bsn-grid{grid-template-columns:repeat(4,1fr)}}

/* ── Item ────────────────────────────────────────────── */
.bsn-item{display:flex;flex-direction:column;align-items:center;padding:10px 4px 8px;border-radius:14px;text-decoration:none;color:rgba(255,255,255,.38);cursor:pointer;position:relative;-webkit-tap-highlight-color:transparent;opacity:0;transform:translateY(14px);transition:background .2s ease,color .2s ease,transform .28s cubic-bezier(.34,1.56,.64,1),opacity .28s ease}
.bsn-sheet.open .bsn-item{opacity:1;transform:translateY(0)}
.bsn-sheet.open .bsn-item:nth-child(1){transition-delay:.04s}
.bsn-sheet.open .bsn-item:nth-child(2){transition-delay:.06s}
.bsn-sheet.open .bsn-item:nth-child(3){transition-delay:.08s}
.bsn-sheet.open .bsn-item:nth-child(4){transition-delay:.10s}
.bsn-sheet.open .bsn-item:nth-child(5){transition-delay:.12s}
.bsn-sheet.open .bsn-item:nth-child(6){transition-delay:.14s}
.bsn-sheet.open .bsn-item:nth-child(7){transition-delay:.16s}
.bsn-sheet.open .bsn-item:nth-child(8){transition-delay:.18s}
.bsn-item:hover{background:rgba(255,255,255,.07);color:rgba(255,255,255,.88);transform:translateY(-3px)}
.bsn-item:active{transform:scale(.92)}
.bsn-item.active{background:rgba(124,92,255,.18);color:#fff}
.bsn-item.active::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:22px;height:2.5px;background:var(--accent,#7c5cff);border-radius:0 0 3px 3px;box-shadow:0 0 10px var(--accent,#7c5cff),0 0 20px rgba(124,92,255,.4)}

/* ── Icon & Label ────────────────────────────────────── */
.bsn-icon{font-size:20px;line-height:1;display:block;transition:transform .3s cubic-bezier(.34,1.56,.64,1);filter:drop-shadow(0 2px 6px rgba(0,0,0,.3))}
.bsn-item:hover .bsn-icon,.bsn-item.active .bsn-icon{transform:scale(1.22) translateY(-2px)}
.bsn-item.active .bsn-icon{filter:drop-shadow(0 0 8px rgba(124,92,255,.5))}
.bsn-lbl{font-size:8.5px;font-weight:700;letter-spacing:.01em;text-align:center;white-space:nowrap;max-height:0;overflow:hidden;opacity:0;transform:translateY(4px);transition:max-height .32s ease,opacity .28s ease,transform .28s ease,margin-top .28s ease}
.bsn-sheet.open .bsn-lbl{max-height:14px;opacity:1;transform:translateY(0);margin-top:5px}

/* ── Close button ────────────────────────────────────── */
.bsn-close-row{display:flex;justify-content:center;padding:10px 14px 2px;max-width:520px;margin:0 auto;opacity:0;transform:translateY(6px);transition:opacity .25s ease .2s,transform .25s ease .2s}
.bsn-sheet.open .bsn-close-row{opacity:1;transform:translateY(0)}
.bsn-close-btn{display:flex;align-items:center;gap:7px;padding:8px 22px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:40px;color:rgba(255,255,255,.5);font-family:inherit;font-size:12px;font-weight:600;letter-spacing:.03em;cursor:pointer;transition:background .2s ease,color .2s ease,transform .18s ease;-webkit-tap-highlight-color:transparent}
.bsn-close-btn:hover{background:rgba(255,255,255,.1);color:rgba(255,255,255,.85)}
.bsn-close-btn:active{transform:scale(.95)}
`;

  /* ── CSS-i <head>-ə inject et ─────────────────────── */
  function injectCSS() {
    if (document.getElementById('bsn-styles')) return;
    var style = document.createElement('style');
    style.id = 'bsn-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  /* ── Nav items — 8 ITEM ─── */
  var ITEMS = [
    { icon: '🏠', label: 'Ana',      href: 'index.html' },
    { icon: '🍿', label: 'Film',     href: 'watch-party.html' },
    { icon: '📖', label: 'Album',    href: 'album.html' },
    { icon: '📋', label: 'Planlar',  href: 'plans.html' },
    { icon: '⏳', label: 'Kapsul',   href: 'capsule.html' },
    { icon: '💑', label: 'Birlikdə', href: 'couple.html' },
    { icon: '🕹️', label: 'Arcade',   href: 'arcade.html' },
    { icon: '🎵', label: 'Musics',  href: 'music.html' },
    { icon: '⚙️', label: 'Ayarlar',  href: 'settings.html' },
  ];

  function getLabelSetting() {
    try {
      var s = JSON.parse(localStorage.getItem('SITE_SETTINGS_V4') || '{}');
      return s.navLabel || 'Menyu';
    } catch (e) {
      return 'Menyu';
    }
  }

  function activePage() {
    var path = window.location.pathname.split('/').pop();
    return path || 'index.html';
  }

  function inject() {
    /* ← Əsas yoxlama: app.js BSN-ni artıq qurubsa çıx */
    if (shouldSkip()) return;

    injectCSS();

    var page  = activePage();
    var label = getLabelSetting();

    /* Overlay */
    var overlay = document.createElement('div');
    overlay.className = 'bsn-overlay';

    /* Trigger */
    var trigger = document.createElement('button');
    trigger.className = 'bsn-trigger';
    trigger.setAttribute('aria-label', 'Naviqasiya menyusu');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML =
      '<span class="bsn-ham" aria-hidden="true">' +
        '<span></span><span></span><span></span>' +
      '</span>' +
      '<span class="bsn-trigger-lbl">' + label + '</span>';

    /* Sheet */
    var sheet = document.createElement('div');
    sheet.className = 'bsn-sheet';
    sheet.setAttribute('role', 'navigation');
    sheet.setAttribute('aria-label', 'Əsas Naviqasiya');

    var gridHtml = ITEMS.map(function (item) {
      var isActive = (page === item.href);
      return (
        '<a class="bsn-item' + (isActive ? ' active' : '') + '" ' +
           'href="' + item.href + '" draggable="false">' +
          '<span class="bsn-icon">' + item.icon + '</span>' +
          '<span class="bsn-lbl">' + item.label + '</span>' +
        '</a>'
      );
    }).join('');

    sheet.innerHTML =
      '<div class="bsn-grip"></div>' +
      '<div class="bsn-inner">' +
        '<div class="bsn-grid">' + gridHtml + '</div>' +
      '</div>' +
      '<div class="bsn-close-row">' +
        '<button class="bsn-close-btn" aria-label="Menyunu bağla">' +
          '<span>✕</span><span>Bağla</span>' +
        '</button>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.appendChild(trigger);
    document.body.appendChild(sheet);

    /* ── Open / Close logic ─────────────────────────── */
    var isOpen = false;

    function openSheet() {
      isOpen = true;
      trigger.classList.add('open');
      sheet.classList.add('open');
      overlay.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
    }

    function closeSheet() {
      isOpen = false;
      trigger.classList.remove('open');
      sheet.classList.remove('open');
      overlay.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    trigger.addEventListener('click', function () {
      if (isOpen) closeSheet(); else openSheet();
    });
    overlay.addEventListener('click', closeSheet);

    var closeBtn = sheet.querySelector('.bsn-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeSheet);

    sheet.querySelectorAll('.bsn-item').forEach(function (el) {
      el.addEventListener('click', function () { closeSheet(); });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closeSheet();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

})();
