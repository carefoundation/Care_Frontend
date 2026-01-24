'use client';

import { ReactNode, useState, useMemo } from 'react';
import { Search, Download, Filter, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { clsx } from 'clsx';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  render?: (value: any, row: T) => ReactNode;
  searchable?: boolean;
}

interface DataTableProps<T> {
  title: string;
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  exportable?: boolean;
  filterable?: boolean;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => ReactNode;
  filters?: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
}

export default function DataTable<T extends { id?: string | number }>({
  title,
  columns,
  data,
  searchable = true,
  exportable = true,
  filterable = true,
  onRowClick,
  actions,
  filters = [],
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchQuery) {
      result = result.filter((row) => {
        return columns.some((column) => {
          if (column.searchable === false) return false;
          let value: any;
          if (typeof column.accessor === 'function') {
            value = column.accessor(row);
          } else {
            value = row[column.accessor];
          }
          return String(value || '').toLowerCase().includes(searchQuery.toLowerCase());
        });
      });
    }

    // Apply filters
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter((row: any) => {
          const rowValue = row[key];
          return String(rowValue || '').toLowerCase() === value.toLowerCase();
        });
      }
    });

    return result;
  }, [data, searchQuery, activeFilters, columns]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredData.slice(start, end);
  }, [filteredData, currentPage, itemsPerPage]);

  // Export to CSV
  const handleExport = () => {
    const headers = columns.map((col) => col.header).join(',');
    const rows = filteredData.map((row) => {
      return columns.map((column) => {
        let value: any;
        if (typeof column.accessor === 'function') {
          value = column.accessor(row);
        } else {
          value = row[column.accessor];
        }
        // Remove HTML tags and format for CSV
        const textValue = typeof value === 'string' ? value.replace(/<[^>]*>/g, '') : value;
        return `"${textValue || ''}"`;
      }).join(',');
    }).join('\n');

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'data'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
    setCurrentPage(1);
  };

  const hasActiveFilters = Object.values(activeFilters).some((v) => v && v !== 'all') || searchQuery;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="flex gap-2 relative">
          {exportable && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          {filterable && filters.length > 0 && (
            <div className="relative">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilterModal(!showFilterModal)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {hasActiveFilters && (
                  <span className="ml-2 bg-[#10b981] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {Object.values(activeFilters).filter(v => v && v !== 'all').length}
                  </span>
                )}
              </Button>
              
              {/* Filter Modal */}
              {showFilterModal && (
                <>
                  <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setShowFilterModal(false)}
                  />
                  <div className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-6 mt-2 right-0 min-w-[300px]">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Filters</h3>
                      <button
                        onClick={() => setShowFilterModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      {filters.map((filter) => (
                        <div key={filter.key}>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {filter.label}
                          </label>
                          <select
                            value={activeFilters[filter.key] || 'all'}
                            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
                          >
                            <option value="all">All</option>
                            {filter.options.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                    {hasActiveFilters && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearFilters}
                          className="w-full"
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Search */}
      {searchable && (
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}


      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#ecfdf5] text-[#10b981] rounded-full text-sm">
              Search: "{searchQuery}"
              <button
                onClick={() => setSearchQuery('')}
                className="hover:text-[#059669]"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value || value === 'all') return null;
            const filter = filters.find((f) => f.key === key);
            const option = filter?.options.find((o) => o.value === value);
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[#ecfdf5] text-[#10b981] rounded-full text-sm"
              >
                {filter?.label}: {option?.label || value}
                <button
                  onClick={() => handleFilterChange(key, 'all')}
                  className="hover:text-[#059669]"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                >
                  {column.header}
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
                  {searchQuery || hasActiveFilters ? 'No results found' : 'No data available'}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  onClick={() => onRowClick?.(row)}
                  className={onRowClick ? 'hover:bg-gray-50 cursor-pointer transition-colors' : 'hover:bg-gray-50'}
                >
                  {columns.map((column, colIndex) => {
                    let value: any;
                    if (typeof column.accessor === 'function') {
                      value = column.accessor(row);
                    } else {
                      value = row[column.accessor];
                    }

                    return (
                      <td key={colIndex} className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {column.render ? column.render(value, row) : value}
                      </td>
                    );
                  })}
                  {actions && (
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={clsx(
                      'px-3 py-1 text-sm rounded',
                      currentPage === pageNum
                        ? 'bg-[#10b981] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

