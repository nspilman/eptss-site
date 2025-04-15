import React from "react";
import { DataTable } from "@/components/DataTable";

import type { Header } from "@/components/DataTable/DataTable";

interface SignupsTableProps {
  signupsHeaders: Readonly<Header<string>[]>;
  signupDataDisplay: Record<string, string | number | React.ReactElement>[];
}

export const SignupsTable = ({ signupsHeaders, signupDataDisplay }: SignupsTableProps) => (
  <DataTable
    title={"Songs in play to Cover"}
    headers={signupsHeaders}
    rows={signupDataDisplay}
  />
);
