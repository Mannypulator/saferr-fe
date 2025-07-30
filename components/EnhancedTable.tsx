// components/EnhancedTable.tsx
"use client";
import React from "react";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface EnhancedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

const EnhancedTable = <T,>({
  data,
  columns,
  emptyMessage = "No data available.",
  onRowClick,
}: EnhancedTableProps<T>) => {
  return (
    <div className="overflow-x-auto">
      {data.length > 0 ? (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(item)}
                className={`hover:bg-gray-50 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      column.className || "text-gray-900"
                    }`}
                  >
                    {typeof column.accessor === "function"
                      ? column.accessor(item)
                      : (item[column.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-10 text-gray-500">{emptyMessage}</div>
      )}
    </div>
  );
};

export default EnhancedTable;
