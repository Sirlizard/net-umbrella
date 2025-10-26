import React from 'react';

interface ScatterChartProps {
  data: { x: number; y: number }[];
  width?: number;
  height?: number;
  color?: string;
}

export const ScatterChart: React.FC<ScatterChartProps> = ({
  data,
  width = 400,
  height = 300,
  color = '#28428c',
}) => {
  if (data.length === 0) {
    return (
      <div style={{ width, height }} className="flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-500">No data available for scatter plot.</p>
      </div>
    );
  }

  const padding = 30;
  const maxX = Math.max(...data.map(d => d.x), 0);
  const maxY = Math.max(...data.map(d => d.y), 0);

  const xScale = (x: number) => padding + (x / maxX) * (width - 2 * padding);
  const yScale = (y: number) => height - padding - (y / maxY) * (height - 2 * padding);

  return (
    <svg width={width} height={height}>
      {/* Axes */}
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#ccc" />
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#ccc" />

      {/* Data Points */}
      {data.map((point, i) => (
        <circle key={i} cx={xScale(point.x)} cy={yScale(point.y)} r="4" fill={color} opacity="0.7" />
      ))}
    </svg>
  );
};
