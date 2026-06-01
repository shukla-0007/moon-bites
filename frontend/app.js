/**
 * Moon Bites – frontend/app.js  (Phase 3)
 * Tab navigation, form state, card rendering, API calls.
 * New in Phase 3: save schedules, load saved schedules, history tab, feedback UI.
 */

// ── State ─────────────────────────────────────────────────────────────────
let surpriseVeg  = true;
let surpriseSpice = 1;
let selectedMood = null;
let schedVeg     = true;

// ── Helpers ───────────────────────────────────────────────────────────────
async function postJSON(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const errData = await res.json();
      if (errData && errData.error) {
        errMsg = errData.error;
      } else if (errData && errData.message) {
        errMsg = errData.message;
      }
    } catch (_) {}
    throw new Error(errMsg);
  }
  return res.json();
}

async function getJSON(path) {
  const res = await fetch(path);
  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const errData = await res.json();
      if (errData && errData.message) errMsg = errData.message;
    } catch (_) {}
    throw new Error(errMsg);
  }
  return res.json();
}

async function deleteJSON(path) {
  const res = await fetch(path, { method: "DELETE" });
  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const errData = await res.json();
      if (errData && errData.message) errMsg = errData.message;
    } catch (_) {}
    throw new Error(errMsg);
  }
  return res.json();
}

async function patchJSON(path, body) {
  const res = await fetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const errData = await res.json();
      if (errData && errData.message) errMsg = errData.message;
    } catch (_) {}
    throw new Error(errMsg);
  }
  return res.json();
}

function showLoading(text = "Finding the perfect meal…") {
  const results = document.getElementById("results");
  results.style.display = "block";
  document.getElementById("results-content").innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>${text}</p>
    </div>`;
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showError(msg) {
  document.getElementById("results-content").innerHTML = `
    <div class="error-state">😕 ${msg || "Something went wrong. Try again."}</div>`;
}

function renderStars(rating)     { return `⭐ ${rating.toFixed(1)}`; }
function renderSpice(level)      { return ["","🌶️ Mild","🌶️🌶️ Medium","🌶️🌶️🌶️ Spicy"][level]||""; }
function deliveryMinutes(km)     { return `~${Math.round(km*4+10)} min`; }
function vegDot(isVeg)           { return `<span class="veg-dot ${isVeg?"veg":"nonveg"}"></span>`; }
function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(diff/60000), h = Math.floor(m/60), d = Math.floor(h/24);
  if (d>0) return `${d}d ago`;
  if (h>0) return `${h}h ago`;
  if (m>0) return `${m}m ago`;
  return "just now";
}

// ── Card Renderer ─────────────────────────────────────────────────────────
function renderCard(rec, badgeClass, badgeLabel) {
  const { restaurant, dish, reason } = rec;
  return `
    <div class="result-card ${badgeClass==="top"?"top-pick":""}">
      <span class="card-badge ${badgeClass}">${badgeLabel}</span>
      <div class="card-header">
        <span class="dish-name">${dish.name}</span>
        <span class="dish-price">₹${dish.price}</span>
      </div>
      <p class="restaurant-name">${restaurant.name} &middot; ${restaurant.cuisine}</p>
      <div class="card-meta">
        <span class="meta-pill">${renderStars(restaurant.rating)}</span>
        <span class="meta-pill">📍 ${restaurant.distanceKm} km</span>
        <span class="meta-pill delivery-pill">${deliveryMinutes(restaurant.distanceKm)}</span>
        <span class="meta-pill">${vegDot(dish.isVeg)}</span>
        <span class="meta-pill">${renderSpice(dish.spiceLevel)}</span>
      </div>
      <p class="card-reason">${reason}</p>
    </div>`;
}

function renderSurpriseResult(data) {
  if (!data.pick) { showError(data.message || "No matches found. Adjust filters."); return; }
  let html = `<p class="results-label">Your Pick</p>`;
  html += renderCard(data.pick, "top", "🏆 TOP PICK");
  
  if (data.order) {
    html += `
      <div class="order-placed-card">
        <div class="order-placed-icon">🎉</div>
        <div class="order-placed-details">
          <h4>Order Placed on Swiggy!</h4>
          <p><strong>Order ID:</strong> <code>${data.order.orderId}</code></p>
          <p><strong>Estimated Arrival:</strong> ${data.order.etaMinutes} mins</p>
          <p><strong>Total Bill:</strong> ₹${data.order.billTotal} (incl. taxes & delivery)</p>
          <a href="${data.order.trackUrl}" target="_blank" class="track-link-btn">📍 Track Live Order</a>
        </div>
      </div>`;
  }
  
  if (data.saved) html += `<p class="saved-badge">✓ Saved to order history</p>`;
  html += `<button class="reshuffle-btn" id="btn-reshuffle">🔀 Try Another Surprise</button>`;
  if (data.alternatives?.length) {
    html += `<p class="alt-header">Alternatives</p>`;
    data.alternatives.forEach((alt,i) => { html += renderCard(alt,"alt",`#${i+2}`); });
  }
  document.getElementById("results-content").innerHTML = html;
  document.getElementById("btn-reshuffle").addEventListener("click", () => document.getElementById("btn-surprise").click());
}

function renderMoodResult(data) {
  if (!data.results?.length) { showError(data.message || "No meals found."); return; }
  const label = data.mood.replace("-"," ").replace(/\b\w/g,c=>c.toUpperCase());
  let html = `<p class="results-label">${data.results.length} picks for "${label}"</p>`;
  data.results.forEach((rec,i) => {
    html += renderCard(rec, i===0?"top":"alt", i===0?"🏆 BEST MATCH":`#${i+1}`);
  });
  document.getElementById("results-content").innerHTML = html;
}

function renderScheduleResult(data) {
  if (!data.schedule?.length) { showError(data.message||"Couldn't build a plan."); return; }
  let html = `<div class="week-header"><h3>📅 Your Week Plan</h3><p>${data.schedule.length} day${data.schedule.length>1?"s":""} planned &middot; ${data.schedule[0].time}</p></div>`;
  data.schedule.forEach(meal => {
    const r = meal.recommendation;
    html += `
      <div class="result-card">
        <span class="card-badge day">📅 ${meal.day}</span>
        <div class="card-header">
          <span class="dish-name">${r.dish.name}</span>
          <span class="dish-price">₹${r.dish.price}</span>
        </div>
        <p class="restaurant-name">${r.restaurant.name} &middot; ${r.restaurant.cuisine}</p>
        <div class="card-meta">
          <span class="meta-pill">${renderStars(r.restaurant.rating)}</span>
          <span class="meta-pill">📍 ${r.restaurant.distanceKm} km</span>
          <span class="meta-pill">${vegDot(r.dish.isVeg)}</span>
        </div>
        <p class="card-reason">${r.reason}</p>
      </div>`;
  });
  document.getElementById("results-content").innerHTML = html;
}

// ── History Tab ───────────────────────────────────────────────────────────
async function loadHistory() {
  const list = document.getElementById("history-list");
  list.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Loading…</p></div>`;
  try {
    const data = await getJSON("/api/history");
    if (!data.orders.length) {
      list.innerHTML = `<div class="empty-state"><div class="empty-icon">🍽️</div><p>No orders yet. Use Surprise Me or Mood to get started!</p></div>`;
      return;
    }
    list.innerHTML = data.orders.map(order => buildHistoryCard(order)).join("");
    // Attach feedback handlers
    data.orders.forEach(order => attachFeedbackHandlers(order));
  } catch {
    list.innerHTML = `<div class="error-state">😕 Couldn't load history. Is the backend running?</div>`;
  }
}

function buildHistoryCard(order) {
  const flowLabel = { surprise:"🎲 Surprise", mood:"😊 Mood", schedule:"📅 Schedule", cron:"⚡ Auto" }[order.flow] || order.flow;
  const fb = order.feedback;
  let feedbackHtml = "";

  if (fb) {
    const ratingIcon = fb.rating === "liked" ? "👍" : "👎";
    const tags = fb.tags ? fb.tags.split(",").filter(Boolean) : [];
    feedbackHtml = `
      <div class="feedback-section">
        <div class="feedback-given">
          <span class="rating-icon">${ratingIcon}</span>
          <span>${fb.rating === "liked" ? "You liked this" : "You disliked this"}</span>
          ${tags.map(t=>`<span class="feedback-tag">${t.replace(/_/g," ")}</span>`).join("")}
        </div>
      </div>`;
  } else {
    feedbackHtml = `
      <div class="feedback-section" id="fb-section-${order.id}">
        <p class="fb-label">How was this meal?</p>
        <div class="fb-rating-row">
          <button class="fb-btn liked-btn" data-order="${order.id}" data-rating="liked">👍</button>
          <button class="fb-btn disliked-btn" data-order="${order.id}" data-rating="disliked">👎</button>
        </div>
        <div class="fb-tags" id="fb-tags-${order.id}" style="display:none">
          <button class="fb-tag" data-tag="too_spicy">Too Spicy</button>
          <button class="fb-tag" data-tag="too_oily">Too Oily</button>
          <button class="fb-tag" data-tag="too_expensive">Too Expensive</button>
          <button class="fb-tag" data-tag="perfect">Perfect!</button>
          <button class="fb-tag" data-tag="wrong_order">Wrong Order</button>
        </div>
        <button class="fb-submit" id="fb-submit-${order.id}" data-order="${order.id}" disabled>Submit Rating</button>
      </div>`;
  }

  return `
    <div class="history-card" id="hcard-${order.id}">
      <div class="history-top">
        <span class="history-dish">${order.dishName}</span>
        <span class="history-price">₹${order.dishPrice}</span>
      </div>
      <p class="history-meta">${order.restaurantName}</p>
      <div class="history-footer">
        <span class="history-time">${timeAgo(order.placedAt)}</span>
        <span class="flow-badge ${order.flow}">${flowLabel}</span>
      </div>
      ${feedbackHtml}
    </div>`;
}

function attachFeedbackHandlers(order) {
  if (order.feedback) return; // already rated

  const selectedRatings = new Map(); // orderId → rating
  const selectedTags    = new Map(); // orderId → Set<tag>
  selectedTags.set(order.id, new Set());

  // Rating buttons
  document.querySelectorAll(`.fb-btn[data-order="${order.id}"]`).forEach(btn => {
    btn.addEventListener("click", () => {
      selectedRatings.set(order.id, btn.dataset.rating);
      document.querySelectorAll(`.fb-btn[data-order="${order.id}"]`).forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      // Show tags
      const tagsEl = document.getElementById(`fb-tags-${order.id}`);
      if (tagsEl) tagsEl.style.display = "flex";
      // Enable submit
      const submitEl = document.getElementById(`fb-submit-${order.id}`);
      if (submitEl) submitEl.disabled = false;
    });
  });

  // Tag chips
  const tagsContainer = document.getElementById(`fb-tags-${order.id}`);
  if (tagsContainer) {
    tagsContainer.querySelectorAll(".fb-tag").forEach(tag => {
      tag.addEventListener("click", () => {
        const t = tag.dataset.tag;
        const set = selectedTags.get(order.id);
        if (set.has(t)) { set.delete(t); tag.classList.remove("selected"); }
        else { set.add(t); tag.classList.add("selected"); }
      });
    });
  }

  // Submit
  const submitBtn = document.getElementById(`fb-submit-${order.id}`);
  if (submitBtn) {
    submitBtn.addEventListener("click", async () => {
      const rating = selectedRatings.get(order.id);
      const tags   = [...(selectedTags.get(order.id) || [])];
      if (!rating) return;
      submitBtn.disabled = true;
      submitBtn.textContent = "Saving…";
      try {
        await postJSON("/api/feedback", { orderHistoryId: order.id, rating, tags });
        const section = document.getElementById(`fb-section-${order.id}`);
        if (section) {
          const icon = rating === "liked" ? "👍" : "👎";
          const tagHtml = tags.map(t=>`<span class="feedback-tag">${t.replace(/_/g," ")}</span>`).join("");
          section.innerHTML = `<div class="feedback-given"><span class="rating-icon">${icon}</span><span>Feedback saved!</span>${tagHtml}</div>`;
        }
      } catch {
        submitBtn.disabled = false;
        submitBtn.textContent = "Try again";
      }
    });
  }
}

// ── Saved Schedules ───────────────────────────────────────────────────────
async function loadSavedSchedules() {
  try {
    const data = await getJSON("/api/schedules");
    const section = document.getElementById("saved-schedules-section");
    const list    = document.getElementById("saved-schedules-list");

    if (!data.schedules.length) {
      section.style.display = "none";
      return;
    }
    section.style.display = "block";
    list.innerHTML = data.schedules.map(s => buildScheduleItem(s)).join("");
    data.schedules.forEach(s => attachScheduleHandlers(s));
  } catch { /* silent — history won't show */ }
}

function buildScheduleItem(s) {
  const isActive = s.active;
  const days = s.days.split(",").join(" · ");
  return `
    <div class="saved-schedule-item ${isActive?"active-item":"paused-item"}" id="sitem-${s.id}">
      <span class="active-dot ${isActive?"on":"off"}"></span>
      <div class="sched-info">
        <p class="sched-name">${s.label}</p>
        <p class="sched-meta">⏰ ${s.time} &nbsp;·&nbsp; ${days} &nbsp;·&nbsp; ₹${s.budget} &nbsp;·&nbsp; ${s.veg?"🌿":"🍗"}</p>
      </div>
      <div class="sched-actions">
        <button class="icon-btn" title="${isActive?"Pause":"Activate"}" data-sched-id="${s.id}" data-toggle="${!isActive}">${isActive?"⏸":"▶️"}</button>
        <button class="icon-btn danger" title="Delete" data-sched-delete="${s.id}">🗑</button>
      </div>
    </div>`;
}

function attachScheduleHandlers(s) {
  // Toggle active
  const toggleBtn = document.querySelector(`[data-sched-id="${s.id}"]`);
  if (toggleBtn) {
    toggleBtn.addEventListener("click", async () => {
      const newActive = toggleBtn.dataset.toggle === "true";
      try {
        await patchJSON(`/api/schedules/${s.id}`, { active: newActive });
        loadSavedSchedules(); // refresh
      } catch { alert("Could not update schedule."); }
    });
  }

  // Delete
  const deleteBtn = document.querySelector(`[data-sched-delete="${s.id}"]`);
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      if (!confirm(`Delete "${s.label}"?`)) return;
      try {
        await deleteJSON(`/api/schedules/${s.id}`);
        document.getElementById(`sitem-${s.id}`)?.remove();
        const list = document.getElementById("saved-schedules-list");
        if (!list?.children.length) document.getElementById("saved-schedules-section").style.display = "none";
      } catch { alert("Could not delete schedule."); }
    });
  }
}

// ── Tab Switching ─────────────────────────────────────────────────────────
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll(".tab-btn").forEach(b => { b.classList.remove("active"); b.setAttribute("aria-selected","false"); });
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    btn.setAttribute("aria-selected","true");
    document.getElementById(`tab-${tab}`).classList.add("active");
    document.getElementById("results").style.display = "none";
    if (tab === "history") loadHistory();
    if (tab === "schedule") loadSavedSchedules();
  });
});

// ── Surprise Controls ─────────────────────────────────────────────────────
const budgetSlider  = document.getElementById("budget-slider");
const budgetDisplay = document.getElementById("budget-display");
budgetSlider.addEventListener("input", () => { budgetDisplay.textContent = `₹${budgetSlider.value}`; });

document.getElementById("toggle-veg").addEventListener("click", () => {
  surpriseVeg = true;
  document.getElementById("toggle-veg").classList.add("active");
  document.getElementById("toggle-nonveg").classList.remove("active");
});
document.getElementById("toggle-nonveg").addEventListener("click", () => {
  surpriseVeg = false;
  document.getElementById("toggle-nonveg").classList.add("active");
  document.getElementById("toggle-veg").classList.remove("active");
});

document.querySelectorAll(".spice-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    surpriseSpice = Number(btn.dataset.level);
    document.querySelectorAll(".spice-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// ── Mood Controls ─────────────────────────────────────────────────────────
document.querySelectorAll(".mood-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    selectedMood = chip.dataset.mood;
    document.querySelectorAll(".mood-chip").forEach(c => c.classList.remove("selected"));
    chip.classList.add("selected");
    const btn = document.getElementById("btn-mood");
    btn.disabled = false;
    btn.setAttribute("aria-disabled","false");
  });
});

// ── Schedule Controls ─────────────────────────────────────────────────────
const schedBudgetSlider  = document.getElementById("sched-budget");
const schedBudgetDisplay = document.getElementById("sched-budget-display");
schedBudgetSlider.addEventListener("input", () => { schedBudgetDisplay.textContent = `₹${schedBudgetSlider.value}`; });

document.querySelector(".sched-veg").addEventListener("click", () => {
  schedVeg = true;
  document.querySelector(".sched-veg").classList.add("active");
  document.querySelector(".sched-nonveg").classList.remove("active");
});
document.querySelector(".sched-nonveg").addEventListener("click", () => {
  schedVeg = false;
  document.querySelector(".sched-nonveg").classList.add("active");
  document.querySelector(".sched-veg").classList.remove("active");
});

function getScheduleFormData() {
  const days = Array.from(document.querySelectorAll(".days-grid input:checked")).map(el => el.value);
  return {
    label:  document.getElementById("sched-label").value.trim() || "My Meal Plan",
    time:   document.getElementById("schedule-time").value,
    days,
    budget: Number(schedBudgetSlider.value),
    veg:    schedVeg,
  };
}

// ── API Button Handlers ───────────────────────────────────────────────────
document.getElementById("btn-surprise").addEventListener("click", async () => {
  showLoading("Picking your surprise…");
  try {
    const data = await postJSON("/api/surprise", { budget: Number(budgetSlider.value), veg: surpriseVeg, spiceLevel: surpriseSpice });
    renderSurpriseResult(data);
  } catch (err) { showError(err.message || "Couldn't reach the server."); }
});

document.getElementById("btn-mood").addEventListener("click", async () => {
  if (!selectedMood) return;
  showLoading("Matching your mood…");
  try {
    const data = await postJSON("/api/mood", { mood: selectedMood });
    renderMoodResult(data);
  } catch (err) { showError(err.message || "Couldn't reach the server."); }
});

// Preview plan (one-shot, no save)
document.getElementById("btn-schedule").addEventListener("click", async () => {
  const { days, time, budget, veg } = getScheduleFormData();
  if (!days.length) { document.getElementById("results").style.display="block"; showError("Select at least one day."); return; }
  showLoading(`Building your ${days.length}-day meal plan…`);
  try {
    const data = await postJSON("/api/schedule", { time, days, budget, veg });
    renderScheduleResult(data);
  } catch (err) { showError(err.message || "Couldn't reach the server."); }
});

// Save & Activate schedule (persists to DB, starts cron job)
document.getElementById("btn-save-schedule").addEventListener("click", async () => {
  const form = getScheduleFormData();
  if (!form.days.length) { alert("Please select at least one day."); return; }
  const btn = document.getElementById("btn-save-schedule");
  btn.disabled = true;
  btn.textContent = "Saving…";
  try {
    await postJSON("/api/schedules", form);
    btn.textContent = "✅ Saved!";
    loadSavedSchedules();
    setTimeout(() => { btn.textContent = "💾 Save & Activate"; btn.disabled = false; }, 2000);
  } catch {
    btn.textContent = "💾 Save & Activate";
    btn.disabled = false;
    alert("Could not save the schedule.");
  }
});

// History refresh button
document.getElementById("btn-refresh-history").addEventListener("click", loadHistory);

// Auto-load saved schedules when schedule tab is the default open tab
// (it's not the default, but init history early so the tab feels snappy)
window.addEventListener("load", () => {
  loadSavedSchedules();
});
