import React from "react";

interface DataPoint {
  label: string;
  value: number;
}

interface CartesianBarChartProps {
  data: DataPoint[];
  formatValue?: (v: number) => string;
  barColor?: string;
  height?: number;
}

const VIEW_W = 640;
const PAD_LEFT = 60;
const PAD_RIGHT = 16;
const PAD_TOP = 20;
const PAD_BOTTOM = 34;

// Kütüphanesiz, saf SVG ile x/y eksenli (kartezyen) bar grafik — admin
// panelin geri kalanı gibi (ConfirmDialog, Pagination vb.) hazır bir
// component kütüphanesi yerine elle yazıldı. Sunucu tarafında (Server
// Component içinde) render edilebilir, hiç JS state/hook kullanmıyor.
export function CartesianBarChart({
  data,
  formatValue = (v) => v.toLocaleString("tr-TR"),
  barColor = "#f97316",
  height = 220,
}: CartesianBarChartProps) {
  const hasData = data.length > 0 && data.some((d) => d.value > 0);

  if (!hasData) {
    return <p className="text-sm text-slate-400 py-10 text-center">Henüz yeterli veri yok.</p>;
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const plotW = VIEW_W - PAD_LEFT - PAD_RIGHT;
  const plotH = height - PAD_TOP - PAD_BOTTOM;
  const barGap = 16;
  const barWidth = (plotW - barGap * (data.length - 1)) / data.length;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));

  return (
    <svg viewBox={`0 0 ${VIEW_W} ${height}`} width="100%" height={height} role="img" aria-label="Grafik">
      {/* y ekseni: gridline + değer etiketi */}
      {ticks.map((t, i) => {
        const y = PAD_TOP + plotH - (t / max) * plotH;
        return (
          <g key={i}>
            <line
              x1={PAD_LEFT}
              y1={y}
              x2={VIEW_W - PAD_RIGHT}
              y2={y}
              strokeWidth={1}
              className="stroke-slate-100 dark:stroke-white/10"
            />
            <text x={PAD_LEFT - 8} y={y + 3} textAnchor="end" fontSize={10} className="fill-slate-400 dark:fill-slate-500">
              {formatValue(t)}
            </text>
          </g>
        );
      })}

      {/* x/y eksen çizgileri */}
      <line
        x1={PAD_LEFT}
        y1={PAD_TOP}
        x2={PAD_LEFT}
        y2={PAD_TOP + plotH}
        strokeWidth={1.5}
        className="stroke-slate-300 dark:stroke-white/20"
      />
      <line
        x1={PAD_LEFT}
        y1={PAD_TOP + plotH}
        x2={VIEW_W - PAD_RIGHT}
        y2={PAD_TOP + plotH}
        strokeWidth={1.5}
        className="stroke-slate-300 dark:stroke-white/20"
      />

      {/* barlar */}
      {data.map((d, i) => {
        const barH = (d.value / max) * plotH;
        const x = PAD_LEFT + i * (barWidth + barGap);
        const y = PAD_TOP + plotH - barH;
        return (
          <g key={d.label}>
            <rect x={x} y={y} width={barWidth} height={Math.max(barH, 1)} rx={4} fill={barColor} />
            <text
              x={x + barWidth / 2}
              y={y - 6}
              textAnchor="middle"
              fontSize={10}
              fontWeight={700}
              className="fill-slate-700 dark:fill-slate-200"
            >
              {formatValue(d.value)}
            </text>
            <text
              x={x + barWidth / 2}
              y={PAD_TOP + plotH + 17}
              textAnchor="middle"
              fontSize={10}
              className="fill-slate-500 dark:fill-slate-400"
            >
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
