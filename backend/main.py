from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from cpu.cpu import CPU

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProgramInput(BaseModel):
    program: list[str]

cpu = CPU()
program = []
step_counter = 0
MAX_STEPS = 500


@app.post("/load-program")
def load_program(data: ProgramInput):
    global cpu, program, step_counter
    if not data.program:
        raise HTTPException(status_code=400, detail="Program cannot be empty")

    program = data.program
    cpu = CPU()
    step_counter = 0
    return {"status": "Program loaded", "lines": len(program)}


@app.post("/step")
def step():
    global step_counter

    if not program:
        raise HTTPException(status_code=400, detail="No program loaded")

    if not cpu.running or step_counter >= MAX_STEPS:
        return {"status": "Program finished"}

    try:
        instr = cpu.fetch(program)
        if instr:
            cpu.execute(instr)
            state = cpu.get_state(step_counter)
            step_counter += 1
            return state
        return {"status": "No instruction"}

    except RuntimeError as e:
        cpu.running = False
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/reset")
def reset():
    global cpu, step_counter
    cpu = CPU()
    step_counter = 0
    return {"status": "CPU reset"}
