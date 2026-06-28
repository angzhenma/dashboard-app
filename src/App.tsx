// src/App.tsx
import React, { useEffect, useState } from 'react';
import { fetchMockThreats } from './mockService';
import type { SecurityThreat } from './types';
import { ShieldAlert, Terminal, ShieldCheck } from 'lucide-react';

export default function App() {
  const [threats, setThreats] = useState<SecurityThreat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMockThreats().then((data) => {
      setThreats(data);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* HEADER BAR */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        paddingBottom: '24px',
        marginBottom: '32px',
        borderBottom: '1px solid var(--soc-border)'
      }}>
        <ShieldAlert size={36} color="var(--soc-red)" />
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#FFF' }}>
            SOC Telemetry Console
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748B' }}>
            Prototype Node (Simulated Data State)
          </p>
        </div>
      </header>

      {/* METRIC SUMMARIES */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={cardStyle}>
          <p style={metricLabelStyle}>Active Live Threats</p>
          <p style={{ ...metricValueStyle, color: 'var(--soc-red)' }}>{loading ? '...' : threats.length}</p>
        </div>
        <div style={cardStyle}>
          <p style={metricLabelStyle}>Monitored Endpoints</p>
          <p style={{ ...metricValueStyle, color: '#FFF' }}>157</p>
        </div>
        <div style={cardStyle}>
          <p style={metricLabelStyle}>Network Gateway Status</p>
          <p style={{ ...metricValueStyle, color: 'var(--soc-green)', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
            <ShieldCheck size={20} /> Operational
          </p>
        </div>
      </section>

      {/* THREAT DATA FEED */}
      {loading ? (
        <p style={{ color: '#64748B' }}>Inverting telemetry pipelines...</p>
      ) : (
        <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr' }}>
          <h2 style={{ fontSize: '18px', color: '#FFF', marginBottom: '4px' }}>Real-time Incident Feed</h2>
          {threats.map((threat) => (
            <div key={threat.id} style={{
              ...cardStyle,
              borderLeft: `4px solid ${threat.severity === 'Critical' ? 'var(--soc-red)' : 'var(--soc-yellow)'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#FFF', fontWeight: 600 }}>
                  <Terminal size={16} color="#64748B" />
                  {threat.computerName} <span style={{ color: '#64748B', fontWeight: 400 }}>({threat.ipAddress})</span>
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  backgroundColor: threat.severity === 'Critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  color: threat.severity === 'Critical' ? 'var(--soc-red)' : 'var(--soc-yellow)',
                  border: `1px solid ${threat.severity === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                }}>
                  {threat.severity.toUpperCase()}
                </span>
              </div>
              <p style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 500, color: '#F1F5F9' }}>{threat.threatType}</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>Flagged Object: <code style={{ backgroundColor: '#1E293B', padding: '2px 6px', borderRadius: '4px' }}>{threat.programName}</code></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* REUSABLE OBJECT STYLES */
const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--soc-card)',
  border: '1px solid var(--soc-border)',
  borderRadius: '12px',
  padding: '20px',
};

const metricLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '13px',
  color: '#94A3B8',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const metricValueStyle: React.CSSProperties = {
  margin: '8px 0 0 0',
  fontSize: '32px',
  fontWeight: 'bold',
};