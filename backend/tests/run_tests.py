"""
Simple test runner script using built-in unittest framework.
"""

import unittest
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from cpu.cpu import CPU
from cpu.alu import ALU
from cpu.memory import Memory
from cpu.parser import AssemblyParser, ParseError

class TestCPUSimulator(unittest.TestCase):

    def test_alu_operations(self):
        res, flags = ALU.execute("ADD", 10, 20)
        self.assertEqual(res, 30)
        self.assertFalse(flags["Z"])
        self.assertFalse(flags["C"])

        res, flags = ALU.execute("SUB", 20, 20)
        self.assertEqual(res, 0)
        self.assertTrue(flags["Z"])

        res, flags = ALU.execute("SUB", 10, 20)
        self.assertEqual(res, 246)  # 8-bit unsigned representation of -10
        self.assertTrue(flags["N"])
        self.assertTrue(flags["C"])

    def test_memory_subsystem(self):
        mem = Memory(size=256)
        mem.write(10, 42)
        self.assertEqual(mem.read(10), 42)
        self.assertEqual(mem.write_count, 1)
        self.assertEqual(mem.read_count, 1)
        with self.assertRaises(ValueError):
            mem.read(300)

    def test_parser_valid_program(self):
        code = [
            "LOAD R0 5",
            "LOAD R1 10",
            "LOOP:",
            "ADD R0 R1",
            "JNZ LOOP"
        ]
        instructions, labels = AssemblyParser.parse_program(code)
        self.assertEqual(len(instructions), 4)
        self.assertEqual(labels["LOOP"], 2)

    def test_parser_invalid_instruction(self):
        code = ["INVALID_OP R0 5"]
        with self.assertRaises(ParseError):
            AssemblyParser.parse_program(code)

    def test_cpu_fibonacci_execution(self):
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

        self.assertEqual(cpu.memory.read(10), 0)
        self.assertEqual(cpu.memory.read(11), 1)
        self.assertEqual(cpu.memory.read(12), 1)
        self.assertEqual(cpu.registers["R0"], 1)

    def test_cpu_call_ret_stack(self):
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
        while cpu.running and not cpu.halted:
            cpu.step_instruction()

        self.assertEqual(cpu.registers["R0"], 6)

if __name__ == '__main__':
    unittest.main()
