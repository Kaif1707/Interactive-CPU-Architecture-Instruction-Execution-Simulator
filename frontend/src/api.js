const API_BASE = "http://127.0.0.1:8000";

export async function loadProgram(program) {
  const res = await fetch(`${API_BASE}/load-program`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ program })
  });
  return res.json();
}

export async function stepCPU() {
  const res = await fetch(`${API_BASE}/step`, { method: "POST" });
  return res.json();
}

export async function resetCPU() {
  const res = await fetch(`${API_BASE}/reset`, { method: "POST" });
  return res.json();
}
