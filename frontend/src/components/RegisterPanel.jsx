import React, { useState } from 'react';
import { Cpu, Eye } from 'lucide-react';

export default function RegisterPanel({ registers, registerChanges }) {
  const [format, setFormat] = useState('dec'); // 'dec', 'hex', 'bin'

  const formatValue = (val) => {
    if (val === undefined || val === null) return '0';
    if (typeof val === 'string') return val;
    if (format === 'hex') return '0x' + (val & 0xFF).toString(16).toUpperCase().padStart(2, '0');
    if (format === 'bin') return '0b' + (val & 0xFF).toString(2).padStart(8, '0');
    return val.toString();
  };

  const generalRegs = ['R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7'];
  const specialRegs = ['PC', 'SP', 'ACC'];

  return (
    <div className="card-panel">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={16} color="var(--accent-blue)" />
          <span>General & Special Registers</span>
        </div>

        {/* Format Selector */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {['dec', 'hex', 'bin'].map((mode) => (
            <button
              key={mode}
              onClick={() => setFormat(mode)}
              style={{
                padding: '2px 8px',
                fontSize: '10px',
                fontWeight: '600',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                background: format === mode ? '#1f6feb' : 'var(--bg-tertiary)',
                color: format === mode ? '#ffffff' : 'var(--text-secondary)'
              }}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="card-body">
        {/* Special Registers Row (PC, SP, ACC) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: '12px'
        }}>
          {specialRegs.map((reg) => {
            const val = registers[reg] || 0;
            const isChanged = registerChanges && registerChanges[reg];
            return (
              <div
                key={reg}
                className={isChanged ? 'flash-updated' : ''}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: `1px solid ${isChanged ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                  borderRadius: '6px',
                  padding: '8px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                  {reg}
                </div>
                <div style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                  {formatValue(val)}
                </div>
              </div>
            );
          })}
        </div>

        {/* General Purpose Registers Grid (R0 - R7) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px'
        }}>
          {generalRegs.map((reg) => {
            const val = registers[reg] || 0;
            const change = registerChanges && registerChanges[reg];

            return (
              <div
                key={reg}
                className={change ? 'flash-updated' : ''}
                style={{
                  background: change ? 'rgba(56, 189, 248, 0.1)' : 'var(--bg-tertiary)',
                  border: `1px solid ${change ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                  borderRadius: '6px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
                  {reg}
                </div>
                <div style={{ fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', margin: '2px 0' }}>
                  {formatValue(val)}
                </div>
                {change && (
                  <div style={{ fontSize: '9px', color: 'var(--accent-green)', fontFamily: 'var(--font-mono)' }}>
                    {formatValue(change.old)} → {formatValue(change.new)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
