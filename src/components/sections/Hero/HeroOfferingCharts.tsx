"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState, type SVGProps } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { useMotionValueEvent, useSpring } from "motion/react";
import styles from "./HeroOfferingShowcase.module.scss";

const barChartData = [
  { month: "Jan", desktop: 342 },
  { month: "Feb", desktop: 876 },
  { month: "Mar", desktop: 512 },
  { month: "Apr", desktop: 629 },
  { month: "May", desktop: 458 },
  { month: "Jun", desktop: 781 },
  { month: "Jul", desktop: 394 },
] as const;

const areaChartData = [
  { month: "Jan", mobile: 245 },
  { month: "Feb", mobile: 654 },
  { month: "Mar", mobile: 387 },
  { month: "Apr", mobile: 521 },
  { month: "May", mobile: 412 },
  { month: "Jun", mobile: 598 },
  { month: "Jul", mobile: 312 },
  { month: "Aug", mobile: 743 },
  { month: "Sep", mobile: 489 },
  { month: "Oct", mobile: 476 },
  { month: "Nov", mobile: 687 },
  { month: "Dec", mobile: 198 },
] as const;

function CustomGradientBar(
  props: SVGProps<SVGRectElement> & {
    dataKey?: string;
    payload?: { month?: string };
  },
) {
  const { fill, x, y, width, height, dataKey, payload } = props;
  const gradientId = `gradient-bar-${dataKey}-${payload?.month ?? "value"}`;
  const barX = Number(x ?? 0);
  const barY = Number(y ?? 0);
  const barWidth = Number(width ?? 0);
  const barHeight = Number(height ?? 0);
  const barRadius = barWidth ? Math.min(barWidth / 2, 14) : 14;

  return (
    <>
      <rect
        x={barX}
        y={barY}
        width={barWidth}
        height={barHeight}
        rx={barRadius}
        ry={barRadius}
        stroke="none"
        fill={`url(#${gradientId})`}
      />
      <rect
        x={barX}
        y={barY}
        width={barWidth}
        height={2}
        rx={2}
        ry={2}
        stroke="none"
        fill={fill}
      />
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} stopOpacity={0.88} />
          <stop offset="100%" stopColor={fill} stopOpacity={0.08} />
        </linearGradient>
      </defs>
    </>
  );
}

function ChartTooltipContent({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: { month?: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const current = payload[0];

  return (
    <div className={styles.evilTooltip}>
      <span>{current.payload?.month}</span>
      <strong>{current.value}</strong>
    </div>
  );
}

export function ShowcaseGradientBarChart() {
  return (
    <div className={styles.evilCard}>
      <div className={styles.evilHeader}>
        <div>
          <div className={styles.evilTitleRow}>
            <strong>Bar Chart</strong>
            <span className={styles.evilTrendUp}>
              <TrendingUp size={14} aria-hidden="true" />
              <span>5.2%</span>
            </span>
          </div>
          <span className={styles.evilSubtle}>January - July 2025</span>
        </div>
      </div>

      <div className={styles.evilChartWrap}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={barChartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
            />
            <Tooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              shape={<CustomGradientBar />}
              dataKey="desktop"
              fill="var(--accent-primary)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ShowcaseClippedAreaChart() {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [axis, setAxis] = useState(0);
  const [chartWidth, setChartWidth] = useState(0);
  const springX = useSpring(0, { damping: 30, stiffness: 100 });
  const springY = useSpring(areaChartData[areaChartData.length - 1].mobile, {
    damping: 30,
    stiffness: 100,
  });

  useEffect(() => {
    const node = chartRef.current;
    if (!node) return;

    const updateWidth = () => {
      setChartWidth(node.getBoundingClientRect().width);
    };

    updateWidth();

    const resizeObserver = new ResizeObserver(() => {
      updateWidth();
    });

    resizeObserver.observe(node);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (chartWidth <= 0) return;

    springX.jump(chartWidth);
    springY.jump(areaChartData[areaChartData.length - 1].mobile);
  }, [chartWidth, springX, springY]);

  useMotionValueEvent(springX, "change", (latest) => {
    setAxis(latest);
  });

  const clipRight = Math.max(chartWidth - axis, 0);

  return (
    <div className={styles.evilCard}>
      <div className={styles.evilHeader}>
        <div>
          <div className={styles.evilTitleRow}>
            <strong>${springY.get().toFixed(0)}</strong>
            <span className={styles.evilTrendDown}>
              <TrendingDown size={14} aria-hidden="true" />
              <span>-5.2%</span>
            </span>
          </div>
          <span className={styles.evilSubtle}>Total revenue for last year</span>
        </div>
      </div>

      <div ref={chartRef} className={styles.evilChartWrap}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            className={styles.evilAreaChart}
            data={areaChartData}
            margin={{ top: 14, right: 0, left: 0, bottom: 0 }}
            onMouseMove={(state) => {
              const x = state.activeCoordinate?.x;
              const dataValue = (state as { activePayload?: Array<{ value?: number }> })
                .activePayload?.[0]?.value;
              if (typeof x === "number" && typeof dataValue === "number") {
                springX.set(x);
                springY.set(dataValue);
              }
            }}
            onMouseLeave={() => {
              springX.set(chartWidth);
              springY.jump(areaChartData[areaChartData.length - 1].mobile);
            }}
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--chart-grid)"
              strokeDasharray="3 3"
              horizontalCoordinatesGenerator={({ height }) => [0, height - 30]}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
            />
            <defs>
              <linearGradient id="gradient-clipped-area-mobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FCA070" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#FCA070" stopOpacity={0} />
              </linearGradient>
              <clipPath id="clip-reveal-area">
                <rect x="0" y="0" width={axis} height="220" />
              </clipPath>
            </defs>
            <Area
              dataKey="mobile"
              type="monotone"
              fill="url(#gradient-clipped-area-mobile)"
              fillOpacity={0.5}
              stroke="#FCA070"
              clipPath="url(#clip-reveal-area)"
              strokeWidth={3}
            />
            <line
              x1={axis}
              y1={0}
              x2={axis}
              y2="85%"
              stroke="#FCA070"
              strokeDasharray="3 3"
              strokeLinecap="round"
              strokeOpacity={0.22}
            />
            <rect x={axis - 48} y={0} width={48} height={18} fill="#FCA070" />
            <text
              x={axis - 24}
              y={13}
              textAnchor="middle"
              fill="white"
              fontSize="11"
              fontWeight={600}
            >
              ${springY.get().toFixed(0)}
            </text>
            <Area
              dataKey="mobile"
              type="monotone"
              fill="none"
              stroke="#FCA070"
              strokeOpacity={0.12}
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
        <div
          className={styles.evilAreaMask}
          style={{ insetInlineStart: `${axis}px`, width: `${clipRight}px` }}
        />
      </div>
    </div>
  );
}
