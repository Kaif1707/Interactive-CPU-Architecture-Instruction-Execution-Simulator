"""
Instruction Definitions for the CPU Simulator.
Defines supported 8-bit assembly instructions, opcodes, operand types, and micro-operation stages.
"""

from typing import List, Dict, Any, Optional

class Instruction:
    """Base class for assembly instructions."""
    def __init__(self, opcode: str, operands: List[str], line_num: int = 0, raw_text: str = ""):
        self.opcode = opcode.upper()
        self.operands = operands
        self.line_num = line_num
        self.raw_text = raw_text or f"{opcode} {' '.join(operands)}".strip()

    def get_control_signals(self) -> Dict[str, bool]:
        """Returns standard CPU control signals for visualization."""
        return {
            "RegWrite": False,
            "ALUSrc": False,
            "MemRead": False,
            "MemWrite": False,
            "MemToReg": False,
            "Branch": False,
            "Jump": False
        }

    def get_micro_stages(self) -> List[Dict[str, str]]:
        """Returns step-by-step 5-stage pipeline micro-operations."""
        return [
            {"stage": "FETCH", "description": f"Fetch instruction '{self.raw_text}' from memory at PC"},
            {"stage": "DECODE", "description": f"Decode opcode {self.opcode} and read operand registers"},
            {"stage": "EXECUTE", "description": "Execute operation in ALU or compute address"},
            {"stage": "MEMORY", "description": "Access memory if load/store/stack operation"},
            {"stage": "WRITEBACK", "description": "Write result back to target register or flags"}
        ]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "opcode": self.opcode,
            "operands": self.operands,
            "line_num": self.line_num,
            "raw_text": self.raw_text,
            "control_signals": self.get_control_signals()
        }

# Supported opcodes dictionary with metadata
SUPPORTED_INSTRUCTIONS = {
    # Data Transfer
    "LOAD": {"args": 2, "category": "Data Transfer", "doc": "LOAD Reg, Imm | LOAD Reg, [Addr] - Load value into register"},
    "STORE": {"args": 2, "category": "Data Transfer", "doc": "STORE Reg, Addr | STORE Reg, [Addr] - Store register value to memory"},
    "MOV": {"args": 2, "category": "Data Transfer", "doc": "MOV Reg1, Reg2 | MOV Reg, Imm - Copy value into register"},
    "PUSH": {"args": 1, "category": "Stack", "doc": "PUSH Reg | PUSH Imm - Push 8-bit value onto stack"},
    "POP": {"args": 1, "category": "Stack", "doc": "POP Reg - Pop top stack value into register"},

    # Arithmetic
    "ADD": {"args": 2, "category": "Arithmetic", "doc": "ADD Reg1, Reg2 | ADD Reg, Imm - Add second operand to first"},
    "SUB": {"args": 2, "category": "Arithmetic", "doc": "SUB Reg1, Reg2 | SUB Reg, Imm - Subtract second operand from first"},
    "MUL": {"args": 2, "category": "Arithmetic", "doc": "MUL Reg1, Reg2 - Multiply two registers"},
    "DIV": {"args": 2, "category": "Arithmetic", "doc": "DIV Reg1, Reg2 - Divide Reg1 by Reg2"},
    "INC": {"args": 1, "category": "Arithmetic", "doc": "INC Reg - Increment register by 1"},
    "DEC": {"args": 1, "category": "Arithmetic", "doc": "DEC Reg - Decrement register by 1"},

    # Logic & Bitwise
    "CMP": {"args": 2, "category": "Logic", "doc": "CMP Reg1, Reg2 | CMP Reg, Imm - Compare two values and set flags"},
    "AND": {"args": 2, "category": "Logic", "doc": "AND Reg1, Reg2 - Bitwise AND"},
    "OR": {"args": 2, "category": "Logic", "doc": "OR Reg1, Reg2 - Bitwise OR"},
    "XOR": {"args": 2, "category": "Logic", "doc": "XOR Reg1, Reg2 - Bitwise XOR"},
    "NOT": {"args": 1, "category": "Logic", "doc": "NOT Reg - Bitwise NOT (invert bits)"},
    "SHL": {"args": 2, "category": "Logic", "doc": "SHL Reg, ShiftAmt - Shift left logical"},
    "SHR": {"args": 2, "category": "Logic", "doc": "SHR Reg, ShiftAmt - Shift right logical"},

    # Control Flow
    "JMP": {"args": 1, "category": "Control Flow", "doc": "JMP Target - Unconditional jump to address/label"},
    "JZ": {"args": 1, "category": "Control Flow", "doc": "JZ Target - Jump to address/label if Zero flag is set"},
    "JNZ": {"args": 1, "category": "Control Flow", "doc": "JNZ Target - Jump to address/label if Zero flag is not set"},
    "CALL": {"args": 1, "category": "Control Flow", "doc": "CALL Target - Call subroutine (push return address & jump)"},
    "RET": {"args": 0, "category": "Control Flow", "doc": "RET - Return from subroutine (pop return address into PC)"},

    # System
    "NOP": {"args": 0, "category": "System", "doc": "NOP - No operation (consumes 1 cycle)"},
    "HLT": {"args": 0, "category": "System", "doc": "HLT - Halt CPU execution"}
}
