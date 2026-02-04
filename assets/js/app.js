// assets/js/app.js
(() => {
  // --- Simple navigation + history for clickable wireframes ---
  const screensEl = document.getElementById("screens");
  const navEl = document.getElementById("nav");
  const toastEl = document.getElementById("toast");

  const historyStack = [];
  let currentScreenId = "dashboard";

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => toastEl.classList.remove("show"), 1400);
  }

  function setActiveNav(id) {
    // Sidebar nav
    navEl?.querySelectorAll('button[data-go]').forEach((btn) => {
      const isActive = btn.getAttribute("data-go") === id;
      btn.setAttribute("aria-current", isActive ? "page" : "false");
    });

    // Top tabs
    document.querySelectorAll(".top-tabs .tab[data-go]").forEach((tab) => {
      const isActive = tab.getAttribute("data-go") === id;
      tab.setAttribute("aria-current", isActive ? "page" : "false");
    });
  }

  function showScreen(id, { pushHistory = true } = {}) {
    const next = document.getElementById(id);
    if (!next) {
      showToast(`No screen found: ${id}`);
      return;
    }

    if (pushHistory && currentScreenId && currentScreenId !== id) {
      historyStack.push(currentScreenId);
    }

    screensEl?.querySelectorAll(".screen").forEach((s) => s.classList.add("hidden"));
    next.classList.remove("hidden");

    currentScreenId = id;
    setActiveNav(id);
    window.location.hash = id;
  }

  // Expose a tiny helper namespace for other files (optional)
  window.WF = window.WF || {};
  window.WF.showScreen = showScreen;
  window.WF.showToast = showToast;

  function openAccountDetailFromRow(row) {
    if (!row) return;
    const name = row.querySelector(".account-name")?.innerText?.trim() || "Account";

    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };
    set("acctdName", name);
    set("acctdSumAccount", name);

    showScreen("account-detail");
    showToast(`Opened: ${name}`);
  }
  window.WF.openAccountDetailFromRow = openAccountDetailFromRow;

  // Notes toggle (single-source-of-truth: CSS class)
  const toggleNotesBtn = document.getElementById("toggleNotesBtn");
  if (toggleNotesBtn) {
    toggleNotesBtn.addEventListener("click", () => {
      document.body.classList.toggle("hide-notes");
    });
  }

  // Click handler for any element with data-go or data-action
  document.addEventListener("click", (e) => {
    // If the user is editing text, don't trigger navigation/toasts.
    if (e.target.closest('[contenteditable="true"]')) return;

    const goEl = e.target.closest("[data-go]");
    const actEl = e.target.closest("[data-action]");

    if (goEl) {
      const id = goEl.getAttribute("data-go");
      showScreen(id);
      return;
    }

    if (actEl) {
      const action = actEl.getAttribute("data-action");
      if (action === "toast") {
        const msg = actEl.getAttribute("data-message") || "Action";
        showToast(msg);
      }
    }

    // Pipeline/account name click -> open account detail
    const nameEl = e.target.closest(".account-name");
    if (nameEl) {
      const row = nameEl.closest(".trow");
      openAccountDetailFromRow(row);
    }
  });

  // --- Inline editing: persist edits in localStorage ---
  const EDIT_STORE_KEY = "wf_inline_edits_v2";

  function loadEdits() {
    try {
      return JSON.parse(localStorage.getItem(EDIT_STORE_KEY) || "{}");
    } catch (_) {
      return {};
    }
  }

  function saveEdits(map) {
    try {
      localStorage.setItem(EDIT_STORE_KEY, JSON.stringify(map));
    } catch (_) {}
  }

  function initInlineEditing() {
    const edits = loadEdits();
    document.querySelectorAll("[data-edit-id]").forEach((el) => {
      const id = el.getAttribute("data-edit-id");
      if (!id) return;

      if (edits[id] != null) el.innerText = edits[id];

      const persist = () => {
        const latest = loadEdits();
        latest[id] = el.innerText;
        saveEdits(latest);
      };

      el.addEventListener("blur", persist);
      el.addEventListener("input", () => {
        window.clearTimeout(el._t);
        el._t = window.setTimeout(persist, 250);
      });

      el.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          el.blur();
        }
      });
    });
  }

  // Load theme preference
  function loadTheme() {
    try {
      const saved = localStorage.getItem("wf_theme");
      if (saved === "dark" || saved === "light") {
        document.documentElement.setAttribute("data-theme", saved);
      }
    } catch (_) {}
  }

  // Basic self-tests (visible in console)
  function runSelfTests() {
    const requiredScreens = ["dashboard", "accounts", "leads", "pipeline", "reporting", "admin", "settings"];
    const missing = requiredScreens.filter((id) => !document.getElementById(id));
    console.assert(missing.length === 0, "Missing screens:", missing);

    try {
      showScreen("dashboard", { pushHistory: false });
      showScreen("accounts", { pushHistory: false });
      showScreen("dashboard", { pushHistory: false });
      console.assert(true, "Navigation smoke test passed");
    } catch (e) {
      console.error("Navigation smoke test failed", e);
      console.assert(false, "Navigation smoke test failed");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadTheme();
    initInlineEditing();

    // Load from hash on refresh
    const initial = (window.location.hash || "#dashboard").replace("#", "");
    showScreen(initial, { pushHistory: false });

    runSelfTests();
  });
})();
