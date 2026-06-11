// Rolling Wrench AI compatibility module.
// Kept so older index.html files requesting /js/commandBus.js do not 404.
window.RWDCommandBus = window.RWDCommandBus || {
  events: {},
  on(name, fn){ (this.events[name] ||= []).push(fn); },
  emit(name, payload){ (this.events[name] || []).forEach(fn => { try { fn(payload); } catch(e){ console.error(e); } }); }
};
