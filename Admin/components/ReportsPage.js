function ReportsPage() {
  const [tab, setTab] = React.useState('submissions');

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%', 
      overflow: 'hidden',
      fontFamily: 'Nunito, sans-serif' 
    }}>

      {/* Tab Bar */}
      <div style={{
        display: 'flex', gap: 0,
        borderBottom: '2px solid #f0f0f0',
        background: '#fff',
        padding: '0 32px',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        {[
          { key: 'submissions', icon: '📋', label: 'Student Reports' },
          { key: 'analytics',   icon: '📊', label: 'Report Analytics' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '16px 24px',
              border: 'none',
              borderBottom: tab === t.key ? '3px solid #667eea' : '3px solid transparent',
              background: 'transparent',
              color: tab === t.key ? '#667eea' : '#888',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif',
              marginBottom: -2,
              transition: 'all 0.2s'
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'submissions' && <AdminReports />}
      {tab === 'analytics'   && <ReportAnalytics />}
    </div>
  );
}