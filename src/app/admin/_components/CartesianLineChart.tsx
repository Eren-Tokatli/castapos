import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface DataPoint {
  label: string;
  value: number;
}

interface CartesianLineChartProps {
  data: DataPoint[];
  formatValue?: (v: number) => string;
  height?: number;
}

const VIEW_W = 640;
const PAD_LEFT = 60;
const PAD_RIGHT = 16;
const PAD_TOP = 16;
const PAD_BOTTOM = 34;

// Borsa/hisse grafiklerindeki gibi: her segment kendi yönüne göre (bir
// önceki noktaya göre artmış/azalmışsa) yeşil/kırmızı renklenir, altında
// genel trendin rengiyle hafif bir alan dolgusu, üstte güncel değer + genel
// değişim rozeti var. Kütüphanesiz, saf SVG — CartesianBarChart ile aynı
// yaklaşım, sadece kategorik değil zaman serisi verisi için.
export function CartesianLineChart({
  data,
  formatValue = (v) => v.toLocaleString("tr-TR"),
  height = 200,
}: CartesianLineChartProps) {
  const hasData = data.length > 0 && data.some((d) => d.value > 0);
  if (!hasData) {
    return <p className="text-sm text-slate-400 py-10 text-center">Henüz yeterli veri yok.</p>;
  }

  const values = data.map((d) => d.value);
  const max = Math.max(...values, 1);
  const min = 0;
  const range = max - min || 1;

  const plotW = VIEW_W - PAD_LEFT - PAD_RIGHT;
  const plotH = height - PAD_TOP - PAD_BOTTOM;
  const stepX = data.length > 1 ? plotW / (data.length - 1) : 0;

  const px = (i: number) => PAD_LEFT + i * stepX;
  const py = (v: number) => PAD_TOP + plotH - ((v - min) / range) * plotH;

  const first = data[0].value;
  const last = data[data.length - 1].value;
  const overallUp = last >= first;
  const trendColor = overallUp ? "#10b981" : "#ef4444";
  const changePct = first !== 0 ? ((last - first) / Math.abs(first)) * 100 : last > 0 ? 100 : 0;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(min + range * f));

  const areaPath =
    `M ${px(0)},${PAD_TOP + plotH} ` +
    data.map((d, i) => `L ${px(i)},${py(d.value)}`).join(" ") +
    ` L ${px(data.length - 1)},${PAD_TOP + plotH} Z`;

  // 640px'lik alanda çok fazla gün etiketi sığmaz — en fazla ~7 etiket
  // göster, aradakileri atla.
  const labelStep = Math.max(1, Math.ceil(data.length / 7));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xl font-black text-slate-900 dark:text-white tabular-nums">{formatValue(last)}</span>
        <span
          className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
            overallUp
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
          }`}
        >
          {overallUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          %{Math.abs(changePct).toFixed(1)}
        </span>
      </div>

      <svg viewBox={`0 0 ${VIEW_W} ${height}`} width="100%" height={height} role="img" aria-label="Trend grafiği">
        {ticks.map((t, i) => {
          const y = py(t);
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

        <line
          x1={PAD_LEFT}
          y1={PAD_TOP + plotH}
          x2={VIEW_W - PAD_RIGHT}
          y2={PAD_TOP + plotH}
          strokeWidth={1.5}
          className="stroke-slate-300 dark:stroke-white/20"
        />

        <path d={areaPath} fill={trendColor} fillOpacity={0.08} stroke="none" />

        {data.slice(1).map((d, idx) => {
          const i = idx + 1;
          const up = d.value >= data[i - 1].value;
          return (
            <line
              key={i}
              x1={px(i - 1)}
              y1={py(data[i - 1].value)}
              x2={px(i)}
              y2={py(d.value)}
              stroke={up ? "#10b981" : "#ef4444"}
              strokeWidth={2}
              strokeLinecap="round"
            />
          );
        })}

        {data.map((d, i) => (
          <circle
            key={i}
            cx={px(i)}
            cy={py(d.value)}
            r={i === data.length - 1 ? 4 : 2}
            fill={i === data.length - 1 ? trendColor : "#94a3b8"}
          />
        ))}

        {data.map(
          (d, i) =>
            (i % labelStep === 0 || i === data.length - 1) && (
              <text
                key={i}
                x={px(i)}
                y={PAD_TOP + plotH + 17}
                textAnchor="middle"
                fontSize={10}
                className="fill-slate-500 dark:fill-slate-400"
              >
                {d.label}
              </text>
            )
        )}
      </svg>
    </div>
  );
}
