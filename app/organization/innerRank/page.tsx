"use client";

import { useEffect } from "react";
import styles from "./page.module.css";
import * as echarts from "echarts";

export default function Home() {
  const names = [
    "freeCodeCamp",
    "TheAlgorithms",
    "EbookFoundation",
    "ossu",
    "h5bp",
    "doocs",
    "jobbole",
    "dair-ai",
    "papers-we-love",
    "datawhalechina",
  ];
  const years = ["2024-1", "2024-5", "2024-9", "2024-12"];
  const generateRankingData = () => {
    const value = [
      { key: 'freeCodeCamp', value: [ 1, 1, 1, 1 ] },
      { key: 'TheAlgorithms', value: [ 2, 2, 2, 2 ] },
      { key: 'EbookFoundation', value: [ 3, 3, 3, 3 ] },
      { key: 'ossu', value: [ 4, 4, 4, 4 ] },
      { key: 'h5bp', value: [ 5, 5, 5, 6 ] },
      { key: 'doocs', value: [ 6, 6, 6, 5 ] },
      { key: 'jobbole', value: [ 7, 7, 8, 9 ] },
      { key: 'dair-ai', value: [ 8, 8, 9, 8 ] },
      { key: 'papers-we-love', value: [ 9, 10, 10, 10 ] },
      { key: 'datawhalechina', value: [ 10, 9, 7, 7 ] }
    ]
    const map = new Map();
    for (const item of value) {
      map.set(item.key, item.value);
    }
    return map;
  };
  const generateSeriesList = () => {
    const seriesList: any[] = [];
    const rankingMap = generateRankingData();
    rankingMap.forEach((data, name) => {
      const series = {
        name,
        symbolSize: 25,
        type: "line",
        smooth: true,
        emphasis: {
          focus: "series",
        },
        endLabel: {
          show: true,
          formatter: "{a}",
          distance: 20,
        },
        label: {
          show: true,
          position: 'inside',
          formatter: '{c}',
          fontSize: 10
        },
        lineStyle: {
          width: 4,
        },
        data,
      };
      seriesList.push(series);
    });
    return seriesList;
  };

  useEffect(() => {
    const myChart = echarts.init(document.getElementById("echart"));
    const option = {
      title: {
        text: "GitHub知识分享类组织Star数排名",
      },
      tooltip: {
        trigger: "item",
      },
      grid: {
        left: 30,
        right: 150,
        bottom: 30,
        containLabel: true,
      },
      toolbox: {
        feature: {
          saveAsImage: {},
        },
      },
      xAxis: {
        type: "category",
        splitLine: {
          show: true,
        },
        axisLabel: {
          margin: 30,
          fontSize: 16,
        },
        boundaryGap: false,
        data: years,
      },
      yAxis: {
        type: "value",
        axisLabel: {
          margin: 30,
          fontSize: 16,
          formatter: "#{value}",
        },
        inverse: true,
        interval: 1,
        min: 1,
        max: names.length,
      },
      series: generateSeriesList(),
    };

    option && myChart.setOption(option);
  }, []);

  return (
    <div className={styles.page}>
      <div id="echart" className={styles.chart}></div>
    </div>
  );
}
