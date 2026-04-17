'use strict';

const ALL_PS = ['ps1', 'ps2', 'ps3', 'ps4', 'ps5', 'ps7', 'ps8', 'ps9', 'ps10', 'ps11', 'ps12', 'ps13', 'ps14', 'ps15'];

const $ = (id) => document.getElementById(id);

const el = {
  bars: $('bar-container'),
  stepInfo: $('step-info'),
  stepCount: $('step-count'),
  prog: $('prog'),
  statCmp: $('stat-cmp'),
  statSwap: $('stat-swap'),
  statTotal: $('stat-total'),
  statProg: $('stat-prog'),
  btnShuffle: $('btn-shuffle'),
  btnReset: $('btn-reset'),
  btnStep: $('btn-step'),
  btnAuto: $('btn-auto'),
  selSize: $('sel-size'),
  speedSlider: $('speed-slider'),
  speedLabel: $('speed-label'),
};

let arr = [];
let steps = [];
let stepIdx = 0;
let autoTimer = null;

function randArr(n) {
  const a = [];
  while (a.length < n) {
    const v = Math.floor(Math.random() * 85) + 10;
    if (!a.includes(v)) a.push(v);
  }
  return a;
}

function generateSteps(input) {
  const a = [...input];
  const out = [];
  const sorted = new Set();
  let cmp = 0, swp = 0;

  function qs(lo, hi) {
    if (lo >= hi) {
      if (lo === hi) sorted.add(lo);
      return;
    }
    const hiVal = a[hi];
    out.push({
      type: 'pivot', arr: [...a], pivot: hi, lo, hi, sorted: new Set(sorted),
      msg: `Vùng [<strong>${lo}..${hi}]</strong> — Chọn pivot = <strong>${hiVal}</strong> (arr[${hi}])`,
      ps: 'ps8',
    });
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      cmp++;
      const ok = a[j] <= hiVal;
      out.push({
        type: 'compare', arr: [...a], pivot: hi, i, j, lo, hi, sorted: new Set(sorted),
        msg: `So sánh arr[<strong>${j}]=${a[j]}</strong> với pivot <strong>${hiVal}</strong>: ${ok ? '<span class="ok">✅ ≤ pivot → tiến i, swap</span>' : '<span class="no">❌ > pivot → bỏ qua</span>'}`,
        ps: 'ps11', cmp, swp,
      });
      if (ok) {
        i++;
        if (i !== j) {
          swp++;
          [a[i], a[j]] = [a[j], a[i]];
          out.push({
            type: 'swap', arr: [...a], pivot: hi, i, j, lo, hi, sorted: new Set(sorted),
            msg: `Swap arr[<strong>${i}]=${a[i]}</strong> ↔ arr[<strong>${j}]=${a[j]}</strong>`,
            ps: 'ps13', cmp, swp,
          });
        } else {
          out.push({
            type: 'inc', arr: [...a], pivot: hi, i, j, lo, hi, sorted: new Set(sorted),
            msg: `arr[${j}]=${a[j]} ≤ pivot → i tăng lên <strong>${i}</strong> (không cần swap)`,
            ps: 'ps12', cmp, swp,
          });
        }
      }
    }
    const pi = i + 1;
    swp++;
    [a[pi], a[hi]] = [a[hi], a[pi]];
    sorted.add(pi);
    out.push({
      type: 'place', arr: [...a], pivot: pi, lo, hi, sorted: new Set(sorted),
      msg: `Đặt pivot <strong>${a[pi]}</strong> vào đúng vị trí <strong>${pi}</strong>. Trái ≤ ${a[pi]}, Phải ≥ ${a[pi]}`,
      ps: 'ps14', cmp, swp,
    });
    qs(lo, pi - 1);
    qs(pi + 1, hi);
  }

  qs(0, a.length - 1);
  const finalSorted = new Set([...Array(a.length).keys()]);
  out.push({
    type: 'done', arr: [...a], sorted: finalSorted,
    msg: '<span class="ok">✅ Mảng đã được sắp xếp hoàn toàn!</span>',
    ps: '', cmp, swp,
  });
  return out;
}

function renderBars(step) {
  const maxV = Math.max(...step.arr);
  el.bars.innerHTML = '';
  step.arr.forEach((v, idx) => {
    const div = document.createElement('div');
    div.className = 'bar';
    let bg = 'var(--default-bar)';
    let valColor = '#4b5563';
    const isSorted = step.sorted && step.sorted.has(idx);
    if (isSorted) { bg = 'var(--sorted)'; valColor = 'var(--sorted)'; }
    if (step.pivot === idx) { bg = 'var(--pivot)'; valColor = 'var(--pivot)'; }
    if (step.i === idx && step.type !== 'place' && !isSorted) { bg = 'var(--i-color)'; valColor = 'var(--i-color)'; }
    if (step.j === idx) { bg = 'var(--j-color)'; valColor = 'var(--j-color)'; }
    if (step.type === 'swap' && (idx === step.i || idx === step.j)) { bg = 'var(--swap)'; valColor = 'var(--swap)'; }
    const h = Math.max(16, Math.round(v / maxV * 180));
    div.style.cssText = `height:${h}px;background:${bg};`;
    const val = document.createElement('span');
    val.className = 'bar-val';
    val.style.color = valColor;
    val.textContent = v;
    const lbl = document.createElement('span');
    lbl.className = 'bar-idx';
    lbl.textContent = idx;
    div.appendChild(val);
    div.appendChild(lbl);
    el.bars.appendChild(div);
  });

  el.stepInfo.innerHTML = step.msg || '';

  ALL_PS.forEach((id) => {
    const node = document.getElementById(id);
    if (node) node.classList.remove('active');
  });
  if (step.ps) {
    const node = document.getElementById(step.ps);
    if (node) node.classList.add('active');
  }

  const total = steps.length;
  const pct = total > 0 ? Math.round((stepIdx / total) * 100) : 0;
  el.stepCount.textContent = `Bước ${stepIdx} / ${total}`;
  el.prog.style.width = pct + '%';
  el.statProg.textContent = pct + '%';
  if (step.cmp != null) el.statCmp.textContent = step.cmp;
  if (step.swp != null) el.statSwap.textContent = step.swp;
}

function init(keepArr) {
  const n = parseInt(el.selSize.value, 10);
  if (!keepArr) arr = randArr(n);
  steps = generateSteps(arr);
  stepIdx = 0;
  el.statTotal.textContent = steps.length;
  el.statCmp.textContent = '0';
  el.statSwap.textContent = '0';
  renderBars({
    arr: [...arr],
    sorted: new Set(),
    msg: 'Mảng ban đầu. Nhấn <strong>Bước tiếp ▶</strong> để bắt đầu.',
    ps: '',
  });
  el.btnStep.disabled = false;
  el.btnAuto.disabled = false;
  stopAuto();
}

function nextStep() {
  if (stepIdx >= steps.length) {
    el.btnStep.disabled = true;
    stopAuto();
    return;
  }
  renderBars(steps[stepIdx++]);
}

function stopAuto() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
  el.btnAuto.textContent = '⚡ Chạy tự động';
}

function startAuto() {
  el.btnAuto.textContent = '⏸ Dừng';
  const getDelay = () => 1800 - parseInt(el.speedSlider.value, 10);
  autoTimer = setInterval(() => {
    if (stepIdx >= steps.length) { stopAuto(); return; }
    nextStep();
  }, getDelay());
}

el.btnShuffle.addEventListener('click', () => init(false));
el.btnReset.addEventListener('click', () => init(true));
el.selSize.addEventListener('change', () => init(false));
el.btnStep.addEventListener('click', nextStep);
el.btnAuto.addEventListener('click', () => {
  if (autoTimer) { stopAuto(); return; }
  startAuto();
});
el.speedSlider.addEventListener('input', function () {
  const v = parseInt(this.value, 10);
  el.speedLabel.textContent = v < 500 ? 'chậm' : v < 1000 ? 'vừa' : 'nhanh';
  if (autoTimer) { stopAuto(); startAuto(); }
});

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  if (e.code === 'Space' || e.key === 'ArrowRight') {
    e.preventDefault();
    nextStep();
  } else if (e.key === 'r' || e.key === 'R') {
    init(true);
  } else if (e.key === 'n' || e.key === 'N') {
    init(false);
  }
});

init(false);
