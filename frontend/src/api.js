const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export async function loadProgram(program) {
  try {
    const res = await fetch(`${API_BASE}/load-program`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ program })
    });
    return await res.json();
  } catch (err) {
    return { detail: err.message || "Failed to connect to backend server" };
  }
}

export async function stepCPU() {
  try {
    const res = await fetch(`${API_BASE}/step`, { method: "POST" });
    return await res.json();
  } catch (err) {
    return { detail: err.message || "Execution error" };
  }
}

export async function stepMicroCPU() {
  try {
    const res = await fetch(`${API_BASE}/step-micro`, { method: "POST" });
    return await res.json();
  } catch (err) {
    return { detail: err.message || "Micro-step error" };
  }
}

export async function resetCPU() {
  try {
    const res = await fetch(`${API_BASE}/reset`, { method: "POST" });
    return await res.json();
  } catch (err) {
    return { detail: err.message || "Reset error" };
  }
}

export async function fetchSamples() {
  try {
    const res = await fetch(`${API_BASE}/samples`);
    return await res.json();
  } catch (err) {
    return {};
  }
}

export async function fetchInstructions() {
  try {
    const res = await fetch(`${API_BASE}/instructions`);
    return await res.json();
  } catch (err) {
    return {};
  }
}
