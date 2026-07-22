"""
Assembly Parser & Lexer for the CPU Simulator.
Parses assembly source code, resolves labels (e.g. `LOOP:`, `JMP LOOP`), validates registers and operands,
and raises line-specific syntax diagnostic errors.
"""

import re
from typing import List, Dict, Tuple, Any
from cpu.instructions import Instruction, SUPPORTED_INSTRUCTIONS

VALID_REGISTERS = {"R0", "R1", "R2", "R3", "R4", "R5", "R6", "R7", "SP", "ACC", "PC", "IR"}

class ParseError(Exception):
    def __init__(self, message: str, line_num: int):
        super().__init__(f"Line {line_num}: {message}")
        self.message = message
        self.line_num = line_num

class AssemblyParser:
    @staticmethod
    def parse_program(source_code: List[str]) -> Tuple[List[Instruction], Dict[str, int]]:
        """
        Two-pass assembly parser:
        Pass 1: Strip comments, collect label definitions and map to instruction index.
        Pass 2: Parse opcodes, validate operands, and replace labels with absolute addresses.
        """
        instructions: List[Instruction] = []
        labels: Dict[str, int] = {}
        clean_lines: List[Tuple[int, str]] = []

        # Pass 1: Collect labels and clean lines
        inst_index = 0
        for idx, raw_line in enumerate(source_code):
            line_num = idx + 1
            # Remove comments (anything after ';' or '#')
            line = raw_line.split(';')[0].split('#')[0].strip()
            if not line:
                continue

            # Check if line contains a label definition (e.g., "START:" or "LOOP: MOV R1 5")
            if ':' in line:
                parts = line.split(':', 1)
                label_name = parts[0].strip().upper()
                if not label_name.isidentifier():
                    raise ParseError(f"Invalid label name '{label_name}'", line_num)
                if label_name in labels:
                    raise ParseError(f"Duplicate label definition '{label_name}'", line_num)
                labels[label_name] = inst_index
                remaining = parts[1].strip()
                if remaining:
                    clean_lines.append((line_num, remaining))
                    inst_index += 1
            else:
                clean_lines.append((line_num, line))
                inst_index += 1

        # Pass 2: Parse instructions
        for line_num, line in clean_lines:
            tokens = [t.strip(',') for t in line.split() if t.strip(',')]
            if not tokens:
                continue

            opcode = tokens[0].upper()
            if opcode not in SUPPORTED_INSTRUCTIONS:
                raise ParseError(f"Unknown instruction '{opcode}'", line_num)

            operands = tokens[1:]
            meta = SUPPORTED_INSTRUCTIONS[opcode]
            expected_args = meta["args"]

            if len(operands) != expected_args:
                raise ParseError(
                    f"Instruction '{opcode}' expects {expected_args} operand(s), got {len(operands)}",
                    line_num
                )

            # Process & validate operands
            processed_operands = []
            for op_str in operands:
                op_upper = op_str.upper()

                # If operand is a register
                if op_upper in VALID_REGISTERS:
                    processed_operands.append(op_upper)
                # If operand is a memory bracket e.g. [10] or [R1]
                elif op_str.startswith('[') and op_str.endswith(']'):
                    inner = op_str[1:-1].strip().upper()
                    if inner in VALID_REGISTERS:
                        processed_operands.append(f"[{inner}]")
                    else:
                        try:
                            addr = int(inner, 0)
                            if not (0 <= addr <= 255):
                                raise ParseError(f"Memory address out of bounds (0-255): {addr}", line_num)
                            processed_operands.append(f"[{addr}]")
                        except ValueError:
                            raise ParseError(f"Invalid memory address inside brackets: '{inner}'", line_num)
                # If operand is a label (for branch/jump/call)
                elif opcode in ("JMP", "JZ", "JNZ", "CALL"):
                    if op_upper in labels:
                        processed_operands.append(str(labels[op_upper]))
                    else:
                        try:
                            # Might be a raw line address
                            addr = int(op_str)
                            processed_operands.append(str(addr))
                        except ValueError:
                            raise ParseError(f"Undefined jump label or invalid address target '{op_str}'", line_num)
                # Otherwise, try parsing immediate integer
                else:
                    clean_op = op_str.lstrip('#')
                    try:
                        val = int(clean_op, 0)
                        processed_operands.append(str(val))
                    except ValueError:
                        raise ParseError(f"Invalid register, label, or integer operand '{op_str}'", line_num)

            inst = Instruction(
                opcode=opcode,
                operands=processed_operands,
                line_num=line_num,
                raw_text=line
            )
            instructions.append(inst)

        return instructions, labels
