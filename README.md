# 🧠 Interactive CPU Architecture & Instruction Execution Simulator

[![Python](https://img.shields.io/badge/Backend-Python%203.10%2B-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/Framework-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Build%20Tool-Vite%207-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Monaco Editor](https://img.shields.io/badge/Editor-Monaco%20Editor-007ACC?logo=visualstudiocode&logoColor=white)](https://microsoft.github.io/monaco-editor/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An interactive, university-grade **8-Bit RISC CPU Architecture Simulator and Microarchitecture Laboratory**. Built for Computer Science undergraduate education, assembly visualization, and microarchitecture exploration. Demonstrates real-time 5-stage instruction pipelining (**Fetch $\rightarrow$ Decode $\rightarrow$ Execute $\rightarrow$ Memory $\rightarrow$ Write Back**), register banks, status condition flags (`Z`, `C`, `N`, `V`), call stack tracking, and hardware performance profiling.

---

## 🌐 Live Demo & API Documentation

- 🖥️ **Interactive Frontend Dashboard**: [https://cpu-execution-simulator.vercel.app](https://cpu-execution-simulator.vercel.app)
- ⚙️ **FastAPI Backend Server**: [https://cpu-execution-simulator.onrender.com](https://cpu-execution-simulator.onrender.com)
- 📖 **Interactive Swagger OpenAPI Docs**: [https://cpu-execution-simulator.onrender.com/docs](https://cpu-execution-simulator.onrender.com/docs)

---

## ✨ Key Features & Architecture Highlights

### ⚡ Animated 5-Stage RISC Pipeline
- **Fetch (IF)**: Retrieve raw 8-bit instruction opcode and operands from memory address at `PC`.
- **Decode (ID)**: Resolve register operands (`R0`–`R7`, `SP`, `ACC`), decode opcode, and activate control buses.
- **Execute (EX)**: Perform arithmetic/bitwise operations in the ALU or compute memory jump targets.
- **Memory Access (MEM)**: Perform 256-byte RAM reads/writes and call stack frame shifts.
- **Write Back (WB)**: Commit final execution results into destination registers and status flags.

### 🧮 Hardware Components & Panels
- **Register Bank**: General-purpose registers `R0`–`R7`, Special registers `PC` (Program Counter), `IR` (Instruction Register), `SP` (Stack Pointer), and `ACC` (Accumulator) with Old $\rightarrow$ New animated change flashes and Dec/Hex/Bin toggles.
- **Status Flag Register**: Condition flags **Zero (`Z`)**, **Carry (`C`)**, **Negative (`N`)**, and **Overflow (`V`)**.
- **256-Byte RAM Memory System**: Interactive memory array (0x00 to 0xFF) with memory access pulse indicators for active reads and writes.
- **Visual Call Stack**: Dedicated stack frame visualizer tracking `SP` operations (`PUSH`, `POP`, `CALL`, `RET`).
- **Monaco Code Editor**: VS Code Monaco integration with custom assembly syntax highlighting, line execution decorations, error markers, and autocompletion.
- **Hardware Telemetry Profiler**: Real-time CPI (Cycles Per Instruction), clock cycle counter, memory read/write counters, and ALU operation counters.

---

## 🏛️ System Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                        VS Code Inspired Engineering UI (React 19)                 |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|  | Monaco Code Editor |  | 5-Stage Pipeline   |  | CPU Core Dashboard          |  |
|  | (Syntax, Errors,   |  | (Fetch->Decode->   |  | Registers (R0-R7, PC, SP)   |  |
|  | Breakpoints, PC)   |  | Exec->Mem->WB)     |  | Flags (Z, C, N, V)          |  |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|  +--------------------------------------------+  +-----------------------------+  |
|  | Interactive Memory & Stack Grid (Hex/Bin)  |  | Performance Stats & Control |  |
|  +--------------------------------------------+  +-----------------------------+  |
+-----------------------------------------------------------------------------------+
                                        | REST API (FastAPI)
                                        v
+-----------------------------------------------------------------------------------+
|                             Modular Python Execution Engine                       |
|  +--------------+  +--------------+  +---------------+  +---------------------+   |
|  | Assembler    |  | ALU Core     |  | Control Unit  |  | Memory & Stack System|   |
|  | & Parser     |  | (Flags/Ops)  |  | (5-Stage F-W) |  | (RAM 256-Byte Array)|   |
|  +--------------+  +--------------+  +---------------+  +---------------------+   |
+-----------------------------------------------------------------------------------+
```

---

## 📜 Supported Assembly Instruction Set Architecture (23 Instructions)

| Category | Opcodes | Description |
| :--- | :--- | :--- |
| **Data Transfer** | `LOAD`, `STORE`, `MOV` | Load immediate/RAM values, store register to RAM, copy registers. |
| **Stack Operations** | `PUSH`, `POP` | Push values onto stack frame (0xFF downwards) / pop into target register. |
| **Arithmetic** | `ADD`, `SUB`, `MUL`, `DIV`, `INC`, `DEC` | 8-bit unsigned/signed arithmetic with full condition flag updates (`Z`, `C`, `N`, `V`). |
| **Logic & Bitwise** | `CMP`, `AND`, `OR`, `XOR`, `NOT`, `SHL`, `SHR` | Bitwise logical operations, comparisons, and shift operations. |
| **Control Flow** | `JMP`, `JZ`, `JNZ`, `CALL`, `RET` | Unconditional/conditional jumps, label resolution, subroutine call and return. |
| **System** | `NOP`, `HLT` | No operation delay / halt CPU clock execution. |

---

## 🛠️ Local Development & Quick Start

### 1️⃣ Clone Repository
```bash
git clone https://github.com/Kaif1707/Interactive-CPU-Architecture-Instruction-Execution-Simulator.git
cd Interactive-CPU-Architecture-Instruction-Execution-Simulator
```

### 2️⃣ Backend Setup (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python tests/run_tests.py
python -m uvicorn main:app --reload --port 8000
```
Backend server will start at: `http://127.0.0.1:8000`

### 3️⃣ Frontend Setup (React + Vite)
```bash
cd ../frontend
npm install
npm run dev
```
Frontend app will start at: `http://localhost:5173`

---

## 🧪 Running Automated Unit Tests

```bash
cd backend
python tests/run_tests.py
```

Output:
```
......
----------------------------------------------------------------------
Ran 6 tests in 0.001s

OK
```

---

## 📄 License

This project is open-source and released under the **MIT License**.

---
**Created by Kaif Khan** • [GitHub Profile](https://github.com/Kaif1707)
