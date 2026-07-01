// Large, obvious Suspense skeletons are a first-class feature of this lab so
// progressive loading is easy to see and screenshot. Presentation-only → shared.

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`skeleton h-4 ${className}`} />;
}

/** A grid of placeholder cards used as a Suspense fallback for any feature. */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-slate-700 bg-slate-800/60 p-4"
        >
          <SkeletonLine className="mb-3 w-2/3" />
          <SkeletonLine className="mb-2 w-1/2" />
          <SkeletonLine className="w-1/3" />
        </div>
      ))}
    </div>
  );
}
