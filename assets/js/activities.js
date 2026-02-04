// assets/js/activities.js
(() => {
  const REASONS = [
    "Follow-up / Next Step",
    "Discovery / Qualification",
    "Demo / Walkthrough",
    "Quote / Proposal Review",
    "Re-Engage (stalled / no response)",
  ];

  const OUTCOMES = {
    call: ["Connected", "Voicemail", "No answer", "Rescheduled"],
    meeting: ["Held", "No show", "Rescheduled", "Canceled"],
    task: ["Done", "Moved", "Canceled"],
  };

  let ACT_STATE = {
    type: "call",
    when: "Now",
    due: "Today",
    activeItemEl: null,
  };

  const activityModal = document.getElementById("activityModal");
  const outcomeModal = document.getElementById("outcomeModal");

  const actReason = document.getElementById("actReason");
  const actTitle = document.getElementById("actTitle");
  const actPrimaryBtn = document.getElementById("actPrimaryBtn");

  const callWhenRow = document.getElementById("callWhenRow");
  const meetingDateRow = document.getElementById("meetingDateRow");
  const taskDueRow = document.getElementById("taskDueRow");

  function fillReasons() {
    if (!actReason) return;
    actReason.innerHTML = REASONS.map((r) => `<option value="${r}">${r}</option>`).join("");
    actReason.value = REASONS[0];
  }

  function pressOneChip(container, pressedBtn) {
    container.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", "false"));
    pressedBtn.setAttribute("aria-pressed", "true");
  }

  function setModalType(type) {
    ACT_STATE.type = type;

    const titleEl = document.getElementById("activityModalTitle");
    if (titleEl) {
      titleEl.textContent =
        type === "call" ? "Schedule Call" :
        type === "meeting" ? "Schedule Meeting" :
        "Create Task";
    }

    // Show/hide rows
    callWhenRow?.classList.toggle("hidden", type !== "call");
    meetingDateRow?.classList.toggle("hidden", type !== "meeting");
    taskDueRow?.classList.toggle("hidden", type !== "task");

    // Auto title format
    const reason = actReason?.value || REASONS[0];
    if (actTitle) {
      const prefix = type === "call" ? "Call" : type === "meeting" ? "Meeting" : "Task";
      actTitle.value = `${prefix} – ${reason}`;
    }
  }

  function openModal(type) {
    setModalType(type);
    activityModal?.classList.add("open");
  }

  function closeModal() {
    activityModal?.classList.remove("open");
  }

  function openOutcomeModal(itemEl) {
    ACT_STATE.activeItemEl = itemEl;
    const type = itemEl?.getAttribute("data-activity-type") || "call";

    const outcomeSelect = document.getElementById("outcomeSelect");
    const list = OUTCOMES[type] || OUTCOMES.call;
    if (outcomeSelect) {
      outcomeSelect.innerHTML = list.map((o) => `<option value="${o}">${o}</option>`).join("");
    }

    outcomeModal?.classList.add("open");
  }

  function closeOutcomeModal() {
    outcomeModal?.classList.remove("open");
  }

  // Chips wiring
  document.getElementById("callWhenChips")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    ACT_STATE.when = btn.getAttribute("data-when") || "Now";
    pressOneChip(e.currentTarget, btn);
  });

  document.getElementById("taskDueChips")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    ACT_STATE.due = btn.getAttribute("data-due") || "Today";
    pressOneChip(e.currentTarget, btn);
  });

  // Keep title in sync when reason changes
  actReason?.addEventListener("change", () => setModalType(ACT_STATE.type));

  // Close buttons
  document.addEventListener("click", (e) => {
    if (e.target.matches("[data-modal-close]")) closeModal();
    if (e.target.matches("[data-outcome-close]")) closeOutcomeModal();
  });

  // Open modal buttons
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-open-activity]");
    if (!btn) return;
    if (e.target.closest('[contenteditable="true"]')) return;
    openModal(btn.getAttribute("data-open-activity"));
  });

  // Save activity -> drop into dashboard (simple wireframe behavior)
  actPrimaryBtn?.addEventListener("click", () => {
    const type = ACT_STATE.type;
    const reason = actReason?.value || REASONS[0];
    const title = actTitle?.value || "";

    // Try to find dashboard lists (matches your original intent)
    const panels = document.querySelectorAll("#dashboard .panel");
    const meetingsList = panels?.[0]?.querySelector(".list");
    const tasksList = panels?.[1]?.querySelector(".list");

    const targetList = type === "meeting" ? meetingsList : tasksList;
    if (!targetList) {
      window.WF?.showToast?.("Could not find dashboard list");
      closeModal();
      return;
    }

    const item = document.createElement("div");
    item.className = "item";
    item.setAttribute("role", "button");
    item.setAttribute("tabindex", "0");
    item.setAttribute("data-activity-type", type);
    item.innerHTML = `
      <span class="chk" aria-hidden="true" style="${type === "meeting" ? "opacity:0" : ""}"></span>
      <div class="item-main">
        <div class="item-title">${title || (type === "meeting" ? "Meeting" : "Task")}</div>
        <div class="item-meta">${reason}</div>
      </div>
      <div class="item-right">
        <button class="mini right-cta" type="button">${type === "meeting" ? "Prep" : "Done"}</button>
      </div>
    `;

    // Clicking item opens outcome modal (so you can “Mark done”)
    item.addEventListener("click", (ev) => {
      if (ev.target.closest("button")) return;
      openOutcomeModal(item);
    });

    targetList.prepend(item);
    window.WF?.showToast?.("Saved (prototype)");
    closeModal();
  });

  // Save outcome -> remove item (wireframe behavior)
  document.getElementById("outcomeSaveBtn")?.addEventListener("click", () => {
    const el = ACT_STATE.activeItemEl;
    if (el && el.remove) el.remove();
    window.WF?.showToast?.("Marked done (prototype)");
    closeOutcomeModal();
  });

  // Init
  document.addEventListener("DOMContentLoaded", () => {
    fillReasons();
    setModalType("call");
  });
})();
