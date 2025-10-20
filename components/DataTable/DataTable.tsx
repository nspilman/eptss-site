"use client";
import { motion } from "framer-motion";
import React, { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/primitives";
import { ChevronUp, ChevronDown, Clipboard, Check } from "lucide-react";

export interface Header<T> {
  key: T;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date';
  // Optional display key for when the sort key is different from the display key
  displayKey?: T;
}

type SortDirection = "asc" | "desc" | null;

interface Props<T extends string> {
  headers: Readonly<Header<T>[]>;
  rows: Record<T, string | number | React.ReactElement>[];
  variant?: "small" | "medium" | "large";
  title?: string;
  subtitle?: string;
  maxHeight?: number;
  className?: string;
  isLoading?: boolean;
  defaultSortKey?: T;
  defaultSortDirection?: SortDirection;
  allowCopy?: boolean;
  onSort?: (key: T, direction: SortDirection) => void;
}

export function DataTable<T extends string>({
  headers,
  rows,
  title,
  maxHeight,
  subtitle,
  className,
  isLoading,
  defaultSortKey,
  defaultSortDirection = null,
  allowCopy = false,
  onSort,
}: Props<T>) {
  // Always declare hooks at the top level
  const [sortKey, setSortKey] = useState<T | null>(defaultSortKey || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);
  const [isCopied, setIsCopied] = useState(false);
  
  // Define isEmpty outside of any conditional
  const isEmpty = !rows?.length;
  
  // Function to convert table data to markdown and copy to clipboard
  const copyTableAsMarkdown = (headers: Readonly<Header<T>[]>, rows: Record<T, string | number | React.ReactElement>[]) => {
    // Create header row
    const headerRow = headers.map(header => header.label).join(' | ');
    // Create separator row
    const separatorRow = headers.map(() => '---').join(' | ');
    
    // Create data rows
    const dataRows = rows.map(row => {
      return headers.map(header => {
        const value = row[header.displayKey || header.key];
        // Convert React elements to string or use empty string
        if (React.isValidElement(value)) {
          return '';
        }
        return String(value);
      }).join(' | ');
    }).join('\n');
    
    // Combine all parts
    const markdownTable = `| ${headerRow} |\n| ${separatorRow} |\n| ${dataRows.split('\n').join(' |\n| ')} |`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(markdownTable)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy table to clipboard:', err);
      });
  };
  
  const handleSort = (key: T, sortable = true) => {
    if (!sortable) return;
    
    let newDirection: SortDirection = "asc";
    if (sortKey === key) {
      if (sortDirection === "asc") {
        newDirection = "desc";
      } else if (sortDirection === "desc") {
        newDirection = null;
      } else {
        newDirection = "asc";
      }
    }
    
    setSortKey(newDirection === null ? null : key);
    setSortDirection(newDirection);
    
    if (onSort) {
      onSort(key, newDirection);
    }
  };

  // Calculate sorted rows
  const sortedRows = useMemo(() => {
    if (!sortKey || !sortDirection || isEmpty) {
      return rows;
    }

    // Find the header for the sort key to determine type
    const header = headers.find(h => h.key === sortKey);
    const columnType = header?.type || 'text';

    return [...rows].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      
      // Handle React elements (don't try to sort them)
      if (React.isValidElement(aValue) || React.isValidElement(bValue)) {
        return 0;
      }

      // Special handling for date columns
      if (columnType === 'date') {
        // Handle "Never" values in date fields
        if (aValue === 'Never' && bValue === 'Never') return 0;
        if (aValue === 'Never') return sortDirection === 'asc' ? 1 : -1;
        if (bValue === 'Never') return sortDirection === 'asc' ? -1 : 1;
        
        // Try to extract date from formatted strings
        // This assumes dates are in a format that can be parsed by Date constructor
        const aDate = new Date(String(aValue));
        const bDate = new Date(String(bValue));
        
        if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
          return sortDirection === 'asc' 
            ? aDate.getTime() - bDate.getTime() 
            : bDate.getTime() - aDate.getTime();
        }
      }
      
      // Handle numeric columns
      if (columnType === 'number') {
        // Convert to strings first to handle any formatting
        const aString = typeof aValue === 'string' ? aValue : String(aValue);
        const bString = typeof bValue === 'string' ? bValue : String(bValue);
        
        // Extract numeric values, ignoring non-numeric characters
        const aNum = parseFloat(aString.replace(/[^0-9.-]+/g, ''));
        const bNum = parseFloat(bString.replace(/[^0-9.-]+/g, ''));
        
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }
      }
      
      // Default string comparison for text or fallback
      const aString = typeof aValue === 'string' ? aValue : String(aValue);
      const bString = typeof bValue === 'string' ? bValue : String(bValue);
      
      return sortDirection === 'asc' 
        ? aString.localeCompare(bString) 
        : bString.localeCompare(aString);
    });
  }, [rows, sortKey, sortDirection, isEmpty, headers]);
  
  // Render loading state after all hooks have been called
  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="h-8 bg-background-secondary/20 animate-pulse rounded" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-background-secondary/20 animate-pulse rounded" />
        ))}
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-background-primary backdrop-blur-md rounded-lg border border-background-secondary p-6 ${className}`}
    >
      <div className="pb-4 flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-2">{title}</h2>
          <p className="text-sm text-secondary">{subtitle}</p>
        </div>
        {!isEmpty && allowCopy && (
          <button
            onClick={() => copyTableAsMarkdown(headers, sortedRows)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-background-secondary hover:bg-background-secondary/80 text-primary text-sm transition-colors"
            title="Copy table as markdown"
          >
            {isCopied ? (
              <>
                <Check className="h-4 w-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Clipboard className="h-4 w-4" />
                <span>Copy as Markdown</span>
              </>
            )}
          </button>
        )}
      </div>
      <div className="border border-background-secondary rounded-md overflow-hidden">
        <div style={{ maxHeight }} className="overflow-auto">
          <Table disableWrapper>
            <TableHeader className="sticky top-0 z-10 bg-background-primary shadow-sm">
              <TableRow>
                {headers.map((header) => (
                  <TableHead 
                    key={header.key} 
                    className={`${header.sortable !== false ? "cursor-pointer select-none" : ""} bg-background-primary border-b border-background-secondary`}
                    onClick={() => handleSort(header.key, header.sortable !== false)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{header.label}</span>
                      {header.sortable !== false && (
                        <span className="flex flex-col ml-1">
                          <ChevronUp 
                            className={`h-3 w-3 ${sortKey === header.key && sortDirection === 'asc' 
                              ? 'text-accent-primary' 
                              : 'text-secondary/50'}`} 
                          />
                          <ChevronDown 
                            className={`h-3 w-3 -mt-1 ${sortKey === header.key && sortDirection === 'desc' 
                              ? 'text-accent-primary' 
                              : 'text-secondary/50'}`} 
                          />
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isEmpty ? (
                <TableRow>
                  <TableCell 
                    colSpan={headers.length}
                    className="text-center text-secondary"
                  >
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                sortedRows.map((row, i) => (
                  <motion.tr 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className="border-t border-background-secondary hover:bg-background-secondary/30"
                  >
                    {headers.map(({ key, displayKey }) => (
                      <TableCell key={key}>{row[displayKey || key]}</TableCell>
                    ))}
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </motion.div>
  );
}
