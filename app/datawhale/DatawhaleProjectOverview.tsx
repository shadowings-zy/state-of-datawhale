"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as echarts from "echarts";
import { getAvailableMonthKeys } from "./chartUtils";
import styles from "./DatawhaleProjectOverview.module.css";

type DatawhaleSourceItem = {
  name: string;
  star_count: number;
  monthly_stars?: Record<string, number>;
  monthly_total_stars: Record<string, number>;
};

type DatawhaleProjectOverviewProps<T extends DatawhaleSourceItem> = {
  source: readonly T[];
  title: string;
};

type RankedProject = {
  name: string;
  totalStars: number;
  periodGrowth: number;
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

const getMonthlyGrowth = (item: DatawhaleSourceItem, month: string) => {
  const monthlyStars = item.monthly_stars?.[month];
  if (typeof monthlyStars === "number") {
    return monthlyStars;
  }

  const [year, monthIndex] = month.split("-").map(Number);
  const previousMonth =
    monthIndex === 1 ? `${year - 1}-12` : `${year}-${monthIndex - 1}`;

  return Math.max(
    0,
    (item.monthly_total_stars[month] || 0) -
      (item.monthly_total_stars[previousMonth] || 0),
  );
};

export function DatawhaleProjectOverview<T extends DatawhaleSourceItem>({
  source,
  title,
}: DatawhaleProjectOverviewProps<T>) {
  const barChartRef = useRef<HTMLDivElement | null>(null);
  const heatmapChartRef = useRef<HTMLDivElement | null>(null);
  const barChartInstanceRef = useRef<echarts.ECharts | null>(null);
  const heatmapChartInstanceRef = useRef<echarts.ECharts | null>(null);
  const availableMonthKeys = useMemo(() => getAvailableMonthKeys(source), [source]);
  const storageKey = useMemo(
    () => `datawhale-project-overview-period:${title}`,
    [title],
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

  const monthKeys = useMemo(
    () =>
      availableMonthKeys.filter(
        (month) =>
          getMonthValue(month) >= getMonthValue(normalizedRange.fromMonth) &&
          getMonthValue(month) <= getMonthValue(normalizedRange.toMonth),
      ),
    [availableMonthKeys, normalizedRange.fromMonth, normalizedRange.toMonth],
  );

  const rankedProjects = useMemo<RankedProject[]>(() => {
    return source
      .map((item) => {
        const totalStars =
          item.monthly_total_stars[normalizedRange.toMonth] ?? item.star_count;
        const periodGrowth = monthKeys.reduce(
          (sum, month) => sum + getMonthlyGrowth(item, month),
          0,
        );

        return {
          name: item.name,
          periodGrowth,
          totalStars,
        };
      })
      .sort((left, right) => right.totalStars - left.totalStars);
  }, [monthKeys, normalizedRange.toMonth, source]);

  const heatmapHeight = Math.max(1100, rankedProjects.length * 52 + 220);

  const colorByName = useMemo(
    () =>
      new Map(
        rankedProjects.map((item, index) => [
          item.name,
          chartColors[index % chartColors.length],
        ]),
      ),
    [rankedProjects],
  );

  useEffect(() => {
    if (!barChartRef.current || !heatmapChartRef.current) {
      return;
    }

    const barChart = echarts.init(barChartRef.current);
    const heatmapChart = echarts.init(heatmapChartRef.current);
    barChartInstanceRef.current = barChart;
    heatmapChartInstanceRef.current = heatmapChart;

    const handleResize = () => {
      barChart.resize();
      heatmapChart.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      barChart.dispose();
      heatmapChart.dispose();
      barChartInstanceRef.current = null;
      heatmapChartInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const barChart = barChartInstanceRef.current;
    const heatmapChart = heatmapChartInstanceRef.current;
    if (!barChart || !heatmapChart || !monthKeys.length) {
      return;
    }

    const reversedProjects = [...rankedProjects].reverse();
    const projectNames = reversedProjects.map((item) => item.name);
    const maxTotalStars = Math.max(
      ...rankedProjects.map((item) => item.totalStars),
      1,
    );
    const heatmapData = reversedProjects.flatMap((project, projectIndex) =>
      monthKeys.map((month, monthIndex) => {
        const sourceItem = source.find((item) => item.name === project.name);
        return [
          monthIndex,
          projectIndex,
          sourceItem ? getMonthlyGrowth(sourceItem, month) : 0,
        ];
      }),
    );
    const monthlyGrowthValues = heatmapData
      .map((item) => Number(item[2]))
      .sort((left, right) => left - right);
    const maxMonthlyGrowth =
      monthlyGrowthValues[Math.floor(monthlyGrowthValues.length * 0.95)] || 1;
    const visibleLabelThreshold = 200;

    const sharedTextStyle = {
      color: "#334155",
      fontFamily:
        "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    };

    barChart.setOption(
      {
        backgroundColor: "#ffffff",
        color: chartColors,
        textStyle: sharedTextStyle,
        animationDuration: 700,
        animationDurationUpdate: 500,
        grid: {
          left: 268,
          right: 168,
          top: 58,
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
          formatter: (params: { dataIndex: number; value: number }) => {
            const item = reversedProjects[params.dataIndex];
            return [
              item.name,
              `总 Star：${formatNumber(item.totalStars)}`,
              `区间新增：${formatNumber(item.periodGrowth)}`,
            ].join("<br/>");
          },
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
          max: Math.ceil(maxTotalStars * 1.12),
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
          data: projectNames,
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
        },
        graphic: {
          type: "text",
          left: 28,
          top: 18,
          silent: true,
          style: {
            text: `${normalizedRange.toMonth} 总 Star 数`,
            fill: "#64748b",
            fontSize: 13,
            fontWeight: 700,
          },
        },
        series: [
          {
            name: "总 Star",
            type: "bar",
            data: reversedProjects.map((item) => ({
              value: item.totalStars,
              itemStyle: {
                color: colorByName.get(item.name),
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
                formatNumber(params.value),
            },
          },
        ],
      },
      true,
    );

    heatmapChart.setOption(
      {
        backgroundColor: "#ffffff",
        textStyle: sharedTextStyle,
        animationDuration: 500,
        grid: {
          left: 320,
          right: 84,
          top: 72,
          bottom: 110,
          containLabel: false,
        },
        tooltip: {
          position: "top",
          backgroundColor: "rgba(15, 23, 42, 0.92)",
          borderColor: "transparent",
          borderWidth: 0,
          padding: [10, 12],
          textStyle: {
            color: "#f8fafc",
            fontSize: 12,
          },
          formatter: (params: { value: [number, number, number] }) => {
            const [monthIndex, projectIndex, value] = params.value;
            return [
              projectNames[projectIndex],
              `${monthKeys[monthIndex]} 新增：${formatNumber(value)} Star`,
            ].join("<br/>");
          },
        },
        toolbox: {
          top: 16,
          right: 18,
          feature: {
            saveAsImage: {},
          },
        },
        visualMap: {
          min: 0,
          max: maxMonthlyGrowth,
          calculable: true,
          orient: "horizontal",
          left: "center",
          bottom: 18,
          inRange: {
            color: [
              "#fffaf0",
              "#ffedd5",
              "#fed7aa",
              "#fb923c",
              "#f97316",
              "#c2410c",
            ],
          },
          textStyle: {
            color: "#64748b",
          },
        },
        xAxis: {
          type: "category",
          data: monthKeys,
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
            margin: 12,
          },
        },
        yAxis: {
          type: "category",
          data: projectNames,
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
            interval: 0,
            width: 292,
            overflow: "break",
            lineHeight: 16,
          },
        },
        graphic: {
          type: "text",
          left: 28,
          top: 18,
          silent: true,
          style: {
            text: "每月新增 Star 热力图",
            fill: "#64748b",
            fontSize: 13,
            fontWeight: 700,
          },
        },
        series: [
          {
            name: "每月新增",
            type: "heatmap",
            data: heatmapData,
            label: {
              show: true,
              fontSize: 10,
              formatter: (params: { value: [number, number, number] }) => {
                const value = params.value[2];
                if (value <= visibleLabelThreshold) {
                  return "";
                }

                const styleName =
                  value >= maxMonthlyGrowth * 0.55 ? "light" : "dark";
                return `{${styleName}|${formatNumber(value)}}`;
              },
              rich: {
                light: { color: "#ffffff" },
                dark: { color: "#1e293b" },
              },
            },
            emphasis: {
              itemStyle: {
                borderColor: "#0f172a",
                borderWidth: 1,
              },
            },
          },
        ],
      },
      true,
    );
  }, [colorByName, monthKeys, normalizedRange.toMonth, rankedProjects, source]);

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
        <div className={styles.chartGrid}>
          <section className={styles.chartPanel} aria-label={`${title}总量`}>
            <div ref={barChartRef} className={styles.barChart} />
          </section>
          <section className={styles.chartPanel} aria-label={`${title}月增长`}>
            <div
              ref={heatmapChartRef}
              className={styles.heatmapChart}
              style={{ height: `${heatmapHeight}px` }}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
