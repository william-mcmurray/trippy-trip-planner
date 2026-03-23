export default function LoadingSkeleton({ lines = 5 }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="h-4 bg-sage-100 rounded"
          style={{ width: `${Math.max(40, 100 - i * 12)}%` }}
        />
      ))}
    </div>
  );
}
