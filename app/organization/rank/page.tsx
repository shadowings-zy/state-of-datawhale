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
      { key: 'freeCodeCamp', value: [ 10, 11, 11, 11 ] },
      { key: 'TheAlgorithms', value: [ 17, 16, 16, 16 ] },
      { key: 'EbookFoundation', value: [ 20, 21, 21, 21 ] },
      { key: 'ossu', value: [ 44, 43, 44, 41 ] },
      { key: 'h5bp', value: [ 56, 57, 59, 62 ] },
      { key: 'doocs', value: [ 63, 63, 61, 60 ] },
      { key: 'jobbole', value: [ 76, 77, 78, 81 ] },
      { key: 'dair-ai', value: [ 107, 86, 85, 76 ] },
      { key: 'papers-we-love', value: [ 133, 130, 128, 128 ] },
      { key: 'datawhalechina', value: [ 139, 106, 76, 68 ] }
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
        text: "GitHub知识分享类组织Star数总排名",
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
        inverse: true,
        axisLabel: {
          margin: 30,
          fontSize: 16,
          formatter: "#{value}",
        },
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
