"use client";
import { Bar, ChartProps } from "react-chartjs-2";
interface Props {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
    }[];
  };
  options: ChartProps["options"];
}
export const ClientBar = ({ data, options }: Props) => (
  <Bar
    options={options}
    data={data}
    height={400}
    width={data.labels.length * 75}
  />
);
