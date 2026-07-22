import React, { useState } from 'react';
import { BookOpen, Search, Code2 } from 'lucide-react';

export default function InstructionGuide({ instructions }) {
  const [filter, setFilter] = useState('');
  const instList = instructions ? Object.entries(instructions) : [];

  return (
    <div className="card-panel" style={{ height: '100%', minHeight: '600px' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={18} color="var(--accent-blue)" />
          <span>8-Bit CPU ISA (Instruction Set Architecture) Reference Manual</span>
        </div>

        {/* Filter Input */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={14} style={{ position: 'absolute', left: '8px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search instruction..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '4px 8px 4px 28px',
              fontSize: '12px',
              color: 'var(--text-primary)',
              outline: 'none',
              width: '180px'
            }}
          />
        </div>
      </div>

      <div className="card-body" style={{ overflowY: 'auto', padding: '16px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '12px'
        }}>
          {instList.map(([opcode, meta]) => {
            if (filter.trim() !== '' && !opcode.toLowerCase().includes(filter.toLowerCase()) && !meta.category.toLowerCase().includes(filter.toLowerCase())) {
              return null;
            }

            return (
              <div
                key={opcode}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '15px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)' }}>
                    {opcode}
                  </div>
                  <span className="badge badge-purple">{meta.category}</span>
                </div>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
                  {meta.doc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
