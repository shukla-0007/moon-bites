/**
 * Moon Bites – frontend/app.js  (Phase 2)
 * Tab navigation + form state + card rendering + API calls
 */

// ── State ─────────────────────────────────────────────────────────────────
let surpriseVeg = true;
let surpriseSpice = 1;
let selectedMood = null;
let schedVeg = true;

// ── Helpers ───────────────────────────────────────────────────────────────
async function postJSON(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
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

function renderStars(rating) {
  return `⭐ ${rating.toFixed(1)}`;
}

function renderSpice(level) {
  return ["", "🌶️ Mild", "🌶️🌶️ Medium", "🌶️🌶️🌶️ Spicy"][level] || "";
}

function deliveryMinutes(distanceKm) {
  return `~${Math.round(distanceKm * 4 + 10)} min`;
}

function vegDot(isVeg) {
  return `<span class="veg-dot ${isVeg ? "veg" : "nonveg"}"></span>`;
}

// ── Card Renderer ─────────────────────────────────────────────────────────
function renderCard(rec, badgeClass, badgeLabel) {
  const { restaurant, dish, reason } = rec;
  return `
    <div class="result-card ${badgeClass === "top" ? "top-pick" : ""}">
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

// ── Surprise Result ───────────────────────────────────────────────────────
function renderSurpriseResult(data) {
  if (!data.pick) {
    showError(data.message || "No matches found. Try adjusting your filters.");
    return;
  }

  let html = `<p class="results-label">Your Pick</p>`;
  html += renderCard(data.pick, "top", "🏆 TOP PICK");

  if (data.saved) {
    html += `<p class="saved-badge">✓ Saved to your order history</p>`;
  }

  html += `<button class="reshuffle-btn" id="btn-reshuffle">🔀 Try Another Surprise</button>`;

  if (data.alternatives && data.alternatives.length > 0) {
    html += `<p class="alt-header">Alternatives</p>`;
    data.alternatives.forEach((alt, i) => {
      html += renderCard(alt, "alt", `#${i + 2}`);
    });
  }

  document.getElementById("results-content").innerHTML = html;

  document.getElementById("btn-reshuffle").addEventListener("click", () => {
    document.getElementById("btn-surprise").click();
  });
}

// ── Mood Result ───────────────────────────────────────────────────────────
function renderMoodResult(data) {
  if (!data.results || data.results.length === 0) {
    showError(data.message || "No meals found for this mood.");
    return;
  }

  const moodLabel = data.mood.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
  let html = `<p class="results-label">${data.results.length} picks for "${moodLabel}"</p>`;
  data.results.forEach((rec, i) => {
    const isTop = i === 0;
    html += renderCard(rec, isTop ? "top" : "alt", isTop ? "🏆 BEST MATCH" : `#${i + 1}`);
  });

  document.getElementById("results-content").innerHTML = html;
}

// ── Schedule Result ───────────────────────────────────────────────────────
function renderScheduleResult(data) {
  if (!data.schedule || data.schedule.length === 0) {
    showError(data.message || "Could not build a schedule with these constraints.");
    return;
  }

  let html = `
    <div class="week-header">
      <h3>📅 Your Week Plan</h3>
      <p>${data.schedule.length} day${data.schedule.length > 1 ? "s" : ""} planned &middot; ${data.schedule[0].time}</p>
    </div>`;

  data.schedule.forEach((meal) => {
    const { day, recommendation: rec } = meal;
    html += `
      <div class="result-card">
        <span class="card-badge day">📅 ${day}</span>
        <div class="card-header">
          <span class="dish-name">${rec.dish.name}</span>
          <span class="dish-price">₹${rec.dish.price}</span>
        </div>
        <p class="restaurant-name">${rec.restaurant.name} &middot; ${rec.restaurant.cuisine}</p>
        <div class="card-meta">
          <span class="meta-pill">${renderStars(rec.restaurant.rating)}</span>
          <span class="meta-pill">📍 ${rec.restaurant.distanceKm} km</span>
          <span class="meta-pill delivery-pill">${deliveryMinutes(rec.restaurant.distanceKm)}</span>
          <span class="meta-pill">${vegDot(rec.dish.isVeg)}</span>
        </div>
        <p class="card-reason">${rec.reason}</p>
      </div>`;
  });

  document.getElementById("results-content").innerHTML = html;
}

// ── Tab Switching ─────────────────────────────────────────────────────────
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll(".tab-btn").forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    document.getElementById(`tab-${tab}`).classList.add("active");
    document.getElementById("results").style.display = "none";
  });
});

// ── Surprise Me Controls ──────────────────────────────────────────────────
const budgetSlider   = document.getElementById("budget-slider");
const budgetDisplay  = document.getElementById("budget-display");

budgetSlider.addEventListener("input", () => {
  budgetDisplay.textContent = `₹${budgetSlider.value}`;
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

document.querySelectorAll(".spice-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    surpriseSpice = Number(btn.dataset.level);
    document.querySelectorAll(".spice-btn").forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-pressed", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-pressed", "true");
  });
});

// ── Mood Controls ─────────────────────────────────────────────────────────
document.querySelectorAll(".mood-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    selectedMood = chip.dataset.mood;
    document.querySelectorAll(".mood-chip").forEach((c) => c.classList.remove("selected"));
    chip.classList.add("selected");
    const moodBtn = document.getElementById("btn-mood");
    moodBtn.disabled = false;
    moodBtn.setAttribute("aria-disabled", "false");
  });
});

// ── Schedule Controls ─────────────────────────────────────────────────────
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

// ── API Button Handlers ───────────────────────────────────────────────────
document.getElementById("btn-surprise").addEventListener("click", async () => {
  showLoading("Picking your surprise…");
  try {
    const data = await postJSON("/api/surprise", {
      budget: Number(budgetSlider.value),
      veg: surpriseVeg,
      spiceLevel: surpriseSpice,
    });
    renderSurpriseResult(data);
  } catch {
    showError("Couldn't reach the server. Is the backend running?");
  }
});

document.getElementById("btn-mood").addEventListener("click", async () => {
  if (!selectedMood) return;
  showLoading("Matching your mood to the best meals…");
  try {
    const data = await postJSON("/api/mood", { mood: selectedMood });
    renderMoodResult(data);
  } catch {
    showError("Couldn't reach the server. Is the backend running?");
  }
});

document.getElementById("btn-schedule").addEventListener("click", async () => {
  const days = Array.from(
    document.querySelectorAll(".days-grid input:checked")
  ).map((el) => el.value);

  if (days.length === 0) {
    document.getElementById("results").style.display = "block";
    showError("Please select at least one day to plan.");
    return;
  }

  showLoading(`Building your ${days.length}-day meal plan…`);
  try {
    const data = await postJSON("/api/schedule", {
      time: document.getElementById("schedule-time").value,
      days,
      budget: Number(schedBudgetSlider.value),
      veg: schedVeg,
    });
    renderScheduleResult(data);
  } catch {
    showError("Couldn't reach the server. Is the backend running?");
  }
});
