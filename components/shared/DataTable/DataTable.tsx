import React, { useState } from "react";
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
  const [sortKey, setSortKey] = useState<T>();
  const [descSort, setDescSort] = useState(true);

  const onHeaderClick = (newSortKey: T) => {
    if (newSortKey === sortKey) {
      setDescSort((descSort) => !descSort);
    } else {
      setDescSort(true);
      setSortKey(newSortKey);
    }
  };

  if (sortKey) {
    rows.sort((rowA, rowB) => {
      const evaluationByDirection = descSort
        ? rowA[sortKey] > rowB[sortKey]
        : rowB[sortKey] > rowA[sortKey];
      return evaluationByDirection ? -1 : 1;
    });
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {headers.map(({ key, className, display }) => (
            <th
              className={classnames(
                styles.headerCell,
                className || styles.defaultColumn
              )}
              key={key}
              onClick={() => onHeaderClick(key)}
            >
              {display} {sortKey === key && <>{descSort ? "^" : "v"}</>}
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
