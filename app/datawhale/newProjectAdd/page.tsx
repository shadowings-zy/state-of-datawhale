"use client";

import { useEffect } from "react";
import styles from "./page.module.css";
import * as echarts from "echarts";

const source = [
  {
    name: 'team-learning-program',
    starCount: 835,
    monthlyStars: { '2025-1': 0, '2025-2': 2, '2025-3': 6, '2025-4': 7 },
    monthlyTotalStars: { '2025-1': 0, '2025-2': 822, '2025-3': 828, '2025-4': 835 }
  },
  {
    name: 'unlock-deepseek',
    starCount: 629,
    monthlyStars: { '2025-1': 3, '2025-2': 546, '2025-3': 64, '2025-4': 16 },
    monthlyTotalStars: { '2025-1': 3, '2025-2': 549, '2025-3': 613, '2025-4': 629 }
  },
  {
    name: 'hugging-vis',
    starCount: 147,
    monthlyStars: { '2025-1': 0, '2025-2': 12, '2025-3': 11, '2025-4': 5 },
    monthlyTotalStars: { '2025-1': 0, '2025-2': 131, '2025-3': 142, '2025-4': 147 }
  },
  {
    name: 'wow-agent',
    starCount: 93,
    monthlyStars: { '2025-1': 29, '2025-2': 47, '2025-3': 10, '2025-4': 7 },
    monthlyTotalStars: { '2025-1': 29, '2025-2': 76, '2025-3': 86, '2025-4': 93 }
  }
]

export default function Home() {
  const generateSeriesList = () => {
    const seriesList: any[] = [];
    source.forEach((item) => {
      const data = Object.keys(item.monthlyStars).reduce((acc, month) => {
        const curr = item.monthlyStars[month as keyof typeof item.monthlyStars] || 0;
        acc.push(acc[acc.length - 1] + curr);
        return acc;
      }, [0]);
      seriesList.push({
        name: item.name,
        type: 'line',
        smooth: true,
        endLabel: {
          show: true,
          formatter: "{a}",
          distance: 20,
        },
        data: data,
        label: {
          show: true,
          position: 'top',
          formatter: '{c}'
        }
      });
    });
    return seriesList;
  };

  useEffect(() => {
    const myChart = echarts.init(document.getElementById("echart"));
    const option = {
      // animationDuration: 10000,
      title: {
        text: 'Datawhale新创建的项目Star增长数'
      },
      tooltip: {
        trigger: 'item'
      },
      legend: {
        data: source.map((item) => item.name),
        orient: 'horizontal',
        top: 40
      },
      grid: {
        left: 30,
        right: 200,
        bottom: 30,
        top: 150,
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: Object.keys(source[0].monthlyTotalStars)
      },
      yAxis: {
        type: 'value'
      },
      series: generateSeriesList()
    };

    option && myChart.setOption(option);
  }, []);

  return (
    <div className={styles.page}>
      <div id="echart" className={styles.chart}></div>
    </div>
  );
}
