'use client';


import React, { useRef, useState } from 'react';

interface LineChartProps {
  data: { x: number; y: number }[];
  width?: number;
  height?: number;
  color?: string;
  label?: string;
  yLabel?: string;
  xLabel?: string;
}

export default function LineChart({ data, width = 400, height = 160, color = '#0074D9', label, yLabel, xLabel }: LineChartProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; value: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  if (!data.length) return <div>No data</div>;
  const minX = Math.min(...data.map(d => d.x));
  const maxX = Math.max(...data.map(d => d.x));
  const minY = Math.min(...data.map(d => d.y));
  const maxY = Math.max(...data.map(d => d.y));
  const scaleX = (x: number) => ((x - minX) / (maxX - minX || 1)) * (width - 60) + 40;
  const scaleY = (y: number) => height - 30 - ((y - minY) / (maxY - minY || 1)) * (height - 50);
  const points = data.map(d => `${scaleX(d.x)},${scaleY(d.y)}`).join(' ');

  // Responsive width
  React.useEffect(() => {
    if (svgRef.current) {
      const handleResize = () => {
        svgRef.current!.setAttribute('width', `${svgRef.current!.parentElement?.clientWidth || width}`);
      };
      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [svgRef]);

  // Tick marks
  const yTicks = 5;
  const xTicks = 5;
  const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) => minY + (i * (maxY - minY)) / yTicks);
  const xTickVals = Array.from({ length: xTicks + 1 }, (_, i) => minX + (i * (maxX - minX)) / xTicks);

  return (
    <div style={{ width: '100%', maxWidth: width }}>
      <svg ref={svgRef} width={width} height={height} style={{ background: '#fafbfc', border: '1px solid #eee', width: '100%' }}>
        <polyline fill="none" stroke={color} strokeWidth={2} points={points} />
        {/* Axis */}
        <line x1={40} y1={height - 30} x2={width - 20} y2={height - 30} stroke="#bbb" />
        <line x1={40} y1={height - 30} x2={40} y2={20} stroke="#bbb" />
        {/* Y-axis ticks and values */}
        {yTickVals.map((y, i) => (
          <g key={i}>
            <line x1={36} y1={scaleY(y)} x2={40} y2={scaleY(y)} stroke="#bbb" />
            <text x={32} y={scaleY(y) + 4} fontSize={10} fill="#888" textAnchor="end">{y.toFixed(2)}</text>
          </g>
        ))}
        {/* X-axis ticks and values */}
        {xTickVals.map((x, i) => (
          <g key={i}>
            <line x1={scaleX(x)} y1={height - 30} x2={scaleX(x)} y2={height - 26} stroke="#bbb" />
            <text x={scaleX(x)} y={height - 14} fontSize={10} fill="#888" textAnchor="middle">{x.toFixed(0)}</text>
          </g>
        ))}
        {/* Axis labels */}
        {yLabel && <text x={10} y={30} fontSize={12} fill="#666" textAnchor="start">{yLabel}</text>}
        {xLabel && <text x={width / 2} y={height - 5} fontSize={12} fill="#666" textAnchor="middle">{xLabel}</text>}
        {/* Chart label */}
        <text x={width / 2} y={15} textAnchor="middle" fontSize={14} fill="#333">{label}</text>
        {/* Tooltip dots */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={scaleX(d.x)}
            cy={scaleY(d.y)}
            r={4}
            fill={color}
            opacity={0.2}
            onMouseEnter={() => setTooltip({ x: scaleX(d.x), y: scaleY(d.y), value: d.y })}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
        {tooltip && (
          <g>
            <rect x={tooltip.x - 20} y={tooltip.y - 30} width={48} height={20} fill="#fff" stroke="#ccc" rx={4} />
            <text x={tooltip.x + 4} y={tooltip.y - 16} fontSize={12} fill="#333">{tooltip.value.toFixed(3)}</text>
          </g>
        )}
      </svg>
    </div>
  );
}
