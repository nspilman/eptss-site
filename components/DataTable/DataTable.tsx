"use client";
import { motion } from "framer-motion";
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gray-900 bg-opacity-50 backdrop-blur-md rounded-lg border border-gray-800 p-6 ${className}`}
    >
      <div className="pb-4">
        <h2 className="text-2xl font-bold text-gray-100 mb-2">{title}</h2>
        <p className="text-sm text-gray-300">{subtitle}</p>
      </div>
      <div className="w-full overflow-x-auto" style={{ maxHeight }}>
        <table className="w-full">
          <thead className="bg-gray-800 sticky top-0">
            <tr>
              {headers.map(({ key, display, sortable }) => (
                <th
                  key={key}
                  className={`px-4 py-2 text-left text-sm font-medium text-gray-300 ${sortable ? 'cursor-pointer hover:bg-gray-700' : ''}`}
                  onClick={() => sortable && onHeaderClick(key)}
                >
                  <div className="flex items-center">
                    {display}
                    {sortable && sortKey === key && (
                      <span className="ml-1">
                        {descSort ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isEmpty ? (
              <tr>
                <td colSpan={headers.length} className="px-4 py-8 text-center text-gray-400">
                  No records to display
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <motion.tr 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="border-b border-gray-800 hover:bg-gray-800"
                >
                  {headers.map(({ key, className }) => (
                    <td
                      key={key}
                      className={`px-4 py-2 text-sm text-gray-300 ${className}`}
                    >
                      {row[key]}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
