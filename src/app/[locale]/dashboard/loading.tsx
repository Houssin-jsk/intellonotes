import { DashboardGridSkeleton } from "@/components/dashboard/DashboardCardSkeleton";

export default function DashboardLoading() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header skeleton */}
      <div className="mb-8 animate-pulse">
        <div className="h-7 w-64 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded mt-2" />
      </div>
      <DashboardGridSkeleton />
    </main>
  );
}
