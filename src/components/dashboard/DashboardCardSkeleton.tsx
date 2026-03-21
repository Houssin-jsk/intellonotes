export function DashboardCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4 animate-pulse">
      {/* Badge row */}
      <div className="flex items-start justify-between gap-2">
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
        <div className="h-4 w-14 bg-gray-200 rounded-full" />
      </div>

      {/* Title */}
      <div className="h-5 w-3/4 bg-gray-200 rounded" />

      {/* Progress bar + axis text */}
      <div className="space-y-1.5">
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-1.5 flex-1 rounded-full bg-gray-200" />
          ))}
        </div>
        <div className="h-3 w-24 bg-gray-200 rounded" />
      </div>

      {/* CTA button */}
      <div className="h-9 w-full bg-gray-200 rounded-lg" />
    </div>
  );
}

export function DashboardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <DashboardCardSkeleton key={i} />
      ))}
    </div>
  );
}
