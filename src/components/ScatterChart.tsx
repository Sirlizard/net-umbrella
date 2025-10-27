import React from 'react';

interface ScatterChartProps {
  data: { x: number; y: number }[];
  width?: number;
  height?: number;
  color?: string;
  title?: string;
  xLabel?: string;
  yLabel?: string;
}

export const ScatterChart: React.FC<ScatterChartProps> = ({
  data,
  width = 400,
  height = 300,
  color = '#28428c',
  title,
  xLabel,
  yLabel,
}) => {
  if (data.length === 0) {
    return (
      <div style={{ width, height }} className="flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-500">No data available for scatter plot.</p>
      </div>
    );
  }

  const padding = 40;
  const innerTop = title ? padding + 20 : padding;
  const maxX = Math.max(0, ...data.map(d => d.x));
  const maxY = Math.max(0, ...data.map(d => d.y));
  const safeMaxX = maxX === 0 ? 1 : maxX;
  const safeMaxY = maxY === 0 ? 1 : maxY;

  const xScale = (x: number) => padding + (x / safeMaxX) * (width - 2 * padding);
  const yScale = (y: number) => height - padding - (y / safeMaxY) * (height - innerTop - padding);

  return (
    <svg width={width} height={height}>
      {/* Title */}
      {title && (
        <text x={width / 2} y={padding} textAnchor="middle" fontSize={14} fill="#28428c" fontWeight={600}>
          {title}
        </text>
      )}
      {/* Axes */}
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" />
      <line x1={padding} y1={innerTop} x2={padding} y2={height - padding} stroke="#e5e7eb" />

      {/* Grid lines (light) */}
      {[0.25, 0.5, 0.75].map((t, i) => {
        const y = height - padding - t * (height - innerTop - padding);
        return <line key={`gy-${i}`} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#f3f4f6" />
      })}
      {[0.25, 0.5, 0.75].map((t, i) => {
        const x = padding + t * (width - 2 * padding);
        return <line key={`gx-${i}`} x1={x} y1={innerTop} x2={x} y2={height - padding} stroke="#f3f4f6" />
      })}

      {/* Data Points */}
      {data.map((point, i) => (
        <circle key={i} cx={xScale(point.x)} cy={yScale(point.y)} r="4" fill={color} opacity="0.7" />
      ))}

      {/* Axis labels */}
      {xLabel && (
        <text x={width / 2} y={height - 6} textAnchor="middle" fontSize={12} fill="#6b7280">
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text x={14} y={(height + innerTop) / 2} textAnchor="middle" fontSize={12} fill="#6b7280" transform={`rotate(-90, 14, ${(height + innerTop) / 2})`}>
          {yLabel}
        </text>
      )}
    </svg>
  );
};
