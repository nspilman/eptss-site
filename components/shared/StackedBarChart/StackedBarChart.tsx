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
import { useTheme } from "@chakra-ui/react";

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
  const theme = useTheme() as {
    colors: { yellow: { 300: string } };
  };
  const options = {
    plugins: {
      title: {
        display: !!title,
        text: title,
        color: theme.colors.yellow[300],
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
