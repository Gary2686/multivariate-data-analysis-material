/* ===== Language Toggle ===== */
let currentLang = localStorage.getItem('lang') || 'zh';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.body.classList.remove('lang-en', 'lang-zh');
  document.body.classList.add('lang-' + lang);
  document.querySelectorAll('.lang-toggle').forEach(btn => {
    btn.textContent = lang === 'zh' ? 'EN' : '中文';
  });
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = lang === 'en' ? el.dataset.en : el.dataset.zh;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setLang(currentLang);
  document.querySelectorAll('.lang-toggle').forEach(btn => {
    btn.addEventListener('click', () => setLang(currentLang === 'zh' ? 'en' : 'zh'));
  });
  initTabs();
  initAccordions();
  initQuizzes();
  initScrollProgress();
});

/* ===== Tabs ===== */
function initTabs() {
  document.querySelectorAll('.tab-container').forEach(container => {
    const btns = container.querySelectorAll('.tab-btn');
    const panels = container.querySelectorAll('.tab-panel');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        container.querySelector('#' + btn.dataset.tab).classList.add('active');
      });
    });
  });
}

/* ===== Accordions ===== */
function initAccordions() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      header.parentElement.classList.toggle('open');
    });
  });
}

/* ===== Quizzes ===== */
function initQuizzes() {
  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const question = opt.closest('.quiz-question');
      if (question.classList.contains('answered')) return;
      question.classList.add('answered');
      const correct = opt.dataset.correct === 'true';
      opt.classList.add(correct ? 'correct' : 'wrong');
      if (!correct) {
        question.querySelector('[data-correct="true"]').classList.add('correct');
      }
      const feedback = question.querySelector('.quiz-feedback');
      if (feedback) {
        feedback.classList.add('show');
        feedback.style.background = correct ? '#d4edda' : '#fdecea';
      }
    });
  });
}

/* ===== Scroll Progress ===== */
function initScrollProgress() {
  const bar = document.querySelector('.progress-bar .fill');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    bar.style.width = pct + '%';
  });
}

/* ===== Cronbach's Alpha Calculator ===== */
function calcAlpha() {
  const k = parseInt(document.getElementById('alpha-k').value);
  const sumVar = parseFloat(document.getElementById('alpha-sumvar').value);
  const totalVar = parseFloat(document.getElementById('alpha-totalvar').value);
  if (isNaN(k) || isNaN(sumVar) || isNaN(totalVar) || k < 2 || totalVar <= 0) {
    showResult('alpha-result', 'N/A', 'Please enter valid values / 請輸入有效值', '');
    return;
  }
  const alpha = (k / (k - 1)) * (1 - sumVar / totalVar);
  let cls, msg;
  if (alpha >= 0.7) { cls = 'good'; msg = currentLang === 'zh' ? '良好的內部一致性信度 (>= .70)' : 'Good internal consistency reliability (>= .70)'; }
  else if (alpha >= 0.6) { cls = 'warn'; msg = currentLang === 'zh' ? '探索性研究可接受 (.60-.70)' : 'Acceptable for exploratory research (.60-.70)'; }
  else { cls = 'bad'; msg = currentLang === 'zh' ? '信度不足 (< .60)，需要改善量表' : 'Insufficient reliability (< .60), scale needs improvement'; }
  showResult('alpha-result', alpha.toFixed(4), msg, cls);
}

/* ===== AVE Calculator ===== */
function calcAVE() {
  const input = document.getElementById('ave-loadings').value.trim();
  const loadings = input.split(/[\s,;]+/).map(Number).filter(v => !isNaN(v));
  if (loadings.length < 2) {
    showResult('ave-result', 'N/A', 'Enter at least 2 factor loadings / 至少輸入2個因素負荷量', '');
    return;
  }
  const sumSq = loadings.reduce((s, l) => s + l * l, 0);
  const ave = sumSq / loadings.length;
  let cls, msg;
  if (ave >= 0.5) { cls = 'good'; msg = currentLang === 'zh' ? '具有足夠的聚合效度 (AVE >= .50)' : 'Adequate convergent validity (AVE >= .50)'; }
  else { cls = 'bad'; msg = currentLang === 'zh' ? 'AVE 不足 (< .50)，聚合效度有疑慮' : 'AVE insufficient (< .50), convergent validity questionable'; }
  const details = currentLang === 'zh'
    ? `個別 λ²: [${loadings.map(l => (l*l).toFixed(3)).join(', ')}]`
    : `Individual λ²: [${loadings.map(l => (l*l).toFixed(3)).join(', ')}]`;
  showResult('ave-result', ave.toFixed(4), msg + '<br><small>' + details + '</small>', cls);
}

/* ===== CR Calculator ===== */
function calcCR() {
  const input = document.getElementById('cr-loadings').value.trim();
  const loadings = input.split(/[\s,;]+/).map(Number).filter(v => !isNaN(v));
  if (loadings.length < 2) {
    showResult('cr-result', 'N/A', 'Enter at least 2 factor loadings / 至少輸入2個因素負荷量', '');
    return;
  }
  const sumL = loadings.reduce((s, l) => s + l, 0);
  const sumE = loadings.reduce((s, l) => s + (1 - l * l), 0);
  const cr = (sumL * sumL) / (sumL * sumL + sumE);
  let cls, msg;
  if (cr >= 0.7) { cls = 'good'; msg = currentLang === 'zh' ? '具有良好的組合信度 (CR >= .70)' : 'Good composite reliability (CR >= .70)'; }
  else { cls = 'bad'; msg = currentLang === 'zh' ? '組合信度不足 (< .70)' : 'Composite reliability insufficient (< .70)'; }
  showResult('cr-result', cr.toFixed(4), msg, cls);
}

/* ===== Discriminant Validity Checker ===== */
function calcDiscriminant() {
  const ave1 = parseFloat(document.getElementById('dv-ave1').value);
  const ave2 = parseFloat(document.getElementById('dv-ave2').value);
  const corr = parseFloat(document.getElementById('dv-corr').value);
  if (isNaN(ave1) || isNaN(ave2) || isNaN(corr)) {
    showResult('dv-result', 'N/A', 'Please enter all values / 請輸入所有數值', '');
    return;
  }
  const sqCorr = corr * corr;
  const pass = ave1 > sqCorr && ave2 > sqCorr;
  const cls = pass ? 'good' : 'bad';
  const msg = currentLang === 'zh'
    ? `AVE₁ (${ave1.toFixed(3)}) ${ave1 > sqCorr ? '>' : '≤'} r² (${sqCorr.toFixed(3)})<br>AVE₂ (${ave2.toFixed(3)}) ${ave2 > sqCorr ? '>' : '≤'} r² (${sqCorr.toFixed(3)})<br>${pass ? 'Fornell-Larcker 判準通過：具有區辨效度' : 'Fornell-Larcker 判準未通過：區辨效度不足'}`
    : `AVE₁ (${ave1.toFixed(3)}) ${ave1 > sqCorr ? '>' : '≤'} r² (${sqCorr.toFixed(3)})<br>AVE₂ (${ave2.toFixed(3)}) ${ave2 > sqCorr ? '>' : '≤'} r² (${sqCorr.toFixed(3)})<br>${pass ? 'Fornell-Larcker criterion passed: discriminant validity supported' : 'Fornell-Larcker criterion failed: discriminant validity not supported'}`;
  showResult('dv-result', pass ? (currentLang === 'zh' ? '通過' : 'PASS') : (currentLang === 'zh' ? '未通過' : 'FAIL'), msg, cls);
}

/* ===== Shared ===== */
function showResult(id, value, msg, cls) {
  const el = document.getElementById(id);
  el.innerHTML = `<span class="value">${value}</span><div class="interpret ${cls}">${msg}</div>`;
}
