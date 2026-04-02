"use client";

import { useEffect } from "react";
import styles from "./page.module.css";
import * as echarts from "echarts";
import datasource from "../../assets/datasource.json"
import { createDatawhaleSeriesConfig } from "../chartUtils";

const source = datasource.projectInfo
const { months, generateSeriesList } = createDatawhaleSeriesConfig({
  source,
  mode: "total",
});

export default function Home() {
  useEffect(() => {
    const myChart = echarts.init(document.getElementById("echart"));
    const option = {
      // animationDuration: 10000,
      title: {
        text: 'Datawhale项目Star数'
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
        data: months
      },
      yAxis: {
        type: 'value',
      },
      series: generateSeriesList()
    };

    myChart.setOption(option);
  }, []);

  return (
    <div className={styles.page}>
      <div id="echart" className={styles.chart}></div>
    </div>
  );
}
