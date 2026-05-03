function InfoRules() {
  const [openSection, setOpenSection] = React.useState(null);

  function toggle(id) {
    setOpenSection(prev => prev === id ? null : id);
  }

  const sections = [
    {
      id: 'booking',
      icon: '🎟️',
      title: 'Booking Policy',
      color: '#4f46e5',
      bg: '#eef2ff',
      items: [
        'Students must book their seat at least 1 day in advance.',
        'Each student is allowed only one active booking per semester.',
        'Bookings are non-transferable and tied to your student ID.',
        'Your booking is confirmed only after successful payment.',
        'Partial payments are not accepted — full fare must be paid upfront.',
      ]
    },
    {
      id: 'schedule',
      icon: '🕐',
      title: 'Schedule & Punctuality',
      color: '#0077cc',
      bg: '#e8f4ff',
      items: [
        'Buses depart exactly on schedule — do not be late.',
        'Students must be at the stoppage at least 5 minutes before departure.',
        'The bus will not wait for late arrivals under any circumstances.',
        'Schedules may change during exam periods or university holidays.',
        'Check the Schedules page regularly for the latest timings.',
      ]
    },
    {
      id: 'conduct',
      icon: '🤝',
      title: 'Code of Conduct',
      color: '#059669',
      bg: '#e8fff0',
      items: [
        'Maintain a respectful and courteous attitude towards drivers and fellow students.',
        'No loud music, shouting, or disruptive behaviour on the bus.',
        'Keep the bus clean — do not litter. Dispose of waste in designated bins.',
        'Eating and drinking (except water) is not permitted on the bus.',
        'Students found harassing others will have their bus pass revoked.',
      ]
    },
    {
      id: 'safety',
      icon: '⚠️',
      title: 'Safety Rules',
      color: '#d97706',
      bg: '#fff8e6',
      items: [
        'Always remain seated while the bus is in motion.',
        'Do not distract the driver under any circumstances.',
        'In case of emergency, use the SOS button in the app immediately.',
        'Report any suspicious activity to the driver or university security.',
        'Seatbelts must be worn at all times where available.',
      ]
    },
    {
      id: 'payment',
      icon: '💳',
      title: 'Payment & Refunds',
      color: '#7c3aed',
      bg: '#f3f0ff',
      items: [
        'Accepted payment methods: bKash, Nagad, and Cash.',
        'Online payments (bKash/Nagad) are processed instantly upon confirmation.',
        'Cash payments must be made to the designated university cashier.',
        'Refunds are only granted if a cancellation is made 48 hours before the semester starts.',
        'No refunds will be issued after the semester has commenced.',
      ]
    },
    {
      id: 'lost',
      icon: '🔍',
      title: 'Lost & Found',
      color: '#db2777',
      bg: '#fff0f6',
      items: [
        'Report any lost items through the Lost & Found section in this app.',
        'Found items are handed to the university transport office.',
        'Items not claimed within 30 days will be donated or disposed of.',
        'BRACU is not liable for valuables lost on the bus.',
        'Always double-check your belongings before exiting the bus.',
      ]
    },
    {
      id: 'contact',
      icon: '📞',
      title: 'Contact & Support',
      color: '#0891b2',
      bg: '#e0f7fa',
      items: [
        'Transport Office: transport@bracu.ac.bd',
        'Helpline: +880-2-9844051 (Ext. 4050)',
        'Office Hours: Sunday–Thursday, 8:00 AM – 5:00 PM',
        'For urgent issues during transit, use the SOS button in the app.',
        'Feedback can be submitted through the Feedback section.',
      ]
    },
  ];

  return (
    <div className="content">
      {/* Hero Header */}
      <div style={ir.hero}>
        <div style={ir.heroInner}>
          <div style={ir.heroIcon}>📋</div>
          <div>
            <h1 style={ir.heroTitle}>Info &amp; Rules</h1>
            <p style={ir.heroSub}>Everything you need to know about the BRACU Bus Service</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={ir.statsRow}>
        {[
          { icon: '🚌', value: 'On Time', label: 'Bus Punctuality' },
          { icon: '🎓', value: '24/7', label: 'App Support' },
          { icon: '🔒', value: 'Secure', label: 'Payments' },
          { icon: '📍', value: 'Live', label: 'Schedules' },
        ].map((s, i) => (
          <div key={i} style={ir.statCard}>
            <div style={ir.statIcon}>{s.icon}</div>
            <div style={ir.statValue}>{s.value}</div>
            <div style={ir.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Accordion Sections */}
      <div style={ir.accordionWrap}>
        {sections.map(sec => {
          const isOpen = openSection === sec.id;
          return (
            <div key={sec.id} style={{ ...ir.card, borderColor: isOpen ? sec.color : '#e8edf5' }}>
              {/* Header */}
              <button
                style={{ ...ir.cardHeader, background: isOpen ? sec.bg : '#fff' }}
                onClick={() => toggle(sec.id)}
              >
                <div style={ir.cardHeaderLeft}>
                  <span style={{ ...ir.cardIcon, background: sec.bg, color: sec.color }}>
                    {sec.icon}
                  </span>
                  <span style={{ ...ir.cardTitle, color: isOpen ? sec.color : '#1a2a3a' }}>
                    {sec.title}
                  </span>
                </div>
                <span style={{ ...ir.chevron, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: sec.color }}>
                  ▾
                </span>
              </button>

              {/* Body */}
              {isOpen && (
                <div style={ir.cardBody}>
                  <ul style={ir.list}>
                    {sec.items.map((item, i) => (
                      <li key={i} style={ir.listItem}>
                        <span style={{ ...ir.bullet, background: sec.color }} />
                        <span style={ir.listText}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div style={ir.footerNote}>
        <span style={{ fontSize: 18 }}>ℹ️</span>
        <span>
          Rules are subject to change. Always check this page for the latest updates.
          For any queries, contact the Transport Office.
        </span>
      </div>
    </div>
  );
}

const ir = {
  hero: {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    borderRadius: 20,
    padding: '28px 28px',
    marginBottom: 24,
    boxShadow: '0 8px 32px rgba(79,70,229,0.25)',
  },
  heroInner: {
    display: 'flex',
    alignItems: 'center',
    gap: 18,
  },
  heroIcon: {
    fontSize: 48,
    lineHeight: 1,
  },
  heroTitle: {
    margin: 0,
    fontSize: 26,
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.3px',
  },
  heroSub: {
    margin: '4px 0 0',
    fontSize: 14,
    color: 'rgba(255,255,255,0.82)',
    fontWeight: 500,
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 14,
    marginBottom: 24,
  },
  statCard: {
    background: '#fff',
    borderRadius: 16,
    padding: '18px 12px',
    textAlign: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
    border: '1px solid #e8edf5',
  },
  statIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  statValue: {
    fontWeight: 800,
    fontSize: 16,
    color: '#1a2a3a',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: 600,
  },
  accordionWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginBottom: 24,
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    border: '2px solid #e8edf5',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    transition: 'border-color 0.2s',
  },
  cardHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'Nunito, sans-serif',
    transition: 'background 0.2s',
  },
  cardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  cardIcon: {
    fontSize: 20,
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 800,
    transition: 'color 0.2s',
  },
  chevron: {
    fontSize: 20,
    fontWeight: 700,
    transition: 'transform 0.25s ease',
    display: 'inline-block',
    lineHeight: 1,
  },
  cardBody: {
    padding: '4px 20px 20px 20px',
    borderTop: '1px solid #f0f4fa',
  },
  list: {
    listStyle: 'none',
    margin: '12px 0 0',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  listItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: 6,
  },
  listText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 1.6,
    fontWeight: 500,
  },
  footerNote: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    background: '#f0f6ff',
    border: '1.5px solid #c7dcf8',
    borderRadius: 14,
    padding: '14px 18px',
    fontSize: 13,
    color: '#3a5a8a',
    fontWeight: 600,
    lineHeight: 1.5,
  },
};
