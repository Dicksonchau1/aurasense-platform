export function CoverageLegend() {
  return (
    <div className="absolute bottom-4 right-4 bg-white/90 rounded p-3 text-xs font-mono shadow">
      <div className="font-semibold mb-1">Surface overlay</div>
      <div className="flex items-center gap-2"><span className="inline-block w-4 h-4 bg-emerald-500"/> coverage</div>
      <div className="flex items-center gap-2"><span className="inline-block w-4 h-4 bg-red-500"/>     defect likelihood</div>
      <div className="flex items-center gap-2"><span className="inline-block w-4 h-4 bg-yellow-500"/>  both — high-value inspection zone</div>
      <div className="text-neutral-500 mt-1">brightness = confidence × proximity</div>
    </div>
  );
}