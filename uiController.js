// Rolling Wrench AI compatibility UI controller.
window.RWDUI = window.RWDUI || {
  show(id){ if (typeof showScreen === 'function') return showScreen(id); const el=document.getElementById(id); if(el){ document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); el.classList.add('active'); } }
};
