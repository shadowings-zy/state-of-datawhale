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

export const DATAWHALE_START_YEAR = 2026;
export const DATAWHALE_START_MONTH = 1;

const shouldReadMonth = (month: string) => {
  const [year, monthIndex] = month.split("-").map(Number);
  return year > DATAWHALE_START_YEAR || (year === DATAWHALE_START_YEAR && monthIndex >= DATAWHALE_START_MONTH);
};

export const filterProjectsWithStarsStartingFrom2026 = <T extends DatawhaleSourceItem>(source: readonly T[]) =>
  source.filter((item) => {
    const before2026 = Object.entries(item.monthly_total_stars).filter(([month]) => {
      const [year, monthIndex] = month.split("-").map(Number);
      return year < DATAWHALE_START_YEAR || (year === DATAWHALE_START_YEAR && monthIndex < DATAWHALE_START_MONTH);
    });

    const from2026 = Object.entries(item.monthly_total_stars).filter(([month]) => {
      const [year, monthIndex] = month.split("-").map(Number);
      return year > DATAWHALE_START_YEAR || (year === DATAWHALE_START_YEAR && monthIndex >= DATAWHALE_START_MONTH);
    });

    return before2026.every(([, value]) => (value || 0) === 0) && from2026.some(([, value]) => (value || 0) > 0);
  });

const getMonthValue = <T extends DatawhaleSourceItem>(item: T, month: string, mode: DatawhaleSeriesMode) => {
  if (mode === "total") {
    return item.monthly_total_stars[month] || 0;
  }

  const current = item.monthly_total_stars[month] || 0;
  const previousKey = `${month.split("-")[0]}-1`;
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
  const months = Object.keys(source[0]?.monthly_total_stars ?? {}).filter(shouldReadMonth);

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
