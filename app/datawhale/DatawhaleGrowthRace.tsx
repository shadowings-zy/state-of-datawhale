"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as echarts from "echarts";
import { getAvailableMonthKeys } from "./chartUtils";
import styles from "./DatawhaleGrowthRace.module.css";

type DatawhaleSourceItem = {
  name: string;
  monthly_total_stars: Record<string, number>;
};

type DatawhaleGrowthRaceProps<T extends DatawhaleSourceItem> = {
  source: readonly T[];
  title: string;
  topCount?: number;
  animationInterval?: number;
};

type RaceItem = {
  name: string;
  value: number;
};

const chartColors = [
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#9333ea",
  "#0891b2",
  "#0f766e",
  "#ca8a04",
  "#be123c",
  "#4f46e5",
  "#475569",
  "#65a30d",
  "#db2777",
  "#64748b",
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("zh-CN").format(Math.round(value));

const getMonthValue = (month: string) => {
  const [year, monthIndex] = month.split("-").map(Number);
  return year * 12 + monthIndex;
};

const formatMonthDateRange = (month: string) => {
  const [year, monthIndex] = month.split("-").map(Number);
  const lastDay = new Date(year, monthIndex, 0).getDate();

  return `${year}-${monthIndex}-1 到 ${year}-${monthIndex}-${lastDay}`;
};

const getGrowthValue = (item: DatawhaleSourceItem, month: string, baseMonth: string) =>
  Math.max(
    0,
    (item.monthly_total_stars[month] || 0) -
      (item.monthly_total_stars[baseMonth] || 0),
  );

const buildRaceItems = <T extends DatawhaleSourceItem>(
  source: readonly T[],
  month: string,
  baseMonth: string,
  topCount: number,
) => {
  return source
    .map((item) => ({
      name: item.name,
      value: getGrowthValue(item, month, baseMonth),
    }))
    .filter((item) => item.value > 0)
    .sort((left, right) => right.value - left.value)
    .slice(0, topCount)
    .sort((left, right) => left.value - right.value);
};

export function DatawhaleGrowthRace<T extends DatawhaleSourceItem>({
  source,
  title,
  topCount = 36,
  animationInterval = 1400,
}: DatawhaleGrowthRaceProps<T>) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const timerRef = useRef<number | null>(null);
  const availableMonthKeys = useMemo(() => getAvailableMonthKeys(source), [source]);
  const storageKey = useMemo(
    () => `datawhale-growth-race-period:${title}`,
    [title],
  );
  const colorByName = useMemo(
    () =>
      new Map(
        source.map((item, index) => [
          item.name,
          chartColors[index % chartColors.length],
        ]),
      ),
    [source],
  );
  const currentYear = String(new Date().getFullYear());
  const defaultFromMonth =
    availableMonthKeys.find((month) => month.startsWith(`${currentYear}-`)) ??
    availableMonthKeys[0] ??
    "";
  const defaultToMonth =
    [...availableMonthKeys]
      .reverse()
      .find((month) => month.startsWith(`${currentYear}-`)) ??
    availableMonthKeys[availableMonthKeys.length - 1] ??
    "";
  const [fromMonth, setFromMonth] = useState(defaultFromMonth);
  const [toMonth, setToMonth] = useState(defaultToMonth);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
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

    setFromMonth((current) =>
      availableMonthKeys.includes(current) ? current : defaultFromMonth,
    );
    setToMonth((current) =>
      availableMonthKeys.includes(current) ? current : defaultToMonth,
    );
  }, [availableMonthKeys, defaultFromMonth, defaultToMonth, storageKey]);

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

  const monthKeys = useMemo(
    () =>
      availableMonthKeys.filter(
        (month) =>
          getMonthValue(month) > getMonthValue(normalizedRange.fromMonth) &&
          getMonthValue(month) <= getMonthValue(normalizedRange.toMonth),
      ),
    [availableMonthKeys, normalizedRange.fromMonth, normalizedRange.toMonth],
  );

  useEffect(() => {
    setActiveIndex(0);
    setIsPlaying(false);
  }, [normalizedRange.fromMonth, normalizedRange.toMonth]);

  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    const chart = echarts.init(chartRef.current);
    chartInstanceRef.current = chart;

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
      chartInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!isPlaying || monthKeys.length <= 1) {
      return;
    }

    timerRef.current = window.setInterval(() => {
      setActiveIndex((current) => {
        if (current >= monthKeys.length - 1) {
          setIsPlaying(false);
          return current;
        }

        return current + 1;
      });
    }, animationInterval);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [animationInterval, isPlaying, monthKeys.length]);

  useEffect(() => {
    const chart = chartInstanceRef.current;
    const activeMonth = monthKeys[activeIndex] ?? monthKeys[0];

    if (!chart || !activeMonth || !normalizedRange.fromMonth) {
      return;
    }

    const raceItems = buildRaceItems(
      source,
      activeMonth,
      normalizedRange.fromMonth,
      topCount,
    );
    const maxValue = Math.max(...raceItems.map((item) => item.value), 1);

    chart.setOption(
      {
        backgroundColor: "#ffffff",
        color: chartColors,
        textStyle: {
          color: "#334155",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
        },
        animationDuration: 700,
        animationDurationUpdate: 700,
        animationEasing: "cubicOut",
        animationEasingUpdate: "cubicOut",
        grid: {
          left: 268,
          right: 150,
          top: 56,
          bottom: 42,
          containLabel: false,
        },
        tooltip: {
          trigger: "item",
          backgroundColor: "rgba(15, 23, 42, 0.92)",
          borderColor: "transparent",
          borderWidth: 0,
          padding: [10, 12],
          textStyle: {
            color: "#f8fafc",
            fontSize: 12,
          },
          formatter: (params: { name: string; value: number }) =>
            `${params.name}<br/>增长 ${formatNumber(params.value)} Star`,
        },
        toolbox: {
          top: 16,
          right: 18,
          feature: {
            saveAsImage: {},
          },
        },
        xAxis: {
          type: "value",
          max: Math.ceil(maxValue * 1.12),
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
        yAxis: {
          type: "category",
          data: raceItems.map((item) => item.name),
          inverse: false,
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: "#334155",
            fontSize: 12,
            fontWeight: 700,
            width: 248,
            overflow: "truncate",
          },
          animationDuration: 300,
          animationDurationUpdate: 700,
        },
        graphic: [
          {
            type: "text",
            right: 42,
            bottom: 28,
            silent: true,
            style: {
              text: formatMonthDateRange(activeMonth),
              fill: "rgba(15, 23, 42, 0.14)",
              fontSize: 48,
              fontWeight: 800,
            },
          },
          {
            type: "text",
            left: 28,
            top: 18,
            silent: true,
            style: {
              text: `Datawhale超过1000Star项目的本年度Star增长数`,
              fill: "#64748b",
              fontSize: 13,
              fontWeight: 700,
            },
          },
        ],
        series: [
          {
            name: "本年度增长",
            type: "bar",
            data: raceItems.map((item, index) => ({
              value: item.value,
              itemStyle: {
                color: colorByName.get(item.name) ?? chartColors[index % chartColors.length],
                borderRadius: [0, 5, 5, 0],
              },
            })),
            barWidth: 16,
            barCategoryGap: "36%",
            label: {
              show: true,
              position: "right",
              color: "#0f172a",
              fontSize: 12,
              fontWeight: 700,
              formatter: (params: { value: number }) =>
                `+${formatNumber(params.value)}`,
            },
          },
        ],
      },
      true,
    );
  }, [activeIndex, colorByName, monthKeys, normalizedRange.fromMonth, source, topCount]);

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
            <button
              className={styles.playButton}
              type="button"
              onClick={() => {
                if (isPlaying) {
                  setIsPlaying(false);
                  return;
                }

                setActiveIndex(0);
                setIsPlaying(true);
              }}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
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
        <section className={styles.chartPanel} aria-label={title}>
          <div ref={chartRef} className={styles.chart} />
        </section>
      </main>
    </div>
  );
}
