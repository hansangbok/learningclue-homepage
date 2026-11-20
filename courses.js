// 교육 과목 찾기 — data/courses.json 을 읽어 목록 · 학습 가이드를 그림
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const state = { f: 'all', lv: 0, q: '' };
  let D;

  fetch('data/courses.json', { cache: 'no-store' })
    .then((r) => r.json())
    .then((d) => { D = d; init(); })
    .catch(() => { $('list').innerHTML = '<p class="empty">목록을 불러오지 못했습니다. 잠시 뒤 다시 열어 주세요.</p>'; });

  function lvName(lv) { return (D.levels.find((l) => l.lv === lv) || {}).name || ''; }
  function fName(f) { return (D.fields.find((x) => x.id === f) || {}).name || ''; }

  function init() {
    $('updated').textContent = '과목 목록 갱신 ' + D.updated + ' · © 2026 Learning Clue';
    const fc = [{ id: 'all', name: '전체 분야' }].concat(D.fields);
    $('fieldChips').innerHTML = fc.map((f) => `<button class="chip${f.id === 'all' ? ' on' : ''}" data-f="${f.id}">${esc(f.name)}</button>`).join('');
    const lc = [{ lv: 0, name: '전체 수준' }].concat(D.levels);
    $('levelChips').innerHTML = lc.map((l) => `<button class="chip lv${l.lv}${l.lv === 0 ? ' on' : ''}" data-lv="${l.lv}">${l.lv ? 'Lv.' + l.lv + ' ' : ''}${esc(l.name)}</button>`).join('');

    $('fieldChips').addEventListener('click', (e) => pick(e, 'f'));
    $('levelChips').addEventListener('click', (e) => pick(e, 'lv'));
    $('q').addEventListener('input', (e) => { state.q = e.target.value.trim().toLowerCase(); draw(); });
    document.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => tab(b.dataset.tab)));

    const h = location.hash.replace('#', '');
    if (h === 'guide') tab('guide');
    else if (D.fields.some((f) => f.id === h)) { state.f = h; mark('fieldChips', 'f', h); }
    draw();
    drawGuides();
  }

  function pick(e, key) {
    const b = e.target.closest('.chip'); if (!b) return;
    state[key] = key === 'lv' ? Number(b.dataset.lv) : b.dataset.f;
    mark(key === 'lv' ? 'levelChips' : 'fieldChips', key, b.dataset[key]);
    draw();
  }
  function mark(box, key, val) {
    $(box).querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c.dataset[key] === String(val)));
  }
  function tab(t) {
    document.querySelectorAll('.tab').forEach((b) => b.classList.toggle('on', b.dataset.tab === t));
    $('tab-list').hidden = t !== 'list';
    $('tab-guide').hidden = t !== 'guide';
  }

  function draw() {
    const list = D.courses.filter((c) =>
      (state.f === 'all' || c.f === state.f) &&
      (!state.lv || c.lv === state.lv) &&
      (!state.q || (c.t + ' ' + c.who + ' ' + c.d + ' ' + fName(c.f)).toLowerCase().includes(state.q))
    ).sort((a, b) => a.lv - b.lv || D.fields.findIndex((f) => f.id === a.f) - D.fields.findIndex((f) => f.id === b.f));
    $('count').textContent = `${list.length}개 과목`;
    $('list').innerHTML = list.length ? list.map((c) => `
      <article class="course" style="--lvc:var(--lv${c.lv})">
        <div class="course-top"><span class="lvl lv${c.lv}">Lv.${c.lv} ${esc(lvName(c.lv))}</span><span class="fld">${esc(fName(c.f))}</span></div>
        <h3>${esc(c.t)}</h3>
        <p>${esc(c.d)}</p>
        <p class="who">대상 · ${esc(c.who)}</p>
      </article>`).join('') : '<p class="empty">맞는 과목이 없습니다. 원하시는 주제를 교육 문의로 알려 주시면 새로 설계해 드립니다.</p>';
  }

  function drawGuides() {
    $('guides').innerHTML = D.guides.map((g) => `
      <article class="guide">
        <h3>${esc(g.title)}</h3>
        <p class="guide-for">${esc(g.for)}</p>
        <ol class="steps">${g.steps.map((s, i) => {
          const c = D.courses.find((x) => x.t === s) || { lv: 0 };
          return `<li><span class="step-no">${i + 1}</span><span class="step-t">${esc(s)}</span><span class="lvl lv${c.lv}">${esc(lvName(c.lv))}</span></li>`;
        }).join('')}</ol>
      </article>`).join('');
  }
})();
