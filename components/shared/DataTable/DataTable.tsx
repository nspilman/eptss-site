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
  Flex,
} from "@chakra-ui/react";

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

export function DataTable<T extends string>({
  headers,
  rows,
  title,
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

  return (
    <TableContainer
      width={{
        base: "380px",
        sm: "600px",
        md: "800px",
        lg: "1000px",
      }}
      display="flex"
      flexDirection="column"
      alignItems="center"
      my="4"
    >
      <Heading size="sm" pb="4">
        {title}
      </Heading>

      <Table>
        <Thead>
          <Tr>
            {headers.map(({ key, display, sortable }) => (
              <Th
                key={key}
                cursor={sortable ? "pointer" : "auto"}
                onClick={() => sortable && onHeaderClick(key)}
                color="yellow.300"
              >
                {display} {sortKey === key && <>{descSort ? "^" : "v"}</>}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {rows.map((row, i) => (
            <Tr key={JSON.stringify(row) + i}>
              {headers.map(({ key, className }) => (
                <Td key={JSON.stringify(row) + row[key]} className={className}>
                  {row[key]}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
