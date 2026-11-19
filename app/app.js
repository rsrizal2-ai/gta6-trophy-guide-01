// Leonida Trophy Guide — offline tracker for the 55 official GTA VI PS5 trophies.
//
// All trophy data comes from app/data/trophies.json, fetched from this same
// folder — no network at all. Earned ticks are saved in localStorage, and
// export/import moves them as a JSON file the user owns. No Rockstar logo or
// official artwork is used anywhere in this guide.

const PROGRESS_KEY = 'gta6-trophy-progress-v1';
const SPOILER_KEY = 'gta6-trophy-spoilers-v1';

const $ = (id) => document.getElementById(id);
const cardsEl = $('cards');
const params = new URLSearchParams(location.search);

// Earned trophy names, restored from the browser (or empty on first visit).
let earned = new Set();
try {
  earned = new Set(JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '[]'));
} catch {
  earned = new Set();
}

// Filter and view state: URL parameters win (they drive the screenshots),
// then the saved spoiler preference, then the defaults.
const state = {
  q: params.get('q') ?? '',
  kind: params.get('kind') ?? 'all',
  grade: params.get('grade') ?? 'all',
  status: params.get('status') ?? 'all',
  missableOnly: params.get('missable') === '1',
  hideSpoilers: params.get('spoilers') === 'show'
    ? false
    : (localStorage.getItem(SPOILER_KEY) ?? 'hide') === 'hide',
  view: params.get('view') ?? 'list',
};

const KIND_LABEL = {
  story: 'Story',
  activity: 'Activity',
  collectible: 'Collectible',
  robbery: 'Robbery',
  combat: 'Combat',
  exploration: 'Exploration',
  money: 'Money',
  misc: 'Odd job / secret',
  completion: '100% completion',
  platinum: 'Platinum',
};

let doc; // the parsed trophies.json document

function sourceById(id) {
  return (doc.sources ?? []).find((s) => s.id === id);
}

function saveProgress() {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort()));
}

// Header counters: total earned, percentage, and the per-grade split.
function renderProgress() {
  const total = doc.trophies.length;
  const n = earned.size;
  const pct = Math.round((n / total) * 100);
  $('earned-count').textContent = n;
  $('bar-fill').style.width = pct + '%';
  $('progress-line').textContent = `${n} earned · ${pct}% to the platinum`;
  const byGrade = {};
  for (const t of doc.trophies) {
    byGrade[t.grade] = byGrade[t.grade] ?? [0, 0];
    byGrade[t.grade][1] += 1;
    if (earned.has(t.name)) byGrade[t.grade][0] += 1;
  }
  $('grade-line').textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${byGrade[g][0]}/${byGrade[g][1]} ${g}`)
    .join(' · ');
}

// A story trophy stays nameless while the spoiler setting is on and it is
// not earned yet; earning it reveals it.
function isSpoilerHidden(t) {
  return state.hideSpoilers && t.story && !earned.has(t.name);
}

function visibleTrophies() {
  const q = state.q.trim().toLowerCase();
  return doc.trophies.filter((t) => {
    if (state.kind !== 'all' && t.kind !== state.kind) return false;
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.status === 'earned' && !earned.has(t.name)) return false;
    if (state.status === 'unearned' && earned.has(t.name)) return false;
    if (state.missableOnly && !t.missable) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
    return true;
  });
}

// One trophy card: tick box, name with grade and flags, kind, the official
// description, our own guide, and the sources that guide cites.
function trophyCard(t) {
  const el = document.createElement('article');
  el.className = 'card'
    + (earned.has(t.name) ? ' earned' : '')
    + (t.missable ? ' missable' : '');

  const head = document.createElement('div');
  head.className = 'card-head';
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.name);
  box.setAttribute('aria-label', 'Earned: ' + t.name);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.name); else earned.delete(t.name);
    saveProgress();
    renderProgress();
    renderList();
  });

  const h = document.createElement('h3');
  if (isSpoilerHidden(t)) {
    h.textContent = 'Hidden story trophy';
    const flag = document.createElement('span');
    flag.className = 'flag hidden';
    flag.textContent = 'story · hidden until earned';
    h.append(flag);
  } else {
    h.textContent = t.name;
    const badge = document.createElement('span');
    badge.className = 'badge ' + t.grade;
    badge.textContent = t.grade;
    h.append(badge);
    if (t.missable) {
      const f = document.createElement('span');
      f.className = 'flag missable';
      f.textContent = 'missable';
      h.append(f);
    } else if (t.hidden) {
      const f = document.createElement('span');
      f.className = 'flag hidden';
      f.textContent = 'hidden';
      h.append(f);
    }
  }
  head.append(box, h);
  el.append(head);

  const kind = document.createElement('p');
  kind.className = 'kind';
  kind.textContent = KIND_LABEL[t.kind] ?? t.kind;
  el.append(kind);

  if (isSpoilerHidden(t)) {
    const p = document.createElement('p');
    p.className = 'official';
    p.textContent = 'A story trophy. Earn it in the campaign to reveal its name and guide — or untick “Hide story spoilers” above.';
    el.append(p);
    return el;
  }

  const off = document.createElement('p');
  off.className = 'official';
  off.textContent = 'Official: “' + t.description + '”';
  el.append(off);

  const g = document.createElement('p');
  g.className = 'guide';
  g.innerHTML = '<b>How to get it:</b> ';
  g.append(document.createTextNode(t.guide));
  el.append(g);

  const src = document.createElement('p');
  src.className = 'src';
  src.textContent = 'Sources: ' + (t.sources ?? []).map((id) => {
    const s = sourceById(id);
    return s ? s.name : id;
  }).join(' · ');
  el.append(src);
  return el;
}

// The checklist view: filtered cards, the empty state, the spoiler note and
// the "Showing N of 55" line. The missable view reuses the same cards.
function renderList() {
  renderProgress();
  const list = visibleTrophies();
  cardsEl.replaceChildren(...list.map(trophyCard));
  $('empty').hidden = list.length !== 0;
  const hiddenCount = doc.trophies.filter(isSpoilerHidden).length;
  $('spoiler-note').hidden = !state.hideSpoilers || hiddenCount === 0;
  if (state.hideSpoilers) {
    $('spoiler-note').textContent = `Spoiler protection is on: ${hiddenCount} story ${hiddenCount === 1 ? 'trophy is' : 'trophies are'} hidden until you earn them. Untick “Hide story spoilers” to see them.`;
  }
  $('count-line').textContent = `Showing ${list.length} of ${doc.trophies.length} trophies`;
  $('missable-list').replaceChildren(
    ...doc.trophies.filter((t) => t.missable).map(trophyCard),
  );
}

function renderRoadmap() {
  const r = doc.roadmap;
  $('roadmap-estimate').textContent = r.estimate;
  $('roadmap-steps').replaceChildren(...r.phases.map((p) => {
    const li = document.createElement('li');
    const b = document.createElement('b');
    b.textContent = p.title + ' — ';
    li.append(b, document.createTextNode(p.text));
    return li;
  }));
  $('roadmap-warnings').replaceChildren(...r.warnings.map((w) => {
    const li = document.createElement('li');
    li.textContent = w;
    return li;
  }));
}

function renderSources() {
  $('source-note').textContent = doc.notes;
  $('source-list').replaceChildren(...(doc.sources ?? []).map((s) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.name;
    a.target = '_blank';
    a.rel = 'noopener';
    li.append(a, document.createTextNode(' — ' + s.url));
    return li;
  }));
}

function setView(view) {
  state.view = view;
  for (const v of ['list', 'roadmap', 'missable', 'sources']) {
    $('view-' + v).hidden = v !== view;
    $('tab-' + v).classList.toggle('active', v === view);
  }
}

function bindControls() {
  $('q').value = state.q;
  $('kind').value = state.kind;
  $('grade').value = state.grade;
  $('status').value = state.status;
  $('missable-only').checked = state.missableOnly;
  $('spoilers').checked = state.hideSpoilers;
  $('q').addEventListener('input', (e) => { state.q = e.target.value; renderList(); });
  $('kind').addEventListener('change', (e) => { state.kind = e.target.value; renderList(); });
  $('grade').addEventListener('change', (e) => { state.grade = e.target.value; renderList(); });
  $('status').addEventListener('change', (e) => { state.status = e.target.value; renderList(); });
  $('missable-only').addEventListener('change', (e) => { state.missableOnly = e.target.checked; renderList(); });
  $('spoilers').addEventListener('change', (e) => {
    state.hideSpoilers = e.target.checked;
    localStorage.setItem(SPOILER_KEY, state.hideSpoilers ? 'hide' : 'show');
    renderList();
  });
  for (const v of ['list', 'roadmap', 'missable', 'sources']) {
    $('tab-' + v).addEventListener('click', () => setView(v));
  }

  $('export').addEventListener('click', () => {
    const payload = JSON.stringify({
      game: doc.game,
      exported: new Date().toISOString(),
      earned: [...earned].sort(),
    }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gta6-trophy-progress.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  $('import').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const names = Array.isArray(data) ? data : data.earned;
      const known = new Set(doc.trophies.map((t) => t.name));
      earned = new Set((names ?? []).filter((n) => known.has(n)));
      saveProgress();
      renderList();
    } catch {
      alert('That file is not a valid trophy-progress export.');
    }
    e.target.value = '';
  });

  $('reset').addEventListener('click', () => {
    if (confirm('Clear every tick on this checklist?')) {
      earned = new Set();
      saveProgress();
      renderList();
    }
  });
}

doc = await (await fetch('data/trophies.json')).json();
bindControls();
renderRoadmap();
renderSources();
setView(['list', 'roadmap', 'missable', 'sources'].includes(state.view) ? state.view : 'list');
renderList();
