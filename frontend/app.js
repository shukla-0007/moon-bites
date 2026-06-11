/**
 * Mood Bites – frontend/app.js  (Phase 5.5)
 * Swiggy-grade UI: toast notifications, skeleton loaders, CTA loading states,
 * quick filter wiring, stagger card animations, bottom nav tab switching.
 */

// ── App State ──────────────────────────────────────────────────────────────
let surpriseVeg   = true;
let surpriseSpice = 1;
let selectedMood  = null;
let schedVeg      = true;

// ── XSS Sanitization Helper ────────────────────────────────────────────────
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ── HTTP Helpers ───────────────────────────────────────────────────────────
async function postJSON(path, body) {
  const res = await fetch(path, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const d = await res.json(); msg = d.error || d.message || msg; } catch (_) {}
    throw new Error(msg);
  }
  return res.json();
}

async function getJSON(path) {
  const res = await fetch(path);
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const d = await res.json(); msg = d.message || msg; } catch (_) {}
    throw new Error(msg);
  }
  return res.json();
}

async function deleteJSON(path) {
  const res = await fetch(path, { method: "DELETE" });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const d = await res.json(); msg = d.message || msg; } catch (_) {}
    throw new Error(msg);
  }
  return res.json();
}

async function patchJSON(path, body) {
  const res = await fetch(path, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const d = await res.json(); msg = d.message || msg; } catch (_) {}
    throw new Error(msg);
  }
  return res.json();
}

// ── Toast Notifications ────────────────────────────────────────────────────
const TOAST_ICONS = { success: "✅", error: "⚠️", info: "ℹ️" };

function showToast(message, type = "success", duration = 3200) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${TOAST_ICONS[type] || "ℹ️"}</span><span class="toast-message-text"></span>`;
  toast.querySelector(".toast-message-text").textContent = message;
  container.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });

  // Animate out + remove
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

// ── CTA Loading State ──────────────────────────────────────────────────────
/**
 * Sets a button into a loading state and returns a restore function.
 * @param {HTMLButtonElement} btn
 * @param {string} loadingText - Text to show while loading
 * @returns {Function} Restore function — call when done
 */
function setCtaLoading(btn, loadingText = "Loading…") {
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.classList.add("loading");
  btn.innerHTML = `<span class="btn-spinner"></span>${loadingText}`;
  return () => {
    btn.disabled = false;
    btn.classList.remove("loading");
    btn.innerHTML = originalHTML;
  };
}

// ── Skeleton Loader ────────────────────────────────────────────────────────
function showSkeletonLoader(count = 2) {
  const results = document.getElementById("results");
  results.style.display = "block";
  let html = "";
  for (let i = 0; i < count; i++) {
    html += `
      <div class="skeleton-card">
        <div class="skel-left">
          <div class="skel" style="height:10px;width:50%"></div>
          <div class="skel" style="height:18px;width:80%"></div>
          <div class="skel" style="height:13px;width:60%"></div>
          <div class="skel" style="height:11px;width:90%;margin-top:4px"></div>
          <div class="skel" style="height:11px;width:70%"></div>
        </div>
        <div class="skel skel-right"></div>
      </div>`;
  }
  document.getElementById("results-content").innerHTML = html;
  results.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ── Standard Loading & Error ───────────────────────────────────────────────
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
  document.getElementById("results").style.display = "block";
  document.getElementById("results-content").innerHTML = `
    <div class="error-state">😕 ${msg || "Something went wrong. Please try again."}</div>`;
}

// ── Render Helpers ─────────────────────────────────────────────────────────
function renderStars(rating)  { return `<span class="rating-badge">★ ${rating.toFixed(1)}</span>`; }
function renderSpice(level)   { return ["","🌶️ Mild","🌶️🌶️ Medium","🌶️🌶️🌶️ Spicy"][level] || ""; }
function deliveryMinutes(km)  { return `~${Math.round(km * 4 + 10)} min`; }
function vegDot(isVeg)        { return `<span class="veg-dot ${isVeg ? "veg" : "nonveg"}"></span>`; }

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const m = Math.floor(diff / 60000), h = Math.floor(m / 60), d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return "just now";
}

// ── Dish Image Config (emoji + gradient per cuisine/dish) ──────────────────
function getDishImageConfig(dishName, tags, cuisine) {
  const n = dishName.toLowerCase();
  const t = (tags || []).join(" ").toLowerCase();
  const c = (cuisine || "").toLowerCase();

  if (n.includes("biryani") || t.includes("biryani"))
    return { gradient: "linear-gradient(135deg,#fff2eb,#ffdcd0)", border: "#ffc2b2", emoji: "🍛" };
  if (n.includes("pizza") || t.includes("pizza"))
    return { gradient: "linear-gradient(135deg,#fff7eb,#ffe9cc)", border: "#ffd49f", emoji: "🍕" };
  if (n.includes("burger") || t.includes("burger"))
    return { gradient: "linear-gradient(135deg,#f4fbeb,#e0f6ca)", border: "#cbe8ae", emoji: "🍔" };
  if (n.includes("salad") || n.includes("bowl") || t.includes("salad") || t.includes("healthy"))
    return { gradient: "linear-gradient(135deg,#edfbf3,#caf5dc)", border: "#acecc5", emoji: "🥗" };
  if (n.includes("pasta") || n.includes("noodle") || n.includes("spaghetti"))
    return { gradient: "linear-gradient(135deg,#fef9ee,#fdecd0)", border: "#fbd9a2", emoji: "🍝" };
  if (n.includes("paneer") || n.includes("dal") || n.includes("chole") || n.includes("curry") || c.includes("north indian"))
    return { gradient: "linear-gradient(135deg,#fffbeb,#fff2be)", border: "#ffe69d", emoji: "🍲" };
  if (n.includes("dosa") || n.includes("idli") || n.includes("vada") || c.includes("south"))
    return { gradient: "linear-gradient(135deg,#fbf7ee,#eee1cf)", border: "#dfcfb9", emoji: "🥞" };
  if (n.includes("egg") || n.includes("omelette"))
    return { gradient: "linear-gradient(135deg,#fbfbef,#f6f6d0)", border: "#ebd6b3", emoji: "🍳" };
  if (n.includes("chicken") || n.includes("kebab") || n.includes("tikka"))
    return { gradient: "linear-gradient(135deg,#fff0eb,#ffd8cc)", border: "#ffb8a2", emoji: "🍗" };
  if (n.includes("sandwich") || n.includes("wrap"))
    return { gradient: "linear-gradient(135deg,#f8fff0,#e4f9cc)", border: "#c8f0a0", emoji: "🥪" };
  return { gradient: "linear-gradient(135deg,#f4f5f8,#e9e9eb)", border: "#d3d3d7", emoji: "🍽️" };
}

// ── One-Click Dish Ordering ────────────────────────────────────────────────
async function orderSpecificDish(dishId, dishName) {
  showSkeletonLoader(1);
  showToast(`Ordering ${dishName}…`, "info", 2000);
  try {
    const data = await postJSON("/api/surprise", {
      budget: 800,
      veg: false,
      retryDishId: dishId
    });
    renderSurpriseResult(data);
  } catch (err) {
    showError(err.message || "Couldn't place order.");
    showToast("Order failed. Please retry.", "error");
  }
}

// Expose to global scope for inline onclick attributes
window.orderSpecificDish = orderSpecificDish;

// ── Card Renderer (Swiggy Split Format) ───────────────────────────────────
function renderCard(rec, badgeClass, badgeLabel, index = 0) {
  const { restaurant, dish, reason } = rec;
  const img = getDishImageConfig(dish.name, dish.tags, restaurant.cuisine);
  const safeName = dish.name.replace(/'/g, "\\'").replace(/"/g, "&quot;");

  return `
    <div class="result-card" style="animation-delay:${index * 80}ms">
      <div class="card-left">
        <div style="display:flex;align-items:center;gap:8px">
          ${vegDot(dish.isVeg)}
          ${badgeLabel ? `<span class="card-badge ${escapeHtml(badgeClass)}">${escapeHtml(badgeLabel)}</span>` : ""}
        </div>
        <span class="dish-name">${escapeHtml(dish.name)}</span>
        <span class="dish-price">₹${escapeHtml(dish.price)}</span>
        <div class="restaurant-name">${escapeHtml(restaurant.name)} &middot; ${escapeHtml(restaurant.cuisine)}</div>
        <div class="card-meta">
          <span class="meta-pill">${renderStars(restaurant.rating)}</span>
          <span class="meta-pill">📍 ${escapeHtml(restaurant.distanceKm)} km</span>
          <span class="meta-pill delivery-pill">${deliveryMinutes(restaurant.distanceKm)}</span>
          <span class="meta-pill">${renderSpice(dish.spiceLevel)}</span>
        </div>
        <p class="card-reason">${escapeHtml(reason)}</p>
      </div>
      <div class="card-right">
        <div class="dish-image-box"
          style="background:${img.gradient};border-color:${img.border}">
          ${img.emoji}
        </div>
        <button class="dish-order-btn"
          onclick="orderSpecificDish('${escapeHtml(dish.id)}','${safeName}')"
          title="Order ${escapeHtml(dish.name)} now">
          + ORDER
        </button>
      </div>
    </div>`;
}

// ── Surprise Me Result ─────────────────────────────────────────────────────
function renderSurpriseResult(data) {
  if (!data.pick) { showError(data.message || "No matches found. Try adjusting filters."); return; }

  let html = `<p class="results-label">Your Pick</p>`;
  html += renderCard(data.pick, "top", "🏆 TOP PICK", 0);

  if (data.order) {
    const subtotal    = data.pick.dish.price;
    const delivery    = 30;
    const packaging   = 15;
    const tax         = Math.round(subtotal * 0.05);
    const total       = subtotal + delivery + packaging + tax;

    const safeTrackUrl = (data.order.trackUrl && (data.order.trackUrl.startsWith("http://") || data.order.trackUrl.startsWith("https://")))
      ? escapeHtml(data.order.trackUrl)
      : "#";

    html += `
      <div class="order-placed-card">
        <div class="success-banner">
          <div class="success-icon-badge">✓</div>
          <span class="success-title">Order Placed on Swiggy!</span>
        </div>

        <div class="order-progress-bar">
          <div class="progress-line-fill"></div>
          <div class="progress-step completed">
            <div class="step-dot"></div>
            <span class="step-label">Ordered</span>
          </div>
          <div class="progress-step active">
            <div class="step-dot"></div>
            <span class="step-label">Preparing</span>
          </div>
          <div class="progress-step">
            <div class="step-dot"></div>
            <span class="step-label">Arriving</span>
          </div>
        </div>

        <div class="receipt-details">
          <div class="receipt-row">
            <span class="receipt-item-name">${escapeHtml(data.pick.dish.name)}</span>
            <span>₹${subtotal}</span>
          </div>
          <div class="receipt-row">
            <span>Delivery Partner Fee</span><span>₹${delivery}</span>
          </div>
          <div class="receipt-row">
            <span>Restaurant Packaging</span><span>₹${packaging}</span>
          </div>
          <div class="receipt-row">
            <span>GST &amp; Taxes</span><span>₹${tax}</span>
          </div>
          <div class="receipt-row total">
            <span>Bill Total</span><span>₹${total}</span>
          </div>
        </div>

        <div style="margin-bottom:16px;font-size:13px;color:var(--text-2)">
          <p style="margin-bottom:4px"><strong>Order ID:</strong> <code>${escapeHtml(data.order.orderId)}</code></p>
          <p><strong>ETA:</strong> ${escapeHtml(data.order.etaMinutes)} mins</p>
        </div>

        <a href="${safeTrackUrl}" target="_blank" rel="noopener" class="track-link-btn">
          📍 Track Live Order
        </a>
      </div>`;

  } else if (data.error) {
    html += `
      <div class="checkout-failed-card">
        <div class="failed-banner">
          <div class="failed-icon-badge">⚠️</div>
          <span class="failed-title">Checkout Failed</span>
        </div>
        <div class="checkout-failed-details">
          <p class="error-msg">Swiggy MCP error: <strong>${escapeHtml(data.error)}</strong>. Your pick is saved — retry below.</p>
          <button class="retry-checkout-btn" id="btn-retry-checkout" data-dish-id="${escapeHtml(data.pick.dish.id)}">
            🔄 Retry Checkout
          </button>
        </div>
      </div>`;
  }

  if (data.saved) html += `<p class="saved-badge">✅ Saved to order history</p>`;

  html += `<button class="reshuffle-btn" id="btn-reshuffle">🔀 Try Another Surprise</button>`;

  if (data.alternatives?.length) {
    html += `<p class="alt-header">You Might Also Like</p>`;
    data.alternatives.forEach((alt, i) => { html += renderCard(alt, "alt", `#${i + 2}`, i + 1); });
  }

  document.getElementById("results-content").innerHTML = html;

  // Wire reshuffle
  document.getElementById("btn-reshuffle")?.addEventListener("click", () => {
    document.getElementById("btn-surprise").click();
  });

  // Wire retry
  const retryBtn = document.getElementById("btn-retry-checkout");
  if (retryBtn) {
    retryBtn.addEventListener("click", async () => {
      const dishId  = retryBtn.getAttribute("data-dish-id");
      const restore = setCtaLoading(retryBtn, "Retrying…");
      try {
        const d = await postJSON("/api/surprise", {
          budget: Number(document.getElementById("budget-slider").value),
          veg: surpriseVeg,
          spiceLevel: surpriseSpice,
          retryDishId: dishId
        });
        renderSurpriseResult(d);
        showToast("Order placed!", "success");
      } catch (err) {
        restore();
        showError(err.message || "Couldn't reach server.");
        showToast("Retry failed — please try again.", "error");
      }
    });
  }

  // Toast on success
  if (data.order) {
    showToast(`🎉 ${data.pick.dish.name} ordered!`, "success");
  }
}

// ── Mood Result ────────────────────────────────────────────────────────────
function renderMoodResult(data) {
  if (!data.results?.length) { showError(data.message || "No meals found for this mood."); return; }
  const label = data.mood.replace("-", " ").replace(/\b\w/g, c => c.toUpperCase());
  let html = `<p class="results-label">${data.results.length} picks for "${label}"</p>`;
  data.results.forEach((rec, i) => {
    html += renderCard(rec, i === 0 ? "top" : "alt", i === 0 ? "🏆 BEST MATCH" : `#${i + 1}`, i);
  });
  document.getElementById("results-content").innerHTML = html;
}

// ── Schedule Preview Result ────────────────────────────────────────────────
function renderScheduleResult(data) {
  if (!data.schedule?.length) { showError(data.message || "Couldn't build a plan."); return; }
  let html = `
    <div class="week-header">
      <h3>📅 Your Week Plan</h3>
      <p>${escapeHtml(data.schedule.length)} meal${data.schedule.length > 1 ? "s" : ""} planned &middot; ${escapeHtml(data.schedule[0].time)}</p>
    </div>`;
  data.schedule.forEach((meal, i) => {
    const r   = meal.recommendation;
    const img = getDishImageConfig(r.dish.name, r.dish.tags, r.restaurant.cuisine);
    html += `
      <div class="result-card" style="animation-delay:${i * 80}ms">
        <div class="card-left">
          <span class="card-badge day">📅 ${escapeHtml(meal.day)}</span>
          <span class="dish-name">${escapeHtml(r.dish.name)}</span>
          <span class="dish-price">₹${escapeHtml(r.dish.price)}</span>
          <div class="restaurant-name">${escapeHtml(r.restaurant.name)} &middot; ${escapeHtml(r.restaurant.cuisine)}</div>
          <div class="card-meta">
            <span class="meta-pill">${renderStars(r.restaurant.rating)}</span>
            <span class="meta-pill">📍 ${escapeHtml(r.restaurant.distanceKm)} km</span>
            <span class="meta-pill">${vegDot(r.dish.isVeg)}</span>
          </div>
          <p class="card-reason">${escapeHtml(r.reason)}</p>
        </div>
        <div class="card-right">
          <div class="dish-image-box" style="background:${img.gradient};border-color:${img.border}">
            ${img.emoji}
          </div>
        </div>
      </div>`;
  });
  document.getElementById("results-content").innerHTML = html;
}

// ── History Tab ────────────────────────────────────────────────────────────
async function loadHistory() {
  const list = document.getElementById("history-list");
  list.innerHTML = `
    <div class="skeleton-card" style="margin:0 18px 10px">
      <div class="skel-left">
        <div class="skel" style="height:16px;width:70%"></div>
        <div class="skel" style="height:12px;width:50%"></div>
        <div class="skel" style="height:11px;width:80%"></div>
      </div>
    </div>
    <div class="skeleton-card" style="margin:0 18px 10px">
      <div class="skel-left">
        <div class="skel" style="height:16px;width:65%"></div>
        <div class="skel" style="height:12px;width:45%"></div>
        <div class="skel" style="height:11px;width:75%"></div>
      </div>
    </div>`;

  try {
    const data = await getJSON("/api/history");
    if (!data.orders.length) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🍽️</div>
          <p>No orders yet. Use Surprise Me or Moods to get started!</p>
        </div>`;
      return;
    }
    list.innerHTML = data.orders.map(order => buildHistoryCard(order)).join("");
    data.orders.forEach(order => attachFeedbackHandlers(order));
  } catch {
    list.innerHTML = `<div class="error-state">😕 Couldn't load history. Is the backend running?</div>`;
  }
}

function buildHistoryCard(order) {
  const flowLabel = {
    surprise: "🎲 Surprise",
    mood:     "😊 Mood",
    schedule: "📅 Schedule",
    cron:     "⚡ Auto"
  }[order.flow] || order.flow;

  const fb = order.feedback;
  let feedbackHtml = "";

  if (fb) {
    const icon = fb.rating === "liked" ? "👍" : "👎";
    const tags = fb.tags ? fb.tags.split(",").filter(Boolean) : [];
    feedbackHtml = `
      <div class="feedback-section">
        <div class="feedback-given">
          <span class="rating-icon">${icon}</span>
          <span>${fb.rating === "liked" ? "You liked this" : "You disliked this"}</span>
          ${tags.map(t => `<span class="feedback-tag">${escapeHtml(t.replace(/_/g, " "))}</span>`).join("")}
        </div>
      </div>`;
  } else {
    feedbackHtml = `
      <div class="feedback-section" id="fb-section-${escapeHtml(order.id)}">
        <p class="fb-label">How was this meal?</p>
        <div class="fb-rating-row">
          <button class="fb-btn liked-btn" data-order="${escapeHtml(order.id)}" data-rating="liked">👍</button>
          <button class="fb-btn disliked-btn" data-order="${escapeHtml(order.id)}" data-rating="disliked">👎</button>
        </div>
        <div class="fb-tags" id="fb-tags-${escapeHtml(order.id)}" style="display:none">
          <button class="fb-tag" data-tag="too_spicy">Too Spicy</button>
          <button class="fb-tag" data-tag="too_oily">Too Oily</button>
          <button class="fb-tag" data-tag="too_expensive">Too Expensive</button>
          <button class="fb-tag" data-tag="perfect">Perfect!</button>
          <button class="fb-tag" data-tag="wrong_order">Wrong Order</button>
        </div>
        <button class="fb-submit" id="fb-submit-${escapeHtml(order.id)}" data-order="${escapeHtml(order.id)}" disabled>Submit Rating</button>
      </div>`;
  }

  return `
    <div class="history-card" id="hcard-${escapeHtml(order.id)}">
      <div class="history-top">
        <span class="history-dish">${escapeHtml(order.dishName)}</span>
        <span class="history-price">₹${escapeHtml(order.dishPrice)}</span>
      </div>
      <p class="history-meta">${escapeHtml(order.restaurantName)}</p>
      <div class="history-footer">
        <span class="history-time">${timeAgo(order.placedAt)}</span>
        <span class="flow-badge ${escapeHtml(order.flow)}">${escapeHtml(flowLabel)}</span>
      </div>
      ${feedbackHtml}
    </div>`;
}

function attachFeedbackHandlers(order) {
  if (order.feedback) return;

  const selectedRatings = new Map();
  const selectedTags    = new Map();
  selectedTags.set(order.id, new Set());

  document.querySelectorAll(`.fb-btn[data-order="${order.id}"]`).forEach(btn => {
    btn.addEventListener("click", () => {
      selectedRatings.set(order.id, btn.dataset.rating);
      document.querySelectorAll(`.fb-btn[data-order="${order.id}"]`).forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      document.getElementById(`fb-tags-${order.id}`)?.style.setProperty("display", "flex");
      const submit = document.getElementById(`fb-submit-${order.id}`);
      if (submit) submit.disabled = false;
    });
  });

  document.getElementById(`fb-tags-${order.id}`)?.querySelectorAll(".fb-tag").forEach(tag => {
    tag.addEventListener("click", () => {
      const set = selectedTags.get(order.id);
      if (set.has(tag.dataset.tag)) { set.delete(tag.dataset.tag); tag.classList.remove("selected"); }
      else { set.add(tag.dataset.tag); tag.classList.add("selected"); }
    });
  });

  const submit = document.getElementById(`fb-submit-${order.id}`);
  if (submit) {
    submit.addEventListener("click", async () => {
      const rating = selectedRatings.get(order.id);
      const tags   = [...(selectedTags.get(order.id) || [])];
      if (!rating) return;

      const restore = setCtaLoading(submit, "Saving…");
      try {
        await postJSON("/api/feedback", { orderHistoryId: order.id, rating, tags });
        const section = document.getElementById(`fb-section-${order.id}`);
        if (section) {
          const icon    = rating === "liked" ? "👍" : "👎";
          const tagHtml = tags.map(t => `<span class="feedback-tag">${t.replace(/_/g, " ")}</span>`).join("");
          section.innerHTML = `<div class="feedback-given"><span class="rating-icon">${icon}</span><span>Feedback saved!</span>${tagHtml}</div>`;
        }
        showToast("Feedback saved! We'll use this to improve your picks.", "success");
      } catch {
        restore();
        submit.textContent = "Try again";
        showToast("Couldn't save feedback.", "error");
      }
    });
  }
}

// ── Saved Schedules ────────────────────────────────────────────────────────
async function loadSavedSchedules() {
  try {
    const data    = await getJSON("/api/schedules");
    const section = document.getElementById("saved-schedules-section");
    const list    = document.getElementById("saved-schedules-list");

    if (!data.schedules.length) { section.style.display = "none"; return; }

    section.style.display = "block";
    list.innerHTML = data.schedules.map(s => buildScheduleItem(s)).join("");
    data.schedules.forEach(s => attachScheduleHandlers(s));
  } catch { /* silent */ }
}

function buildScheduleItem(s) {
  const isActive = s.active;
  const days     = s.days.split(",").join(" · ");
  return `
    <div class="saved-schedule-item ${isActive ? "active-item" : "paused-item"}" id="sitem-${escapeHtml(s.id)}">
      <span class="active-dot ${isActive ? "on" : "off"}"></span>
      <div class="sched-info">
        <p class="sched-name">${escapeHtml(s.label)}</p>
        <p class="sched-meta">⏰ ${escapeHtml(s.time)} &nbsp;·&nbsp; ${escapeHtml(days)} &nbsp;·&nbsp; ₹${escapeHtml(s.budget)} &nbsp;·&nbsp; ${s.veg ? "🌿" : "🍗"}</p>
      </div>
      <div class="sched-actions">
        <button class="icon-btn" title="${isActive ? "Pause" : "Activate"}"
          data-sched-id="${escapeHtml(s.id)}" data-toggle="${!isActive}">${isActive ? "⏸" : "▶️"}</button>
        <button class="icon-btn danger" title="Delete" data-sched-delete="${escapeHtml(s.id)}">🗑</button>
      </div>
    </div>`;
}

function attachScheduleHandlers(s) {
  const toggleBtn = document.querySelector(`[data-sched-id="${s.id}"]`);
  if (toggleBtn) {
    toggleBtn.addEventListener("click", async () => {
      const newActive = toggleBtn.dataset.toggle === "true";
      try {
        await patchJSON(`/api/schedules/${s.id}`, { active: newActive });
        showToast(newActive ? "Schedule activated!" : "Schedule paused.", "info");
        loadSavedSchedules();
      } catch { showToast("Couldn't update schedule.", "error"); }
    });
  }

  const deleteBtn = document.querySelector(`[data-sched-delete="${s.id}"]`);
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      if (!confirm(`Delete "${s.label}"?`)) return;
      try {
        await deleteJSON(`/api/schedules/${s.id}`);
        document.getElementById(`sitem-${s.id}`)?.remove();
        const list = document.getElementById("saved-schedules-list");
        if (!list?.children.length) document.getElementById("saved-schedules-section").style.display = "none";
        showToast("Schedule deleted.", "info");
      } catch { showToast("Couldn't delete schedule.", "error"); }
    });
  }
}

// ── Quick Filter Pills ─────────────────────────────────────────────────────
const budgetSlider  = document.getElementById("budget-slider");
const budgetDisplay = document.getElementById("budget-display");

document.getElementById("quick-filters")?.addEventListener("click", (e) => {
  const pill   = e.target.closest(".filter-pill");
  if (!pill) return;

  // Toggle active state
  document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
  pill.classList.add("active");

  // Pre-fill form and auto-trigger
  const filter = pill.dataset.filter;

  if (filter === "veg") {
    // Set veg
    surpriseVeg = true;
    document.getElementById("toggle-veg").classList.add("active");
    document.getElementById("toggle-nonveg").classList.remove("active");
  }
  if (filter === "budget") {
    // Set budget to ₹150
    budgetSlider.value   = 150;
    budgetDisplay.textContent = "₹150";
  }
  if (filter === "fast") {
    // Shorter delivery = nearby = lower budget cap
    budgetSlider.value   = 250;
    budgetDisplay.textContent = "₹250";
  }

  // Auto-trigger surprise
  setTimeout(() => document.getElementById("btn-surprise").click(), 120);
});

// ── Tab Switching (Bottom Nav) ─────────────────────────────────────────────
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;

    document.querySelectorAll(".nav-btn").forEach(b => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));

    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    document.getElementById(`tab-${tab}`)?.classList.add("active");
    document.getElementById("results").style.display = "none";

    // Lazy load data on tab switch
    if (tab === "history")  loadHistory();
    if (tab === "schedule") loadSavedSchedules();

    // Scroll to top of content on tab switch
    document.getElementById("scroll-area")?.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// ── Surprise Controls ──────────────────────────────────────────────────────
budgetSlider.addEventListener("input", () => {
  budgetDisplay.textContent = `₹${budgetSlider.value}`;
  // Clear quick filter active state if user manually adjusts
  document.querySelectorAll(".filter-pill").forEach(p => p.classList.remove("active"));
});

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

// ── Mood Controls ──────────────────────────────────────────────────────────
document.querySelectorAll(".mood-chip").forEach(chip => {
  chip.addEventListener("click", () => {
    selectedMood = chip.dataset.mood;
    document.querySelectorAll(".mood-chip").forEach(c => c.classList.remove("selected"));
    chip.classList.add("selected");
    const btn = document.getElementById("btn-mood");
    btn.disabled = false;
    btn.setAttribute("aria-disabled", "false");
  });
});

// ── Schedule Controls ──────────────────────────────────────────────────────
const schedBudgetSlider  = document.getElementById("sched-budget");
const schedBudgetDisplay = document.getElementById("sched-budget-display");

schedBudgetSlider.addEventListener("input", () => {
  schedBudgetDisplay.textContent = `₹${schedBudgetSlider.value}`;
});

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

// ── API Button Handlers ────────────────────────────────────────────────────

// Surprise Me
document.getElementById("btn-surprise").addEventListener("click", async () => {
  const btn     = document.getElementById("btn-surprise");
  const restore = setCtaLoading(btn, "Finding your pick…");
  showSkeletonLoader(2);
  try {
    const data = await postJSON("/api/surprise", {
      budget:     Number(budgetSlider.value),
      veg:        surpriseVeg,
      spiceLevel: surpriseSpice
    });
    renderSurpriseResult(data);
  } catch (err) {
    showError(err.message || "Couldn't reach the server.");
    showToast("Request failed. Is the server running?", "error");
  } finally {
    restore();
  }
});

// Mood
document.getElementById("btn-mood").addEventListener("click", async () => {
  if (!selectedMood) return;
  const btn     = document.getElementById("btn-mood");
  const restore = setCtaLoading(btn, "Matching your mood…");
  showSkeletonLoader(3);
  try {
    const data = await postJSON("/api/mood", { mood: selectedMood });
    renderMoodResult(data);
  } catch (err) {
    showError(err.message || "Couldn't reach the server.");
    showToast("Request failed.", "error");
  } finally {
    restore();
  }
});

// Preview plan (no save)
document.getElementById("btn-schedule").addEventListener("click", async () => {
  const { days, time, budget, veg } = getScheduleFormData();
  if (!days.length) { showError("Please select at least one day."); return; }
  const btn     = document.getElementById("btn-schedule");
  const restore = setCtaLoading(btn, "Building plan…");
  showSkeletonLoader(days.length);
  try {
    const data = await postJSON("/api/schedule", { time, days, budget, veg });
    renderScheduleResult(data);
  } catch (err) {
    showError(err.message || "Couldn't reach the server.");
    showToast("Preview failed.", "error");
  } finally {
    restore();
  }
});

// Save & Activate schedule
document.getElementById("btn-save-schedule").addEventListener("click", async () => {
  const form = getScheduleFormData();
  if (!form.days.length) { alert("Please select at least one day."); return; }
  const btn     = document.getElementById("btn-save-schedule");
  const restore = setCtaLoading(btn, "Saving…");
  try {
    await postJSON("/api/schedules", form);
    showToast("📅 Schedule activated! Meals will be auto-ordered.", "success");
    loadSavedSchedules();
    setTimeout(() => restore(), 1200);
  } catch {
    restore();
    showToast("Could not save the schedule.", "error");
  }
});

// History refresh
document.getElementById("btn-refresh-history").addEventListener("click", loadHistory);

// ── Initialisation ─────────────────────────────────────────────────────────
window.addEventListener("load", () => {
  // Pre-load saved schedules in background so schedule tab feels instant
  loadSavedSchedules();
});
