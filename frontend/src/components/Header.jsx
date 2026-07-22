import React from 'react';
import { Cpu, BookOpen, Sparkles, PlayCircle, RefreshCw } from 'lucide-react';

export default function Header({ samples, onSelectSample, activeTab, setActiveTab, status, onReset }) {
  return (
    <header style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '12px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 12px rgba(56, 189, 248, 0.4)'
        }}>
          <Cpu size={22} color="#ffffff" />
        </div>
        <div>
          <h1 style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '-0.3px', margin: 0, color: 'var(--text-primary)' }}>
            CPU Architecture & Execution Simulator
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
            8-Bit RISC Microarchitecture Laboratory | 5-Stage Animated Pipeline
          </p>
        </div>
      </div>

      {/* Preset Loader & Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Sample Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={16} color="var(--accent-amber)" />
          <select
            onChange={(e) => onSelectSample(e.target.value)}
            defaultValue=""
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="" disabled>-- Load Preset Sample Program --</option>
            {Object.keys(samples).map((key) => (
              <option key={key} value={key}>
                {samples[key].title}
              </option>
            ))}
          </select>
        </div>

        {/* View Mode Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--bg-tertiary)',
          padding: '3px',
          borderRadius: '6px',
          border: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => setActiveTab('simulator')}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'simulator' ? '#1f6feb' : 'transparent',
              color: activeTab === 'simulator' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            Simulator Lab
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'guide' ? '#1f6feb' : 'transparent',
              color: activeTab === 'guide' ? '#ffffff' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease'
            }}
          >
            <BookOpen size={13} />
            Instruction Set Reference
          </button>
        </div>
      </div>
    </header>
  );
}
