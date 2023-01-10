import React, { useState } from "react";
import * as styles from "./DataTable.css";
import classnames from "classnames";

interface Header<T> {
  key: T;
  display: string;
  className?: string;
  sortable?: boolean;
}

interface Props<T extends string> {
  headers: Readonly<Header<T>[]>;
  rows: Record<T, string | number>[];
  variant?: "small" | "medium" | "large";
  title?: string;
}

const classesByVariant = {
  small: {
    height: styles.smallHeight,
    width: styles.smallWidth,
  },
  medium: {
    height: styles.mediumHeight,
    width: styles.mediumWidth,
  },
  large: {
    height: styles.largeHeight,
    width: styles.largeWidth,
  },
};

export function DataTable<T extends string>({
  headers,
  rows,
  title,
  variant,
}: Props<T>) {
  const [sortKey, setSortKey] = useState<T>();
  const [descSort, setDescSort] = useState(true);
  const classByVariant = variant ? classesByVariant[variant] : "";

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

  const { width, height } = classByVariant || {};
  return (
    <>
      <b>{title}</b>
      <table className={classnames(styles.table, width)}>
        <thead>
          <tr>
            {headers.map(({ key, className, display, sortable }) => (
              <th
                className={classnames(
                  styles.headerCell,
                  sortable && styles.sortable,
                  className || styles.defaultColumn
                )}
                key={key}
                onClick={() => sortable && onHeaderClick(key)}
              >
                {display} {sortKey === key && <>{descSort ? "^" : "v"}</>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={classnames(styles.body, height)}>
          {rows.map((row, i) => (
            <tr className={styles.row} key={JSON.stringify(row) + i}>
              {headers.map(({ key, className }) => (
                <td
                  key={JSON.stringify(row) + row[key]}
                  className={className || styles.defaultColumn}
                >
                  {row[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
