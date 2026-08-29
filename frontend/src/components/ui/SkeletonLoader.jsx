export default function SkeletonLoader({ rows = 3 }) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height: '80px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)',
            backgroundSize: '200% 100%',
            animation: 'skeletonShimmer 1.5s infinite',
          }}
        />
      ))}
    </div>
  );
}
