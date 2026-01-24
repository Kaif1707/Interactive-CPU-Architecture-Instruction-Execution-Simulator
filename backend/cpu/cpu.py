class CPU:
    def __init__(self):
        self.registers = {
            "R1": 0,
            "R2": 0,
            "PC": 0,
            "IR": None
        }

        self.memory = [0] * 256
        self.previous_memory = self.memory.copy()
        self.running = True

    # ===== FETCH =====
    def fetch(self, program):
        if self.registers["PC"] >= len(program):
            self.running = False
            return None

        instruction = program[self.registers["PC"]]
        self.registers["IR"] = instruction
        self.registers["PC"] += 1
        return instruction

    # ===== EXECUTE =====
    def execute(self, instruction):
        parts = instruction.split()
        op = parts[0]

        try:
            if op == "LOAD":
                reg, val = parts[1], int(parts[2])
                self._check_reg(reg)
                self.registers[reg] = val

            elif op == "ADD":
                r1, r2 = parts[1], parts[2]
                self._check_reg(r1)
                self._check_reg(r2)
                self.registers[r1] += self.registers[r2]

            elif op == "STORE":
                reg, addr = parts[1], int(parts[2])
                self._check_reg(reg)
                self._check_addr(addr)
                self.memory[addr] = self.registers[reg]

            elif op == "JMP":
                addr = int(parts[1])
                self._check_pc(addr)
                self.registers["PC"] = addr

            elif op == "JZ":
                reg, addr = parts[1], int(parts[2])
                self._check_reg(reg)
                self._check_pc(addr)
                if self.registers[reg] == 0:
                    self.registers["PC"] = addr

            elif op == "JNZ":
                reg, addr = parts[1], int(parts[2])
                self._check_reg(reg)
                self._check_pc(addr)
                if self.registers[reg] != 0:
                    self.registers["PC"] = addr

            else:
                raise ValueError(f"Unknown instruction: {op}")

        except (IndexError, ValueError) as e:
            self.running = False
            raise RuntimeError(str(e))

    # ===== STATE =====
    def get_memory_changes(self):
        changes = {}
        for i in range(len(self.memory)):
            if self.memory[i] != self.previous_memory[i]:
                changes[i] = self.memory[i]
        self.previous_memory = self.memory.copy()
        return changes

    def get_state(self, step):
        return {
            "step": step,
            "instruction": self.registers["IR"],
            "registers": self.registers.copy(),
            "memory_changes": self.get_memory_changes()
        }

    # ===== VALIDATION HELPERS =====
    def _check_reg(self, reg):
        if reg not in self.registers:
            raise ValueError(f"Invalid register: {reg}")

    def _check_addr(self, addr):
        if not (0 <= addr < len(self.memory)):
            raise ValueError(f"Invalid memory address: {addr}")

    def _check_pc(self, addr):
        if addr < 0:
            raise ValueError("Invalid jump address")
