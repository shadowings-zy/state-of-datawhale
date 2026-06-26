"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as echarts from "echarts";
import {
  createDatawhaleSeriesConfig,
  getAvailableMonthKeys,
} from "./chartUtils";
import styles from "./DatawhaleChart.module.css";

type DatawhaleSourceItem = {
  name: string;
  star_count: number;
  monthly_total_stars: Record<string, number>;
};

type DatawhaleChartProps<T extends DatawhaleSourceItem> = {
  source: readonly T[];
  title: string;
  mode: "total" | "yearlyGrowth";
  showLabel?: boolean;
  animationDuration?: number;
};

const getMonthValue = (month: string) => {
  const [year, monthIndex] = month.split("-").map(Number);
  return year * 12 + monthIndex;
};

const chartColors = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#9333ea",
  "#ea580c",
  "#0891b2",
  "#4f46e5",
  "#65a30d",
  "#be123c",
  "#0f766e",
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("zh-CN").format(value);

type LabelSeries = {
  data?: unknown[];
  name?: unknown;
};

const createEndLabelGraphics = (
  chart: echarts.ECharts,
  seriesList: LabelSeries[],
  months: string[],
  avoidOverlap: boolean,
) => {
  const lastMonth = months[months.length - 1];
  if (!lastMonth) {
    return [];
  }

  const labels = seriesList
    .map((series, index) => {
      const data = series.data ?? [];
      const value = Number(data[data.length - 1]);
      if (!Number.isFinite(value)) {
        return null;
      }

      const point = chart.convertToPixel(
        { xAxisIndex: 0, yAxisIndex: 0 },
        [lastMonth, value],
      ) as [number, number];

      return {
        color: chartColors[index % chartColors.length],
        name: String(series.name ?? ""),
        pointX: point[0],
        pointY: point[1],
        y: point[1],
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((left, right) => left.y - right.y);

  if (avoidOverlap) {
    const minGap = 30;
    const topBound = 58;
    const bottomBound = chart.getHeight() - 28;

    for (let index = 0; index < labels.length; index += 1) {
      const previous = labels[index - 1];
      labels[index].y = Math.max(labels[index].y, topBound);
      if (previous && labels[index].y - previous.y < minGap) {
        labels[index].y = previous.y + minGap;
      }
    }

    for (let index = labels.length - 1; index >= 0; index -= 1) {
      const next = labels[index + 1];
      labels[index].y = Math.min(labels[index].y, bottomBound);
      if (next && next.y - labels[index].y < minGap) {
        labels[index].y = next.y - minGap;
      }
    }
  }

  return labels.map((label, index) => {
    const labelX = Math.min(label.pointX + 49, chart.getWidth() - 160);

    return {
      id: `end-label-text-${index}`,
      type: "text",
      silent: true,
      x: labelX,
      y: label.y - 13,
      style: {
        text: label.name,
        overflow: "break",
        fill: label.color,
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        borderColor: label.color,
        borderWidth: 1,
        borderRadius: 4,
        padding: [3, 7],
        fontSize: 12,
        fontWeight: 600,
      },
      z: 101,
    };
  });
};

export function DatawhaleChart<T extends DatawhaleSourceItem>({
  source,
  title,
  mode,
  showLabel = false,
  animationDuration,
}: DatawhaleChartProps<T>) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const renderEndLabelsRef = useRef<() => void>(() => {});
  const availableMonthKeys = useMemo(() => getAvailableMonthKeys(source), [source]);
  const storageKey = useMemo(
    () => `datawhale-chart-period:${mode}:${title}`,
    [mode, title],
  );
  const [fromMonth, setFromMonth] = useState(availableMonthKeys[0] ?? "");
  const [toMonth, setToMonth] = useState(
    availableMonthKeys[availableMonthKeys.length - 1] ?? "",
  );

  useEffect(() => {
    if (!availableMonthKeys.length) {
      return;
    }

    const savedPeriod = window.localStorage.getItem(storageKey);
    if (savedPeriod) {
      try {
        const parsedPeriod = JSON.parse(savedPeriod) as {
          fromMonth?: string;
          toMonth?: string;
        };
        const savedFromMonth = parsedPeriod.fromMonth ?? "";
        const savedToMonth = parsedPeriod.toMonth ?? "";

        if (
          availableMonthKeys.includes(savedFromMonth) &&
          availableMonthKeys.includes(savedToMonth)
        ) {
          setFromMonth(savedFromMonth);
          setToMonth(savedToMonth);
          return;
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }

    setFromMonth(availableMonthKeys[0]);
    setToMonth(availableMonthKeys[availableMonthKeys.length - 1]);
  }, [availableMonthKeys, storageKey]);

  useEffect(() => {
    if (!fromMonth || !toMonth) {
      return;
    }

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        fromMonth,
        toMonth,
      }),
    );
  }, [fromMonth, storageKey, toMonth]);

  const normalizedRange = useMemo(() => {
    if (!fromMonth || !toMonth) {
      return { fromMonth, toMonth };
    }

    return getMonthValue(fromMonth) <= getMonthValue(toMonth)
      ? { fromMonth, toMonth }
      : { fromMonth: toMonth, toMonth: fromMonth };
  }, [fromMonth, toMonth]);

  const { months, generateSeriesList } = useMemo(
    () =>
      createDatawhaleSeriesConfig({
        source,
        mode,
        showLabel,
        fromMonth: normalizedRange.fromMonth,
        toMonth: normalizedRange.toMonth,
      }),
    [mode, normalizedRange.fromMonth, normalizedRange.toMonth, showLabel, source],
  );

  const seriesList = useMemo(
    () =>
      generateSeriesList().map((series) => ({
        ...series,
        endLabel: showLabel
          ? undefined
          : {
              show: true,
              formatter: "{a}",
              distance: 8,
            },
        animation: true,
        animationDuration: animationDuration ?? 800,
        animationDurationUpdate: 450,
        animationEasing: "cubicOut",
        animationEasingUpdate: "cubicOut",
        symbol: "circle",
        symbolSize: mode === "total" ? 4 : 6,
        lineStyle: {
          ...(series.lineStyle ?? {}),
          width: mode === "total" ? 2 : 3,
        },
        areaStyle:
          mode === "yearlyGrowth"
            ? {
                opacity: 0.08,
              }
            : undefined,
        emphasis: {
          focus: "series",
          lineStyle: {
            width: 4,
          },
        },
      })),
    [animationDuration, generateSeriesList, mode, showLabel],
  );

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    const chart = echarts.init(chartRef.current);
    chartInstanceRef.current = chart;

    const handleResize = () => {
      chart.resize();
      window.requestAnimationFrame(() => renderEndLabelsRef.current());
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const chart = chartInstanceRef.current;
    if (!chart) {
      return;
    }

    const renderEndLabels = () => {
      chart.setOption({
        graphic: {
          id: "end-label-layer",
          type: "group",
          silent: true,
          children: showLabel
            ? createEndLabelGraphics(chart, seriesList, months, true)
            : [],
        },
      });
    };

    renderEndLabelsRef.current = renderEndLabels;

    chart.setOption(
      {
        animationDuration,
        backgroundColor: "#ffffff",
        color: chartColors,
        textStyle: {
          color: "#334155",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "line",
            lineStyle: {
              color: "#94a3b8",
              width: 1,
              type: "dashed",
            },
          },
          backgroundColor: "rgba(15, 23, 42, 0.92)",
          borderColor: "transparent",
          borderWidth: 0,
          padding: [10, 12],
          textStyle: {
            color: "#f8fafc",
            fontSize: 12,
          },
          valueFormatter: (value: number | string) =>
            typeof value === "number" ? formatNumber(value) : String(value),
        },
        legend: {
          data: source.map((item) => item.name),
          type: "scroll",
          orient: "horizontal",
          top: 8,
          left: 8,
          right: 8,
          itemWidth: 16,
          itemHeight: 8,
          textStyle: {
            color: "#475569",
            fontSize: 12,
          },
        },
        grid: {
          left: 24,
          right: 180,
          bottom: 36,
          top: 82,
          containLabel: true,
        },
        toolbox: {
          top: 42,
          right: 18,
          feature: {
            saveAsImage: {},
          },
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: months,
          axisLine: {
            lineStyle: {
              color: "#cbd5e1",
            },
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: "#64748b",
            margin: 14,
          },
        },
        yAxis: {
          type: "value",
          splitLine: {
            lineStyle: {
              color: "#e2e8f0",
            },
          },
          axisLabel: {
            color: "#64748b",
            formatter: (value: number) => formatNumber(value),
          },
        },
        graphic: {
          id: "end-label-layer",
          type: "group",
          silent: true,
          children: [],
        },
        series: seriesList,
      },
      true,
    );
    window.requestAnimationFrame(renderEndLabels);
  }, [animationDuration, months, seriesList, source]);

  return (
    <div className={styles.page}>
      <main className={styles.shell}>
        <div className={styles.toolbar}>
          <div className={styles.titleGroup}>
            <button
              className={styles.backButton}
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                  return;
                }
                window.location.href = "/";
              }}
            >
              Back
            </button>
            <h1>{title}</h1>
          </div>
          <div className={styles.controls}>
            <label className={styles.field}>
              <span>From</span>
              <select
                value={fromMonth}
                onChange={(event) => setFromMonth(event.target.value)}
              >
                {availableMonthKeys.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span>To</span>
              <select
                value={toMonth}
                onChange={(event) => setToMonth(event.target.value)}
              >
                {availableMonthKeys.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <section
          className={styles.chartPanel}
          aria-label={title}
        >
          <div ref={chartRef} className={styles.chart} />
        </section>
      </main>
    </div>
  );
}
