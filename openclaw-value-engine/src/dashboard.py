"""Generates a single self-contained HTML dashboard (no backend, no server)."""
from __future__ import annotations

import json
from typing import Any, Dict, List

TEMPLATE = """<!DOCTYPE html>
<html lang="no">
<head>
<meta charset="utf-8">
<title>OpenClaw Value Engine — Dashboard</title>
<style>
  body { font-family: -apple-system, Segoe UI, sans-serif; margin: 2rem; background: #0e0f12; color: #eee; }
  h1 { margin-bottom: 0.2rem; }
  .meta { color: #999; margin-bottom: 1.5rem; }
  table { width: 100%; border-collapse: collapse; }
  th, td { padding: 0.5rem 0.7rem; border-bottom: 1px solid #2a2c33; text-align: left; vertical-align: top; }
  th { cursor: pointer; background: #1b1d24; position: sticky; top: 0; }
  tr:hover { background: #1b1d24; }
  .PASS { color: #4ade80; font-weight: bold; }
  .REWORK { color: #facc15; font-weight: bold; }
  .BLOCK { color: #f87171; font-weight: bold; }
  input#search { padding: 0.5rem; width: 100%; max-width: 400px; margin-bottom: 1rem;
    background: #1b1d24; color: #eee; border: 1px solid #2a2c33; border-radius: 4px; }
  .score { font-weight: bold; }
  .details { color: #aaa; font-size: 0.85rem; }
</style>
</head>
<body>
<h1>OpenClaw Value Engine</h1>
<div class="meta">Generert: __GENERATED_AT__ | __IDEA_COUNT__ idéer rangert</div>
<input id="search" type="text" placeholder="Filtrer på navn, kategori eller hvem betaler...">
<table id="table">
  <thead>
    <tr>
      <th data-key="rank">#</th>
      <th data-key="total_score">Score</th>
      <th data-key="recommendation">Anbefaling</th>
      <th data-key="name">Navn</th>
      <th data-key="category">Kategori</th>
      <th data-key="who_pays">Hvem betaler</th>
      <th data-key="first_deliverable">Første leveranse</th>
      <th data-key="next_action">Neste handling (24t)</th>
    </tr>
  </thead>
  <tbody id="rows"></tbody>
</table>

<script>
const IDEAS = __IDEAS_JSON__;

function render(items) {
  const tbody = document.getElementById('rows');
  tbody.innerHTML = '';
  items.forEach((idea, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td class="score">${idea.total_score}</td>
      <td class="${idea.recommendation}">${idea.recommendation}</td>
      <td>${idea.name}</td>
      <td>${idea.category}</td>
      <td>${idea.who_pays}</td>
      <td class="details">${idea.first_deliverable}</td>
      <td class="details">${idea.next_action}</td>
    `;
    tbody.appendChild(tr);
  });
}

let sortKey = 'total_score';
let sortDesc = true;

function sortAndRender() {
  const sorted = [...IDEAS].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDesc ? bv - av : av - bv;
    }
    return sortDesc ? String(bv).localeCompare(String(av)) : String(av).localeCompare(String(bv));
  });
  render(sorted);
}

document.querySelectorAll('th').forEach((th) => {
  th.addEventListener('click', () => {
    const key = th.dataset.key;
    if (key === 'rank') return;
    if (sortKey === key) { sortDesc = !sortDesc; } else { sortKey = key; sortDesc = true; }
    sortAndRender();
  });
});

document.getElementById('search').addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase();
  const filtered = IDEAS.filter((idea) =>
    idea.name.toLowerCase().includes(query) ||
    idea.category.toLowerCase().includes(query) ||
    idea.who_pays.toLowerCase().includes(query)
  );
  render(filtered);
});

sortAndRender();
</script>
</body>
</html>
"""


def render_dashboard_html(scored_ideas: List[Dict[str, Any]], generated_at: str = "") -> str:
    ideas_json = json.dumps(scored_ideas, ensure_ascii=False)
    html = TEMPLATE.replace("__IDEAS_JSON__", ideas_json)
    html = html.replace("__IDEA_COUNT__", str(len(scored_ideas)))
    html = html.replace("__GENERATED_AT__", generated_at)
    return html


def write_dashboard(scored_ideas: List[Dict[str, Any]], output_path: str, generated_at: str = "") -> None:
    html = render_dashboard_html(scored_ideas, generated_at=generated_at)
    with open(output_path, "w", encoding="utf-8") as handle:
        handle.write(html)
