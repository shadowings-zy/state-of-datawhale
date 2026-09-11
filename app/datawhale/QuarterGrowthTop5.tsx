"use client";

import { useEffect, useMemo, useRef } from "react";
import * as echarts from "echarts";
import styles from "./QuarterGrowthTop5.module.css";

type QuarterGrowthSourceItem = {
  name: string;
  star_count: number;
  monthly_stars: Record<string, number>;
};

type QuarterGrowthTop5Props<T extends QuarterGrowthSourceItem> = {
  source: readonly T[];
  title: string;
  periodMode?: "quarter" | "year";
  limit?: number;
};

const colors = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#9333ea",
  "#0891b2",
  "#dc2626",
  "#4f46e5",
  "#65a30d",
  "#ea580c",
  "#0f766e",
  "#be123c",
  "#475569",
];

const getMonthValue = (month: string) => {
  const [year, monthIndex] = month.split("-").map(Number);
  return year * 12 + monthIndex;
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("zh-CN").format(value);

export function QuarterGrowthTop5<T extends QuarterGrowthSourceItem>({
  source,
  title,
  periodMode = "quarter",
  limit = 5,
}: QuarterGrowthTop5Props<T>) {
  const chartRef = useRef<HTMLDivElement | null>(null);

  const chartData = useMemo(() => {
    const availableMonths = [
      ...new Set(source.flatMap((item) => Object.keys(item.monthly_stars ?? {}))),
    ].sort((left, right) => getMonthValue(left) - getMonthValue(right));
    const latestMonth = availableMonths[availableMonths.length - 1];

    if (!latestMonth) {
      return { monthKeys: [], periodLabel: "当前周期", topProjects: [] };
    }

    const [year, monthIndex] = latestMonth.split("-").map(Number);
    const quarter = Math.ceil(monthIndex / 3);
    const quarterStartMonth = (quarter - 1) * 3 + 1;
    const monthKeys =
      periodMode === "quarter"
        ? Array.from(
            { length: monthIndex - quarterStartMonth + 1 },
            (_, index) => `${year}-${quarterStartMonth + index}`,
          )
        : availableMonths.filter((month) => month.startsWith(`${year}-`));
    const topProjects = source
      .map((item) => ({
        ...item,
        periodGrowth: monthKeys.reduce(
          (sum, month) => sum + (item.monthly_stars[month] ?? 0),
          0,
        ),
      }))
      .sort((left, right) => right.periodGrowth - left.periodGrowth)
      .slice(0, limit);

    return {
      monthKeys,
      periodLabel: periodMode === "quarter" ? `${year} Q${quarter}` : `${year} 年`,
      topProjects,
    };
  }, [limit, periodMode, source]);

  useEffect(() => {
    if (!chartRef.current || chartData.topProjects.length === 0) {
      return;
    }

    const chart = echarts.init(chartRef.current);
    const projectNames = chartData.topProjects.map((project) => project.name);

    chart.setOption({
      animationDuration: 800,
      color: colors,
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        valueFormatter: (value: number | string) =>
          `+${formatNumber(Number(value))} Star`,
      },
      legend: {
        top: 8,
        data: chartData.monthKeys.map((month) => `${month.split("-")[1]} 月`),
      },
      grid: {
        top: 64,
        right: 118,
        bottom: 36,
        left: 28,
        containLabel: true,
      },
      xAxis: {
        type: "value",
        name: "新增 Star",
        splitLine: { lineStyle: { color: "#e2e8f0" } },
        axisLabel: { formatter: (value: number) => formatNumber(value) },
      },
      yAxis: {
        type: "category",
        inverse: true,
        data: projectNames,
        axisTick: { show: false },
        axisLabel: { color: "#0f172a", fontSize: 13, fontWeight: 600 },
      },
      series: chartData.monthKeys.map((month, monthIndex) => ({
        name: `${month.split("-")[1]} 月`,
        type: "bar",
        stack: "quarter-growth",
        barMaxWidth: 42,
        data: chartData.topProjects.map(
          (project) => project.monthly_stars[month] ?? 0,
        ),
        itemStyle: {
          borderRadius:
            monthIndex === chartData.monthKeys.length - 1 ? [0, 6, 6, 0] : 0,
        },
        label:
          monthIndex === chartData.monthKeys.length - 1
            ? {
                show: true,
                position: "right",
                color: "#0f172a",
                fontWeight: 700,
                formatter: (params: { dataIndex: number }) =>
                  `+${formatNumber(
                    chartData.topProjects[params.dataIndex].periodGrowth,
                  )}`,
              }
            : undefined,
      })),
    });

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [chartData]);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <span className={styles.eyebrow}>{chartData.periodLabel}</span>
            <h1>{title}</h1>
            <p>按周期累计新增 Star 排序，分月展示各项目的增长贡献。</p>
          </div>
          <button
            className={styles.backButton}
            onClick={() => window.history.back()}
          >
            返回
          </button>
        </header>
        <section className={styles.chartPanel}>
          <div ref={chartRef} className={styles.chart} />
        </section>
      </div>
    </main>
  );
}
