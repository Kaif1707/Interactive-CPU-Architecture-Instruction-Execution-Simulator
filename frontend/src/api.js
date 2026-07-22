import { clientCPU } from './simulatorEngine';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://cpu-execution-simulator.onrender.com";

let useFallback = false;

// Helper to attempt fetch with timeout
async function fetchWithTimeout(url, options = {}, timeoutMs = 3500) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export async function loadProgram(program) {
  if (!useFallback) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/load-program`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program })
      }, 3500);

      if (res.ok) {
        return await res.json();
      } else {
        const errorData = await res.json();
        return errorData;
      }
    } catch (err) {
      console.warn("Backend unavailable or spinning up on Render free tier. Switching to client-side CPU engine fallback:", err.message);
      useFallback = true;
    }
  }

  // Fallback to client-side CPU simulation engine
  try {
    const res = clientCPU.loadProgram(program);
    return {
      status: "Loaded (Client Engine Fallback)",
      instruction_count: res.count,
      labels: res.labels,
      state: clientCPU.getState()
    };
  } catch (err) {
    return { detail: err };
  }
}

export async function stepCPU() {
  if (!useFallback) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/step`, { method: "POST" }, 3000);
      if (res.ok) return await res.json();
    } catch (err) {
      useFallback = true;
    }
  }
  return { status: "Stepped 1 Instruction", state: clientCPU.stepInstruction() };
}

export async function stepMicroCPU() {
  if (!useFallback) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/step-micro`, { method: "POST" }, 3000);
      if (res.ok) return await res.json();
    } catch (err) {
      useFallback = true;
    }
  }
  return { status: "Stepped 1 Stage", state: clientCPU.stepStage() };
}

export async function resetCPU() {
  if (!useFallback) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/reset`, { method: "POST" }, 3000);
      if (res.ok) return await res.json();
    } catch (err) {
      useFallback = true;
    }
  }
  clientCPU.reset();
  return { status: "CPU state reset", state: clientCPU.getState() };
}

export async function fetchSamples() {
  if (!useFallback) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/samples`, {}, 2500);
      if (res.ok) return await res.json();
    } catch (err) {}
  }
  // Default Client Samples
  return {
    "fibonacci": {
      "title": "Fibonacci Sequence Generator",
      "code": `LOAD R0, 0     ; Term 1 = 0
LOAD R1, 1     ; Term 2 = 1
STORE R0, 10   ; Store 0 at Addr 10
STORE R1, 11   ; Store 1 at Addr 11

LOAD R2, 12    ; Target Mem Address
LOAD R3, 4     ; Loop counter

LOOP:
LOAD R4, R0    ; R4 = R0
ADD R4, R1     ; R4 = R0 + R1
STORE R4, [R2] ; Store term
MOV R0, R1     ; Shift term 1
MOV R1, R4     ; Shift term 2
INC R2         ; Next RAM address
DEC R3         ; Decrement loop counter
JNZ LOOP       ; Loop if counter != 0
HLT`
    },
    "subroutine": {
      "title": "Subroutine Call & Stack",
      "code": `LOAD R0, 5
LOAD R1, 10
CALL MULTIPLY_ADD
STORE R0, 30
HLT

MULTIPLY_ADD:
PUSH R1        ; Save R1 on stack
MUL R0, R1     ; R0 = 5 * 10 = 50
INC R0         ; R0 = 51
POP R1         ; Restore R1
RET`
    },
    "factorial": {
      "title": "Factorial Calculation (5!)",
      "code": `LOAD R0, 5     ; Target N = 5
LOAD R1, 1     ; Result accumulator = 1

FACT_LOOP:
CMP R0, 1      ; Compare R0 with 1
JZ DONE        ; Finish if N <= 1
MUL R1, R0     ; Result = Result * N
DEC R0         ; N = N - 1
JMP FACT_LOOP

DONE:
STORE R1, 50   ; Store 120 at Address 50
HLT`
    }
  };
}

export async function fetchInstructions() {
  return {
    "LOAD": { "args": 2, "category": "Data Transfer", "doc": "LOAD Reg, Imm | LOAD Reg, [Addr] - Load value into register" },
    "STORE": { "args": 2, "category": "Data Transfer", "doc": "STORE Reg, Addr | STORE Reg, [Addr] - Store register value to RAM" },
    "MOV": { "args": 2, "category": "Data Transfer", "doc": "MOV Reg1, Reg2 | MOV Reg, Imm - Copy value into register" },
    "PUSH": { "args": 1, "category": "Stack", "doc": "PUSH Reg | PUSH Imm - Push value onto stack" },
    "POP": { "args": 1, "category": "Stack", "doc": "POP Reg - Pop stack value into register" },
    "ADD": { "args": 2, "category": "Arithmetic", "doc": "ADD Reg1, Reg2 - Add second operand to first" },
    "SUB": { "args": 2, "category": "Arithmetic", "doc": "SUB Reg1, Reg2 - Subtract second operand from first" },
    "MUL": { "args": 2, "category": "Arithmetic", "doc": "MUL Reg1, Reg2 - Multiply two registers" },
    "DIV": { "args": 2, "category": "Arithmetic", "doc": "DIV Reg1, Reg2 - Divide Reg1 by Reg2" },
    "INC": { "args": 1, "category": "Arithmetic", "doc": "INC Reg - Increment register by 1" },
    "DEC": { "args": 1, "category": "Arithmetic", "doc": "DEC Reg - Decrement register by 1" },
    "CMP": { "args": 2, "category": "Logic", "doc": "CMP Reg1, Reg2 - Compare values and set flags" },
    "JMP": { "args": 1, "category": "Control Flow", "doc": "JMP Target - Unconditional jump" },
    "JZ": { "args": 1, "category": "Control Flow", "doc": "JZ Target - Jump if Zero flag is set" },
    "JNZ": { "args": 1, "category": "Control Flow", "doc": "JNZ Target - Jump if Zero flag is not set" },
    "CALL": { "args": 1, "category": "Control Flow", "doc": "CALL Target - Call subroutine" },
    "RET": { "args": 0, "category": "Control Flow", "doc": "RET - Return from subroutine" },
    "NOP": { "args": 0, "category": "System", "doc": "NOP - No operation" },
    "HLT": { "args": 0, "category": "System", "doc": "HLT - Halt CPU execution" }
  };
}
