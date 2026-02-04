// assets/js/pipeline.js
(() => {
  const PIPE_STATE = {
    tab: "all",
    query: "",
    groupByStage: true,
  };

  function money(n) {
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
    } catch {
      return `$${Math.round(n || 0).toLocaleString()}`;
    }
  }

  function flattenOpps(data) {
    const out = [];
    (data?.accounts || []).forEach((a) => {
      (a.opportunities || []).forEach((o) => {
        out.push({
          ...o,
          accountId: a.id,
          accountName: a.name,
          industry: a.industry,
          am: a.am,
          accountAR: a.arCount,
          lastTouch: a.lastTouch,
          staleDays: a.staleDays,
        });
      });
    });
    return out;
  }

  function oppMatchesTab(o, tab) {
    if (tab === "all") return true;
    if (tab === "closing") return (o.closingDays ?? 999) <= 30;
    if (tab === "risk") return (o.risk || "") === "hot";
    if (tab === "stale") return (o.staleDays ?? 0) >= 14;
    return true;
  }

  function oppMatchesQuery(o, q) {
    const query = (q || "").trim().toLowerCase();
    if (!query) return true;
    return (
      (o.name || "").toLowerCase().includes(query) ||
      (o.accountName || "").toLowerCase().includes(query) ||
      (o.stage || "").toLowerCase().includes(query)
    );
  }

  function riskChip(risk) {
    const r = (risk || "").toLowerCase();
    if (r === "hot") return `<span class="tag" style="border:1px solid var(--stroke);padding:2px 8px;border-radius:999px;">Hot</span>`;
    if (r === "warm") return `<span class="tag" style="border:1px solid var(--stroke);padding:2px 8px;border-radius:999px;">Warm</span>`;
    return `<span class="tag" style="border:1px solid var(--stroke);padding:2px 8px;border-radius:999px;">Cool</span>`;
  }

  function pipeRow(o) {
    const stale = o.staleDays ?? 0;
    const staleLabel =
      stale >= 14 ? `<span class="score-chip bad">${stale}d</span>` :
      stale >= 7  ? `<span class="score-chip warn">${stale}d</span>` :
                   `<span class="score-chip good">${stale}d</span>`;

    return `
      <div class="trow" role="button" tabindex="0" data-action="toast"
           data-message="Open deal: ${o.name} (${o.accountName})">
        <div class="cell">
          <div style="font-weight:900;">${o.name}</div>
          <div class="muted">${riskChip(o.risk)} <span style="margin-left:8px;">Closing: ${o.closingDays ?? "—"}d</span></div>
        </div>

        <div class="cell hide-sm">
          <div class="account-name" style="cursor:pointer;">${o.accountName}</div>
          <div class="muted">${o.industry || ""}</div>
        </div>

        <div class="cell"><span class="score-chip">${o.stage || "—"}</span></div>
        <div class="cell hide-sm"><strong>${money(o.value || 0)}</strong></div>
        <div class="cell hide-sm">${o.am || "—"}</div>

        <div class="cell hide-sm">
          <div class="stack">
            <div><strong>${o.lastTouch?.date || "—"}</strong></div>
            <div class="muted">${o.lastTouch?.type || ""}</div>
          </div>
        </div>

        <div class="cell hide-sm">${staleLabel}</div>
        <div class="ar-pill">${"AR: " + (o.accountAR ?? 0)}</div>
      </div>
    `;
  }

  function renderPipeline() {
    const host = document.getElementById("pipeTable");
    if (!host) return;

    const data = window.CRM_DATA;
    const all = flattenOpps(data)
      .filter((o) => oppMatchesTab(o, PIPE_STATE.tab))
      .filter((o) => oppMatchesQuery(o, PIPE_STATE.query));

    const head = `
      <div class="thead">
        <div>Opportunity</div>
        <div class="hide-sm">Account</div>
        <div>Stage</div>
        <div class="hide-sm">Value</div>
        <div class="hide-sm">Owner</div>
        <div class="hide-sm">Last Touch</div>
        <div class="hide-sm">Stale</div>
        <div></div>
      </div>
    `;

    if (PIPE_STATE.groupByStage) {
      const groups = {};
      all.forEach((o) => {
        const k = o.stage || "Unstaged";
        (groups[k] ||= []).push(o);
      });

      const stageOrder = ["Discovery", "Quote", "PO", "Closed", "Unstaged"];
      const sortedStages = Object.keys(groups).sort((a, b) => {
        const ai = stageOrder.indexOf(a);
        const bi = stageOrder.indexOf(b);
        if (ai === -1 && bi === -1) return a.localeCompare(b);
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });

      const body = sortedStages
        .map((stage) => {
          const rows = groups[stage]
            .sort((a, b) => (b.value || 0) - (a.value || 0))
            .map((o) => pipeRow(o))
            .join("");

          return `
            <div class="stage-break">
              <strong style="font-size:12px;letter-spacing:.12em;">${stage.toUpperCase()}</strong>
              <span class="muted" style="margin-left:10px;">${groups[stage].length} deal(s)</span>
            </div>
            ${rows}
          `;
        })
        .join("");

      host.innerHTML = head + body;
      return;
    }

    const body = all
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .map((o) => pipeRow(o))
      .join("");

    host.innerHTML = head + body;
  }

  function wirePipelineUI() {
    const search = document.getElementById("pipeSearch");
    if (search) {
      search.addEventListener("input", (e) => {
        PIPE_STATE.query = e.target.value || "";
        renderPipeline();
      });
    }

    document.querySelectorAll("[data-pipe-tab]").forEach((btn) => {
      btn.addEventListener("click", () => {
        PIPE_STATE.tab = btn.getAttribute("data-pipe-tab") || "all";

        document.querySelectorAll("[data-pipe-tab]").forEach((b) => b.removeAttribute("aria-current"));
        btn.setAttribute("aria-current", "page");

        renderPipeline();
      });
    });

    const toggle = document.getElementById("pipeToggleGroup");
    if (toggle) {
      toggle.addEventListener("click", () => {
        PIPE_STATE.groupByStage = !PIPE_STATE.groupByStage;
        toggle.textContent = PIPE_STATE.groupByStage ? "Group: Stage" : "Group: Off";
        renderPipeline();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    wirePipelineUI();
    renderPipeline();
  });
})();
