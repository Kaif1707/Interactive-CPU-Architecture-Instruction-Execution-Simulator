"""
CPU Execution Engine for 8-bit Simulator.
Features:
- Registers: R0-R7, PC (Program Counter), IR (Instruction Register), SP (Stack Pointer), ACC (Accumulator)
- Status Flags: Z (Zero), C (Carry), N (Negative), V (Overflow)
- Memory System: 256-byte RAM (0x00 to 0xFF)
- Stack operations growing downwards from 0xFF
- 5-stage Pipeline simulation (FETCH, DECODE, EXECUTE, MEMORY, WRITEBACK)
- Execution Telemetry (Cycles, Instruction Counter, CPI, Memory Reads/Writes, ALU Ops)
"""

from typing import List, Dict, Any, Optional
from cpu.memory import Memory
from cpu.alu import ALU
from cpu.instructions import Instruction, SUPPORTED_INSTRUCTIONS
from cpu.parser import AssemblyParser, ParseError

class CPU:
    def __init__(self):
        # Registers
        self.registers: Dict[str, int] = {
            "R0": 0, "R1": 0, "R2": 0, "R3": 0,
            "R4": 0, "R5": 0, "R6": 0, "R7": 0,
            "PC": 0,
            "SP": 255,  # Top of stack by default
            "ACC": 0,
        }
        self.previous_registers: Dict[str, int] = self.registers.copy()

        # Flags
        self.flags: Dict[str, bool] = {
            "Z": False,  # Zero
            "C": False,  # Carry
            "N": False,  # Negative
            "V": False,  # Overflow
        }

        # Instruction Register & Source Mapping
        self.IR: Optional[Instruction] = None
        self.current_instruction_text: str = "NOP"
        self.current_line_num: int = 0

        # Memory Subsystem
        self.memory: Memory = Memory(size=256)

        # CPU Status
        self.running: bool = True
        self.halted: bool = False

        # Program Context
        self.instructions: List[Instruction] = []
        self.labels: Dict[str, int] = {}

        # Pipeline State (5 Stages)
        self.pipeline_stage: str = "FETCH"  # FETCH -> DECODE -> EXECUTE -> MEMORY -> WRITEBACK
        self.pipeline_active_index: int = 0
        self.stage_micro_op: str = "Ready"

        # Telemetry & Performance Counters
        self.step_counter: int = 0
        self.cycle_counter: int = 0
        self.alu_ops_count: int = 0
        self.reg_updates_count: int = 0

    def load_program(self, source_lines: List[str]) -> Tuple[int, Dict[str, int]]:
        """Parses and loads program assembly into CPU memory/instruction list."""
        self.reset()
        self.instructions, self.labels = AssemblyParser.parse_program(source_lines)
        return len(self.instructions), self.labels

    def reset(self) -> None:
        """Resets registers, flags, memory, counters, and pipeline."""
        self.registers = {
            "R0": 0, "R1": 0, "R2": 0, "R3": 0,
            "R4": 0, "R5": 0, "R6": 0, "R7": 0,
            "PC": 0,
            "SP": 255,
            "ACC": 0,
        }
        self.previous_registers = self.registers.copy()
        self.flags = {"Z": False, "C": False, "N": False, "V": False}
        self.IR = None
        self.current_instruction_text = "NOP"
        self.current_line_num = 0
        self.memory.reset()
        self.running = True
        self.halted = False
        self.instructions = []
        self.labels = {}
        self.pipeline_stage = "FETCH"
        self.pipeline_active_index = 0
        self.stage_micro_op = "Ready"
        self.step_counter = 0
        self.cycle_counter = 0
        self.alu_ops_count = 0
        self.reg_updates_count = 0

    def step_stage(self) -> Dict[str, Any]:
        """Advances execution by 1 single pipeline stage (micro-step execution)."""
        if not self.running or self.halted or not self.instructions:
            return self.get_state()

        pc = self.registers["PC"]
        if pc >= len(self.instructions):
            self.running = False
            self.pipeline_stage = "HALTED"
            self.stage_micro_op = "Program execution completed"
            return self.get_state()

        inst = self.instructions[pc]
        self.current_line_num = inst.line_num

        stages = ["FETCH", "DECODE", "EXECUTE", "MEMORY", "WRITEBACK"]

        current_stage = stages[self.pipeline_active_index]
        self.pipeline_stage = current_stage
        self.cycle_counter += 1

        if current_stage == "FETCH":
            self.IR = inst
            self.current_instruction_text = inst.raw_text
            self.stage_micro_op = f"Fetched '{inst.raw_text}' from address PC={pc}"

        elif current_stage == "DECODE":
            self.stage_micro_op = f"Decoded Opcode: {inst.opcode}, Operands: {inst.operands}"

        elif current_stage == "EXECUTE":
            self.stage_micro_op = f"ALU / Branch evaluation for {inst.opcode}"

        elif current_stage == "MEMORY":
            self.stage_micro_op = f"Memory / Stack access for {inst.opcode}"

        elif current_stage == "WRITEBACK":
            # Perform full instruction execution logic on Writeback completion stage
            self._execute_instruction_logic(inst)
            self.step_counter += 1
            self.stage_micro_op = f"Wrote result back, updated PC to {self.registers['PC']}"

        # Advance stage pointer
        self.pipeline_active_index = (self.pipeline_active_index + 1) % len(stages)
        return self.get_state()

    def step_instruction(self) -> Dict[str, Any]:
        """Executes 1 complete instruction across all 5 pipeline stages."""
        if not self.running or self.halted or not self.instructions:
            return self.get_state()

        # Run through remaining pipeline stages for the current instruction
        for _ in range(5):
            if not self.running or self.halted:
                break
            self.step_stage()
            if self.pipeline_active_index == 0:
                break
        return self.get_state()

    def _execute_instruction_logic(self, inst: Instruction) -> None:
        op = inst.opcode
        ops = inst.operands

        try:
            # 1. DATA TRANSFER
            if op == "LOAD":
                dest_reg, val_src = ops[0], ops[1]
                val = self._resolve_val(val_src)
                self._set_register(dest_reg, val)

            elif op == "STORE":
                src_reg, addr_src = ops[0], ops[1]
                val = self.registers[src_reg]
                addr = self._resolve_addr(addr_src)
                self.memory.write(addr, val)

            elif op == "MOV":
                dest_reg, src = ops[0], ops[1]
                val = self._resolve_val(src)
                self._set_register(dest_reg, val)

            elif op == "PUSH":
                val = self._resolve_val(ops[0])
                sp = self.registers["SP"]
                self.memory.write(sp, val)
                self._set_register("SP", (sp - 1) & 0xFF)

            elif op == "POP":
                dest_reg = ops[0]
                sp = (self.registers["SP"] + 1) & 0xFF
                val = self.memory.read(sp)
                self._set_register("SP", sp)
                self._set_register(dest_reg, val)

            # 2. ARITHMETIC & LOGIC (ALU)
            elif op in ("ADD", "SUB", "MUL", "DIV", "INC", "DEC", "CMP", "AND", "OR", "XOR", "NOT", "SHL", "SHR"):
                self.alu_ops_count += 1
                reg1 = ops[0]
                val1 = self.registers[reg1]
                val2 = self._resolve_val(ops[1]) if len(ops) > 1 else 0

                res, flags = ALU.execute(op, val1, val2)
                self.flags.update(flags)

                if op != "CMP":
                    self._set_register(reg1, res)

            # 3. CONTROL FLOW
            elif op == "JMP":
                target_pc = int(ops[0])
                self.registers["PC"] = target_pc
                return  # Skip PC increment

            elif op == "JZ":
                if self.flags["Z"]:
                    self.registers["PC"] = int(ops[0])
                    return
                
            elif op == "JNZ":
                if not self.flags["Z"]:
                    self.registers["PC"] = int(ops[0])
                    return

            elif op == "CALL":
                target_pc = int(ops[0])
                return_pc = self.registers["PC"] + 1
                sp = self.registers["SP"]
                self.memory.write(sp, return_pc)
                self._set_register("SP", (sp - 1) & 0xFF)
                self.registers["PC"] = target_pc
                return

            elif op == "RET":
                sp = (self.registers["SP"] + 1) & 0xFF
                return_pc = self.memory.read(sp)
                self._set_register("SP", sp)
                self.registers["PC"] = return_pc
                return

            # 4. SYSTEM
            elif op == "NOP":
                pass

            elif op == "HLT":
                self.running = False
                self.halted = True
                return

            # Increment PC for linear control flow
            self.registers["PC"] += 1

        except Exception as e:
            self.running = False
            raise RuntimeError(f"Runtime execution error at line {inst.line_num} ('{inst.raw_text}'): {str(e)}")

    def _resolve_val(self, operand: str) -> int:
        if operand in self.registers:
            return self.registers[operand]
        if operand.startswith('[') and operand.endswith(']'):
            inner = operand[1:-1]
            addr = self.registers[inner] if inner in self.registers else int(inner, 0)
            return self.memory.read(addr)
        return int(operand, 0) & 0xFF

    def _resolve_addr(self, operand: str) -> int:
        if operand.startswith('[') and operand.endswith(']'):
            inner = operand[1:-1]
            return self.registers[inner] if inner in self.registers else int(inner, 0)
        if operand in self.registers:
            return self.registers[operand]
        return int(operand, 0)

    def _set_register(self, reg: str, val: int) -> None:
        if reg not in self.registers:
            raise ValueError(f"Invalid target register: {reg}")
        self.registers[reg] = val & 0xFF
        self.reg_updates_count += 1

    def get_register_changes(self) -> Dict[str, Dict[str, int]]:
        changes = {}
        for reg, val in self.registers.items():
            if val != self.previous_registers[reg]:
                changes[reg] = {"old": self.previous_registers[reg], "new": val}
        self.previous_registers = self.registers.copy()
        return changes

    def get_state(self) -> Dict[str, Any]:
        cpi = round(self.cycle_counter / self.step_counter, 2) if self.step_counter > 0 else 1.0
        active_inst = self.IR.to_dict() if self.IR else None

        return {
            "step": self.step_counter,
            "cycle": self.cycle_counter,
            "cpi": cpi,
            "running": self.running,
            "halted": self.halted,
            "pipeline_stage": self.pipeline_stage,
            "stage_micro_op": self.stage_micro_op,
            "current_line_num": self.current_line_num,
            "current_instruction_text": self.current_instruction_text,
            "instruction": active_inst,
            "registers": self.registers.copy(),
            "register_changes": self.get_register_changes(),
            "flags": self.flags.copy(),
            "memory": self.memory.get_state(),
            "memory_changes": self.memory.get_changes(),
            "telemetry": {
                "instructions_executed": self.step_counter,
                "clock_cycles": self.cycle_counter,
                "alu_operations": self.alu_ops_count,
                "memory_reads": self.memory.read_count,
                "memory_writes": self.memory.write_count,
                "register_updates": self.reg_updates_count,
            }
        }
