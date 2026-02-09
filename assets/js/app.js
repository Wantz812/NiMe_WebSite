(() => {
  const $ = q => document.querySelector(q);
  const $$ = q => document.querySelectorAll(q);
  const STORE = "SITE_SETTINGS_V4";

  // Default State
  const state = {
    theme: "neo",
    bg: "orbs",
    fx: "balanced",
    contrast: 0,
    compact: 0,
    reducedMotion: 0,
    music: 1,
    musicVol: 0.5,
    song: "assets/audio/bg-music.mp3"
  };

  // Load Saved Settings
  const saved = JSON.parse(localStorage.getItem(STORE) || "{}");
  Object.assign(state, saved);

  // Audio Player
  let audioPlayer = null;

  const App = {
    getSettings: () => ({ ...state }),
    $: $,
    $$: $$,
    
    setSettings: (obj) => {
      Object.assign(state, obj);
      apply();
      save();
    },

    toast: (msg, duration = 1800) => {
      const existing = $$('.toast');
      existing.forEach(t => t.remove());
      
      const toast = document.createElement("div");
      toast.className = "toast";
      toast.textContent = msg;
      document.body.appendChild(toast);
      
      requestAnimationFrame(() => {
        toast.classList.add("show");
      });
      
      setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
      }, duration);
    },

    audio: {
      test: () => {
        if (!audioPlayer) {
          audioPlayer = new Audio();
        }
        audioPlayer.src = state.song;
        audioPlayer.volume = state.musicVol;
        audioPlayer.play().catch(() => {
          App.toast("⚠️ Audio yüklənə bilmədi");
        });
      },
      
      stop: () => {
        if (audioPlayer) {
          audioPlayer.pause();
          audioPlayer.currentTime = 0;
        }
      },
      
      setVolume: (vol) => {
        if (audioPlayer) {
          audioPlayer.volume = vol;
        }
      }
    },

    // Storage helpers (for compatibility)
    storage: {
      keys: {
        STORE_MEMORIES: 'memories_v2',
        STORE_BUCKET: 'bucket_v2',
        STORE_GIFT: 'gift_v2',
        STORE_PUZZLEBOX: 'puzzlebox_v2'
      },
      
      readJSON: (key, defaultVal) => {
        try {
          const val = localStorage.getItem(key);
          return val ? JSON.parse(val) : defaultVal;
        } catch {
          return defaultVal;
        }
      },
      
      writeJSON: (key, val) => {
        try {
          localStorage.setItem(key, JSON.stringify(val));
          return true;
        } catch {
          return false;
        }
      }
    },

    settings: () => state,
    saveSettings: (s) => {
      Object.assign(state, s);
      apply();
      save();
    },

    migrateFromOldSite: () => {
      // Migration logic from old site
      let migrated = false;
      try {
        const oldKeys = ['old_memories', 'old_bucket', 'old_gift'];
        oldKeys.forEach(key => {
          const val = localStorage.getItem(key);
          if (val) {
            migrated = true;
            // Migrate to new keys
          }
        });
      } catch (e) {
        console.error('Migration error:', e);
      }
      return migrated;
    }
  };

  window.App = App;

  // Apply Settings to DOM
  function apply() {
    const root = document.documentElement;
    root.setAttribute("data-theme", state.theme);
    root.setAttribute("data-bg", state.bg);
    root.setAttribute("data-fx", state.fx);
    root.setAttribute("data-contrast", state.contrast ? "high" : "normal");
    root.setAttribute("data-compact", state.compact ? "true" : "false");
    root.classList.toggle("reducedMotion", state.reducedMotion === 1);
  }

  // Save to LocalStorage
  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
    } catch (e) {
      console.error('Save error:', e);
    }
  }

  // Initialize on DOM Ready
  document.addEventListener("DOMContentLoaded", () => {
    apply();
    
    // Add page load animation
    document.body.style.opacity = '0';
    requestAnimationFrame(() => {
      document.body.style.transition = 'opacity 0.4s ease';
      document.body.style.opacity = '1';
    });

    // Detect system preference for reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && state.reducedMotion === 0) {
      state.reducedMotion = 1;
      apply();
      save();
    }

    // Auto-play background music if enabled
    if (state.music === 1) {
      setTimeout(() => {
        App.audio.test();
      }, 500);
    }
  });

  // Initialize immediately for SSR/static
  apply();
})();
