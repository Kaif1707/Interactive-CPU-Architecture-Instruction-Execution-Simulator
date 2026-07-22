import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  loadProgram,
  stepCPU,
  stepMicroCPU,
  resetCPU,
  fetchSamples,
  fetchInstructions
} from './api';

import Header from './components/Header';
import MonacoEditorWrapper from './components/MonacoEditor';
import PipelineViewer from './components/PipelineViewer';
import RegisterPanel from './components/RegisterPanel';
import FlagPanel from './components/FlagPanel';
import MemoryViewer from './components/MemoryViewer';
import StackViewer from './components/StackViewer';
import ControlToolbar from './components/ControlToolbar';
import StatsPanel from './components/StatsPanel';
import InstructionGuide from './components/InstructionGuide';

const DEFAULT_PROGRAM = `# 8-Bit Assembly Sample Program
# Generate Fibonacci sequence at RAM Address 10
LOAD R0, 0     ; Term 1 = 0
LOAD R1, 1     ; Term 2 = 1
STORE R0, 10   ; Write RAM[10] = 0
STORE R1, 11   ; Write RAM[11] = 1

LOAD R2, 12    ; Target Address pointer
LOAD R3, 4     ; Loop count

FIB_LOOP:
LOAD R4, R0    ; R4 = R0
ADD R4, R1     ; R4 = R0 + R1
STORE R4, [R2] ; RAM[R2] = R4
MOV R0, R1     ; Shift term 1
MOV R1, R4     ; Shift term 2
INC R2         ; Next RAM address
DEC R3         ; Decrement counter
JNZ FIB_LOOP   ; Loop if counter != 0
HLT`;

export default function App() {
  const [code, setCode] = useState(DEFAULT_PROGRAM);
  const [activeTab, setActiveTab] = useState('simulator'); // 'simulator' | 'guide'

  const [cpuState, setCpuState] = useState(null);
  const [samples, setSamples] = useState({});
  const [instructionSet, setInstructionSet] = useState({});

  const [statusText, setStatusText] = useState('Ready to assemble');
  const [errorInfo, setErrorInfo] = useState({ line: 0, message: '' });

  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [speedDelay, setSpeedDelay] = useState(300);

  const autoRunTimerRef = useRef(null);

  // Initial load
  useEffect(() => {
    fetchSamples().then(data => setSamples(data));
    fetchInstructions().then(data => setInstructionSet(data));
    handleLoadProgram();
  }, []);

  // Handle Load Program
  const handleLoadProgram = async () => {
    setErrorInfo({ line: 0, message: '' });
    setIsAutoRunning(false);

    const lines = code.split('\n');
    const res = await loadProgram(lines);

    if (res.detail) {
      if (typeof res.detail === 'object') {
        setErrorInfo({ line: res.detail.line, message: res.detail.message });
        setStatusText(`Parse error on line ${res.detail.line}`);
      } else {
        setErrorInfo({ line: 1, message: res.detail });
        setStatusText('Load failed');
      }
    } else {
      setCpuState(res.state);
      setStatusText(`Program loaded (${res.instruction_count} instructions)`);
    }
  };

  // Step 1 Instruction
  const handleStepInstruction = async () => {
    setErrorInfo({ line: 0, message: '' });
    const res = await stepCPU();

    if (res.detail) {
      setErrorInfo({ line: cpuState ? cpuState.current_line_num : 1, message: res.detail });
      setIsAutoRunning(false);
      setStatusText('Execution error halted CPU');
    } else {
      setCpuState(res.state);
      if (res.state.halted) {
        setIsAutoRunning(false);
        setStatusText('Program halted successfully (HLT)');
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }
    }
  };

  // Step 1 Micro-Stage
  const handleStepMicroStage = async () => {
    setErrorInfo({ line: 0, message: '' });
    const res = await stepMicroCPU();

    if (res.detail) {
      setErrorInfo({ line: cpuState ? cpuState.current_line_num : 1, message: res.detail });
      setIsAutoRunning(false);
      setStatusText('Micro-stage error');
    } else {
      setCpuState(res.state);
      if (res.state.halted) {
        setIsAutoRunning(false);
        setStatusText('Program halted successfully (HLT)');
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }
    }
  };

  // Reset CPU
  const handleReset = async () => {
    setIsAutoRunning(false);
    setErrorInfo({ line: 0, message: '' });
    const res = await resetCPU();
    setCpuState(res.state);
    setStatusText('CPU Reset');
  };

  // Preset Sample loader
  const handleSelectSample = (sampleKey) => {
    if (samples[sampleKey]) {
      setCode(samples[sampleKey].code);
    }
  };

  // Auto-run loop timer effect
  useEffect(() => {
    if (isAutoRunning) {
      autoRunTimerRef.current = setInterval(() => {
        handleStepInstruction();
      }, speedDelay);
    } else {
      if (autoRunTimerRef.current) clearInterval(autoRunTimerRef.current);
    }

    return () => {
      if (autoRunTimerRef.current) clearInterval(autoRunTimerRef.current);
    };
  }, [isAutoRunning, speedDelay]);

  const toggleAutoRun = () => {
    setIsAutoRunning(prev => !prev);
  };

  const isRunning = cpuState ? (cpuState.running && !cpuState.halted) : false;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Top Navigation Header */}
      <Header
        samples={samples}
        onSelectSample={handleSelectSample}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        status={statusText}
        onReset={handleReset}
      />

      {/* Main Workspace Layout */}
      {activeTab === 'guide' ? (
        <div style={{ padding: '16px', flex: 1 }}>
          <InstructionGuide instructions={instructionSet} />
        </div>
      ) : (
        <main style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>

          {/* Top Row: Execution Toolbar Controls */}
          <ControlToolbar
            isRunning={isRunning}
            isAutoRunning={isAutoRunning}
            onStepInstruction={handleStepInstruction}
            onStepStage={handleStepMicroStage}
            onToggleAutoRun={toggleAutoRun}
            onReset={handleReset}
            speedDelay={speedDelay}
            setSpeedDelay={setSpeedDelay}
          />

          {/* Error Callout Banner if error exists */}
          {errorInfo.message && (
            <div style={{
              background: 'rgba(248, 113, 113, 0.15)',
              border: '1px solid var(--accent-red)',
              borderRadius: '6px',
              padding: '10px 14px',
              color: 'var(--accent-red)',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <strong>Execution Halt:</strong> {errorInfo.message} (Line {errorInfo.line})
              </div>
              <button
                className="btn btn-danger"
                onClick={() => setErrorInfo({ line: 0, message: '' })}
                style={{ padding: '2px 8px', fontSize: '11px' }}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Core Grid: Left = Editor, Right = Architecture Visualizer */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.3fr',
            gap: '14px',
            minHeight: '620px'
          }}>

            {/* Left Column: Monaco Code Editor */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <MonacoEditorWrapper
                value={code}
                onChange={(newVal) => setCode(newVal || '')}
                currentLine={cpuState ? cpuState.current_line_num : 0}
                errorLine={errorInfo.line}
                errorMsg={errorInfo.message}
                onLoadProgram={handleLoadProgram}
                onResetProgram={() => setCode('')}
              />
            </div>

            {/* Right Column: Architecture Dashboard */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* 5-Stage Pipeline Animated Viewer */}
              <PipelineViewer
                activeStage={cpuState ? cpuState.pipeline_stage : 'FETCH'}
                microOpText={cpuState ? cpuState.stage_micro_op : 'Ready'}
                currentInstruction={cpuState ? cpuState.current_instruction_text : 'NOP'}
                controlSignals={cpuState && cpuState.instruction ? cpuState.instruction.control_signals : null}
              />

              {/* Registers & Flags Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                <RegisterPanel
                  registers={cpuState ? cpuState.registers : {}}
                  registerChanges={cpuState ? cpuState.register_changes : {}}
                />
                <FlagPanel
                  flags={cpuState ? cpuState.flags : {}}
                />
              </div>

              {/* Memory & Call Stack Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <MemoryViewer
                  memoryData={cpuState ? cpuState.memory : null}
                  lastAccessedAddr={cpuState && cpuState.memory ? cpuState.memory.last_accessed_addr : -1}
                  lastAccessType={cpuState && cpuState.memory ? cpuState.memory.last_access_type : ''}
                  memoryChanges={cpuState ? cpuState.memory_changes : {}}
                />
                <StackViewer
                  memoryData={cpuState ? cpuState.memory : null}
                  sp={cpuState && cpuState.registers ? cpuState.registers.SP : 255}
                />
              </div>

              {/* Telemetry Hardware Profiler Panel */}
              <StatsPanel
                telemetry={cpuState ? cpuState.telemetry : null}
                cpi={cpuState ? cpuState.cpi : '1.00'}
                cycle={cpuState ? cpuState.cycle : 0}
                step={cpuState ? cpuState.step : 0}
              />

            </div>

          </div>

        </main>
      )}

      {/* Footer */}
      <footer style={{
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        padding: '10px 20px',
        fontSize: '11px',
        color: 'var(--text-muted)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <span>Interactive Computer Architecture Simulator &copy; 2026 Kaif Khan</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)' }}>
          Status: <span style={{ color: 'var(--accent-green)' }}>{statusText}</span>
        </div>
      </footer>
    </div>
  );
}
