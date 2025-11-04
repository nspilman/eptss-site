import React from "react";
import { DataTable } from "@eptss/ui";

import type { Header } from "@eptss/ui";

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
