/**
 * NiMe App — Core + Bottom Sheet Nav (Ultra Edition)
 * assets/js/app.js
 *
 * ✅ Hər HTML-ə avtomatik inject olunur
 * ✅ Advanced spring animasiyalar + particles
 * ✅ Swipe-to-close (barmaq sürüşdür)
 * ✅ Haptic feedback (mobil)
 * ✅ 4 nav style (pill / glass / minimal / neon)
 * ✅ Mövqe seçimi (sol / orta / sağ)
 * ✅ Settings-dən tam idarə
 * ✅ bottomnav.js ilə dublikat naviqasiya aradan qaldırıldı
 */

(() => {
  'use strict';

  const $ = q => document.querySelector(q);
  const $$ = q => document.querySelectorAll(q);
  const STORE = 'SITE_SETTINGS_V4';

  /* ── Default State ── */
  const state = {
    theme: 'neo', bg: 'orbs', fx: 'balanced',
    contrast: 0, compact: 0, reducedMotion: 0,
    music: 1, musicVol: 0.5, song: 'assets/audio/bg-music.mp3',
    navLabel: 'Menyu',
    navStyle: 'pill',
    navPos: 'center',
    navLabelsVisible: true,
  };

  const saved = JSON.parse(localStorage.getItem(STORE) || '{}');
  Object.assign(state, saved);

  let audioPlayer = null;

  const App = {
    getSettings: () => ({ ...state }),
    $, $$,
    setSettings: obj => { Object.assign(state, obj); applyTheme(); save(); },
    settings: () => state,
    saveSettings: s => { Object.assign(state, s); applyTheme(); save(); },

    toast(msg, duration = 2200) {
      $$('.toast').forEach(t => t.remove());
      const t = document.createElement('div');
      t.className = 'toast';
      t.textContent = msg;
      document.body.appendChild(t);
      requestAnimationFrame(() => t.classList.add('show'));
      setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, duration);
    },

    audio: {
      test() {
        if (!audioPlayer) audioPlayer = new Audio();
        audioPlayer.src = state.song;
        audioPlayer.volume = state.musicVol;
        audioPlayer.play().catch(() => App.toast('⚠️ Audio yüklənə bilmədi'));
      },
      stop() { if (audioPlayer) { audioPlayer.pause(); audioPlayer.currentTime = 0; } },
      setVolume(vol) { if (audioPlayer) audioPlayer.volume = vol; }
    },

    storage: {
      keys: {
        STORE_MEMORIES: 'memories_v2', STORE_BUCKET: 'bucket_v2',
        STORE_GIFT: 'gift_v2', STORE_PUZZLEBOX: 'puzzlebox_v2'
      },
      readJSON(key, def) {
        try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
      },
      writeJSON(key, val) {
        try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch { return false; }
      }
    },

    migrateFromOldSite() {
      let migrated = false;
      try { ['old_memories','old_bucket','old_gift'].forEach(k => { if (localStorage.getItem(k)) migrated = true; }); } catch {}
      return migrated;
    }
  };

  window.App = App;
  window.AppConfig = { STORAGE_KEYS: App.storage.keys };

  /* ── bottomnav.js-dən gələn köhnə nav-ı blokla ── */
  /* Bu flag bottomnav.js-in inject funksiyasını dayandırır */
  window.__BSN_INITIALIZED__ = false; // BSN init edildikdən sonra true olacaq

  /* ── Theme ── */
  function applyTheme() {
    const r = document.documentElement;
    r.setAttribute('data-theme', state.theme);
    r.setAttribute('data-bg', state.bg);
    r.setAttribute('data-fx', state.fx);
    r.setAttribute('data-contrast', state.contrast ? 'high' : 'normal');
    r.setAttribute('data-compact', state.compact ? 'true' : 'false');
    r.classList.toggle('reducedMotion', state.reducedMotion === 1);
  }

  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch {}
  }

  applyTheme();

  /* ═══════════════════════════════════════════════════════════
     BOTTOM SHEET NAVIGATION
  ═══════════════════════════════════════════════════════════ */

  const BSN = (() => {
    const ITEMS = [
      { icon: '🏠', label: 'Ana',      href: 'index.html' },
      { icon: '🍿', label: 'Film',     href: 'watch-party.html' },
      { icon: '📖', label: 'Album',    href: 'album.html' },
      { icon: '📋', label: 'Planlar',  href: 'plans.html' },
      { icon: '⏳', label: 'Kapsul',   href: 'capsule.html' },
      { icon: '💑', label: 'Birlikdə', href: 'couple.html' },
      { icon: '🕹️', label: 'Arcade',   href: 'arcade.html' },
      { icon: '⚙️', label: 'Ayarlar',  href: 'settings.html' },
    ];

    let overlay, trigger, sheet, isOpen = false;
    let touchStartY = 0, touchCurrentY = 0, isDragging = false;

    /* ── CSS ── */
    function injectCSS() {
      let el = document.getElementById('bsn-styles');
      if (!el) { el = document.createElement('style'); el.id = 'bsn-styles'; document.head.appendChild(el); }
      el.textContent = buildCSS();
    }

    function buildCSS() {
      const rm = state.reducedMotion;
      const sd  = rm ? '.001s' : '.48s';
      const id  = rm ? '.001s' : '.32s';
      const td  = rm ? '.001s' : '.3s';
      const ovd = rm ? '.001s' : '.3s';
      return `
.bottomNav,.cartoonNav{display:none!important}
body{padding-bottom:92px!important}

/* Particles */
.bsn-particle{position:fixed;width:7px;height:7px;border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);animation:bsnPart .65s cubic-bezier(.2,0,.8,1) forwards}
@keyframes bsnPart{0%{opacity:1;transform:translate(-50%,-50%) translate(0,0) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) translate(var(--dx),var(--dy)) scale(0)}}

/* Overlay */
.bsn-overlay{position:fixed;inset:0;background:rgba(0,0,0,.62);backdrop-filter:blur(10px) saturate(.75);-webkit-backdrop-filter:blur(10px) saturate(.75);z-index:900;opacity:0;pointer-events:none;transition:opacity ${ovd} ease}
.bsn-overlay.open{opacity:1;pointer-events:all}

/* Trigger */
.bsn-trigger{
  position:fixed;bottom:24px;z-index:910;
  display:flex;align-items:center;gap:11px;padding:14px 28px;
  cursor:pointer;color:#fff;font-family:inherit;font-size:13px;font-weight:700;letter-spacing:.05em;
  -webkit-tap-highlight-color:transparent;user-select:none;white-space:nowrap;overflow:hidden;
  transition:opacity ${td} ease,transform ${td} cubic-bezier(.34,1.56,.64,1),box-shadow .25s ease;
}
.bsn-trigger:not(.open):active{transform:var(--bsn-t,translateX(-50%)) scale(.93)!important}
.bsn-trigger.open{opacity:0;pointer-events:none;transform:var(--bsn-t,translateX(-50%)) scale(.75) translateY(12px)!important}

/* Style: pill */
.bsn-style-pill{background:rgba(11,11,19,.92);border:1px solid rgba(255,255,255,.14);border-radius:100px;backdrop-filter:blur(30px) saturate(200%);-webkit-backdrop-filter:blur(30px) saturate(200%);box-shadow:0 8px 36px rgba(0,0,0,.55),0 2px 8px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.1)}
.bsn-style-pill:hover{background:rgba(20,20,34,.96);box-shadow:0 14px 52px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.13);border-color:rgba(255,255,255,.22)}
/* Style: glass */
.bsn-style-glass{background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.24);border-radius:20px;backdrop-filter:blur(36px) saturate(180%);-webkit-backdrop-filter:blur(36px) saturate(180%);box-shadow:0 8px 44px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.2),inset 0 -1px 0 rgba(0,0,0,.1)}
.bsn-style-glass:hover{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.34)}
/* Style: minimal */
.bsn-style-minimal{background:rgba(10,10,18,.78);border:1px solid rgba(255,255,255,.08);border-radius:14px;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);box-shadow:0 4px 20px rgba(0,0,0,.4)}
.bsn-style-minimal:hover{background:rgba(18,18,28,.88);border-color:rgba(255,255,255,.14)}
/* Style: neon */
.bsn-style-neon{background:rgba(8,8,16,.94);border:1px solid var(--accent,#7c5cff);border-radius:100px;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);box-shadow:0 0 22px rgba(124,92,255,.45),0 0 65px rgba(124,92,255,.18),inset 0 0 22px rgba(124,92,255,.06)}
.bsn-style-neon:hover{box-shadow:0 0 32px rgba(124,92,255,.65),0 0 90px rgba(124,92,255,.28),inset 0 0 32px rgba(124,92,255,.1)}

/* Trigger glow ring */
.bsn-trigger-ring{position:absolute;inset:-1px;border-radius:inherit;background:linear-gradient(135deg,var(--accent,#7c5cff),var(--accent2,#00f2ff));opacity:0;filter:blur(10px);z-index:-1;pointer-events:none;transition:opacity .3s ease}
.bsn-trigger:hover .bsn-trigger-ring{opacity:.3}
.bsn-style-neon .bsn-trigger-ring{opacity:.2}
.bsn-style-neon:hover .bsn-trigger-ring{opacity:.5}

/* Hamburger */
.bsn-ham{width:20px;height:14px;display:flex;flex-direction:column;justify-content:space-between;flex-shrink:0}
.bsn-ham span{display:block;height:2px;background:currentColor;border-radius:2px;transform-origin:center;transition:transform .42s cubic-bezier(.68,-.6,.32,1.6),opacity .25s ease,width .3s ease}
.bsn-ham span:nth-child(1){width:100%}
.bsn-ham span:nth-child(2){width:65%;align-self:flex-end}
.bsn-ham span:nth-child(3){width:42%}
.bsn-trigger.open .bsn-ham span:nth-child(1){transform:translateY(6px) rotate(45deg);width:100%}
.bsn-trigger.open .bsn-ham span:nth-child(2){opacity:0;transform:scaleX(0)}
.bsn-trigger.open .bsn-ham span:nth-child(3){transform:translateY(-6px) rotate(-45deg);width:100%}
.bsn-trigger-lbl{transition:opacity .2s ease}

/* Sheet */
.bsn-sheet{
  position:fixed;bottom:0;left:0;right:0;z-index:905;
  background:rgba(8,8,14,.97);
  backdrop-filter:blur(44px) saturate(200%);-webkit-backdrop-filter:blur(44px) saturate(200%);
  border-top:1px solid rgba(255,255,255,.1);
  border-radius:28px 28px 0 0;
  padding-bottom:max(26px,env(safe-area-inset-bottom,0px));
  box-shadow:0 -28px 90px rgba(0,0,0,.75),0 -1px 0 rgba(255,255,255,.07),inset 0 1px 0 rgba(255,255,255,.04);
  transform:translateY(105%);
  transition:transform ${sd} cubic-bezier(.32,.72,0,1);
  will-change:transform;
}
.bsn-sheet::before{content:'';position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(124,92,255,.14),transparent 72%)}
.bsn-sheet.open{transform:translateY(0)}

/* Grip */
.bsn-handle-area{padding:14px 0 6px;cursor:grab;touch-action:pan-y;-webkit-tap-highlight-color:transparent}
.bsn-handle-area:active{cursor:grabbing}
.bsn-grip{width:38px;height:4px;background:linear-gradient(90deg,rgba(255,255,255,.08),rgba(255,255,255,.25),rgba(255,255,255,.08));border-radius:4px;margin:0 auto;transition:transform .2s ease,background .2s ease}
.bsn-handle-area:hover .bsn-grip{background:rgba(255,255,255,.4);transform:scaleX(1.25)}

.bsn-inner{padding:6px 18px 6px;max-width:560px;margin:0 auto}

/* Grid — 8 items */
.bsn-grid{display:grid;grid-template-columns:repeat(8,1fr);gap:6px}
@media(max-width:480px){.bsn-grid{grid-template-columns:repeat(4,1fr);gap:10px}}

/* Items */
.bsn-item{
  display:flex;flex-direction:column;align-items:center;
  padding:13px 4px 10px;border-radius:20px;
  text-decoration:none;color:rgba(255,255,255,.32);
  cursor:pointer;position:relative;
  -webkit-tap-highlight-color:transparent;
  opacity:0;transform:translateY(20px) scale(.82);
  transition:background .22s ease,color .22s ease,transform ${id} cubic-bezier(.34,1.56,.64,1),opacity ${id} ease;
  transition-delay:calc(var(--i,0) * 0.042s);
}
.bsn-sheet.open .bsn-item{opacity:1;transform:translateY(0) scale(1)}
.bsn-item:hover{background:rgba(255,255,255,.07);color:rgba(255,255,255,.92)}
.bsn-item:active{transform:scale(.85)!important;transition-duration:.1s!important}

/* Active */
.bsn-item.active{
  background:linear-gradient(150deg,rgba(124,92,255,.24),rgba(0,242,255,.1));
  color:#fff;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.09),0 4px 20px rgba(124,92,255,.15);
}
.bsn-item.active::after{
  content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);
  width:30px;height:3px;
  background:linear-gradient(90deg,var(--accent,#7c5cff),var(--accent2,#00f2ff));
  border-radius:0 0 4px 4px;
  box-shadow:0 0 14px var(--accent,#7c5cff),0 0 28px rgba(124,92,255,.5);
  animation:bsnInd .2s cubic-bezier(.34,1.56,.64,1);
}
@keyframes bsnInd{from{transform:translateX(-50%) scaleX(0);opacity:0}to{transform:translateX(-50%) scaleX(1);opacity:1}}

/* Active pulse ring */
.bsn-active-ring{
  position:absolute;inset:-3px;border-radius:22px;
  border:1.5px solid var(--accent,#7c5cff);
  opacity:.55;pointer-events:none;
  box-shadow:0 0 14px rgba(124,92,255,.4),inset 0 0 14px rgba(124,92,255,.1);
  animation:bsnRingPulse 3s ease-in-out infinite;
}
@keyframes bsnRingPulse{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:.8;transform:scale(1.05)}}

/* Icon */
.bsn-icon-wrap{position:relative;display:flex;align-items:center;justify-content:center}
.bsn-icon{
  font-size:24px;line-height:1;display:block;
  transition:transform .38s cubic-bezier(.34,1.56,.64,1);
  filter:drop-shadow(0 2px 8px rgba(0,0,0,.4));
}
.bsn-item:hover .bsn-icon{transform:scale(1.32) translateY(-4px) rotate(-5deg)}
.bsn-item.active .bsn-icon{
  transform:scale(1.18) translateY(-3px);
  filter:drop-shadow(0 0 12px rgba(124,92,255,.7)) drop-shadow(0 2px 8px rgba(0,0,0,.4));
  animation:bsnIconBob 3.5s ease-in-out infinite;
}
@keyframes bsnIconBob{0%,100%{transform:scale(1.18) translateY(-3px)}50%{transform:scale(1.22) translateY(-5px)}}

/* Label */
.bsn-lbl{
  font-size:8.5px;font-weight:800;letter-spacing:.04em;
  text-align:center;white-space:nowrap;
  max-height:0;overflow:hidden;opacity:0;transform:translateY(6px);
  transition:max-height .35s ease,opacity .3s ease,transform .3s ease,margin-top .3s ease;
}
.bsn-sheet.open .bsn-lbl{max-height:14px;opacity:1;transform:translateY(0);margin-top:5px}
.bsn-item.active .bsn-lbl{
  background:linear-gradient(90deg,var(--accent,#7c5cff),var(--accent2,#00f2ff));
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;
}

/* Footer */
.bsn-footer{
  display:flex;align-items:center;justify-content:space-between;gap:10px;
  padding:8px 20px 4px;max-width:560px;margin:0 auto;
  opacity:0;transform:translateY(10px);
  transition:opacity .3s ease .28s,transform .3s ease .28s;
}
.bsn-sheet.open .bsn-footer{opacity:1;transform:translateY(0)}

.bsn-close-btn{
  display:flex;align-items:center;gap:9px;padding:11px 26px;
  background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.13);
  border-radius:100px;color:rgba(255,255,255,.55);
  font-family:inherit;font-size:12px;font-weight:800;letter-spacing:.04em;
  cursor:pointer;transition:all .22s ease;-webkit-tap-highlight-color:transparent;
}
.bsn-close-btn:hover{background:rgba(255,255,255,.13);color:#fff;border-color:rgba(255,255,255,.24);transform:scale(1.04)}
.bsn-close-btn:active{transform:scale(.95)}
.bsn-close-x{width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,.1);display:inline-flex;align-items:center;justify-content:center;font-size:10px;transition:background .2s ease,transform .25s cubic-bezier(.34,1.56,.64,1)}
.bsn-close-btn:hover .bsn-close-x{background:rgba(255,255,255,.22);transform:rotate(90deg) scale(1.1)}

.bsn-page-indicator{
  font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;
  color:rgba(255,255,255,.28);
  background:rgba(255,255,255,.05);padding:7px 14px;
  border-radius:100px;border:1px solid rgba(255,255,255,.08);
}

/* Reduced motion */
html.reducedMotion .bsn-sheet,
html.reducedMotion .bsn-item,
html.reducedMotion .bsn-overlay,
html.reducedMotion .bsn-trigger,
html.reducedMotion .bsn-active-ring,
html.reducedMotion .bsn-icon{animation:none!important;transition-duration:.001ms!important}
      `;
    }

    /* ── Helpers ── */
    function getTriggerStyle() {
      const pos = state.navPos || 'center';
      if (pos === 'left')  return 'left:22px;right:auto;--bsn-t:none';
      if (pos === 'right') return 'left:auto;right:22px;--bsn-t:none';
      return 'left:50%;right:auto;transform:translateX(-50%);--bsn-t:translateX(-50%)';
    }

    function haptic(type) {
      if (!navigator.vibrate) return;
      if (type === 'open')  navigator.vibrate(10);
      if (type === 'close') navigator.vibrate(6);
      if (type === 'item')  navigator.vibrate(4);
    }

    function spawnParticles() {
      if (state.reducedMotion) return;
      const rect   = trigger.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const colors = ['var(--accent)', 'var(--accent2)', '#ffffff', '#c4b5fd', '#67e8f9'];
      for (let i = 0; i < 12; i++) {
        const p     = document.createElement('div');
        p.className = 'bsn-particle';
        const angle = (Math.PI * 2 / 12) * i;
        const dist  = 38 + Math.random() * 35;
        p.style.cssText = `left:${cx}px;top:${cy}px;--dx:${Math.cos(angle)*dist}px;--dy:${Math.sin(angle)*dist}px;background:${colors[i % colors.length]};animation-delay:${i * 0.018}s;width:${4 + Math.random()*5}px;height:${4 + Math.random()*5}px`;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 750);
      }
    }

    /* ── Open / Close ── */
    function openSheet() {
      if (isOpen) return;
      isOpen = true;
      haptic('open');
      trigger.classList.add('open');
      sheet.classList.add('open');
      overlay.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      spawnParticles();
    }

    function closeSheet() {
      if (!isOpen) return;
      isOpen = false;
      haptic('close');
      trigger.classList.remove('open');
      sheet.classList.remove('open');
      overlay.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      sheet.style.transform = '';
    }

    /* ── Swipe to close ── */
    function onTouchStart(e) {
      touchStartY   = e.touches[0].clientY;
      touchCurrentY = touchStartY;
      isDragging    = true;
      sheet.style.transition = 'none';
    }
    function onTouchMove(e) {
      if (!isDragging) return;
      touchCurrentY = e.touches[0].clientY;
      const delta   = Math.max(0, touchCurrentY - touchStartY);
      sheet.style.transform  = `translateY(${delta}px)`;
      overlay.style.opacity  = Math.max(0, (1 - delta / 220) * 0.62);
    }
    function onTouchEnd() {
      if (!isDragging) return;
      isDragging             = false;
      sheet.style.transition = '';
      overlay.style.opacity  = '';
      if ((touchCurrentY - touchStartY) > 90) {
        closeSheet();
      } else {
        sheet.style.transform = '';
      }
    }

    /* ── Build DOM ── */
    function buildDOM() {
      const page       = window.location.pathname.split('/').pop() || 'index.html';
      const label      = state.navLabel || 'Menyu';
      const showLabels = state.navLabelsVisible !== false;
      const pageNames  = {
        'index.html':'Ana','watch-party.html':'Film','album.html':'Album',
        'plans.html':'Planlar','capsule.html':'Kapsul','couple.html':'Birlikdə',
        'arcade.html':'Arcade','settings.html':'Ayarlar'
      };
      const pageName = pageNames[page] || page.replace('.html','');

      overlay = document.createElement('div');
      overlay.className = 'bsn-overlay';

      trigger = document.createElement('button');
      trigger.className = `bsn-trigger bsn-style-${state.navStyle || 'pill'}`;
      trigger.setAttribute('aria-label', 'Naviqasiya menyusu');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('style', getTriggerStyle());
      trigger.innerHTML =
        `<span class="bsn-ham" aria-hidden="true"><span></span><span></span><span></span></span>
         <span class="bsn-trigger-lbl">${label}</span>
         <span class="bsn-trigger-ring" aria-hidden="true"></span>`;

      sheet = document.createElement('div');
      sheet.className = 'bsn-sheet';
      sheet.setAttribute('role', 'navigation');
      sheet.setAttribute('aria-label', 'Əsas Naviqasiya');

      const gridHtml = ITEMS.map((item, i) => {
        const active = page === item.href;
        return `<a class="bsn-item${active ? ' active' : ''}" href="${item.href}" draggable="false" style="--i:${i}" aria-label="${item.label}${active ? ' (aktiv)' : ''}">
          <span class="bsn-icon-wrap">
            <span class="bsn-icon">${item.icon}</span>
            ${active ? '<span class="bsn-active-ring"></span>' : ''}
          </span>
          ${showLabels ? `<span class="bsn-lbl">${item.label}</span>` : ''}
        </a>`;
      }).join('');

      sheet.innerHTML = `
        <div class="bsn-handle-area"><div class="bsn-grip"></div></div>
        <div class="bsn-inner"><div class="bsn-grid">${gridHtml}</div></div>
        <div class="bsn-footer">
          <button class="bsn-close-btn" aria-label="Menyunu bağla">
            <span class="bsn-close-x" aria-hidden="true">✕</span>
            <span>Bağla</span>
          </button>
          <span class="bsn-page-indicator">${pageName}</span>
        </div>`;

      document.body.appendChild(overlay);
      document.body.appendChild(trigger);
      document.body.appendChild(sheet);
    }

    /* ── Bind Events ── */
    function bindEvents() {
      trigger.addEventListener('click', () => isOpen ? closeSheet() : openSheet());
      overlay.addEventListener('click', closeSheet);
      sheet.querySelector('.bsn-close-btn').addEventListener('click', closeSheet);
      sheet.querySelectorAll('.bsn-item').forEach(el => {
        el.addEventListener('click', () => { haptic('item'); setTimeout(closeSheet, 100); });
      });
      sheet.addEventListener('touchstart', onTouchStart, { passive: true });
      sheet.addEventListener('touchmove',  onTouchMove,  { passive: true });
      sheet.addEventListener('touchend',   onTouchEnd);
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen) closeSheet(); });
    }

    /* ── Public: full rebuild (settings dəyişəndə) ── */
    function rebuild() {
      if (isOpen) closeSheet();
      if (overlay) overlay.remove();
      if (trigger) trigger.remove();
      if (sheet)   sheet.remove();
      isOpen = false;
      injectCSS();
      buildDOM();
      bindEvents();
    }

    function init() {
      /* Əgər bottomnav.js artıq nav qurubsa, onu sil */
      document.querySelectorAll('.bsn-trigger, .bsn-sheet, .bsn-overlay').forEach(el => el.remove());

      injectCSS();
      buildDOM();
      bindEvents();
      window.__BSN_INITIALIZED__ = true;
    }

    return { init, rebuild };
  })();

  window.App.navRebuild = () => BSN.rebuild();
  window.BSN = BSN;

  /* ── DOMContentLoaded ── */
  document.addEventListener('DOMContentLoaded', () => {
    applyTheme();
    BSN.init();

    document.body.style.opacity = '0';
    requestAnimationFrame(() => {
      document.body.style.transition = 'opacity 0.45s ease';
      document.body.style.opacity    = '1';
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && !state.reducedMotion) {
      state.reducedMotion = 1; applyTheme(); save();
    }

    if (state.music === 1) setTimeout(() => App.audio.test(), 600);
  });

})();
