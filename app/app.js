/* Leonida Trophy Atlas — tracker logic. Loads data/trophies.json, renders the
   checklist, saves progress in localStorage, filters, spoilers, export/import. */
const DATA_URL = 'data/trophies.json';
const STORE_EARNED = 'lta-earned-v1';
const STORE_SPOILER = 'lta-spoiler-v1';

const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detail');
const metaEl = document.getElementById('listMeta');
const searchEl = document.getElementById('searchInput');
const filtersEl = document.getElementById('filters');
const spoilerEl = document.getElementById('spoilerToggle');
const earnedCountEl = document.getElementById('earnedCount');
const progressFillEl = document.getElementById('progressFill');
const progressPctEl = document.getElementById('progressPct');

let trophies = [];
let earned = new Set(loadJson(STORE_EARNED, []));
let spoilerOn = loadJson(STORE_SPOILER, false);
let activeFilter = 'all';
let selectedId = null;

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const value = JSON.parse(raw);
    return value === null || value === undefined ? fallback : value;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or blocked */ }
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function kindLabel(kind) {
  const labels = {
    story: 'Story', missable: 'Missable', collectibles: 'Collectibles',
    activities: 'Activities', crime: 'Crime', exploration: 'Exploration',
    misc: 'Misc', platinum: 'Platinum',
  };
  return labels[kind] || kind;
}

function stageLabel(stage) {
  return { 1: 'Stage 1 · Story', 2: 'Stage 2 · 100% completion', 3: 'Stage 3 · Strangers & clean-up', 4: 'Stage 4 · Platinum' }[stage] || '';
}

function isSpoilerHidden(trophy) {
  return spoilerOn && trophy.kind === 'story' && !earned.has(trophy.id);
}

function visibleTrophies() {
  const query = searchEl.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (activeFilter === 'story' && t.kind !== 'story') return false;
    if (activeFilter === 'missable' && !t.missable) return false;
    if (activeFilter === 'collectibles' && t.kind !== 'collectibles') return false;
    if (activeFilter === 'activities' && t.kind !== 'activities') return false;
    if (activeFilter === 'crime' && t.kind !== 'crime') return false;
    if (activeFilter === 'exploration' && t.kind !== 'exploration') return false;
    if (activeFilter === 'earned' && !earned.has(t.id)) return false;
    if (activeFilter === 'unearned' && earned.has(t.id)) return false;
    if (query && !(t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query))) return false;
    return true;
  });
}

function tagHtml(trophy) {
  const tags = [`<span class="tag ${trophy.grade}">${gradeLabel(trophy.grade)}</span>`];
  if (trophy.hidden) tags.push('<span class="tag hidden">Hidden</span>');
  if (trophy.missable) tags.push('<span class="tag missable">Missable</span>');
  // The missable flag already says it for a missable-kind trophy; a
  // second "Missable" kind tag would only repeat it.
  if (trophy.kind !== 'missable') tags.push(`<span class="tag kind">${kindLabel(trophy.kind)}</span>`);
  return tags.join('');
}

function renderList() {
  const shown = visibleTrophies();
  listEl.innerHTML = '';
  for (const t of shown) {
    const li = document.createElement('li');
    const masked = isSpoilerHidden(t);
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'trophy-item' + (earned.has(t.id) ? ' earned' : '') + (selectedId === t.id ? ' selected' : '');
    item.dataset.id = t.id;

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', `Mark ${masked ? 'this story trophy' : t.name} as earned`);
    box.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleEarned(t.id);
    });

    const body = document.createElement('span');
    const name = document.createElement('span');
    name.className = 'trophy-name';
    name.textContent = masked ? 'Hidden story trophy' : t.name;
    const desc = document.createElement('span');
    desc.className = 'trophy-desc';
    desc.textContent = masked ? 'Earn it to reveal its name and description.' : t.description;
    const tags = document.createElement('span');
    tags.className = 'trophy-tags';
    tags.innerHTML = masked ? `<span class="tag hidden">Hidden</span><span class="tag kind">Story</span>` : tagHtml(t);
    body.append(name, desc, tags);

    const grade = document.createElement('span');
    grade.className = `trophy-grade-dot ${t.grade}`;
    grade.textContent = gradeLabel(t.grade);

    item.append(box, body, grade);
    item.addEventListener('click', () => selectTrophy(t.id));
    li.append(item);
    listEl.append(li);
  }
  metaEl.textContent = shown.length === trophies.length
    ? `Showing all ${trophies.length} trophies.`
    : `Showing ${shown.length} of ${trophies.length} trophies.`;
}

function renderProgress() {
  const count = earned.size;
  const pct = Math.round((count / trophies.length) * 100);
  earnedCountEl.textContent = String(count);
  progressPctEl.textContent = `${pct}%`;
  progressFillEl.style.width = `${pct}%`;
  document.querySelectorAll('[data-count-stage]').forEach((el) => {
    const stage = Number(el.dataset.countStage);
    el.textContent = `${trophies.filter((t) => t.stage === stage).length} trophies`;
  });
}

function renderDetail() {
  const t = trophies.find((x) => x.id === selectedId);
  if (!t) {
    detailEl.innerHTML = '<p class="detail-empty">Select a trophy to read its guide and sources.</p>';
    return;
  }
  const masked = isSpoilerHidden(t);
  detailEl.innerHTML = '';
  const title = document.createElement('h3');
  title.textContent = masked ? 'Hidden story trophy' : t.name;
  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = masked ? 'Earn this trophy to reveal its name, description and guide.' : t.description;
  const meta = document.createElement('div');
  meta.className = 'detail-meta';
  meta.innerHTML = masked
    ? '<span class="tag hidden">Hidden</span><span class="tag kind">Story</span>'
    : tagHtml(t) + `<span class="tag kind">${stageLabel(t.stage)}</span>`;

  detailEl.append(title, desc, meta);
  if (!masked) {
    const guideHead = document.createElement('h4');
    guideHead.textContent = 'Guide';
    const guide = document.createElement('p');
    guide.textContent = t.guide;
    const srcHead = document.createElement('h4');
    srcHead.textContent = 'Sources';
    const srcList = document.createElement('ul');
    srcList.className = 'sources';
    for (const s of t.sources || []) {
      const li = document.createElement('li');
      li.textContent = s;
      srcList.append(li);
    }
    detailEl.append(guideHead, guide, srcHead, srcList);
  }
  const line = document.createElement('p');
  line.className = 'earned-line';
  const btn = document.createElement('button');
  btn.type = 'button';
  const isEarned = earned.has(t.id);
  btn.textContent = isEarned ? '✓ Earned — mark as not earned' : 'Mark as earned';
  btn.className = isEarned ? 'undo' : '';
  btn.addEventListener('click', () => toggleEarned(t.id));
  line.append(btn);
  detailEl.append(line);
}

function render() {
  renderProgress();
  renderList();
  renderDetail();
}

function toggleEarned(id) {
  if (earned.has(id)) earned.delete(id); else earned.add(id);
  saveJson(STORE_EARNED, [...earned]);
  render();
}

function selectTrophy(id) {
  selectedId = id;
  renderList();
  renderDetail();
}

function download(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

filtersEl.addEventListener('click', (event) => {
  const chip = event.target.closest('[data-filter]');
  if (!chip) return;
  activeFilter = chip.dataset.filter;
  filtersEl.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === chip));
  renderList();
});

searchEl.addEventListener('input', renderList);

spoilerEl.checked = spoilerOn;
spoilerEl.addEventListener('change', () => {
  spoilerOn = spoilerEl.checked;
  saveJson(STORE_SPOILER, spoilerOn);
  renderList();
  renderDetail();
});

document.getElementById('exportBtn').addEventListener('click', () => {
  download('leonida-trophy-atlas-progress.json', JSON.stringify({ earned: [...earned].sort(), exported_at: new Date().toISOString() }, null, 2));
});

document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    if (!Array.isArray(ids)) throw new Error('no earned list');
    earned = new Set(ids.filter((id) => trophies.some((t) => t.id === id)));
    saveJson(STORE_EARNED, [...earned]);
    render();
  } catch {
    alert('That file is not a Leonida Trophy Atlas progress export.');
  }
  event.target.value = '';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all earned trophies? This cannot be undone.')) return;
  earned = new Set();
  saveJson(STORE_EARNED, []);
  render();
});

fetch(DATA_URL)
  .then((response) => {
    if (!response.ok) throw new Error(`trophies.json: ${response.status}`);
    return response.json();
  })
  .then((data) => {
    trophies = Array.isArray(data) ? data : data.trophies;
    render();
  })
  .catch(() => {
    listEl.innerHTML = '<li><p>Could not load data/trophies.json. Serve app/ over HTTP and try again.</p></li>';
  });
