// Leonida Trophy Atlas — tracker logic.
//
// Loads app/data/trophies.json, renders the checklist and the four-stage
// roadmap, and keeps earned trophies in localStorage. Nothing here fetches
// anything but the app's own data file.

(function () {
  'use strict';

  var STORAGE_KEY = 'gta6-trophy-atlas-v4';
  var DATA_URL = 'data/trophies.json';

  var STAGES = [
    {
      id: 1,
      title: 'Stage 1 — Play the story',
      text: 'Play Chapters 1 to 4 and the final mission in order. Story trophies pop as you go; nothing here can be missed except one meditation (see the banner above). Meditate at Jason\u2019s house in Chapter 1 before the story moves on.',
      kinds: ['story'],
    },
    {
      id: 2,
      title: 'Stage 2 — Strangers & side strands',
      text: 'After the story opens the map up, work the stranger mission strands: Andy, Kenton, Billy, Randy and Tyrone, plus Bret\u2019s hunt and the eight-strand Strangers & Freaks set. These are unmissable in free roam.',
      kinds: ['strangers'],
    },
    {
      id: 3,
      title: 'Stage 3 — Activities & collectibles',
      text: 'The long middle: 250 stunts, 42 shooting-range gold medals, drone races, races, fishing, arcade, cards, WAiNK scans, meditations, vehicles and challenges. Chip away at these between story missions so the clean-up is short.',
      kinds: ['activities', 'collectibles'],
    },
    {
      id: 4,
      title: 'Stage 4 — Heists, combat & clean-up',
      text: 'Bank vaults, armored trucks, shop robberies with your partner, combat challenges and the last exploration and money trophies. Finish 100% completion here and the platinum pops.',
      kinds: ['heists', 'exploration', 'completion'],
    },
  ];

  var KIND_LABELS = {
    story: 'Story',
    strangers: 'Strangers',
    collectibles: 'Collectibles',
    activities: 'Activities',
    heists: 'Heists & combat',
    exploration: 'Exploration & money',
    completion: '100% completion',
  };

  var GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

  var trophies = [];
  var earned = {};
  var detailOpenId = null;

  var listEl = document.getElementById('trophyList');
  var roadmapEl = document.getElementById('roadmap');
  var searchBox = document.getElementById('searchBox');
  var gradeFilter = document.getElementById('gradeFilter');
  var kindFilter = document.getElementById('kindFilter');
  var stateFilter = document.getElementById('stateFilter');
  var spoilerToggle = document.getElementById('spoilerToggle');
  var resultCount = document.getElementById('resultCount');
  var emptyNote = document.getElementById('emptyNote');
  var saveNote = document.getElementById('saveNote');

  function loadEarned() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (e) { /* corrupted save: start fresh */ }
    return {};
  }

  function saveEarned(note) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(earned));
      if (note) {
        saveNote.textContent = note;
        setTimeout(function () { saveNote.textContent = ''; }, 2500);
      }
    } catch (e) { /* storage full or blocked: progress stays in memory */ }
  }

  function gradeLabel(grade) {
    return grade.charAt(0).toUpperCase() + grade.slice(1);
  }

  function isSpoiled(trophy) {
    return spoilerToggle.checked && trophy.kind === 'story' && !earned[trophy.id];
  }

  function trophyMatches(trophy) {
    var q = searchBox.value.trim().toLowerCase();
    if (q) {
      var hay = (trophy.name + ' ' + trophy.description + ' ' + trophy.guide).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    if (gradeFilter.value !== 'all' && trophy.grade !== gradeFilter.value) return false;
    if (kindFilter.value === 'missable') {
      if (!trophy.missable) return false;
    } else if (kindFilter.value !== 'all' && trophy.kind !== kindFilter.value) {
      return false;
    }
    if (stateFilter.value === 'earned' && !earned[trophy.id]) return false;
    if (stateFilter.value === 'unearned' && earned[trophy.id]) return false;
    return true;
  }

  function renderProgress() {
    var done = trophies.filter(function (t) { return earned[t.id]; }).length;
    var total = trophies.length;
    var pct = total ? Math.round((done / total) * 100) : 0;
    document.getElementById('progressText').textContent = done + ' of ' + total + ' earned';
    document.getElementById('progressPct').textContent = pct + '%';
    document.getElementById('progressFill').style.width = pct + '%';
    var counts = {};
    trophies.forEach(function (t) {
      counts[t.grade] = (counts[t.grade] || 0) + (earned[t.id] ? 1 : 0);
    });
    var totals = {};
    trophies.forEach(function (t) { totals[t.grade] = (totals[t.grade] || 0) + 1; });
    document.getElementById('gradeCounts').textContent =
      'Platinum ' + (counts.platinum || 0) + '/' + (totals.platinum || 0) +
      ' · Gold ' + (counts.gold || 0) + '/' + (totals.gold || 0) +
      ' · Silver ' + (counts.silver || 0) + '/' + (totals.silver || 0) +
      ' · Bronze ' + (counts.bronze || 0) + '/' + (totals.bronze || 0);
  }

  function renderRoadmap() {
    roadmapEl.innerHTML = '';
    STAGES.forEach(function (stage) {
      var members = trophies.filter(function (t) { return stage.kinds.indexOf(t.kind) !== -1; });
      var done = members.filter(function (t) { return earned[t.id]; }).length;
      var pct = members.length ? Math.round((done / members.length) * 100) : 0;
      var box = document.createElement('article');
      box.className = 'stage';
      var head = document.createElement('div');
      head.className = 'stage-head';
      var title = document.createElement('h3');
      title.textContent = stage.title;
      var count = document.createElement('span');
      count.className = 'stage-count';
      count.textContent = done + ' / ' + members.length + ' · ' + pct + '%';
      head.appendChild(title);
      head.appendChild(count);
      box.appendChild(head);
      var text = document.createElement('p');
      text.textContent = stage.text;
      box.appendChild(text);
      var bar = document.createElement('div');
      bar.className = 'progress-bar';
      var fill = document.createElement('div');
      fill.className = 'progress-fill';
      fill.style.width = pct + '%';
      bar.appendChild(fill);
      box.appendChild(bar);
      var list = document.createElement('ul');
      list.className = 'stage-trophies';
      members.forEach(function (t) {
        var li = document.createElement('li');
        if (earned[t.id]) li.className = 'done';
        li.textContent = (earned[t.id] ? '✓ ' : '○ ') + t.name;
        list.appendChild(li);
      });
      box.appendChild(list);
      roadmapEl.appendChild(box);
    });
  }

  function sourceLine(trophy) {
    if (!trophy.sources || !trophy.sources.length) return '';
    return 'Sources: ' + trophy.sources.map(function (s) { return s.name; }).join('; ') + '.';
  }

  function renderList() {
    listEl.innerHTML = '';
    var shown = 0;
    var sorted = trophies.slice().sort(function (a, b) {
      return GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.name.localeCompare(b.name);
    });
    sorted.forEach(function (trophy) {
      if (!trophyMatches(trophy)) return;
      shown++;
      var li = document.createElement('li');
      li.className = 'trophy' + (earned[trophy.id] ? ' earned' : '');
      li.id = 'trophy-' + trophy.id;

      var check = document.createElement('input');
      check.type = 'checkbox';
      check.checked = !!earned[trophy.id];
      check.setAttribute('aria-label', 'Mark ' + trophy.name + ' as earned');
      check.addEventListener('change', function () {
        if (check.checked) earned[trophy.id] = true;
        else delete earned[trophy.id];
        saveEarned('Progress saved in this browser.');
        renderAll();
      });
      li.appendChild(check);

      var body = document.createElement('div');
      if (isSpoiled(trophy)) body.className = 'spoiled';
      var name = document.createElement('div');
      name.className = 'trophy-name';
      name.textContent = trophy.name;
      body.appendChild(name);
      var desc = document.createElement('p');
      desc.className = 'trophy-desc';
      desc.textContent = trophy.description;
      body.appendChild(desc);
      if (isSpoiled(trophy)) {
        var hint = document.createElement('p');
        hint.className = 'spoiler-hint';
        hint.textContent = 'Story trophy — hidden until earned. Tick the box when it pops.';
        body.appendChild(hint);
      } else {
        var guide = document.createElement('p');
        guide.className = 'trophy-guide';
        guide.textContent = trophy.guide;
        body.appendChild(guide);
        var src = document.createElement('p');
        src.className = 'trophy-source';
        src.textContent = sourceLine(trophy);
        body.appendChild(src);
      }
      var tags = document.createElement('div');
      tags.className = 'tags';
      var kindTag = document.createElement('span');
      kindTag.className = 'tag';
      kindTag.textContent = KIND_LABELS[trophy.kind] || trophy.kind;
      tags.appendChild(kindTag);
      if (trophy.missable) {
        var miss = document.createElement('span');
        miss.className = 'tag missable';
        miss.textContent = 'Possibly missable';
        tags.appendChild(miss);
      }
      if (trophy.hidden) {
        var hid = document.createElement('span');
        hid.className = 'tag hidden-tag';
        hid.textContent = 'Hidden on PS5';
        tags.appendChild(hid);
      }
      if (trophy.count) {
        var cnt = document.createElement('span');
        cnt.className = 'tag';
        cnt.textContent = 'Count: ' + trophy.count;
        tags.appendChild(cnt);
      }
      body.appendChild(tags);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'guide-btn';
      btn.textContent = detailOpenId === trophy.id ? 'Hide full guide' : 'Open full guide';
      btn.addEventListener('click', function () { toggleDetail(trophy.id); });
      body.appendChild(btn);
      li.appendChild(body);

      var badge = document.createElement('span');
      badge.className = 'grade-badge grade-' + trophy.grade;
      badge.textContent = gradeLabel(trophy.grade);
      li.appendChild(badge);

      listEl.appendChild(li);
    });
    resultCount.textContent =
      shown + ' of ' + trophies.length + ' trophies shown · ' +
      trophies.filter(function (t) { return earned[t.id]; }).length + ' earned (' +
      (trophies.length ? Math.round((trophies.filter(function (t) { return earned[t.id]; }).length / trophies.length) * 100) : 0) + '%)';
    emptyNote.hidden = shown !== 0;
  }

  function renderDetail() {
    var panel = document.getElementById('detailPanel');
    var body = document.getElementById('detailBody');
    body.innerHTML = '';
    if (!detailOpenId) {
      panel.hidden = true;
      return;
    }
    var trophy = null;
    trophies.forEach(function (t) { if (t.id === detailOpenId) trophy = t; });
    if (!trophy) {
      panel.hidden = true;
      detailOpenId = null;
      return;
    }
    panel.hidden = false;
    var title = document.createElement('h3');
    title.textContent = trophy.name + ' — ' + gradeLabel(trophy.grade);
    body.appendChild(title);
    var desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = 'Official description: ' + trophy.description;
    body.appendChild(desc);
    var guide = document.createElement('p');
    guide.textContent = trophy.guide;
    body.appendChild(guide);
    if (trophy.steps && trophy.steps.length) {
      var steps = document.createElement('ol');
      steps.className = 'detail-steps';
      trophy.steps.forEach(function (s) {
        var li = document.createElement('li');
        li.textContent = s;
        steps.appendChild(li);
      });
      body.appendChild(steps);
    }
    var src = document.createElement('p');
    src.className = 'trophy-source';
    src.textContent = sourceLine(trophy);
    body.appendChild(src);
    if (trophy.sources) {
      var links = document.createElement('ul');
      links.className = 'source-list';
      trophy.sources.forEach(function (s) {
        if (!s.url) return;
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.href = s.url;
        a.textContent = s.name;
        li.appendChild(a);
        links.appendChild(li);
      });
      body.appendChild(links);
    }
  }

  function toggleDetail(id) {
    detailOpenId = detailOpenId === id ? null : id;
    renderList();
    renderDetail();
    if (detailOpenId) {
      document.getElementById('detailPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function renderAll() {
    renderProgress();
    renderRoadmap();
    renderList();
    renderDetail();
  }

  function exportProgress() {
    var payload = {
      app: 'Leonida Trophy Atlas',
      exportedAt: new Date().toISOString(),
      earned: Object.keys(earned).sort(),
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'gta6-trophy-progress.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    saveNote.textContent = 'Progress exported as a JSON file.';
  }

  function importProgress(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result));
        var ids = Array.isArray(data) ? data : data.earned;
        if (!Array.isArray(ids)) throw new Error('no earned list');
        var known = {};
        trophies.forEach(function (t) { known[t.id] = true; });
        var next = {};
        ids.forEach(function (id) { if (known[id]) next[id] = true; });
        earned = next;
        saveEarned('Progress imported.');
        renderAll();
      } catch (e) {
        saveNote.textContent = 'That file is not a progress export from this guide.';
      }
    };
    reader.readAsText(file);
  }

  function applyUrlState() {
    var params = new URLSearchParams(window.location.search);
    var demo = parseInt(params.get('demo') || '', 10);
    if (!isNaN(demo) && demo > 0) {
      // Demo progress follows the roadmap order (stage 1 story first), so a
      // demo of 12 means the story is done and the rest is still to go.
      var inStageOrder = trophies
        .map(function (t, i) { return { t: t, i: i }; })
        .sort(function (a, b) { return (a.t.stage - b.t.stage) || (a.i - b.i); });
      inStageOrder.slice(0, demo).forEach(function (entry) { earned[entry.t.id] = true; });
      saveEarned();
    }
    var open = params.get('open');
    if (open) {
      var found = trophies.some(function (t) { return t.id === open; });
      if (found) detailOpenId = open;
    }
    if (params.get('panel') === 'roadmap') {
      setTimeout(function () {
        document.getElementById('roadmapPanel').scrollIntoView();
      }, 50);
    }
    // Deep links: #checklist jumps to the tracker, #roadmap to the roadmap,
    // and #trophy-<id> opens that trophy's guide and jumps to it.
    var hash = window.location.hash || '';
    if (hash === '#checklist') {
      setTimeout(function () {
        document.getElementById('trackerTitle').scrollIntoView();
      }, 50);
    } else if (hash === '#roadmap') {
      setTimeout(function () {
        document.getElementById('roadmapPanel').scrollIntoView();
      }, 50);
    } else if (hash.indexOf('#trophy-') === 0) {
      var tid = hash.slice('#trophy-'.length);
      var foundHash = trophies.some(function (t) { return t.id === tid; });
      if (foundHash) {
        detailOpenId = tid;
        setTimeout(function () {
          var el = document.getElementById('trophy-' + tid);
          if (el) el.scrollIntoView({ block: 'center' });
        }, 50);
      }
    }
  }

  function bindControls() {
    searchBox.addEventListener('input', renderList);
    gradeFilter.addEventListener('change', renderList);
    kindFilter.addEventListener('change', renderList);
    stateFilter.addEventListener('change', renderList);
    spoilerToggle.addEventListener('change', renderList);
    document.getElementById('exportBtn').addEventListener('click', exportProgress);
    document.getElementById('importBtn').addEventListener('click', function () {
      document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', function (ev) {
      if (ev.target.files && ev.target.files[0]) importProgress(ev.target.files[0]);
      ev.target.value = '';
    });
    document.getElementById('resetBtn').addEventListener('click', function () {
      if (window.confirm('Clear all earned trophies?')) {
        earned = {};
        saveEarned('Progress cleared.');
        renderAll();
      }
    });
    document.getElementById('detailClose').addEventListener('click', function () {
      detailOpenId = null;
      renderList();
      renderDetail();
    });
  }

  fetch(DATA_URL)
    .then(function (res) {
      if (!res.ok) throw new Error('trophies.json failed to load');
      return res.json();
    })
    .then(function (data) {
      trophies = Array.isArray(data) ? data : data.trophies;
      earned = loadEarned();
      applyUrlState();
      bindControls();
      renderAll();
    })
    .catch(function () {
      listEl.innerHTML = '';
      var note = document.createElement('p');
      note.textContent = 'The trophy data could not be loaded. Reload the page.';
      listEl.appendChild(note);
    });
})();
