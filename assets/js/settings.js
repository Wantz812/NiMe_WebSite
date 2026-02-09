(() => {
  'use strict';
  const $ = App.$;

  function render(){
    const s = App.settings();
    $('#sound').checked = !!s.sound;
    $('#reduce').checked = !!s.reduceMotion;
    $('#migrated').textContent = s.migratedAt ? s.migratedAt : '—';
    $('#size').textContent = `${Math.round((JSON.stringify(localStorage).length)/1024)} KB (approx)`;
  }

  function save(){
    const s = App.settings();
    s.sound = $('#sound').checked;
    s.reduceMotion = $('#reduce').checked;
    App.saveSettings(s);
    App.toast('Saved ✅');
    render();
  }

  function doExport(){
    $('#io').value = App.exportAll();
    App.toast('Export created.');
  }

  function doImport(){
    const txt = $('#io').value.trim();
    if(!txt){ App.toast('Paste JSON first.'); return; }
    const res = App.importAll(txt);
    if(!res.ok){
      App.toast(res.err || 'Import failed.');
      return;
    }
    App.toast(`Imported (${res.changed} keys).`);
    render();
  }

  function doMigrate(){
    const ok = App.migrateFromOldSite();
    App.toast(ok ? 'Imported from old keys ✅' : 'Nothing to import (or already imported).');
    render();
  }

  function resetAll(){
    if(!confirm('Reset EVERYTHING (all pages)?')) return;
    const keys = Object.values(App.storage.keys);
    keys.forEach(k => localStorage.removeItem(k));
    const s = App.settings();
    s.migratedAt = null;
    App.saveSettings(s);
    App.toast('Reset done.');
    render();
  }

  function boot(){
    render();
    $('#btnSave').addEventListener('click', save);
    $('#btnExport').addEventListener('click', doExport);
    $('#btnImport').addEventListener('click', doImport);
    $('#btnMigrate').addEventListener('click', doMigrate);
    $('#btnReset').addEventListener('click', resetAll);
  }

  window.addEventListener('load', boot);
})();
