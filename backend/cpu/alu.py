"""
Arithmetic Logic Unit (ALU) for the CPU Simulator.
Executes arithmetic and logical operations and updates processor status flags:
- Zero Flag (Z): Set if result is 0
- Carry Flag (C): Set if operation generated an unsigned overflow (above 255 or below 0)
- Negative Flag (N): Set if result is negative (MSB set, i.e., bit 7 is 1 or value < 0)
- Overflow Flag (V): Set if signed 8-bit overflow occurred (-128 to 127)
"""

from typing import Tuple, Dict

class ALU:
    @staticmethod
    def execute(op: str, val1: int, val2: int = 0) -> Tuple[int, Dict[str, bool]]:
        """
        Executes an ALU operation on 8-bit unsigned integers (0-255).
        Returns: (result_8bit, flags_dict)
        """
        val1 = val1 & 0xFF
        val2 = val2 & 0xFF
        raw_result = 0
        carry = False
        overflow = False

        if op == "ADD":
            raw_result = val1 + val2
            carry = raw_result > 0xFF
            # Signed overflow logic
            s1 = val1 if val1 < 128 else val1 - 256
            s2 = val2 if val2 < 128 else val2 - 256
            s_res = s1 + s2
            overflow = s_res < -128 or s_res > 127

        elif op == "SUB" or op == "CMP":
            raw_result = val1 - val2
            carry = val1 < val2  # Borrow occurred
            s1 = val1 if val1 < 128 else val1 - 256
            s2 = val2 if val2 < 128 else val2 - 256
            s_res = s1 - s2
            overflow = s_res < -128 or s_res > 127

        elif op == "MUL":
            raw_result = val1 * val2
            carry = raw_result > 0xFF
            overflow = raw_result > 0xFF

        elif op == "DIV":
            if val2 == 0:
                raise ZeroDivisionError("ALU Division by zero")
            raw_result = val1 // val2
            carry = False
            overflow = False

        elif op == "INC":
            raw_result = val1 + 1
            carry = raw_result > 0xFF
            s1 = val1 if val1 < 128 else val1 - 256
            overflow = (s1 + 1) > 127

        elif op == "DEC":
            raw_result = val1 - 1
            carry = val1 < 1
            s1 = val1 if val1 < 128 else val1 - 256
            overflow = (s1 - 1) < -128

        elif op == "AND":
            raw_result = val1 & val2
            carry = False
            overflow = False

        elif op == "OR":
            raw_result = val1 | val2
            carry = False
            overflow = False

        elif op == "XOR":
            raw_result = val1 ^ val2
            carry = False
            overflow = False

        elif op == "NOT":
            raw_result = (~val1) & 0xFF
            carry = False
            overflow = False

        elif op == "SHL":
            raw_result = val1 << (val2 if val2 else 1)
            carry = bool(raw_result & 0x100)
            overflow = False

        elif op == "SHR":
            shift = val2 if val2 else 1
            carry = bool((val1 >> (shift - 1)) & 1) if shift > 0 else False
            raw_result = val1 >> shift
            overflow = False

        else:
            raise ValueError(f"Unknown ALU operation: {op}")

        res_8bit = raw_result & 0xFF
        zero = (res_8bit == 0)
        negative = bool(res_8bit & 0x80)

        flags = {
            "Z": zero,
            "C": carry,
            "N": negative,
            "V": overflow
        }

        return res_8bit, flags
