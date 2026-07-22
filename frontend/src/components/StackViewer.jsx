import React from 'react';
import { Layers } from 'lucide-react';

export default function StackViewer({ memoryData, sp }) {
  const data = (memoryData && memoryData.data) ? memoryData.data : new Array(256).fill(0);
  const currentSP = sp !== undefined ? sp : 255;

  // Render top 8 stack frames from address 255 downwards
  const stackEntries = [];
  for (let i = 255; i >= 240; i--) {
    stackEntries.push({ address: i, value: data[i] });
  }

  return (
    <div className="card-panel">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} color="var(--accent-amber)" />
          <span>Call Stack Pointer (SP: 0x{currentSP.toString(16).toUpperCase()})</span>
        </div>
        <span className="badge badge-amber">Stack Segment (0xFF Down)</span>
      </div>

      <div className="card-body" style={{ maxHeight: '180px', overflowY: 'auto', padding: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {stackEntries.map((item) => {
            const isSP = item.address === currentSP;

            return (
              <div
                key={item.address}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  background: isSP ? 'rgba(251, 191, 36, 0.15)' : 'var(--bg-tertiary)',
                  border: `1px solid ${isSP ? 'var(--accent-amber)' : 'var(--border-color)'}`,
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>0x{item.address.toString(16).toUpperCase()}</span>
                  {isSP && (
                    <span className="badge badge-amber" style={{ fontSize: '9px', padding: '1px 4px' }}>
                      ← SP
                    </span>
                  )}
                </div>

                <div style={{ fontWeight: '600', color: item.value !== 0 ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                  0x{item.value.toString(16).toUpperCase().padStart(2, '0')} ({item.value})
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
