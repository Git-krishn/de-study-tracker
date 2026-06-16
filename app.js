/* ── NAV ACTIVE STATE ── */
(function () {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });
})();

/* ── ACCORDION ── */
document.addEventListener('click', function (e) {
  const head = e.target.closest('.week-head');
  if (!head) return;
  const card  = head.closest('.week-card');
  const body  = card.querySelector('.week-body');
  const chev  = head.querySelector('.week-chevron');
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  if (chev) chev.classList.toggle('open', !isOpen);
});

/* ── CHECKBOX PERSISTENCE (localStorage) ── */
(function () {
  const KEY_PREFIX = 'de_check_';

  function saveCheck(id, checked) {
    localStorage.setItem(KEY_PREFIX + id, checked ? '1' : '0');
  }
  function loadChecks() {
    document.querySelectorAll('input[type=checkbox][data-id]').forEach(cb => {
      const saved = localStorage.getItem(KEY_PREFIX + cb.dataset.id);
      if (saved === '1') {
        cb.checked = true;
        cb.closest('.topic-item')?.classList.add('done');
      }
      cb.addEventListener('change', function () {
        saveCheck(this.dataset.id, this.checked);
        this.closest('.topic-item')?.classList.toggle('done', this.checked);
        updatePageProgress();
      });
    });
  }

  function updatePageProgress() {
    const all     = document.querySelectorAll('input[type=checkbox][data-id]');
    const checked = document.querySelectorAll('input[type=checkbox][data-id]:checked');
    const pct = all.length ? Math.round((checked.length / all.length) * 100) : 0;
    const bar = document.getElementById('page-progress-fill');
    const lbl = document.getElementById('page-progress-label');
    if (bar) bar.style.width = pct + '%';
    if (lbl) lbl.textContent = pct + '% complete · ' + checked.length + ' / ' + all.length + ' topics done';
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadChecks();
    updatePageProgress();
  });
})();

/* ── HOMEPAGE GLOBAL PROGRESS ── */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    // Count total checkboxes across all pages using stored keys
    const months = [
      { prefix: 'm1_', total: 29, elPct: 'prog-m1-pct', elBar: 'prog-m1-bar', elNum: 'prog-m1-num' },
      { prefix: 'm2_', total: 22, elPct: 'prog-m2-pct', elBar: 'prog-m2-bar', elNum: 'prog-m2-num' },
      { prefix: 'm3_', total: 22, elPct: 'prog-m3-pct', elBar: 'prog-m3-bar', elNum: 'prog-m3-num' },
    ];
    let grandTotal = 0, grandDone = 0;
    months.forEach(m => {
      let done = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('de_check_' + m.prefix) && localStorage.getItem(k) === '1') done++;
      }
      const pct = Math.round((done / m.total) * 100);
      const barEl = document.getElementById(m.elBar);
      const pctEl = document.getElementById(m.elPct);
      const numEl = document.getElementById(m.elNum);
      if (barEl) { setTimeout(() => barEl.style.width = pct + '%', 200); }
      if (pctEl) pctEl.textContent = pct + '%';
      if (numEl) numEl.textContent = done + ' / ' + m.total;
      grandTotal += m.total; grandDone += done;
    });

    // Overall ring
    const grandPct = grandTotal ? Math.round((grandDone / grandTotal) * 100) : 0;
    const arc = document.getElementById('ring-arc');
    if (arc) {
      const r = 30, circ = 2 * Math.PI * r;
      arc.setAttribute('stroke-dasharray', circ);
      setTimeout(() => {
        arc.setAttribute('stroke-dashoffset', circ - (circ * grandPct / 100));
      }, 400);
    }
    const ringPct = document.getElementById('ring-pct');
    if (ringPct) ringPct.textContent = grandPct + '%';
    const ringDone = document.getElementById('ring-done');
    if (ringDone) ringDone.textContent = grandDone + ' of ' + grandTotal + ' topics';

    // Weeks completed stat
    const weeksEl = document.getElementById('stat-weeks');
    if (weeksEl) {
      const wDone = months.reduce((acc, m) => {
        let done = 0;
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('de_check_' + m.prefix) && localStorage.getItem(k) === '1') done++;
        }
        return acc + Math.floor(done / 7);
      }, 0);
      weeksEl.textContent = Math.min(wDone, 12);
    }
  });
})();

/* ── ANIMATE NUMBERS ON SCROLL ── */
function animateNum(el, target, suffix) {
  let start = 0;
  const step = target / 30;
  const interval = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = Math.round(start) + (suffix || '');
    if (start >= target) clearInterval(interval);
  }, 30);
}
