import { DataTable } from "@/components/DataTable";
import { useEffect, useState } from "react";
import { SummaryDisplay } from "./SummaryDisplay/SummaryDisplay";

interface Props<T extends string> {
  headers: { key: T; display: string }[];
  queryFn: () => Promise<{
    data: Record<T, string | number>[];
    status: number;
  }>;
  summaryFunction?: {
    label: string;
    summaryFunction: "sum";
  };
}

export function AsyncTableQueryDisplay<T extends string>({
  queryFn,
  headers,
  summaryFunction,
}: Props<T>) {
  const [isLoading, setIsLoading] = useState(false);
  const [payload, setPayload] = useState<Record<T, string | number>[]>([]);
  useEffect(() => {
    const getAggregateVote = async () => {
      setIsLoading(true);
      const { data, status } = await queryFn();
      setPayload(data);
      setIsLoading(false);
    };
    getAggregateVote();
  }, []);

  return (
    <div>
      {isLoading ? (
        <h2 className="font-fraunces text-white font-bold">loading</h2>
      ) : (
        <div>
          {summaryFunction && (
            <SummaryDisplay {...summaryFunction} data={payload} />
          )}
          <DataTable headers={headers} rows={payload} />
        </div>
      )}
    </div>
  );
}
