export default function Spinner({ size = 24, style }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2.5px solid var(--border-primary)`,
      borderTopColor: 'var(--accent-primary)',
      borderRadius: '50%',
      ...style,
    }} className="animate-spin" />
  );
}
