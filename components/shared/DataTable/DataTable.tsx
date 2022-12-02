import React from "react";
import * as styles from "./DataTable.css";
import classnames from "classnames";

interface Header<T> {
  key: T;
  display: string;
  className?: string;
}

interface Props<T extends string> {
  headers: Readonly<Header<T>[]>;
  rows: Record<T, string | number>[];
}

export function DataTable<T extends string>({ headers, rows }: Props<T>) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {headers.map((header) => (
            <th
              className={classnames(
                styles.headerCell,
                header.className || styles.defaultColumn
              )}
              key={header.key}
            >
              {header.display}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr className={styles.row} key={i}>
            {headers.map(({ key, className }) => (
              <td key={row[key]} className={className || styles.defaultColumn}>
                {row[key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
