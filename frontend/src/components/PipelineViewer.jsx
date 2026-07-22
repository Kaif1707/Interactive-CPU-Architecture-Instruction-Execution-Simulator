import React from 'react';
import { ArrowRight, Cpu, HardDrive, Layers, CheckCircle2 } from 'lucide-react';

const STAGES = [
  { id: 'FETCH', label: '1. Fetch', icon: ArrowRight, color: '#38bdf8' },
  { id: 'DECODE', label: '2. Decode', icon: Layers, color: '#c084fc' },
  { id: 'EXECUTE', label: '3. Execute', icon: Cpu, color: '#fbbf24' },
  { id: 'MEMORY', label: '4. Memory', icon: HardDrive, color: '#34d399' },
  { id: 'WRITEBACK', label: '5. Write Back', icon: CheckCircle2, color: '#f472b6' }
];

export default function PipelineViewer({ activeStage, microOpText, currentInstruction, controlSignals }) {
  return (
    <div className="card-panel">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} color="var(--accent-cyan)" />
          <span>Fetch-Decode-Execute Microarchitecture Pipeline</span>
        </div>
        <span className="badge badge-purple">5-Stage RISC Pipeline</span>
      </div>
      <div className="card-body">
        {/* Pipeline Stage Blocks */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '10px',
          marginBottom: '14px'
        }}>
          {STAGES.map((stage) => {
            const Icon = stage.icon;
            const isActive = activeStage === stage.id;

            return (
              <div
                key={stage.id}
                style={{
                  background: isActive ? 'var(--bg-card-hover)' : 'var(--bg-tertiary)',
                  border: `2px solid ${isActive ? stage.color : 'var(--border-color)'}`,
                  borderRadius: '8px',
                  padding: '10px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: isActive ? `0 0 15px ${stage.color}40` : 'none',
                  transform: isActive ? 'scale(1.03)' : 'scale(1)'
                }}
              >
                <div style={{
                  display: 'inline-flex',
                  padding: '6px',
                  borderRadius: '50%',
                  background: isActive ? `${stage.color}20` : 'transparent',
                  marginBottom: '4px'
                }}>
                  <Icon size={18} color={isActive ? stage.color : 'var(--text-muted)'} />
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: isActive ? stage.color : 'var(--text-secondary)',
                  fontFamily: 'var(--font-mono)'
                }}>
                  {stage.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Micro-Op Detail Banner */}
        <div style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ fontSize: '12px' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Active Stage Operation: </span>
            <span style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)', fontWeight: '600' }}>
              {microOpText || 'Idle'}
            </span>
          </div>
          {currentInstruction && (
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
              <span className="badge badge-amber">IR: {currentInstruction}</span>
            </div>
          )}
        </div>

        {/* Control Signals Bus */}
        {controlSignals && (
          <div style={{
            marginTop: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            fontSize: '11px'
          }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Control Signals:</span>
            {Object.entries(controlSignals).map(([sig, active]) => (
              <span
                key={sig}
                style={{
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: '600',
                  background: active ? 'rgba(52, 211, 153, 0.15)' : 'var(--bg-tertiary)',
                  color: active ? 'var(--accent-green)' : 'var(--text-muted)',
                  border: `1px solid ${active ? 'rgba(52, 211, 153, 0.3)' : 'var(--border-color)'}`
                }}
              >
                {sig}={active ? '1' : '0'}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
