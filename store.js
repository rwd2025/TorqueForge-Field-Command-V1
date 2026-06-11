// Rolling Wrench AI compatibility store.
window.RWDStore = window.RWDStore || {
  get(key, fallback=null){ try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
  set(key, value){ localStorage.setItem(key, JSON.stringify(value)); return value; },
  remove(key){ localStorage.removeItem(key); }
};
