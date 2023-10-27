import React, { useState } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Heading,
  Text,
  Box,
} from "@chakra-ui/react";

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
}

export function DataTable<T extends string>({
  headers,
  rows,
  title,
  maxHeight,
  subtitle,
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
    <>
      <Box pb="4">
        <Heading size="sm" pb="1">
          {title}
        </Heading>
        <Text size="xsm" fontWeight="light">
          {subtitle}
        </Text>
      </Box>
      <TableContainer
        width="90vw"
        overflowX="scroll"
        maxHeight={maxHeight}
        overflowY={"scroll"}
      >
        <Table size="sm" overflowY={"scroll"} maxHeight={maxHeight || "unset"}>
          <Thead>
            <Tr>
              {headers.map(({ key, display, sortable }) => (
                <Th
                  key={key}
                  cursor={sortable ? "pointer" : "auto"}
                  onClick={() => sortable && onHeaderClick(key)}
                  fontSize="xs"
                >
                  <Heading size="3xs">
                    {display} {sortKey === key && <>{descSort ? "^" : "v"}</>}
                  </Heading>
                </Th>
              ))}
            </Tr>
          </Thead>
          {isEmpty ? (
            <Box>
              <Text fontWeight="bold">No records to display</Text>
            </Box>
          ) : (
            <Tbody>
              {rows.map((row, i) => (
                <Tr key={i}>
                  {headers.map(({ key, className }) => (
                    <Td key={key} className={className}>
                      <Text>{row[key]}</Text>
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          )}
        </Table>
      </TableContainer>
    </>
  );
}
