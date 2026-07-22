import React, { useState } from 'react';
import { Database, Search } from 'lucide-react';

export default function MemoryViewer({ memoryData, lastAccessedAddr, lastAccessType, memoryChanges }) {
  const [search, setSearch] = useState('');
  const [format, setFormat] = useState('hex'); // 'hex', 'dec', 'bin'

  const data = (memoryData && memoryData.data) ? memoryData.data : new Array(256).fill(0);

  const formatValue = (val) => {
    if (format === 'hex') return (val & 0xFF).toString(16).toUpperCase().padStart(2, '0');
    if (format === 'bin') return (val & 0xFF).toString(2).padStart(8, '0');
    return val.toString();
  };

  const formatAddress = (addr) => {
    return '0x' + addr.toString(16).toUpperCase().padStart(2, '0');
  };

  return (
    <div className="card-panel" style={{ height: '100%' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={16} color="var(--accent-green)" />
          <span>256-Byte Main RAM Memory</span>
        </div>

        {/* Search & Format Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={12} style={{ position: 'absolute', left: '6px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search Addr..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '2px 6px 2px 22px',
                fontSize: '11px',
                color: 'var(--text-primary)',
                width: '100px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '2px' }}>
            {['hex', 'dec', 'bin'].map((mode) => (
              <button
                key={mode}
                onClick={() => setFormat(mode)}
                style={{
                  padding: '2px 6px',
                  fontSize: '10px',
                  fontWeight: '600',
                  borderRadius: '3px',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  background: format === mode ? '#238636' : 'var(--bg-tertiary)',
                  color: format === mode ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                {mode.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card-body" style={{ overflowY: 'auto', maxHeight: '280px', padding: '8px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))',
          gap: '4px'
        }}>
          {data.map((val, addr) => {
            if (search.trim() !== '') {
              const hexAddr = formatAddress(addr).toLowerCase();
              const decAddr = addr.toString();
              if (!hexAddr.includes(search.toLowerCase()) && !decAddr.includes(search)) {
                return null;
              }
            }

            const isLastAccessed = lastAccessedAddr === addr;
            const isRead = isLastAccessed && lastAccessType === 'READ';
            const isWrite = isLastAccessed && lastAccessType === 'WRITE';
            const isModified = memoryChanges && memoryChanges[addr] !== undefined;

            let animClass = '';
            if (isRead) animClass = 'mem-read-pulse';
            if (isWrite || isModified) animClass = 'mem-write-pulse';

            return (
              <div
                key={addr}
                className={animClass}
                style={{
                  background: isModified
                    ? 'rgba(248, 113, 113, 0.15)'
                    : val !== 0
                    ? 'rgba(56, 189, 248, 0.1)'
                    : 'var(--bg-tertiary)',
                  border: `1px solid ${
                    isWrite ? 'var(--accent-red)' : isRead ? 'var(--accent-green)' : val !== 0 ? 'var(--border-active)' : 'var(--border-color)'
                  }`,
                  borderRadius: '4px',
                  padding: '4px',
                  textAlign: 'center',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                  {formatAddress(addr)}
                </div>
                <div style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: val !== 0 ? 'var(--accent-amber)' : 'var(--text-secondary)'
                }}>
                  {formatValue(val)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
