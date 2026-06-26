"use client";

import { useEffect } from "react";
import styles from "./page.module.css";
import * as echarts from "echarts";

export default function Home() {
  const years = ["2025-1", "2025-5", "2025-9", "2025-12"];
  const generateRankingData = () => {
    const value = [
      { key: "datawhalechina", value: [132904, 156885, 188746, 222916] },
    ];
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
        endLabel: {
          show: true,
          formatter: "{a}",
          distance: 20,
        },
        label: {
          show: true,
          position: "inside",
          formatter: "{c}",
          fontSize: 10,
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
        text: "Datawhale组织Star数增长情况",
      },
      xAxis: {
        type: "category",
        data: ["2025-1", "2025-5", "2025-9", "2025-12"],
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          data: [132904, 156885, 188746, 222916],
          type: "line",
        },
      ],
    };

    option && myChart.setOption(option);
  }, []);

  return (
    <div className={styles.page}>
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
      <div id="echart" className={styles.chart}></div>
    </div>
  );
}
