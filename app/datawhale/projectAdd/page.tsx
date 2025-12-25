"use client";

import { useEffect } from "react";
import styles from "./page.module.css";
import * as echarts from "echarts";
import datasource from "../../assets/datasource.json"

const source = datasource.projectAddInfo

export default function Home() {
  const generateSeriesList = () => {
    const seriesList: any[] = [];
    source.forEach((item) => {
      const data = Object.keys(item.monthlyTotalStars).map((month) => {
        const current = item.monthlyTotalStars[month as keyof typeof item.monthlyTotalStars] || 0;
        const previousKey = `${month.split("-")[0]}-1` as keyof typeof item.monthlyTotalStars
        const previous = item.monthlyTotalStars[previousKey] || 0;
        return current - previous
      });
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
      });
    });
    return seriesList;
  };

  useEffect(() => {
    const myChart = echarts.init(document.getElementById("echart"));
    const option = {
      animationDuration: 5000,
      title: {
        text: 'Datawhale项目本年度Star增长数'
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
