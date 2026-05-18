export default function SkeletonLoader() {
  return (
    <div className="animate-pulse space-y-4 rounded-xl bg-slate-800 p-6 border border-slate-700">
      {/* Header shimmer */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-3 w-3 rounded-full bg-red-500/50" />
        <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
        <div className="h-3 w-3 rounded-full bg-green-500/50" />
        <div className="h-4 w-48 rounded bg-slate-700 ml-2" />
      </div>
      {/* Text lines */}
      <div className="space-y-2">
        <div className="h-4 w-3/4 rounded bg-slate-700" />
        <div className="h-4 w-full rounded bg-slate-700" />
        <div className="h-4 w-5/6 rounded bg-slate-700" />
      </div>
      {/* Code block shimmer */}
      <div className="rounded-lg bg-slate-900 p-4 space-y-2 mt-4">
        <div className="h-3 w-1/4 rounded bg-slate-700" />
        <div className="h-3 w-full rounded bg-slate-700" />
        <div className="h-3 w-5/6 rounded bg-slate-700" />
        <div className="h-3 w-3/4 rounded bg-slate-700" />
        <div className="h-3 w-full rounded bg-slate-700" />
        <div className="h-3 w-2/3 rounded bg-slate-700" />
        <div className="h-3 w-4/5 rounded bg-slate-700" />
        <div className="h-3 w-full rounded bg-slate-700" />
      </div>
      {/* Bullet points */}
      <div className="space-y-2 mt-4">
        {[70, 90, 60, 80].map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-slate-700 flex-shrink-0" />
            <div
              className={`h-3 rounded bg-slate-700`}
              style={{ width: `${w}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
