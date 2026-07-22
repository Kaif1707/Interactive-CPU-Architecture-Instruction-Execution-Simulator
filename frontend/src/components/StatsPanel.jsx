import React from 'react';
import { Activity, Gauge, HardDrive, Cpu, RefreshCw } from 'lucide-react';

export default function StatsPanel({ telemetry, cpi, cycle, step }) {
  const stats = [
    { label: 'Instructions Executed', value: step || 0, icon: Activity, color: '#38bdf8' },
    { label: 'Clock Cycles', value: cycle || 0, icon: RefreshCw, color: '#fbbf24' },
    { label: 'CPI (Cycles/Inst)', value: cpi || '1.00', icon: Gauge, color: '#c084fc' },
    { label: 'ALU Operations', value: (telemetry && telemetry.alu_operations) || 0, icon: Cpu, color: '#34d399' },
    { label: 'Memory Reads / Writes', value: `${(telemetry && telemetry.memory_reads) || 0} / ${(telemetry && telemetry.memory_writes) || 0}`, icon: HardDrive, color: '#f472b6' },
  ];

  return (
    <div className="card-panel">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} color="var(--accent-amber)" />
          <span>Performance & Telemetry Dashboard</span>
        </div>
        <span className="badge badge-amber">Hardware Profiler</span>
      </div>

      <div className="card-body">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px'
        }}>
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div style={{
                  padding: '6px',
                  borderRadius: '6px',
                  background: `${stat.color}15`,
                  display: 'flex'
                }}>
                  <Icon size={16} color={stat.color} />
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{stat.label}</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {stat.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
