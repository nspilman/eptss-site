import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { theme } from "../../../tailwind.config";
//
// const yellow = theme?.extend?.colors?.["themeYellow"];

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

ChartJS.defaults.color = "white";
ChartJS.defaults.plugins.title.color = "white";

interface Props {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  };
  title?: string;
}

export const StackedBarChart = ({ data, title }: Props) => {
  const options = {
    plugins: {
      title: {
        display: !!title,
        text: title,
        color: "white",
        font: {
          weight: "bold",
          size: 20,
        },
      },
      legend: {
        position: "left" as const,
      },
    },
    responsive: false,
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
      },
    },
  };

  return (
    <Bar
      options={options}
      data={data}
      height={400}
      width={data.labels.length * 75}
    />
  );
};
