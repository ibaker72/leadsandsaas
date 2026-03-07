export default function DashboardLoading() {
  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-5">
      {/* Fake topbar */}
      <div className="h-16 flex items-center px-8">
        <div className="skeleton h-6 w-40 rounded" />
      </div>
      {/* Fake stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
        {[0,1,2,3].map(i => <div key={i} className="skeleton rounded-xl h-[100px] md:h-[120px]" style={{ animationDelay: `${i*100}ms` }} />)}
      </div>
      {/* Fake content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="skeleton rounded-xl h-[200px]" />
        <div className="skeleton rounded-xl h-[200px]" />
      </div>
    </div>
  );
}
