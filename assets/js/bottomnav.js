/**
 * NiMe — Bottom Sheet Navigation
 * assets/js/bottomnav.js
 *
 * QOŞMAQ ÜÇÜN hər səhifənin </body>-dən əvvəl:
 * <script src="assets/js/bottomnav.js"></script>
 *
 * Özü həmişə inject edir. Heç nə yazmağa ehtiyac yoxdur.
 */

(function () {
  'use strict';

  /* ── Nav items ──────────────────────────────────────────
     Siyahını dəyişmək istəsən buradan et.
  ─────────────────────────────────────────────────────── */
  var ITEMS = [
    { icon: '🏠', label: 'Ana',     href: 'index.html' },
    { icon: '🍿', label: 'Film',    href: 'watch-party.html' },
    { icon: '📖', label: 'Album',   href: 'album.html' },
    { icon: '📋', label: 'Planlar', href: 'plans.html' },
    { icon: '⏳', label: 'Kapsul',  href: 'capsule.html' },
    { icon: '🕹️', label: 'Arcade',  href: 'arcade.html' },
    { icon: '⚙️', label: 'Ayarlar', href: 'settings.html' },
  ];

  /* ── Trigger label settings-dən oxunur ─────────────── */
  function getLabelSetting() {
    try {
      var s = JSON.parse(localStorage.getItem('SITE_SETTINGS_V4') || '{}');
      return s.navLabel || 'Menyu';
    } catch (e) {
      return 'Menyu';
    }
  }

  /* ── Aktiv səhifəni tap ─────────────────────────────── */
  function activePage() {
    var path = window.location.pathname.split('/').pop();
    return path || 'index.html';
  }

  /* ── HTML inject et ─────────────────────────────────── */
  function inject() {
    var page  = activePage();
    var label = getLabelSetting();

    /* Overlay */
    var overlay = document.createElement('div');
    overlay.className = 'bsn-overlay';

    /* Trigger button */
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

    /* ── Açıb-bağlama məntiqi ─────────────────────────── */
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
      // Trigger-i yenidən görünür et — az gecikmə ilə
      trigger.style.transition = 'opacity 0.25s ease 0.1s, transform 0.25s ease 0.1s';
    }

    trigger.addEventListener('click', function () {
      if (isOpen) closeSheet(); else openSheet();
    });

    overlay.addEventListener('click', closeSheet);

    /* Sheet içindəki bağla düyməsi */
    var closeBtn = sheet.querySelector('.bsn-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeSheet);

    /* Seçim edəndən sonra bağlanır (natural navigation baş verəcək) */
    var items = sheet.querySelectorAll('.bsn-item');
    items.forEach(function (el) {
      el.addEventListener('click', function () {
        closeSheet();
      });
    });

    /* Escape düyməsi ilə bağla */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closeSheet();
    });
  }

  /* ── Init ─────────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

})();
