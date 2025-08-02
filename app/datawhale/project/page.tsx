"use client";

import { useEffect } from "react";
import styles from "./page.module.css";
import * as echarts from "echarts";

const source = [
  {
    name: 'pumpkin-book',
    monthlyStars: { '2025-1': 115, '2025-2': 150, '2025-3': 176, '2025-4': 125 },
    monthlyTotalStars: {
      '2025-1': 24285,
      '2025-2': 24435,
      '2025-3': 24611,
      '2025-4': 24736
    }
  },
  {
    name: 'llm-cookbook',
    monthlyStars: { '2025-1': 758, '2025-2': 2345, '2025-3': 925, '2025-4': 2528 },
    monthlyTotalStars: {
      '2025-1': 13244,
      '2025-2': 15589,
      '2025-3': 16514,
      '2025-4': 19042
    }
  },
  {
    name: 'leedl-tutorial',
    monthlyStars: { '2025-1': 207, '2025-2': 317, '2025-3': 244, '2025-4': 174 },
    monthlyTotalStars: {
      '2025-1': 14269,
      '2025-2': 14586,
      '2025-3': 14830,
      '2025-4': 15004
    }
  },
  {
    name: 'self-llm',
    monthlyStars: { '2025-1': 1229, '2025-2': 1422, '2025-3': 1098, '2025-4': 732 },
    monthlyTotalStars: {
      '2025-1': 11717,
      '2025-2': 13139,
      '2025-3': 14237,
      '2025-4': 14969
    }
  },
  {
    name: 'easy-rl',
    monthlyStars: { '2025-1': 203, '2025-2': 411, '2025-3': 389, '2025-4': 297 },
    monthlyTotalStars: {
      '2025-1': 9983,
      '2025-2': 10394,
      '2025-3': 10783,
      '2025-4': 11080
    }
  },
  {
    name: 'llm-universe',
    monthlyStars: { '2025-1': 251, '2025-2': 1382, '2025-3': 691, '2025-4': 436 },
    monthlyTotalStars: { '2025-1': 5333, '2025-2': 6715, '2025-3': 7406, '2025-4': 7842 }
  },
  {
    name: 'fun-rec',
    monthlyStars: { '2025-1': 163, '2025-2': 214, '2025-3': 235, '2025-4': 171 },
    monthlyTotalStars: { '2025-1': 5013, '2025-2': 5227, '2025-3': 5462, '2025-4': 5633 }
  },
  {
    name: 'joyful-pandas',
    monthlyStars: { '2025-1': 28, '2025-2': 37, '2025-3': 42, '2025-4': 43 },
    monthlyTotalStars: { '2025-1': 4712, '2025-2': 4749, '2025-3': 4791, '2025-4': 4834 }
  },
  {
    name: 'so-large-lm',
    monthlyStars: { '2025-1': 252, '2025-2': 516, '2025-3': 349, '2025-4': 230 },
    monthlyTotalStars: { '2025-1': 3563, '2025-2': 4079, '2025-3': 4428, '2025-4': 4658 }
  },
  {
    name: 'competition-baseline',
    monthlyStars: { '2025-1': 19, '2025-2': 35, '2025-3': 38, '2025-4': 34 },
    monthlyTotalStars: { '2025-1': 4336, '2025-2': 4371, '2025-3': 4409, '2025-4': 4443 }
  },
  {
    name: 'thorough-pytorch',
    monthlyStars: { '2025-1': 63, '2025-2': 96, '2025-3': 73, '2025-4': 70 },
    monthlyTotalStars: { '2025-1': 2748, '2025-2': 2844, '2025-3': 2917, '2025-4': 2987 }
  },
  {
    name: 'hugging-llm',
    monthlyStars: { '2025-1': 20, '2025-2': 84, '2025-3': 40, '2025-4': 24 },
    monthlyTotalStars: { '2025-1': 2821, '2025-2': 2905, '2025-3': 2945, '2025-4': 2969 }
  },
  {
    name: 'daily-interview',
    monthlyStars: { '2025-1': 64, '2025-2': 53, '2025-3': 77, '2025-4': 45 },
    monthlyTotalStars: { '2025-1': 2716, '2025-2': 2769, '2025-3': 2846, '2025-4': 2891 }
  },
  {
    name: 'learn-nlp-with-transformers',
    monthlyStars: { '2025-1': 78, '2025-2': 111, '2025-3': 133, '2025-4': 94 },
    monthlyTotalStars: { '2025-1': 2524, '2025-2': 2635, '2025-3': 2768, '2025-4': 2862 }
  },
  {
    name: 'llms-from-scratch-cn',
    monthlyStars: { '2025-1': 215, '2025-2': 245, '2025-3': 196, '2025-4': 198 },
    monthlyTotalStars: { '2025-1': 2136, '2025-2': 2381, '2025-3': 2577, '2025-4': 2775 }
  },
  {
    name: 'tiny-universe',
    monthlyStars: { '2025-1': 220, '2025-2': 320, '2025-3': 283, '2025-4': 165 },
    monthlyTotalStars: { '2025-1': 1998, '2025-2': 2318, '2025-3': 2601, '2025-4': 2766 }
  },
  {
    name: 'team-learning',
    monthlyStars: { '2025-1': 11, '2025-2': 8, '2025-3': 6, '2025-4': 11 },
    monthlyTotalStars: { '2025-1': 2228, '2025-2': 2236, '2025-3': 2242, '2025-4': 2253 }
  },
  {
    name: 'statistical-learning-method-solutions-manual',
    monthlyStars: { '2025-1': 18, '2025-2': 18, '2025-3': 28, '2025-4': 15 },
    monthlyTotalStars: { '2025-1': 1795, '2025-2': 1813, '2025-3': 1841, '2025-4': 1856 }
  },
  {
    name: 'team-learning-data-mining',
    monthlyStars: { '2025-1': 9, '2025-2': 14, '2025-3': 23, '2025-4': 18 },
    monthlyTotalStars: { '2025-1': 1644, '2025-2': 1658, '2025-3': 1681, '2025-4': 1699 }
  },
  {
    name: 'key-book',
    monthlyStars: { '2025-1': 11, '2025-2': 2, '2025-3': 22, '2025-4': 12 },
    monthlyTotalStars: { '2025-1': 1580, '2025-2': 1582, '2025-3': 1604, '2025-4': 1616 }
  },
  {
    name: 'handy-ollama',
    monthlyStars: { '2025-1': 145, '2025-2': 553, '2025-3': 496, '2025-4': 135 },
    monthlyTotalStars: { '2025-1': 418, '2025-2': 971, '2025-3': 1467, '2025-4': 1602 }
  },
  {
    name: 'hands-on-data-analysis',
    monthlyStars: { '2025-1': 12, '2025-2': 18, '2025-3': 22, '2025-4': 19 },
    monthlyTotalStars: { '2025-1': 1198, '2025-2': 1216, '2025-3': 1238, '2025-4': 1257 }
  },
  {
    name: 'hugging-multi-agent',
    monthlyStars: { '2025-1': 31, '2025-2': 30, '2025-3': 46, '2025-4': 24 },
    monthlyTotalStars: { '2025-1': 1107, '2025-2': 1137, '2025-3': 1183, '2025-4': 1207 }
  },
  {
    name: 'whale-quant',
    monthlyStars: { '2025-1': 137, '2025-2': 73, '2025-3': 81, '2025-4': 60 },
    monthlyTotalStars: { '2025-1': 875, '2025-2': 948, '2025-3': 1029, '2025-4': 1089 }
  }
]

export default function Home() {
  const generateSeriesList = () => {
    const seriesList: any[] = [];
    source.forEach((item) => {
      const data = Object.keys(item.monthlyTotalStars).map((month) => item.monthlyTotalStars[month as keyof typeof item.monthlyTotalStars] || 0);
      seriesList.push({
        name: item.name,
        type: 'line',
        smooth: true,
        endLabel: {
          show: true,
          formatter: "{a}",
          distance: 20,
        },
        data: data
      });
    });
    return seriesList;
  };

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
        data: Object.keys(source[0].monthlyTotalStars)
      },
      yAxis: {
        type: 'value',
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
