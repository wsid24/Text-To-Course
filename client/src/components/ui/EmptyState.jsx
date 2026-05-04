export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="animate-fade-in" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: 'var(--space-3xl) var(--space-lg)',
      textAlign: 'center',
    }}>
      {Icon && (
        <div style={{
          width: 64, height: 64,
          borderRadius: 'var(--radius-lg)',
          background: 'var(--accent-glow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 'var(--space-lg)',
        }}>
          <Icon size={28} style={{ color: 'var(--accent-primary)' }} />
        </div>
      )}
      <h3 style={{
        fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)',
        marginBottom: 'var(--space-xs)',
      }}>{title}</h3>
      <p style={{
        color: 'var(--text-tertiary)', fontSize: '0.875rem',
        maxWidth: 360, lineHeight: 1.6, marginBottom: 'var(--space-lg)',
      }}>{description}</p>
      {action}
    </div>
  );
}
