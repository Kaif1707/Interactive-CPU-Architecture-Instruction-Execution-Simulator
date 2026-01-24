# 🧠 Visual CPU Execution Simulator

A **full-stack, cloud-deployed CPU execution simulator** that visually demonstrates how a CPU executes instructions step by step. This project is designed to help students and enthusiasts deeply understand **Computer Organization & Architecture** concepts by seeing registers, memory, and execution flow in real time.

---

## 🚀 Live Demo

- **Frontend (Vercel)**: https://cpu-execution-simulator.vercel.app
- **Backend API (Render)**: https://cpu-execution-simulator.onrender.com
- **API Docs (Swagger UI)**: https://cpu-execution-simulator.onrender.com/docs

---

## ✨ Features

- 📝 Program editor for assembly-like instructions
- ▶️ Step-by-step CPU execution
- 🧮 Register state visualization
- 🧠 Memory updates after each instruction
- 📜 Execution timeline (instruction history)
- 🔁 Reset and reload program functionality
- 🌐 Fully deployed (frontend + backend separated)

---

## 🧾 Supported Instructions

```
LOAD Rn value     # Load immediate value into register
ADD  Rn Rm        # Add two registers
STORE Rn address  # Store register value into memory
```

> Example Program:
```
LOAD R1 5
LOAD R2 10
ADD R1 R2
STORE R1 20
```

---

## 🏗️ Architecture Overview

```
Browser (User)
   ↓
React + Vite (Frontend)
   ↓ REST API
FastAPI (Backend)
   ↓
CPU Execution Engine (Python)
```

---

## 🛠️ Tech Stack

### Frontend
- ⚛️ React
- ⚡ Vite
- 🌐 Fetch API
- ☁️ Deployed on **Vercel**

### Backend
- 🐍 Python
- 🚀 FastAPI
- 🔁 Uvicorn
- ☁️ Deployed on **Render**

---

## 🧑‍💻 Local Development

### 1️⃣ Clone Repository
```bash
git clone https://github.com/Kaif1707/cpu-execution-simulator.git
cd cpu-execution-simulator
```

### 2️⃣ Backend Setup
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload
```

Backend will run at:
```
http://127.0.0.1:8000
```

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend will run at:
```
http://localhost:5173
```

---

## 📚 Learning Outcomes

- Deep understanding of **CPU instruction execution**
- Practical exposure to **registers & memory management**
- Hands-on experience with **REST APIs**
- Real-world **full-stack deployment workflow**
- Cloud hosting using **Vercel & Render**

---

## 🔮 Future Enhancements

- 🧩 Instruction pipelining visualization
- 🛑 Breakpoints & execution pause
- 🎨 Instruction highlighting
- 📈 Performance metrics
- 🧠 More instruction types (SUB, MUL, JMP)

---

## 👤 Author

**Kaif Khan**  
- GitHub: https://github.com/Kaif1707

---

## ⭐ If you like this project

Give it a **star ⭐** and feel free to fork, explore, or extend it!

