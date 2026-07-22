"""
FastAPI Backend Application for CPU Simulator.
Exposes REST endpoints for program loading, step-by-step pipeline execution, state reset, and sample programs.
"""

from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from cpu.cpu import CPU
from cpu.parser import ParseError
from cpu.instructions import SUPPORTED_INSTRUCTIONS

app = FastAPI(
    title="CPU Execution Simulator API",
    description="Interactive Computer Architecture & 8-bit CPU Instruction Simulator API",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global CPU instance
cpu = CPU()
loaded_program: List[str] = []

class ProgramInput(BaseModel):
    program: List[str] = Field(..., description="List of assembly instructions")

# Preset sample programs for CS learning
SAMPLE_PROGRAMS = {
    "fibonacci": {
        "title": "Fibonacci Sequence Generator",
        "code": """# Generate first 6 terms of Fibonacci Sequence
# Store terms starting at Memory Address 10
LOAD R0, 0     ; Term 1 = 0
LOAD R1, 1     ; Term 2 = 1
STORE R0, 10   ; Store 0 at Addr 10
STORE R1, 11   ; Store 1 at Addr 11

LOAD R2, 12    ; Target Mem Address
LOAD R3, 4     ; Loop counter (4 remaining terms)

LOOP:
LOAD R4, R0    ; R4 = R0
ADD R4, R1     ; R4 = R0 + R1
STORE R4, [R2] ; Store term at RAM[R2]
MOV R0, R1     ; Shift term 1
MOV R1, R4     ; Shift term 2
INC R2         ; Next RAM address
DEC R3         ; Decrement loop counter
JNZ LOOP       ; Loop if counter != 0
HLT"""
    },
    "subroutine": {
        "title": "Subroutine Call & Stack Operation",
        "code": """# Demonstrate CALL, RET, PUSH, POP
LOAD R0, 5
LOAD R1, 10
CALL MULTIPLY_ADD
STORE R0, 30
HLT

MULTIPLY_ADD:
PUSH R1        ; Save R1 on stack
MUL R0, R1     ; R0 = 5 * 10 = 50
INC R0         ; R0 = 51
POP R1         ; Restore R1 from stack
RET"""
    },
    "factorial": {
        "title": "Factorial Calculation (5!)",
        "code": """# Calculate 5! = 120
LOAD R0, 5     ; Target number N = 5
LOAD R1, 1     ; Result accumulator = 1

FACT_LOOP:
CMP R0, 1      ; Compare R0 with 1
JZ DONE        ; If N <= 1, finished
MUL R1, R0     ; Result = Result * N
DEC R0         ; N = N - 1
JMP FACT_LOOP

DONE:
STORE R1, 50   ; Store 120 at Address 50
HLT"""
    },
    "bitwise": {
        "title": "Bitwise Operations & Flags",
        "code": """# Bitwise AND, OR, XOR, NOT, Shift
LOAD R0, 0b11001100
LOAD R1, 0b10101010
AND R0, R1     ; R0 = 0b10001000 (136)
OR  R0, R1     ; R0 = 0b11101010 (234)
XOR R0, R1     ; Bitwise XOR
SHL R0, 2      ; Shift Left by 2
NOT R0         ; Invert bits
HLT"""
    }
}

@app.get("/")
def root():
    return {
        "name": "CPU Architecture & Instruction Simulator API",
        "version": "2.0.0",
        "status": "Online",
        "supported_instructions": list(SUPPORTED_INSTRUCTIONS.keys())
    }

@app.post("/load-program")
def load_program(data: ProgramInput):
    global loaded_program
    if not data.program:
        raise HTTPException(status_code=400, detail="Program cannot be empty")

    try:
        loaded_program = data.program
        count, labels = cpu.load_program(loaded_program)
        return {
            "status": "Program loaded successfully",
            "instruction_count": count,
            "labels": labels,
            "state": cpu.get_state()
        }
    except ParseError as pe:
        raise HTTPException(status_code=422, detail={"line": pe.line_num, "message": pe.message})
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/step")
def step_instruction():
    """Executes 1 full instruction across all pipeline stages."""
    if not cpu.instructions:
        raise HTTPException(status_code=400, detail="No program loaded in CPU")

    if not cpu.running or cpu.halted:
        return {"status": "Program execution completed", "state": cpu.get_state()}

    try:
        state = cpu.step_instruction()
        return {"status": "Stepped 1 Instruction", "state": state}
    except RuntimeError as re:
        raise HTTPException(status_code=400, detail=str(re))

@app.post("/step-micro")
def step_micro_stage():
    """Advances 1 single micro-operation stage (FETCH -> DECODE -> EXECUTE -> MEMORY -> WRITEBACK)."""
    if not cpu.instructions:
        raise HTTPException(status_code=400, detail="No program loaded in CPU")

    try:
        state = cpu.step_stage()
        return {"status": "Stepped 1 Stage", "state": state}
    except RuntimeError as re:
        raise HTTPException(status_code=400, detail=str(re))

@app.post("/reset")
def reset_cpu():
    cpu.reset()
    return {"status": "CPU state reset to default", "state": cpu.get_state()}

@app.get("/samples")
def get_samples():
    return SAMPLE_PROGRAMS

@app.get("/instructions")
def get_instruction_set():
    return SUPPORTED_INSTRUCTIONS
