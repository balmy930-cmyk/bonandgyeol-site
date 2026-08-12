/* 브라우저 콘솔에 붙여넣어 실행하는 접근성 검사기.
   axe·Lighthouse를 쓸 수 없는 환경(node 없음)이라 직접 구현했습니다.

   사용:  __a11y()            → 위반 목록
          __a11y({expect:true}) → data-expect 속성과 대조한 탐지율까지

   규칙 ID는 tests/a11y-fixture.html 의 data-expect 값과 맞춥니다.
   검사기를 고칠 때는 반드시 픽스처로 재검증하세요. (CLAUDE.md 검증 절차) */
window.__a11y = function (opts) {
  opts = opts || {};
  const V = [];
  const add = (rule, el, detail) => V.push({ rule, el, detail });

  const lum = (c) => {
    const v = c.map(x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  };
  const parse = (s) => { const m = s.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : null; };
  const alphaOf = (s) => { const m = s.match(/rgba?\([^)]*,\s*([\d.]+)\s*\)/); return m ? parseFloat(m[1]) : 1; };

  // 배경색: 반투명이면 아래 배경과 합성해서 실제 색을 구한다
  function bgOf(el) {
    let n = el, acc = null;
    while (n && n !== document.documentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      const c = parse(bg), a = alphaOf(bg);
      if (c && a > 0) {
        acc = acc === null ? { c, a } : acc;
        if (a >= 0.999) return acc.a >= 0.999 ? acc.c : acc.c.map((v, i) => Math.round(v * acc.a + c[i] * (1 - acc.a)));
      }
      n = n.parentElement;
    }
    const page = parse(getComputedStyle(document.body).backgroundColor) || [255, 255, 255];
    if (!acc) return page;
    return acc.a >= 0.999 ? acc.c : acc.c.map((v, i) => Math.round(v * acc.a + page[i] * (1 - acc.a)));
  }

  const shown = (el) => {
    if (el.closest('[hidden]')) return false;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') return false;
    if (el.offsetParent === null && cs.position !== 'fixed') return false;
    return true;
  };
  const srOnly = (el) => el.classList.contains('sr-only') || el.classList.contains('skip');
  const nameOf = (el) => (el.getAttribute('aria-label') || el.textContent || el.title || '').trim();

  /* ── 1. 명도 대비 ─────────────────────────────── */
  document.querySelectorAll('p,span,a,h1,h2,h3,h4,h5,h6,li,dt,dd,button,label,td,th,figcaption').forEach(el => {
    if (srOnly(el) || !shown(el)) return;
    const own = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
    if (!own) return;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
    const cs = getComputedStyle(el);
    const fg = parse(cs.color); if (!fg) return;
    if (parseFloat(cs.opacity) === 0) return;
    const px = parseFloat(cs.fontSize), wt = parseInt(cs.fontWeight) || 400;
    const large = px >= 24 || (px >= 18.66 && wt >= 700);
    const need = large ? 3 : 4.5;
    const l1 = lum(fg), l2 = lum(bgOf(el));
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    if (ratio < need - 0.01) {
      const logo = !!el.closest('.logo,.wordmark,.wordmark-ko,.contact-mark,.mark');
      add('contrast', el, `${ratio.toFixed(2)}:1 (기준 ${need}) ${px}px/${wt}${logo ? ' [로고타입 예외]' : ''}`);
    }
  });

  /* ── 2. 클릭 영역 44px ────────────────────────── */
  document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,[role=tab],[role=button]').forEach(el => {
    if (srOnly(el) || !shown(el)) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    if (r.height < 44) add('target-size', el, `${Math.round(r.width)}x${Math.round(r.height)}`);
  });

  /* ── 3. 폼 라벨 ───────────────────────────────── */
  document.querySelectorAll('input:not([type=hidden]),select,textarea').forEach(el => {
    if (!shown(el)) return;
    const byFor = el.id && document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    const wrapped = el.closest('label');
    if (byFor || wrapped) return;
    if (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')) return;
    if (el.type === 'submit' || el.type === 'button') return;   // value가 이름이 됨
    add('form-label', el, `${el.tagName.toLowerCase()}[${el.type || ''}] name=${el.name || '-'}`);
  });

  /* ── 4. 이미지 대체텍스트 ─────────────────────── */
  document.querySelectorAll('img').forEach(el => {
    if (!el.hasAttribute('alt')) add('img-alt', el, (el.currentSrc || el.src || '').slice(0, 40));
  });
  document.querySelectorAll('svg').forEach(el => {
    if (el.getAttribute('aria-hidden') === 'true') return;
    const named = el.getAttribute('role') === 'img' && (el.getAttribute('aria-label') || el.querySelector('title'));
    if (!named) add('svg-name', el, 'aria-hidden도 접근 가능한 이름도 없음');
  });

  /* ── 5. 중복 id ───────────────────────────────── */
  const idc = {};
  document.querySelectorAll('[id]').forEach(el => { idc[el.id] = (idc[el.id] || 0) + 1; });
  Object.entries(idc).filter(([, n]) => n > 1).forEach(([id, n]) => {
    document.querySelectorAll(`[id="${CSS.escape(id)}"]`).forEach(el => add('duplicate-id', el, `${id} ×${n}`));
  });

  /* ── 6. 헤딩 순서 ─────────────────────────────── */
  let prev = 0;
  document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(h => {
    if (!shown(h)) return;
    const lv = +h.tagName[1];
    if (prev && lv > prev + 1) add('heading-order', h, `${h.tagName} after H${prev}`);
    prev = lv;
  });
  const h1n = document.querySelectorAll('h1').length;
  if (h1n !== 1) add('h1-count', document.body, `h1 ${h1n}개`);

  /* ── 7. 키보드 도달 ───────────────────────────── */
  // 7a. 인터랙티브 역할인데 탭 순서에서 빠진 것
  document.querySelectorAll('a[href],button,[role=button],[role=tab],input,select,textarea').forEach(el => {
    if (srOnly(el) || !shown(el)) return;
    if (el.disabled) return;
    if (el.tabIndex >= 0) return;
    // 로빙 탭인덱스: tablist 안에서 비활성 탭이 -1인 것은 ARIA 표준 패턴이다.
    // 같은 tablist에 탭 순서에 있는 탭이 하나라도 있으면 위반이 아니다.
    if (el.getAttribute('role') === 'tab') {
      const list = el.closest('[role=tablist]');
      if (list && [...list.querySelectorAll('[role=tab]')].some(t => t.tabIndex >= 0)) return;
    }
    add('keyboard-unreachable', el, `tabindex=${el.tabIndex}`);
  });
  // 7b. 클릭 핸들러만 달린 비인터랙티브 요소
  document.querySelectorAll('[onclick]').forEach(el => {
    const tag = el.tagName.toLowerCase();
    if (['a', 'button', 'input', 'select', 'textarea', 'summary'].includes(tag)) return;
    if (el.getAttribute('role') === 'button' && el.tabIndex >= 0) return;
    if (el.tabIndex >= 0) return;
    add('keyboard-unreachable', el, `<${tag}> onclick만 있고 포커스 불가`);
  });
  // 7c. 양수 tabindex (탭 순서 왜곡)
  document.querySelectorAll('[tabindex]').forEach(el => {
    if (el.tabIndex > 0 && el.getAttribute('role') !== 'tab') add('positive-tabindex', el, `tabindex=${el.tabIndex}`);
  });

  /* ── 8. 링크·버튼 이름 ────────────────────────── */
  document.querySelectorAll('a[href],button').forEach(el => {
    if (!shown(el)) return;
    // aria-hidden 자식만 있는 경우 접근 가능한 이름이 비게 된다
    const visible = [...el.childNodes].map(n => {
      if (n.nodeType === 3) return n.textContent;
      if (n.nodeType === 1 && n.getAttribute('aria-hidden') === 'true') return '';
      return n.textContent;
    }).join('').trim();
    const name = el.getAttribute('aria-label') || el.getAttribute('title') || visible;
    if (!name) add('link-name', el, el.outerHTML.slice(0, 50));
  });

  /* ── 9. 맥락 없는 링크 문구 ───────────────────── */
  const VAGUE = ['자세히', '자세히 보기', '보기', '더보기', '더 보기', '여기', '클릭', '링크', 'here', 'click', 'more', 'read more'];
  const seen = {};
  document.querySelectorAll('a[href]').forEach(el => {
    if (!shown(el)) return;
    const full = (el.getAttribute('aria-label') || el.textContent || '').trim();
    const visibleOnly = [...el.childNodes].filter(n => n.nodeType === 3 || !(n.classList && n.classList.contains('sr-only')))
      .map(n => n.textContent).join('').replace(/\s+/g, ' ').trim();
    // 양쪽 다 공백·화살표를 제거해서 비교한다 (목록엔 공백이 있고 텍스트엔 없을 수 있음)
    const norm = (s) => s.replace(/[→↗>\s]/g, '').toLowerCase();
    const vagueSet = VAGUE.map(norm);
    if (vagueSet.includes(norm(visibleOnly)) && norm(full) === norm(visibleOnly))
      add('vague-link-text', el, `"${visibleOnly}"`);
    const key = full.replace(/\s+/g, ' ');
    if (key) { seen[key] = seen[key] || new Set(); seen[key].add(el.getAttribute('href')); }
  });
  Object.entries(seen).filter(([, s]) => s.size > 1).forEach(([txt, s]) => {
    document.querySelectorAll('a[href]').forEach(el => {
      if ((el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ') === txt)
        add('ambiguous-link-text', el, `"${txt.slice(0, 24)}" → ${s.size}개 목적지`);
    });
  });

  /* ── 10. 랜드마크 / 언어 / 확대 ───────────────── */
  ['main', 'header', 'footer'].forEach(t => { if (!document.querySelector(t)) add('landmark-missing', document.body, t); });
  if (!document.documentElement.lang) add('html-lang', document.documentElement, 'lang 없음');
  const vp = (document.querySelector('meta[name=viewport]') || {}).content || '';
  if (/user-scalable\s*=\s*no|maximum-scale\s*=\s*[01]/.test(vp)) add('meta-viewport', document.body, vp);

  /* ── 결과 ─────────────────────────────────────── */
  const desc = (el) => el === document.body ? 'body'
    : el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '');
  const findings = V.map(v => ({ rule: v.rule, 요소: desc(v.el), 상세: v.detail }));

  if (!opts.expect) return { 위반수: findings.length, 위반: findings };

  // data-expect 대조
  const expected = [...document.querySelectorAll('[data-expect]')].map(el => ({ el, rule: el.getAttribute('data-expect') }));
  const caught = [], missed = [];
  expected.forEach(e => {
    const hit = V.some(v => v.rule === e.rule && (v.el === e.el || e.el.contains(v.el) || v.el.contains(e.el)));
    (hit ? caught : missed).push(`${e.rule} — ${desc(e.el)}`);
  });
  const expectedEls = new Set(expected.map(e => e.el));
  const falsePos = V.filter(v => !expectedEls.has(v.el) && ![...expectedEls].some(e => e.contains(v.el)))
    .map(v => `${v.rule} — ${desc(v.el)} (${v.detail})`);

  // 음성 케이스: data-expect-none="rule1,rule2" 인 요소를 그 규칙으로 잡으면 오탐
  const negs = [];
  document.querySelectorAll('[data-expect-none]').forEach(el => {
    el.getAttribute('data-expect-none').split(',').map(s => s.trim()).forEach(rule => {
      const hit = V.some(v => v.rule === rule && (v.el === el || el.contains(v.el)));
      negs.push({ rule, el: desc(el), 오탐: hit });
    });
  });
  const wrong = negs.filter(n => n.오탐);

  return {
    기대위반: expected.length, 탐지: caught.length, 미탐지: missed.length,
    탐지율: Math.round(caught.length / expected.length * 100) + '%',
    미탐지목록: missed, 잡은것: caught,
    "기대외검출(확인필요)": falsePos,
    음성케이스: negs.length, 오탐: wrong.length,
    오탐목록: wrong.map(n => `${n.rule} — ${n.el}`)
  };
};
'a11y checker loaded — __a11y() 또는 __a11y({expect:true})';
