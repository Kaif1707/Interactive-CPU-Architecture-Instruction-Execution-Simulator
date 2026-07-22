/**
 * Client-Side CPU Simulator Engine (Fallback for Offline / Cold-Start Backend)
 * Implements 8-bit CPU Registers, Status Flags (Z, C, N, V), 256-Byte RAM, 5-Stage Pipeline, and 23 Instructions.
 */

export class ClientCPU {
  constructor() {
    this.reset();
  }

  reset() {
    this.registers = {
      R0: 0, R1: 0, R2: 0, R3: 0,
      R4: 0, R5: 0, R6: 0, R7: 0,
      PC: 0, SP: 255, ACC: 0
    };
    this.previous_registers = { ...this.registers };
    this.flags = { Z: false, C: false, N: false, V: false };
    this.IR = null;
    this.current_instruction_text = "NOP";
    this.current_line_num = 0;
    
    this.memory = new Array(256).fill(0);
    this.previous_memory = new Array(256).fill(0);
    this.last_accessed_addr = -1;
    this.last_access_type = "";
    this.read_count = 0;
    this.write_count = 0;

    this.running = true;
    this.halted = false;
    this.instructions = [];
    this.labels = {};

    this.pipeline_stage = "FETCH";
    this.pipeline_active_index = 0;
    this.stage_micro_op = "Ready";

    this.step_counter = 0;
    this.cycle_counter = 0;
    this.alu_ops_count = 0;
    this.reg_updates_count = 0;
  }

  loadProgram(sourceLines) {
    this.reset();
    const { instructions, labels, error } = this.parseProgram(sourceLines);
    if (error) throw error;
    this.instructions = instructions;
    this.labels = labels;
    return { count: instructions.length, labels };
  }

  parseProgram(sourceLines) {
    const instructions = [];
    const labels = {};
    const cleanLines = [];
    let instIndex = 0;

    for (let idx = 0; idx < sourceLines.length; idx++) {
      const lineNum = idx + 1;
      const rawLine = sourceLines[idx];
      const line = rawLine.split(';')[0].split('#')[0].trim();
      if (!line) continue;

      if (line.includes(':')) {
        const parts = line.split(':');
        const labelName = parts[0].trim().toUpperCase();
        if (labels[labelName] !== undefined) {
          return { error: { line: lineNum, message: `Duplicate label definition '${labelName}'` } };
        }
        labels[labelName] = instIndex;
        const remaining = parts.slice(1).join(':').trim();
        if (remaining) {
          cleanLines.push({ lineNum, text: remaining });
          instIndex++;
        }
      } else {
        cleanLines.push({ lineNum, text: line });
        instIndex++;
      }
    }

    for (const item of cleanLines) {
      const tokens = item.text.split(/[\s,]+/).filter(Boolean);
      if (!tokens.length) continue;

      const opcode = tokens[0].toUpperCase();
      const operands = tokens.slice(1);

      // Process labels in operands
      const processedOperands = operands.map(op => {
        const opUpper = op.toUpperCase();
        if (labels[opUpper] !== undefined) return labels[opUpper].toString();
        return op;
      });

      instructions.push({
        opcode,
        operands: processedOperands,
        line_num: item.lineNum,
        raw_text: item.text
      });
    }

    return { instructions, labels };
  }

  stepStage() {
    if (!this.running || this.halted || !this.instructions.length) {
      return this.getState();
    }

    const pc = this.registers.PC;
    if (pc >= this.instructions.length) {
      this.running = false;
      this.pipeline_stage = "HALTED";
      this.stage_micro_op = "Program execution completed";
      return this.getState();
    }

    const inst = this.instructions[pc];
    this.current_line_num = inst.line_num;

    const stages = ["FETCH", "DECODE", "EXECUTE", "MEMORY", "WRITEBACK"];
    const currentStage = stages[this.pipeline_active_index];
    this.pipeline_stage = currentStage;
    this.cycle_counter++;

    if (currentStage === "FETCH") {
      this.IR = inst;
      this.current_instruction_text = inst.raw_text;
      this.stage_micro_op = `Fetched '${inst.raw_text}' at PC=${pc}`;
    } else if (currentStage === "DECODE") {
      this.stage_micro_op = `Decoded Opcode: ${inst.opcode}, Operands: ${inst.operands.join(', ')}`;
    } else if (currentStage === "EXECUTE") {
      this.stage_micro_op = `ALU / Branch evaluation for ${inst.opcode}`;
    } else if (currentStage === "MEMORY") {
      this.stage_micro_op = `Memory / Stack access for ${inst.opcode}`;
    } else if (currentStage === "WRITEBACK") {
      this.executeInstructionLogic(inst);
      this.step_counter++;
      this.stage_micro_op = `Wrote result back, updated PC to ${this.registers.PC}`;
    }

    this.pipeline_active_index = (this.pipeline_active_index + 1) % stages.length;
    return this.getState();
  }

  stepInstruction() {
    if (!this.running || this.halted || !this.instructions.length) {
      return this.getState();
    }

    for (let i = 0; i < 5; i++) {
      if (!this.running || this.halted) break;
      this.stepStage();
      if (this.pipeline_active_index === 0) break;
    }
    return this.getState();
  }

  executeInstructionLogic(inst) {
    const op = inst.opcode;
    const ops = inst.operands;

    const resolveVal = (operand) => {
      if (this.registers[operand] !== undefined) return this.registers[operand];
      if (operand.startsWith('[') && operand.endsWith(']')) {
        const inner = operand.slice(1, -1).trim();
        const addr = this.registers[inner] !== undefined ? this.registers[inner] : parseInt(inner, 10);
        this.last_accessed_addr = addr;
        this.last_access_type = "READ";
        this.read_count++;
        return this.memory[addr] & 0xFF;
      }
      return parseInt(operand.replace('#', ''), 10) & 0xFF;
    };

    const resolveAddr = (operand) => {
      if (operand.startsWith('[') && operand.endsWith(']')) {
        const inner = operand.slice(1, -1).trim();
        return this.registers[inner] !== undefined ? this.registers[inner] : parseInt(inner, 10);
      }
      if (this.registers[operand] !== undefined) return this.registers[operand];
      return parseInt(operand, 10);
    };

    const setReg = (reg, val) => {
      if (this.registers[reg] === undefined) throw new Error(`Invalid register: ${reg}`);
      this.registers[reg] = val & 0xFF;
      this.reg_updates_count++;
    };

    try {
      if (op === "LOAD") {
        setReg(ops[0], resolveVal(ops[1]));
      } else if (op === "STORE") {
        const val = this.registers[ops[0]];
        const addr = resolveAddr(ops[1]);
        this.memory[addr] = val & 0xFF;
        this.last_accessed_addr = addr;
        this.last_access_type = "WRITE";
        this.write_count++;
      } else if (op === "MOV") {
        setReg(ops[0], resolveVal(ops[1]));
      } else if (op === "PUSH") {
        const val = resolveVal(ops[0]);
        const sp = this.registers.SP;
        this.memory[sp] = val & 0xFF;
        this.write_count++;
        setReg("SP", (sp - 1) & 0xFF);
      } else if (op === "POP") {
        const sp = (this.registers.SP + 1) & 0xFF;
        const val = this.memory[sp];
        this.read_count++;
        setReg("SP", sp);
        setReg(ops[0], val);
      } else if (["ADD", "SUB", "MUL", "DIV", "INC", "DEC", "CMP", "AND", "OR", "XOR", "NOT", "SHL", "SHR"].includes(op)) {
        this.alu_ops_count++;
        const val1 = this.registers[ops[0]] || 0;
        const val2 = ops.length > 1 ? resolveVal(ops[1]) : 0;
        const { res, flags } = this.runALU(op, val1, val2);
        this.flags = { ...this.flags, ...flags };
        if (op !== "CMP") setReg(ops[0], res);
      } else if (op === "JMP") {
        this.registers.PC = parseInt(ops[0], 10);
        return;
      } else if (op === "JZ") {
        if (this.flags.Z) {
          this.registers.PC = parseInt(ops[0], 10);
          return;
        }
      } else if (op === "JNZ") {
        if (!this.flags.Z) {
          this.registers.PC = parseInt(ops[0], 10);
          return;
        }
      } else if (op === "CALL") {
        const targetPc = parseInt(ops[0], 10);
        const returnPc = this.registers.PC + 1;
        const sp = this.registers.SP;
        this.memory[sp] = returnPc & 0xFF;
        setReg("SP", (sp - 1) & 0xFF);
        this.registers.PC = targetPc;
        return;
      } else if (op === "RET") {
        const sp = (this.registers.SP + 1) & 0xFF;
        const returnPc = this.memory[sp];
        setReg("SP", sp);
        this.registers.PC = returnPc;
        return;
      } else if (op === "HLT") {
        this.running = false;
        this.halted = true;
        return;
      }

      this.registers.PC++;
    } catch (e) {
      this.running = false;
      throw e;
    }
  }

  runALU(op, val1, val2) {
    val1 = val1 & 0xFF;
    val2 = val2 & 0xFF;
    let raw = 0;
    let carry = false;

    if (op === "ADD") {
      raw = val1 + val2;
      carry = raw > 0xFF;
    } else if (op === "SUB" || op === "CMP") {
      raw = val1 - val2;
      carry = val1 < val2;
    } else if (op === "MUL") {
      raw = val1 * val2;
      carry = raw > 0xFF;
    } else if (op === "DIV") {
      if (val2 === 0) throw new Error("Division by zero");
      raw = Math.floor(val1 / val2);
    } else if (op === "INC") {
      raw = val1 + 1;
      carry = raw > 0xFF;
    } else if (op === "DEC") {
      raw = val1 - 1;
      carry = val1 < 1;
    } else if (op === "AND") {
      raw = val1 & val2;
    } else if (op === "OR") {
      raw = val1 | val2;
    } else if (op === "XOR") {
      raw = val1 ^ val2;
    } else if (op === "NOT") {
      raw = (~val1) & 0xFF;
    } else if (op === "SHL") {
      raw = val1 << (val2 || 1);
      carry = Boolean(raw & 0x100);
    } else if (op === "SHR") {
      raw = val1 >> (val2 || 1);
    }

    const res = raw & 0xFF;
    return {
      res,
      flags: {
        Z: res === 0,
        C: carry,
        N: Boolean(res & 0x80),
        V: false
      }
    };
  }

  getState() {
    const memoryChanges = {};
    for (let i = 0; i < 256; i++) {
      if (this.memory[i] !== this.previous_memory[i]) {
        memoryChanges[i] = this.memory[i];
      }
    }
    this.previous_memory = [...this.memory];

    const regChanges = {};
    for (const reg in this.registers) {
      if (this.registers[reg] !== this.previous_registers[reg]) {
        regChanges[reg] = { old: this.previous_registers[reg], new: this.registers[reg] };
      }
    }
    this.previous_registers = { ...this.registers };

    return {
      step: this.step_counter,
      cycle: this.cycle_counter,
      cpi: this.step_counter > 0 ? (this.cycle_counter / this.step_counter).toFixed(2) : "1.00",
      running: this.running,
      halted: this.halted,
      pipeline_stage: this.pipeline_stage,
      stage_micro_op: this.stage_micro_op,
      current_line_num: this.current_line_num,
      current_instruction_text: this.current_instruction_text,
      instruction: this.IR ? { opcode: this.IR.opcode, control_signals: { RegWrite: true, ALUSrc: false, MemRead: false, MemWrite: false, Branch: false } } : null,
      registers: { ...this.registers },
      register_changes: regChanges,
      flags: { ...this.flags },
      memory: {
        data: [...this.memory],
        last_accessed_addr: this.last_accessed_addr,
        last_access_type: this.last_access_type,
        read_count: this.read_count,
        write_count: this.write_count
      },
      memory_changes: memoryChanges,
      telemetry: {
        instructions_executed: this.step_counter,
        clock_cycles: this.cycle_counter,
        alu_operations: this.alu_ops_count,
        memory_reads: this.read_count,
        memory_writes: this.write_count,
        register_updates: this.reg_updates_count
      }
    };
  }
}

export const clientCPU = new ClientCPU();
