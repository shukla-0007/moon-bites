async function postJSON(path, body) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return res.json();
}

const responseBox = document.getElementById("response-box");

document.getElementById("btn-surprise").addEventListener("click", async () => {
  const data = await postJSON("/api/surprise", { budget: 300, veg: true });
  responseBox.textContent = JSON.stringify(data, null, 2);
});

document.getElementById("btn-mood").addEventListener("click", async () => {
  const data = await postJSON("/api/mood", { mood: "comfort" });
  responseBox.textContent = JSON.stringify(data, null, 2);
});

document.getElementById("btn-schedule").addEventListener("click", async () => {
  const data = await postJSON("/api/schedule", { time: "13:00", days: ["Mon", "Tue"] });
  responseBox.textContent = JSON.stringify(data, null, 2);
});
