"use client";
import { motion } from "framer-motion";
import React from "react";

interface Header<T> {
  key: T;
  label: string;
}

interface Props<T extends string> {
  headers: Readonly<Header<T>[]>;
  rows: Record<T, string | number | React.ReactElement>[];
  variant?: "small" | "medium" | "large";
  title?: string;
  subtitle?: string;
  maxHeight?: number;
  className?: string;
  isLoading?: boolean;
}

export function DataTable<T extends string>({
  headers,
  rows,
  title,
  maxHeight,
  subtitle,
  className,
  isLoading,
}: Props<T>) {
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-8 bg-gray-700/20 animate-pulse rounded" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-700/20 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  const isEmpty = !rows?.length;

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
          <thead className="bg-gray-800/50">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.key}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-300"
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isEmpty ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-2 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <motion.tr 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="border-t border-gray-800 hover:bg-gray-800/30"
                >
                  {headers.map(({ key }) => (
                    <td key={key} className="px-4 py-3 text-sm text-gray-300">
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
