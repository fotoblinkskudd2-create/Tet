/* KLEPPFORGE Command Center v0 — ren vanilla JS, mockdata, ingen backend. */
(function () {
  "use strict";

  const D = KLEPPFORGE_DATA;
  const ideas = D.ideas;

  const state = {
    tab: "dashboard",
    selected: D.meta.today_focus || ideas[0].id,
    killFluff: false,
  };

  const TABS = [
    ["dashboard", "Dashboard"],
    ["inbox", "Idea Inbox"],
    ["product", "Product Card"],
    ["report", "Report Builder"],
    ["tickets", "Codex Tickets"],
    ["sales", "Sales Kit"],
    ["daily", "Daily Judgment"],
  ];

  /* ---------- helpers ---------- */
  const $ = (sel) => document.querySelector(sel);

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getSelected() {
    return ideas.find((i) => i.id === state.selected) || ideas[0];
  }

  function counts() {
    const c = { PASS: 0, REWORK: 0, BLOCK: 0 };
    ideas.forEach((i) => { c[i.judgment] = (c[i.judgment] || 0) + 1; });
    return c;
  }

  function dom(j) {
    return `<span class="dom ${j}">${j}</span>`;
  }

  function li(items, cls) {
    return `<ul class="${cls || "clean"}">${items
      .map((x) => `<li>${esc(x)}</li>`)
      .join("")}</ul>`;
  }

  function field(k, valHtml, fluff) {
    return `<div class="field"${fluff ? ' data-fluff="true"' : ""}>
      <div class="k">${esc(k)}</div><div class="val">${valHtml}</div></div>`;
  }

  function copyBlock(text) {
    const id = "cb" + Math.random().toString(36).slice(2, 8);
    return `<button class="copybtn" data-copy="${id}">Kopier</button>
      <pre class="copyblock" id="${id}">${esc(text)}</pre>`;
  }

  function ideaPicker() {
    return `<div class="field"><div class="k">Valgt spor</div>
      <select id="ideaSelect" class="picker">
        ${ideas
          .map(
            (i) =>
              `<option value="${i.id}"${i.id === state.selected ? " selected" : ""}>${esc(
                i.name
              )} — ${i.judgment}</option>`
          )
          .join("")}
      </select></div>`;
  }

  /* ---------- views ---------- */
  function viewDashboard() {
    const c = counts();
    const top = getSelected();
    return `
      <section class="view">
        <div class="grid cols-4">
          <div class="panel stat"><div class="num">${ideas.length}</div><div class="lbl">Spor</div></div>
          <div class="panel stat pass"><div class="num">${c.PASS}</div><div class="lbl">PASS</div></div>
          <div class="panel stat rework"><div class="num">${c.REWORK}</div><div class="lbl">Rework</div></div>
          <div class="panel stat block"><div class="num">${c.BLOCK}</div><div class="lbl">Block</div></div>
        </div>

        <div class="section-title">Dagens toppspor</div>
        <div class="panel">
          <h3>${esc(top.name)} ${dom(top.judgment)}</h3>
          ${field("Problem", esc(top.problem))}
          ${field("Kjøper", esc(top.buyer))}
          ${field("Første leveranse", esc(top.first_deliverable))}
          <div data-fluff="true">${field("Hvorfor det vinner", esc(top.why_wins))}</div>
        </div>

        <div class="grid cols-2" style="margin-top:14px">
          <div class="panel">
            <h2>Neste handling akkurat nå</h2>
            <div class="next-now">${esc(D.meta.next_action_now)}</div>
          </div>
          <div class="panel">
            <h2>Neste 24 timer</h2>
            ${li(D.meta.next_24h, "clean next24")}
          </div>
        </div>
      </section>`;
  }

  function viewInbox() {
    const rows = ideas
      .map((i) => {
        const sel = i.id === state.selected ? " selected" : "";
        return `<div class="idea-row${sel}" data-pick="${i.id}">
          <div>
            <div class="name">${esc(i.name)}</div>
            <div class="meta">${esc(i.problem)}</div>
            <div class="meta" data-fluff="true"><b>Kjøper:</b> ${esc(i.buyer)}</div>
            <div class="meta"><b>Første leveranse:</b> ${esc(i.first_deliverable)}</div>
          </div>
          <div class="right">
            ${dom(i.judgment)}
            <div class="scorebar">
              <div>verdi <b>${i.value_score}</b><div class="bar value"><span style="width:${i.value_score}%"></span></div></div>
              <div>risiko <b>${i.risk_score}</b><div class="bar risk"><span style="width:${i.risk_score}%"></span></div></div>
            </div>
          </div>
        </div>`;
      })
      .join("");
    return `<section class="view"><div class="grid" style="gap:10px">${rows}</div>
      <div class="note" data-fluff="true">Velg et spor for å åpne produktkort, rapport, tickets og salgssett. Alt uten kjøper hører hjemme i kunstmappa.</div>
      </section>`;
  }

  function viewProduct() {
    const i = getSelected();
    const p = i.product_card;
    return `<section class="view">
      <div class="panel">${ideaPicker()}</div>
      <div class="panel" style="margin-top:14px">
        <h3>${esc(p.name)} ${dom(i.judgment)}</h3>
        ${field("Problem", esc(i.problem))}
        ${field("Kjøper", esc(i.buyer))}
        ${field("Bruker", esc(i.user), true)}
        ${field("MVP", esc(p.mvp))}
        ${field("Første salgbare leveranse", esc(p.first_sellable))}
        <div class="field"><div class="k">Prisnivå</div>
          <div class="price-list">${p.price_levels.map((x) => `<div class="p">${esc(x)}</div>`).join("")}</div></div>
        ${field("Første test", esc(p.first_test))}
        ${field("7-dagers plan", li(p.plan_7_days, "plain"))}
      </div>
    </section>`;
  }

  function viewReport() {
    const i = getSelected();
    const r = i.report;
    return `<section class="view">
      <div class="panel">${ideaPicker()}</div>
      <div class="panel" style="margin-top:14px">
        <h2>Rapportstruktur — ${esc(i.name)}</h2>
        ${field("Sammendrag", esc(r.summary))}
        ${field("Problem", esc(r.problem))}
        ${field("Observasjoner", li(r.observations, "plain"))}
        ${field("Anbefalte tiltak", li(r.recommended_actions, "plain"))}
        ${field("Økonomisk verdi", esc(r.economic_value))}
        ${field("Neste steg", li(r.next_steps, "plain"))}
      </div>
      <div class="note" data-fluff="true">Samme struktur eksporteres som DOCX via DOCX Report Factory. Språk: norsk, profesjonell, null fluff.</div>
    </section>`;
  }

  function viewTickets() {
    const i = getSelected();
    const rows = i.tickets
      .map(
        (t, n) =>
          `<div class="ticket"><div class="id">#${n + 1}</div><div>${esc(t)}</div></div>`
      )
      .join("");
    return `<section class="view">
      <div class="panel">${ideaPicker()}</div>
      <div class="panel" style="margin-top:14px">
        <h2>10 Codex/Claude-tickets — ${esc(i.name)}</h2>
        ${rows}
      </div>
    </section>`;
  }

  function viewSales() {
    const i = getSelected();
    const s = i.sales;
    return `<section class="view">
      <div class="panel">${ideaPicker()}</div>
      <div class="grid cols-2" style="margin-top:14px">
        <div class="panel"><h2>Kort pitch</h2><p>${esc(s.pitch_short)}</p></div>
        <div class="panel" data-fluff="true"><h2>LinkedIn / Facebook</h2><p>${esc(s.linkedin)}</p></div>
      </div>
      <div class="panel" style="margin-top:14px"><h2>E-post</h2>${copyBlock(s.email)}</div>
      <div class="panel" style="margin-top:14px">
        <h2>Innvendinger og svar</h2>
        ${s.objections
          .map((o) => `<div class="qa"><div class="q">– ${esc(o.q)}</div><div class="a">${esc(o.a)}</div></div>`)
          .join("")}
      </div>
      <div class="panel" style="margin-top:14px" data-fluff="true">
        <h2>10 mulige kundetyper</h2>
        <div class="chips">${s.buyer_types.map((b) => `<span class="chip">${esc(b)}</span>`).join("")}</div>
      </div>
    </section>`;
  }

  function viewDaily() {
    const i = getSelected();
    const d = i.daily;
    return `<section class="view">
      <div class="panel">${ideaPicker()}</div>
      <div class="panel" style="margin-top:14px">
        <h3>${esc(i.name)} ${dom(i.judgment)}</h3>
        ${field("Hva er verdifullt", esc(d.valuable))}
        <div data-fluff="true">${field("Hva er bare pynt", esc(d.fluff))}</div>
        ${field("Hva skal bygges neste", esc(d.build_next))}
      </div>
      <div class="section-title">Dom for hele porteføljen</div>
      <div class="grid" style="gap:8px">
        ${ideas
          .map(
            (x) =>
              `<div class="idea-row" data-pick="${x.id}">
                 <div><div class="name">${esc(x.name)}</div>
                 <div class="meta">${esc(x.daily.build_next)}</div></div>
                 <div class="right">${dom(x.judgment)}</div>
               </div>`
          )
          .join("")}
      </div>
    </section>`;
  }

  const VIEWS = {
    dashboard: viewDashboard,
    inbox: viewInbox,
    product: viewProduct,
    report: viewReport,
    tickets: viewTickets,
    sales: viewSales,
    daily: viewDaily,
  };

  /* ---------- render & events ---------- */
  function renderTabs() {
    $("#tabs").innerHTML = TABS.map(
      ([id, label]) =>
        `<button data-tab="${id}" class="${id === state.tab ? "active" : ""}">${label}</button>`
    ).join("");
  }

  function render() {
    renderTabs();
    $("#main").innerHTML = (VIEWS[state.tab] || viewDashboard)();
    const kf = $("#killFluff");
    kf.setAttribute("aria-pressed", String(state.killFluff));
    kf.textContent = state.killFluff ? "FLUFF SKJULT" : "KILL FLUFF";
    document.body.classList.toggle("killfluff", state.killFluff);
  }

  document.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-tab]");
    if (tab) { state.tab = tab.dataset.tab; render(); return; }

    const pick = e.target.closest("[data-pick]");
    if (pick) {
      state.selected = pick.dataset.pick;
      if (state.tab === "inbox" || state.tab === "daily") state.tab = "product";
      render();
      return;
    }

    if (e.target.id === "killFluff") {
      state.killFluff = !state.killFluff;
      render();
      return;
    }

    const cp = e.target.closest("[data-copy]");
    if (cp) {
      const pre = document.getElementById(cp.dataset.copy);
      const txt = pre ? pre.textContent : "";
      navigator.clipboard && navigator.clipboard.writeText(txt);
      cp.textContent = "Kopiert";
      cp.classList.add("ok");
      setTimeout(() => { cp.textContent = "Kopier"; cp.classList.remove("ok"); }, 1500);
    }
  });

  document.addEventListener("change", (e) => {
    if (e.target.id === "ideaSelect") {
      state.selected = e.target.value;
      render();
    }
  });

  render();
})();
