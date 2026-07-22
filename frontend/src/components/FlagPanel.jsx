import React from 'react';
import { Flag } from 'lucide-react';

const FLAGS_DEF = [
  { key: 'Z', label: 'Zero Flag (Z)', desc: 'Set when ALU operation result equals 0' },
  { key: 'C', label: 'Carry Flag (C)', desc: 'Set on 8-bit unsigned overflow or borrow' },
  { key: 'N', label: 'Negative Flag (N)', desc: 'Set when MSB bit 7 is 1 (negative result)' },
  { key: 'V', label: 'Overflow Flag (V)', desc: 'Set on 8-bit signed arithmetic overflow' }
];

export default function FlagPanel({ flags }) {
  return (
    <div className="card-panel">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flag size={16} color="var(--accent-purple)" />
          <span>Status Flag Register</span>
        </div>
        <span className="badge badge-purple">4-Bit Condition Flags</span>
      </div>

      <div className="card-body">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px'
        }}>
          {FLAGS_DEF.map((flagDef) => {
            const isActive = flags && flags[flagDef.key];

            return (
              <div
                key={flagDef.key}
                title={flagDef.desc}
                style={{
                  background: isActive ? 'rgba(192, 132, 252, 0.15)' : 'var(--bg-tertiary)',
                  border: `1px solid ${isActive ? 'var(--accent-purple)' : 'var(--border-color)'}`,
                  borderRadius: '6px',
                  padding: '8px',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: isActive ? 'var(--accent-purple)' : 'var(--text-muted)' }}>
                  {flagDef.key}
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '800',
                  fontFamily: 'var(--font-mono)',
                  color: isActive ? '#ffffff' : 'var(--text-muted)'
                }}>
                  {isActive ? '1' : '0'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
