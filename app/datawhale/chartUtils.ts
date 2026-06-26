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
  fromMonth?: string;
  toMonth?: string;
};

const parseMonth = (month: string) => {
  const [year, monthIndex] = month.split("-").map(Number);
  return { year, monthIndex };
};

const getMonthTimestamp = (month: string) => {
  const { year, monthIndex } = parseMonth(month);
  return year * 12 + monthIndex;
};

const mapMonthToNextMonthFirstDay = (month: string) => {
  const { year, monthIndex } = parseMonth(month);
  const nextYear = monthIndex === 12 ? year + 1 : year;
  const nextMonthIndex = monthIndex === 12 ? 1 : monthIndex + 1;

  return `${nextYear}-${String(nextMonthIndex).padStart(2, "0")}-01`;
};

const shouldReadMonth = (month: string, fromMonth: string, toMonth: string) => {
  const currentMonth = getMonthTimestamp(month);
  return (
    currentMonth >= getMonthTimestamp(fromMonth) &&
    currentMonth <= getMonthTimestamp(toMonth)
  );
};

const getMonthValue = <T extends DatawhaleSourceItem>(
  item: T,
  month: string,
  mode: DatawhaleSeriesMode,
  baseMonth: string,
) => {
  if (mode === "total") {
    return item.monthly_total_stars[month] || 0;
  }

  const current = item.monthly_total_stars[month] || 0;
  const previous = item.monthly_total_stars[baseMonth] || 0;
  return current - previous;
};

const createLineSeries = (name: string, data: number[], showLabel: boolean) => {
  const series: echarts.LineSeriesOption = {
    name,
    type: "line",
    smooth: true,
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

export const getAvailableMonthKeys = <T extends DatawhaleSourceItem>(
  source: readonly T[],
) => {
  const monthSet = new Set<string>();

  for (const item of source) {
    for (const month of Object.keys(item.monthly_total_stars ?? {})) {
      monthSet.add(month);
    }
  }

  return [...monthSet].sort(
    (left, right) => getMonthTimestamp(left) - getMonthTimestamp(right),
  );
};

export const createDatawhaleSeriesConfig = <T extends DatawhaleSourceItem>({
  source,
  mode,
  showLabel = false,
  fromMonth,
  toMonth,
}: CreateDatawhaleSeriesConfigOptions<T>) => {
  const availableMonthKeys = getAvailableMonthKeys(source);
  const selectedFromMonth = fromMonth ?? availableMonthKeys[0];
  const selectedToMonth = toMonth ?? availableMonthKeys[availableMonthKeys.length - 1];
  const monthKeys = availableMonthKeys.filter((month) =>
    shouldReadMonth(month, selectedFromMonth, selectedToMonth),
  );
  const months = monthKeys.map(mapMonthToNextMonthFirstDay);

  const generateSeriesList = () =>
    source.map((item) => {
      const data = monthKeys.map((month) =>
        getMonthValue(item, month, mode, selectedFromMonth),
      );
      return createLineSeries(item.name, data, showLabel);
    });

  return {
    availableMonthKeys,
    monthKeys,
    months,
    generateSeriesList,
  };
};
