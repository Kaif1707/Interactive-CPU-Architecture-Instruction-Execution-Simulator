"""
Unit tests for CPU Simulator Backend.
Tests ALU, Memory, Assembly Parser, CPU Pipeline Execution, and Instructions.
"""

import pytest
from cpu.cpu import CPU
from cpu.alu import ALU
from cpu.memory import Memory
from cpu.parser import AssemblyParser, ParseError

def test_alu_operations():
    res, flags = ALU.execute("ADD", 10, 20)
    assert res == 30
    assert flags["Z"] is False
    assert flags["C"] is False

    res, flags = ALU.execute("SUB", 20, 20)
    assert res == 0
    assert flags["Z"] is True

    res, flags = ALU.execute("SUB", 10, 20)
    assert res == 246  # 8-bit unsigned representation of -10
    assert flags["N"] is True
    assert flags["C"] is True

def test_memory_subsystem():
    mem = Memory(size=256)
    mem.write(10, 42)
    assert mem.read(10) == 42
    assert mem.write_count == 1
    assert mem.read_count == 1
    with pytest.raises(ValueError):
        mem.read(300)

def test_parser_valid_program():
    code = [
        "LOAD R0 5",
        "LOAD R1 10",
        "LOOP:",
        "ADD R0 R1",
        "JNZ LOOP"
    ]
    instructions, labels = AssemblyParser.parse_program(code)
    assert len(instructions) == 4
    assert labels["LOOP"] == 2

def test_parser_invalid_instruction():
    code = ["INVALID_OP R0 5"]
    with pytest.raises(ParseError):
        AssemblyParser.parse_program(code)

def test_cpu_fibonacci_execution():
    cpu = CPU()
    code = [
        "LOAD R0 0",
        "LOAD R1 1",
        "STORE R0 10",
        "STORE R1 11",
        "ADD R0 R1",
        "STORE R0 12"
    ]
    cpu.load_program(code)
    for _ in range(len(code)):
        cpu.step_instruction()

    assert cpu.memory.read(10) == 0
    assert cpu.memory.read(11) == 1
    assert cpu.memory.read(12) == 1
    assert cpu.registers["R0"] == 1

def test_cpu_call_ret_stack():
    cpu = CPU()
    code = [
        "LOAD R0 5",
        "CALL SUBROUTINE",
        "HLT",
        "SUBROUTINE:",
        "INC R0",
        "RET"
    ]
    cpu.load_program(code)
    # Step through CALL, SUBROUTINE INC, RET, HLT
    while cpu.running and not cpu.halted:
        cpu.step_instruction()

    assert cpu.registers["R0"] == 6
