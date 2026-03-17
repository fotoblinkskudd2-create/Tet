/* =============================================================
   MoodShift – iOS mood web app
   ============================================================= */

(function () {
  "use strict";

  // ----- State -----
  let currentMood = null;
  let moods = {};
  let activities = {};
  let journal = [];
  let breatheInterval = null;
  let movementInterval = null;

  // ----- DOM helpers -----
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  // ----- Clock -----
  function updateClock() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, "0");
    const m = now.getMinutes().toString().padStart(2, "0");
    const el = $("#clock");
    if (el) el.textContent = `${h}:${m}`;
  }
  setInterval(updateClock, 10000);
  updateClock();

  // ----- Navigation -----
  function showScreen(name) {
    $$(".screen").forEach((s) => s.classList.remove("active"));
    const target = $(`#screen-${name}`);
    if (target) target.classList.add("active");

    // Update tab bar
    $$(".tab").forEach((t) => {
      t.classList.toggle("active", t.dataset.screen === name);
    });

    // Update status dots
    const screens = ["home", "mood", "journal"];
    const idx = screens.indexOf(name);
    $$(".status-dots .dot").forEach((d, i) => {
      d.classList.toggle("active", i === Math.max(0, idx));
    });
  }

  // Tab bar clicks
  document.addEventListener("click", (e) => {
    const tab = e.target.closest(".tab");
    if (tab) {
      showScreen(tab.dataset.screen);
      return;
    }

    const back = e.target.closest(".back-btn");
    if (back) {
      const target = back.dataset.target;
      showScreen(target);
      return;
    }
  });

  // ----- API helpers -----
  async function api(path) {
    const res = await fetch(path);
    return res.json();
  }

  async function apiPost(path, body) {
    const res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json();
  }

  // ----- Toast -----
  function toast(msg) {
    let el = $(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2500);
  }

  // ----- Init: Load data -----
  async function init() {
    try {
      moods = await api("/api/moods");
      activities = await api("/api/activities");
      journal = await api("/api/journal");
    } catch {
      // Use fallback data if server isn't running
      moods = {
        radiant: { emoji: "\u2728", color: "#FFD700", energy: 10, label: "Radiant" },
        happy: { emoji: "\uD83D\uDE0A", color: "#FF9F43", energy: 8, label: "Happy" },
        calm: { emoji: "\uD83C\uDF3F", color: "#54A0FF", energy: 6, label: "Calm" },
        focused: { emoji: "\uD83C\uDFAF", color: "#5F27CD", energy: 7, label: "Focused" },
        meh: { emoji: "\uD83D\uDE11", color: "#8395A7", energy: 4, label: "Meh" },
        anxious: { emoji: "\uD83D\uDE30", color: "#EE5A24", energy: 5, label: "Anxious" },
        sad: { emoji: "\uD83D\uDCA7", color: "#2E86DE", energy: 3, label: "Sad" },
        angry: { emoji: "\uD83D\uDD25", color: "#FF3838", energy: 6, label: "Angry" },
        tired: { emoji: "\uD83D\uDE34", color: "#576574", energy: 2, label: "Tired" },
        grateful: { emoji: "\uD83D\uDC9C", color: "#A29BFE", energy: 7, label: "Grateful" },
      };
      activities = {};
      journal = [];
    }
    renderMoodGrid();
    renderQuickActions();
    renderJournalPreview();
    renderJournalScreen();
    initAmbient();
  }

  // ----- Render: Mood Grid -----
  function renderMoodGrid() {
    const grid = $("#mood-grid");
    if (!grid) return;
    grid.innerHTML = "";
    for (const [key, m] of Object.entries(moods)) {
      const el = document.createElement("div");
      el.className = "mood-item";
      el.dataset.mood = key;
      el.style.setProperty("--item-color", m.color);
      el.innerHTML = `
        <span class="mood-emoji">${m.emoji}</span>
        <span class="mood-label">${m.label}</span>
      `;
      el.addEventListener("click", () => selectMood(key));
      grid.appendChild(el);
    }
  }

  // ----- Select Mood -----
  async function selectMood(key) {
    currentMood = key;
    const m = moods[key];

    // Highlight selection
    $$(".mood-item").forEach((el) => {
      el.classList.toggle("selected", el.dataset.mood === key);
    });

    // Update hero orb color
    const orb = $("#hero-orb");
    if (orb) {
      orb.style.background = `radial-gradient(circle at 35% 35%, ${m.color}, ${m.color}88, ${m.color}33)`;
    }

    // Fetch quote
    try {
      const data = await api(`/api/quote?mood=${key}`);
      $("#hero-quote").textContent = data.quote;
    } catch {
      $("#hero-quote").textContent = `You're feeling ${m.label.toLowerCase()}.`;
    }

    // Small delay then navigate
    setTimeout(() => openMoodDetail(key), 400);
  }

  // ----- Mood Detail -----
  async function openMoodDetail(key) {
    const m = moods[key];
    $("#mood-big-emoji").textContent = m.emoji;
    $("#mood-big-label").textContent = m.label;
    $("#mood-big-label").style.color = m.color;

    // Quote
    try {
      const data = await api(`/api/quote?mood=${key}`);
      $("#mood-quote-text").textContent = data.quote;
    } catch {
      $("#mood-quote-text").textContent = "";
    }

    // Suggested activities
    try {
      const suggestions = await api(`/api/suggest?mood=${key}`);
      renderActivityList(suggestions);
    } catch {
      renderActivityList(Object.values(activities));
    }

    showScreen("mood");
  }

  function renderActivityList(items) {
    const list = $("#suggested-activities");
    if (!list) return;
    list.innerHTML = "";
    const arr = Array.isArray(items) ? items : Object.values(items);
    arr.forEach((act) => {
      const el = document.createElement("div");
      el.className = "activity-item";
      el.innerHTML = `
        <div class="activity-icon">${act.icon}</div>
        <div class="activity-info">
          <div class="activity-title">${act.title}</div>
          <div class="activity-sub">${act.subtitle}</div>
        </div>
        <div class="activity-arrow">&rsaquo;</div>
      `;
      el.addEventListener("click", () => openActivity(act.id));
      list.appendChild(el);
    });
  }

  // ----- Quick Actions -----
  function renderQuickActions() {
    const container = $("#quick-actions");
    if (!container) return;
    container.innerHTML = "";
    const acts = Object.values(activities);
    const fallback = [
      { id: "breathe", icon: "\uD83C\uDF2C\uFE0F", title: "Breathe", subtitle: "4-7-8 calm" },
      { id: "gratitude", icon: "\uD83C\uDF1F", title: "Gratitude", subtitle: "3 sparks of joy" },
      { id: "color_therapy", icon: "\uD83C\uDF08", title: "Colors", subtitle: "Immersive therapy" },
      { id: "creative_spark", icon: "\uD83C\uDFA8", title: "Create", subtitle: "Spark inspiration" },
      { id: "movement", icon: "\uD83D\uDC83", title: "Move", subtitle: "Shift energy" },
      { id: "body_scan", icon: "\uD83E\uDDD8", title: "Body Scan", subtitle: "Deep relax" },
    ];
    const items = acts.length > 0 ? acts : fallback;
    items.forEach((act) => {
      const el = document.createElement("div");
      el.className = "action-card";
      el.innerHTML = `
        <span class="action-card-icon">${act.icon}</span>
        <div class="action-card-title">${act.title}</div>
        <div class="action-card-sub">${act.subtitle}</div>
      `;
      el.addEventListener("click", () => {
        if (!currentMood) {
          toast("Pick a mood first!");
          return;
        }
        openActivity(act.id);
      });
      container.appendChild(el);
    });
  }

  // ----- Open Activity -----
  function openActivity(id) {
    const screenMap = {
      breathe: "breathe",
      gratitude: "gratitude",
      color_therapy: "color_therapy",
      body_scan: "body_scan",
      creative_spark: "creative_spark",
      movement: "movement",
    };
    const screen = screenMap[id];
    if (screen) {
      showScreen(screen);
      if (id === "color_therapy") initColorTherapy();
    }
  }

  // ----- Save Mood -----
  $("#save-mood-btn")?.addEventListener("click", async () => {
    if (!currentMood) return;
    const note = $("#mood-note")?.value || "";
    try {
      const entry = await apiPost("/api/journal", {
        mood: currentMood,
        note: note,
        activities_done: [],
      });
      journal.unshift(entry);
    } catch {
      journal.unshift({
        id: Date.now().toString(),
        mood: currentMood,
        note: note,
        timestamp: Date.now() / 1000,
        activities_done: [],
      });
    }

    toast("Mood logged! \u2728");
    $("#save-mood-btn").classList.add("success");
    $("#save-mood-btn").innerHTML = '<span class="cta-icon">&#10003;</span> Saved!';

    setTimeout(() => {
      $("#save-mood-btn").classList.remove("success");
      $("#save-mood-btn").innerHTML = '<span class="cta-icon">&#10003;</span> Log This Mood';
      $("#mood-note").value = "";
      renderJournalPreview();
      renderJournalScreen();
      showScreen("home");
      currentMood = null;
      $$(".mood-item").forEach((el) => el.classList.remove("selected"));
    }, 1200);
  });

  // ============================================================
  // BREATHING EXERCISE
  // ============================================================

  const BREATHE_PHASES = [
    { name: "Breathe In", duration: 4, cls: "inhale" },
    { name: "Hold", duration: 7, cls: "hold" },
    { name: "Breathe Out", duration: 8, cls: "exhale" },
  ];
  const BREATHE_ROUNDS = 6;

  $("#breathe-circle")?.addEventListener("click", startBreathing);

  function startBreathing() {
    if (breatheInterval) return;
    let round = 0;
    let phase = 0;
    let count = BREATHE_PHASES[0].duration;

    const ring = $("#breathe-ring");
    const circle = $("#breathe-circle");
    const text = $("#breathe-text");
    const counter = $("#breathe-counter");
    const instruction = $("#breathe-instruction");
    const roundEl = $("#breathe-round");

    ring.classList.add("active");
    instruction.textContent = "Follow the rhythm...";
    updateBreathPhase();

    function updateBreathPhase() {
      const p = BREATHE_PHASES[phase];
      text.textContent = p.name;
      counter.textContent = count;
      circle.className = "breathe-circle " + p.cls;
    }

    breatheInterval = setInterval(() => {
      count--;
      if (count <= 0) {
        phase++;
        if (phase >= BREATHE_PHASES.length) {
          phase = 0;
          round++;
          roundEl.textContent = round;
        }
        if (round >= BREATHE_ROUNDS) {
          stopBreathing();
          text.textContent = "Done";
          counter.textContent = "\u2728";
          instruction.textContent = "Beautiful. Notice how you feel.";
          toast("Breathing complete! \uD83C\uDF2C\uFE0F");
          return;
        }
        count = BREATHE_PHASES[phase].duration;
      }
      counter.textContent = count;
      const p = BREATHE_PHASES[phase];
      text.textContent = p.name;
      circle.className = "breathe-circle " + p.cls;
    }, 1000);
  }

  function stopBreathing() {
    if (breatheInterval) {
      clearInterval(breatheInterval);
      breatheInterval = null;
    }
    const ring = $("#breathe-ring");
    if (ring) ring.classList.remove("active");
  }

  // ============================================================
  // GRATITUDE
  // ============================================================

  $("#save-gratitude-btn")?.addEventListener("click", () => {
    const cards = $$(".gratitude-card textarea");
    const entries = cards.map((t) => t.value.trim()).filter(Boolean);
    if (entries.length === 0) {
      toast("Write at least one thing!");
      return;
    }

    cards.forEach((t) => {
      if (t.value.trim()) {
        t.closest(".gratitude-card").classList.add("saved");
      }
    });

    const note = entries.map((e, i) => `${i + 1}. ${e}`).join("\n");
    journal.unshift({
      id: Date.now().toString(),
      mood: "grateful",
      note: `Gratitude: ${note}`,
      timestamp: Date.now() / 1000,
      activities_done: ["gratitude"],
    });

    toast("Gratitude saved! \u2728");
    setTimeout(() => {
      cards.forEach((t) => {
        t.value = "";
        t.closest(".gratitude-card").classList.remove("saved");
      });
      renderJournalPreview();
      renderJournalScreen();
      showScreen("mood");
    }, 1500);
  });

  // ============================================================
  // COLOR THERAPY
  // ============================================================

  const CT_PALETTES = {
    sunrise: ["#FF6B6B", "#FFA06B", "#FFD93D", "#FF8E53"],
    ocean: ["#0077B6", "#00B4D8", "#90E0EF", "#CAF0F8"],
    forest: ["#2D6A4F", "#40916C", "#52B788", "#95D5B2"],
    aurora: ["#7400B8", "#6930C3", "#5390D9", "#48BFE3"],
    sunset: ["#FF006E", "#FB5607", "#FFBE0B", "#FF006E"],
  };
  let ctPalette = "aurora";
  let ctPlaying = false;

  function initColorTherapy() {
    const picker = $("#ct-palette-picker");
    if (!picker) return;
    picker.innerHTML = "";
    for (const [name, colors] of Object.entries(CT_PALETTES)) {
      const btn = document.createElement("button");
      btn.className = `ct-palette-btn ${name === ctPalette ? "active" : ""}`;
      btn.innerHTML =
        `<span>${name}</span>` +
        colors.map((c) => `<div class="ct-swatch" style="background:${c}"></div>`).join("");
      btn.addEventListener("click", () => {
        ctPalette = name;
        $$(".ct-palette-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        applyCtPalette();
      });
      picker.appendChild(btn);
    }
    applyCtPalette();
  }

  function applyCtPalette() {
    const colors = CT_PALETTES[ctPalette];
    const blobs = $$(".ct-blob");
    if (blobs[0]) blobs[0].style.background = colors[0];
    if (blobs[1]) blobs[1].style.background = colors[1];
    if (blobs[2]) blobs[2].style.background = colors[2] || colors[0];
  }

  $("#ct-play-btn")?.addEventListener("click", () => {
    const display = $("#ct-display");
    const btn = $("#ct-play-btn");
    ctPlaying = !ctPlaying;
    display.classList.toggle("playing", ctPlaying);
    btn.textContent = ctPlaying ? "Stop Immersion" : "Begin Immersion";
    if (ctPlaying) {
      toast("Breathe and let the colors flow...");
    }
  });

  // ============================================================
  // BODY SCAN
  // ============================================================

  const BS_ZONES = [
    { area: "Crown of your head", cue: "Let warmth melt down from the top..." },
    { area: "Forehead & eyes", cue: "Soften your brow, relax your gaze..." },
    { area: "Jaw & neck", cue: "Unclench gently, let your jaw float..." },
    { area: "Shoulders & arms", cue: "Drop your shoulders away from your ears..." },
    { area: "Chest & heart", cue: "Feel each breath expand your ribcage..." },
    { area: "Belly & core", cue: "Let your belly be soft and free..." },
    { area: "Legs & feet", cue: "Feel the ground supporting you..." },
  ];

  let bsRunning = false;

  $("#bs-start-btn")?.addEventListener("click", startBodyScan);

  function startBodyScan() {
    if (bsRunning) return;
    bsRunning = true;
    const btn = $("#bs-start-btn");
    btn.textContent = "Scanning...";
    btn.disabled = true;

    const zones = $$(".bs-zone");
    let idx = 0;

    function nextZone() {
      if (idx >= BS_ZONES.length) {
        bsRunning = false;
        btn.textContent = "Start Scan";
        btn.disabled = false;
        $("#bs-area").textContent = "Scan complete";
        $("#bs-text").textContent = "Your whole body is at peace. Beautiful.";
        zones.forEach((z) => z.classList.add("done"));
        toast("Body scan complete! \uD83E\uDDD8");
        return;
      }

      zones.forEach((z) => z.classList.remove("active"));
      if (zones[idx]) zones[idx].classList.add("active");
      if (idx > 0 && zones[idx - 1]) zones[idx - 1].classList.add("done");

      const zone = BS_ZONES[idx];
      $("#bs-area").textContent = zone.area;
      $("#bs-text").textContent = zone.cue;
      idx++;
      setTimeout(nextZone, 5000);
    }

    nextZone();
  }

  // ============================================================
  // CREATIVE SPARK
  // ============================================================

  let creativeMedium = "art";

  $$(".medium-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      creativeMedium = btn.dataset.medium;
      $$(".medium-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  $("#creative-generate-btn")?.addEventListener("click", async () => {
    const seeds = [
      "A tiny robot learning to paint sunsets",
      "The sound of rain on a tin roof at dusk",
      "A letter from your future self full of kindness",
      "The first flower of spring pushing through concrete",
      "A cozy cafe where time flows like honey",
      "Dancing shadows on a warm evening wall",
      "The feeling of sand between your toes at dawn",
      "A paper boat sailing across a puddle sky",
      "Moonlight turning a forest path into silver",
      "A grandmother's kitchen filled with cinnamon warmth",
    ];
    const seed = seeds[Math.floor(Math.random() * seeds.length)];
    const output = $("#creative-output");

    output.innerHTML = '<p class="creative-placeholder">Generating spark...</p>';

    try {
      const data = await api(
        `/api/creative?seed=${encodeURIComponent(seed)}&medium=${creativeMedium}`
      );
      output.innerHTML = `
        <div class="creative-result-title">${data.kind}: ${creativeMedium}</div>
        <div class="creative-result-body">${data.answer}</div>
        <ul class="creative-result-tips">
          ${(data.details || []).map((d) => `<li>${d}</li>`).join("")}
        </ul>
      `;
    } catch {
      output.innerHTML = `
        <div class="creative-result-title">Creative Spark: ${creativeMedium}</div>
        <div class="creative-result-body">${seed}. Let this image guide your ${creativeMedium} creation. Start with the feeling, then build outward.</div>
        <ul class="creative-result-tips">
          <li>Focus on one sensory detail first</li>
          <li>Let imperfection be part of the beauty</li>
          <li>The first draft is always a conversation</li>
        </ul>
      `;
    }

    toast("Spark generated! \u26A1");
  });

  // ============================================================
  // MOVEMENT
  // ============================================================

  const MV_MOVES = [
    { name: "Sunrise stretch", desc: "Reach arms up, stretch tall, breathe deep", seconds: 15 },
    { name: "Shoulder rolls", desc: "Roll forward 5x, backward 5x, release tension", seconds: 15 },
    { name: "Side sway", desc: "Sway gently side to side like a tree in breeze", seconds: 15 },
    { name: "Shake it off", desc: "Shake hands, arms, shimmy shoulders freely", seconds: 10 },
    { name: "Micro-dance", desc: "Move however feels good for 20 seconds", seconds: 20 },
    { name: "Deep breath close", desc: "Stand still, three deep breaths, smile", seconds: 15 },
  ];

  let mvRunning = false;

  $("#mv-start-btn")?.addEventListener("click", startMovement);

  function startMovement() {
    if (mvRunning) return;
    mvRunning = true;
    const btn = $("#mv-start-btn");
    btn.textContent = "Moving...";
    btn.disabled = true;
    const circle = $("#mv-circle");
    circle.classList.add("active");

    let moveIdx = 0;
    let secondsLeft = MV_MOVES[0].seconds;
    const totalSeconds = MV_MOVES.reduce((s, m) => s + m.seconds, 0);
    let elapsed = 0;

    updateMove();

    movementInterval = setInterval(() => {
      secondsLeft--;
      elapsed++;
      $("#mv-timer").textContent = secondsLeft > 0 ? secondsLeft + "s" : "";
      $("#mv-progress-fill").style.width = `${(elapsed / totalSeconds) * 100}%`;

      if (secondsLeft <= 0) {
        moveIdx++;
        if (moveIdx >= MV_MOVES.length) {
          stopMovement();
          toast("Movement complete! \uD83D\uDC83");
          return;
        }
        secondsLeft = MV_MOVES[moveIdx].seconds;
        updateMove();
      }
    }, 1000);

    function updateMove() {
      const move = MV_MOVES[moveIdx];
      $("#mv-name").textContent = move.name;
      $("#mv-desc").textContent = move.desc;
    }
  }

  function stopMovement() {
    if (movementInterval) {
      clearInterval(movementInterval);
      movementInterval = null;
    }
    mvRunning = false;
    const btn = $("#mv-start-btn");
    const circle = $("#mv-circle");
    btn.textContent = "Start Moving";
    btn.disabled = false;
    circle.classList.remove("active");
    $("#mv-name").textContent = "Done!";
    $("#mv-desc").textContent = "Great job! Feel the energy shift.";
    $("#mv-timer").textContent = "";
    $("#mv-progress-fill").style.width = "100%";
  }

  // ============================================================
  // JOURNAL RENDERING
  // ============================================================

  function renderJournalPreview() {
    const list = $("#journal-preview-list");
    if (!list) return;
    if (journal.length === 0) {
      list.innerHTML = '<p class="empty-state">Your mood story starts here.</p>';
      return;
    }
    list.innerHTML = "";
    journal.slice(0, 3).forEach((e) => {
      list.appendChild(createJournalEntry(e));
    });
  }

  function renderJournalScreen() {
    const container = $("#journal-entries");
    const statsEl = $("#journal-stats");
    if (!container) return;

    if (journal.length === 0) {
      container.innerHTML = '<p class="empty-state">No entries yet. Check in with your mood to start.</p>';
      if (statsEl) statsEl.innerHTML = "";
      return;
    }

    // Stats
    if (statsEl) {
      const moodCounts = {};
      journal.forEach((e) => {
        moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1;
      });
      const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
      const topMoodData = moods[topMood?.[0]] || { emoji: "\uD83D\uDE0A", label: "Happy" };

      statsEl.innerHTML = `
        <div class="stat-card">
          <span class="stat-value">${journal.length}</span>
          <span class="stat-label">Check-ins</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${topMoodData.emoji}</span>
          <span class="stat-label">Top Mood</span>
        </div>
        <div class="stat-card">
          <span class="stat-value">${Object.keys(moodCounts).length}</span>
          <span class="stat-label">Unique Moods</span>
        </div>
      `;
    }

    container.innerHTML = "";
    journal.forEach((e) => {
      container.appendChild(createJournalEntry(e));
    });
  }

  function createJournalEntry(entry) {
    const m = moods[entry.mood] || { emoji: "\u2728", label: entry.mood };
    const el = document.createElement("div");
    el.className = "journal-entry";
    const date = new Date(entry.timestamp * 1000);
    const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric" });
    el.innerHTML = `
      <span class="journal-emoji">${m.emoji}</span>
      <div class="journal-info">
        <div class="journal-mood-name">${m.label}</div>
        <div class="journal-note-preview">${entry.note || "No note"}</div>
      </div>
      <span class="journal-time">${dateStr} ${timeStr}</span>
    `;
    return el;
  }

  // ============================================================
  // AMBIENT PARTICLE CANVAS
  // ============================================================

  function initAmbient() {
    const canvas = $("#ambient-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w, h;
    const particles = [];
    const PARTICLE_COUNT = 40;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.3,
        dy: (Math.random() - 0.5) * 0.3,
        hue: Math.random() * 60 + 240, // purple-blue range
        alpha: Math.random() * 0.4 + 0.1,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Update hue based on current mood
        if (currentMood && moods[currentMood]) {
          // Shift color toward mood color over time
          const moodColor = moods[currentMood].color;
          const rgb = hexToRgb(moodColor);
          if (rgb) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${p.alpha})`;
            ctx.fill();
            continue;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 60%, 60%, ${p.alpha})`;
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    draw();
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  // ----- Boot -----
  init();
})();
