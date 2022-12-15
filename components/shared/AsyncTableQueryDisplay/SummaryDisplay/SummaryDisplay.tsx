interface Props {
  summaryFunction: "sum";
  label: string;
  data: unknown[];
}
export const SummaryDisplay = ({ summaryFunction, label, data }: Props) => {
  switch (summaryFunction) {
    case "sum":
      return <>{`${label}: ${data.length}`}</>;
    default:
      return <></>;
  }
};
