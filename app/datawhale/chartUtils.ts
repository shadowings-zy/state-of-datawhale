import * as echarts from "echarts";

type DatawhaleSourceItem = {
  name: string;
  monthly_total_stars: Record<string, number>;
};

type DatawhaleSeriesMode = "total" | "yearlyGrowth";

type CreateDatawhaleSeriesConfigOptions<T extends DatawhaleSourceItem> = {
  source: readonly T[];
  mode: DatawhaleSeriesMode;
  showLabel?: boolean;
};

const startTime = `2025-12`;
const endTime = `2026-3`;
const previousKey = startTime;

const getMonthTimestamp = (month: string) => {
  const [year, monthIndex] = month.split("-").map(Number);
  return year * 12 + monthIndex;
};

const shouldReadMonth = (month: string) => {
  const currentMonth = getMonthTimestamp(month);
  return (
    currentMonth >= getMonthTimestamp(startTime) &&
    currentMonth <= getMonthTimestamp(endTime)
  );
};

const getMonthValue = <T extends DatawhaleSourceItem>(
  item: T,
  month: string,
  mode: DatawhaleSeriesMode,
) => {
  if (mode === "total") {
    return item.monthly_total_stars[month] || 0;
  }

  const current = item.monthly_total_stars[month] || 0;
  const previous = item.monthly_total_stars[previousKey] || 0;
  return current - previous;
};

const createLineSeries = (name: string, data: number[], showLabel: boolean) => {
  const series: echarts.LineSeriesOption = {
    name,
    type: "line",
    smooth: true,
    endLabel: {
      show: true,
      formatter: "{a}",
      distance: 20,
    },
    data,
  };

  if (showLabel) {
    series.label = {
      show: true,
      position: "top",
      formatter: "{c}",
    };
  }

  return series;
};

export const createDatawhaleSeriesConfig = <T extends DatawhaleSourceItem>({
  source,
  mode,
  showLabel = false,
}: CreateDatawhaleSeriesConfigOptions<T>) => {
  const months = Object.keys(source[0]?.monthly_total_stars ?? {}).filter(
    shouldReadMonth,
  );

  const generateSeriesList = () =>
    source.map((item) => {
      const data = months.map((month) => getMonthValue(item, month, mode));
      return createLineSeries(item.name, data, showLabel);
    });

  return {
    months,
    generateSeriesList,
  };
};
