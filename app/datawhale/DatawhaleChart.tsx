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

export function DatawhaleChart<T extends DatawhaleSourceItem>({
  source,
  title,
  mode,
  showLabel = false,
  animationDuration,
}: DatawhaleChartProps<T>) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);
  const availableMonthKeys = useMemo(() => getAvailableMonthKeys(source), [source]);
  const [fromMonth, setFromMonth] = useState(availableMonthKeys[0] ?? "");
  const [toMonth, setToMonth] = useState(
    availableMonthKeys[availableMonthKeys.length - 1] ?? "",
  );

  useEffect(() => {
    if (!availableMonthKeys.length) {
      return;
    }

    setFromMonth((current) =>
      availableMonthKeys.includes(current) ? current : availableMonthKeys[0],
    );
    setToMonth((current) =>
      availableMonthKeys.includes(current)
        ? current
        : availableMonthKeys[availableMonthKeys.length - 1],
    );
  }, [availableMonthKeys]);

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
    const chart = chartInstanceRef.current;
    if (!chart) {
      return;
    }

    chart.setOption(
      {
        animationDuration,
        title: {
          text: title,
        },
        tooltip: {
          trigger: "item",
        },
        legend: {
          data: source.map((item) => item.name),
          orient: "horizontal",
          top: 40,
        },
        grid: {
          left: 30,
          right: 200,
          bottom: 30,
          top: 150,
          containLabel: true,
        },
        toolbox: {
          feature: {
            saveAsImage: {},
          },
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: months,
        },
        yAxis: {
          type: "value",
        },
        series: generateSeriesList(),
      },
      true,
    );
  }, [animationDuration, generateSeriesList, months, source, title]);

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
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
          <select value={toMonth} onChange={(event) => setToMonth(event.target.value)}>
            {availableMonthKeys.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div ref={chartRef} className={styles.chart} />
    </div>
  );
}
