import React from 'react';
import { Play, Pause, StepForward, RotateCcw, FastForward, Sliders } from 'lucide-react';

export default function ControlToolbar({
  isRunning,
  isAutoRunning,
  onStepInstruction,
  onStepStage,
  onToggleAutoRun,
  onReset,
  speedDelay,
  setSpeedDelay
}) {
  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      {/* Execution Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          className={`btn ${isAutoRunning ? 'btn-danger' : 'btn-success'}`}
          onClick={onToggleAutoRun}
          disabled={!isRunning}
        >
          {isAutoRunning ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Run Clock</>}
        </button>

        <button className="btn btn-primary" onClick={onStepInstruction} disabled={!isRunning || isAutoRunning}>
          <StepForward size={14} /> Step Instruction
        </button>

        <button className="btn btn-accent" onClick={onStepStage} disabled={!isRunning || isAutoRunning}>
          <FastForward size={14} /> Step Micro-Stage
        </button>

        <button className="btn" onClick={onReset}>
          <RotateCcw size={14} /> Reset CPU
        </button>
      </div>

      {/* Clock Frequency / Speed Slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          <Sliders size={14} />
          <span>Clock Speed:</span>
        </div>
        <input
          type="range"
          min="50"
          max="1500"
          step="50"
          value={speedDelay}
          onChange={(e) => setSpeedDelay(Number(e.target.value))}
          style={{ cursor: 'pointer', width: '110px' }}
        />
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', width: '60px' }}>
          {speedDelay} ms
        </span>
      </div>
    </div>
  );
}
