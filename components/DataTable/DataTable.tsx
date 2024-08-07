"use client";
import React, { useState } from "react";

interface Header<T> {
  key: T;
  display: string;
  className?: string;
  sortable?: boolean;
}

interface Props<T extends string> {
  headers: Readonly<Header<T>[]>;
  rows: Record<T, string | number | React.ReactElement>[];
  variant?: "small" | "medium" | "large";
  title?: string;
  subtitle?: string;
  maxHeight?: number;
  className?: string;
}

export function DataTable<T extends string>({
  headers,
  rows,
  title,
  maxHeight,
  subtitle,
  className,
}: Props<T>) {
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
  const isEmpty = !rows.length;

  return (
    <div className={`block ${className}`}>
      <div className="pb-4">
        <h2 className="font-fraunces text-white font-bold pb-1 text-xl">
          {title}
        </h2>
        <span className="text-sm font-light font-roboto text-white text-center my-4">
          {subtitle}
        </span>
      </div>
      <div
        className="w-[90vw] overflow-x-scroll overflow-y-scroll flex justify-center"
        style={{ maxHeight }}
      >
        <table className="overflow-y-scroll block" style={{ maxHeight }}>
          <thead className="window-border font-fraunces cursor-pointer sticky top-0">
            <tr>
              {headers.map(({ key, display, sortable }) => (
                <th
                  key={key}
                  className={`text-sm ${sortable ? "pointer" : "auto"}`}
                  onClick={() => sortable && onHeaderClick(key)}
                >
                  <h4 className="font-fraunces text-white font-bold">
                    {display}{" "}
                    {sortKey === key && (
                      <span className="text-xs">{descSort ? "^" : "v"}</span>
                    )}
                  </h4>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="overflow-scroll">
            {isEmpty ? (
              <div>
                <span className="text-md font-bold font-roboto text-white text-center my-4">
                  No records to display
                </span>
              </div>
            ) : (
              <>
                {rows.map((row, i) => (
                  <tr key={i}>
                    {headers.map(({ key, className }) => (
                      <td
                        key={key}
                        className={`${className} bg-black shadow-themeYellow border-2 border-white`}
                      >
                        <span className="text-md font-light text-white text-center my-4 p-1 font-mono shadow-sm">
                          {row[key]}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
