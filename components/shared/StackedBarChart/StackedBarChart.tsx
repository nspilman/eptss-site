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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

ChartJS.defaults.font = {
  family: "Segoe UI",
};

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
      height={800}
      width={data.labels.length * 75}
    />
  );
};
