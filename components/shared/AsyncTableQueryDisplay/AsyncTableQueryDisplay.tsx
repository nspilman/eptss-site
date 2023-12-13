import { Heading } from "@chakra-ui/react";
import { PostgrestError } from "@supabase/supabase-js";
import { DataTable } from "components/shared/DataTable";
import { useEffect, useState } from "react";
import { SummaryDisplay } from "./SummaryDisplay/SummaryDisplay";

interface Props<T extends string> {
  headers: { key: T; display: string }[];
  queryFn: () => Promise<{
    data: Record<T, string | number>[];
    error: PostgrestError | null;
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
      const { data, error, status } = await queryFn();
      setPayload(data);
      setIsLoading(false);
    };
    getAggregateVote();
  }, []);

  return (
    <div>
      {isLoading ? (
        <Heading>loading</Heading>
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
