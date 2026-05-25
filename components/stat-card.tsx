export function StatCard({ label, value, delta }: { label: string; value: string | number; delta?: string }) {
  return (
    <div className="atlas-kpi">
      <p className="atlas-label">{label}</p>
      <div className="mt-4 flex items-end justify-between gap-4">
        <p className="text-3xl font-semibold text-white sm:text-4xl">{value}</p>
        {delta ? <p className="text-sm text-teal-300">{delta}</p> : null}
      </div>
    </div>
  );
}
