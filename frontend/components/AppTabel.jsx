"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
// import { toast } from "sonner";
//import { useSelector } from "react-redux";

const AppTabel = ({
  loading,
  error,
  rowKey,
  setEditPatientPage,
  footerHideAndShowPath,
  setPatID,
  Data = [],
  columnNames = {},
  onClickDeleteBtn = () => {},
  onLoadMore = () => {},
  hasMore = false,
  setAddPatientPage,
}) => {
  const [focusedRow, setFocusedRow] = useState(-1);
  const [selectedRow, setSelectedRow] = useState(-1);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteRowId, setDeleteRowId] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [actionMenuPosition, setActionMenuPosition] = useState({ x: 0, y: 0 });

  // Filtering states
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const tableRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const rowRefs = useRef([]);

  const tableHead = Object.keys(columnNames);

  // Filter data based on search term and column filters
  const filteredData = useMemo(() => {
    let filtered = Data;

    // Apply search term filter
    if (searchTerm.trim()) {
      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue.trim()) {
        filtered = filtered.filter((item) =>
          String(item[key] || "")
            .toLowerCase()
            .includes(filterValue.toLowerCase())
        );
      }
    });

    return filtered;
  }, [Data, searchTerm, filters]);

  // Calculate totals for filtered data
  const totalAmount = filteredData?.reduce(
    (sum, item) => sum + (Number(item?.TrAmt) || 0),
    0
  );

  const selectedRowsData = filteredData.filter((_, index) =>
    selectedRows.has(index)
  );
  const selectedAmount = selectedRowsData.reduce(
    (sum, item) => sum + (Number(item?.TrAmt) || 0),
    0
  );

  // Handle checkbox selection
  const handleRowSelect = useCallback((index, isShiftKey = false) => {
    setSelectedRows((prev) => {
      const newSelected = new Set(prev);

      if (isShiftKey && prev.size > 0) {
        // Select range
        const lastSelected = Math.max(...Array.from(prev));
        const start = Math.min(index, lastSelected);
        const end = Math.max(index, lastSelected);
        for (let i = start; i <= end; i++) {
          newSelected.add(i);
        }
      } else {
        // Toggle single selection
        if (newSelected.has(index)) {
          newSelected.delete(index);
        } else {
          newSelected.add(index);
        }
      }

      return newSelected;
    });
  }, []);

  // Select all filtered rows
  const handleSelectAll = useCallback(() => {
    if (selectedRows.size === filteredData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredData.map((_, index) => index)));
    }
  }, [filteredData.length, selectedRows.size]);

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm("");
    setSelectedRows(new Set());
  }, []);

  // Handle edit navigation
  const handleEdit = (enter) => {
    //console.log(enter)
    setEditPatientPage(true);
    setPatID(enter.PatID);
  };

  // Handle delete
  const handleDelete = useCallback(() => {
    if (deleteRowId) {
      onClickDeleteBtn(deleteRowId);
      // toast.error("Record deleted successfully");
      setShowDeleteModal(false);
      setDeleteRowId(null);
      setShowActionMenu(false);
      setSelectedRows(new Set());
    }
  }, [deleteRowId, onClickDeleteBtn]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (!filteredData.length) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedRow((prev) => {
            const newIndex = Math.min(prev + 1, filteredData.length - 1);
            rowRefs.current[newIndex]?.focus();
            return newIndex;
          });
          break;

        case "ArrowUp":
          e.preventDefault();
          setFocusedRow((prev) => {
            const newIndex = Math.max(prev - 1, 0);
            rowRefs.current[newIndex]?.focus();
            return newIndex;
          });
          break;

        case "Enter":
          e.preventDefault();
          if (focusedRow >= 0 && filteredData[focusedRow]) {
            handleEdit(filteredData[focusedRow]);
          }
          break;

        case "Delete":
          if (focusedRow >= 0 && filteredData[focusedRow]) {
            setDeleteRowId(filteredData[focusedRow][rowKey]);
            setShowDeleteModal(true);
          }
          break;

        case "Escape":
          setShowActionMenu(false);
          setShowDeleteModal(false);
          break;
      }
    },
    [filteredData, focusedRow, handleEdit, rowKey]
  );

  // Double click handler
  const handleDoubleClick = useCallback(
    (index) => {
      if (filteredData[index]) {
        handleEdit(filteredData[index]);
      }
    },
    [filteredData, handleEdit]
  );

  // Right click context menu
  const handleRightClick = useCallback((e, index) => {
    e.preventDefault();
    setSelectedRow(index);
    setActionMenuPosition({ x: e.clientX, y: e.clientY });
    setShowActionMenu(true);
  }, []);

  // Status indicator component
  const StatusIndicator = ({ value, type = "status" }) => {
    const isActive = value === 1 || value === true || value === "active";

    return (
      <div className="flex items-center justify-center">
        <div
          className={`w-3 h-3 rounded-full ${
            isActive
              ? "bg-green-500 shadow-lg shadow-green-500/30"
              : "bg-red-500 shadow-lg shadow-red-500/30"
          } animate-pulse`}
          title={isActive ? "Active" : "Inactive"}
        />
      </div>
    );
  };

  // Format cell value with alignment
  const formatCellValue = useCallback((key, value, isDarkMode) => {
    if (["IsSigned", "IsCleared", "IsActive", "Status"].includes(key)) {
      return <StatusIndicator value={value} />;
    }

    if (key === "TrDate" || key === "CreateTime") {
      return new Date(value).toLocaleDateString("en-GB", {
        timeZone: "Asia/Kolkata",
      });
    }

    if (typeof value === "object" && value !== null) {
      return Object.values(value).join(", ");
    }

    return value || "";
  }, []);

  // Check if column should be right-aligned (numbers, amounts, quantities)
  const isNumberColumn = useCallback((key, value) => {
    const numberColumns = [
      "TrAmt",
      "Amount",
      "Total",
      "Price",
      "Cost",
      "Balance",
      "Quantity",
      "Qty",
      "OpBalDr",
      "OpBalCr",
      "DrAmt",
      "CrAmt",
      "NetAmount",
      "TaxAmount",
      "Discount",
      "Rate",
      "Value",
      "Sum",
      "Count",
      "Number",
      "ID",
    ];

    // if(key === "DrAmt" && globalVariables.){
    //   return (globalVariables).toFixed(globalVariables.)
    // }

    const isNumberByName = numberColumns.some((col) =>
      key.toLowerCase().includes(col.toLowerCase())
    );

    const isNumberByValue =
      typeof value === "number" ||
      (!isNaN(parseFloat(value)) && isFinite(value) && value !== "");

    return isNumberByName || isNumberByValue;
  }, []);

  // Setup event listeners
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Infinite scroll handler
  useEffect(() => {
    const container = scrollContainerRef.current;

    const handleScroll = () => {
      if (
        container.scrollTop + container.clientHeight >=
          container.scrollHeight - 20 &&
        hasMore
      ) {
        onLoadMore();
      }
    };

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [onLoadMore, hasMore]);

  // Close action menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setShowActionMenu(false);
    if (showActionMenu) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showActionMenu]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 dark:text-white">Loading...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
        <p className="text-red-700 dark:text-red-400">Error: {error}</p>
      </div>
    );
  }

  // Empty state
  if (!Data.length) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        <p>No data available.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-[#171717]">
      {/* Search and Filter Controls */}
      <div className="p-4 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-[#171717]">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search all columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-700 rounded-lg 
                         bg-white dark:bg-neutral-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              showFilters
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          {showFilters === true && (
            <>
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 
                       bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 
                       hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
              >
                Clear All
              </button>
            </>
          )}
          <button
            onClick={() => setAddPatientPage(true)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-neutral-700 
                       bg-white dark:bg-neutral-800 text-gray-700 dark:text-gray-300 
                       hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            Add Patient +
          </button>
        </div>

        {/* Column Filters */}
        {showFilters && (
          <div className="flex flex-col lg:flex-row gap-3">
            {tableHead.map((key) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {columnNames[key] || key}
                </label>
                <input
                  type="text"
                  placeholder={`Filter ${columnNames[key] || key}...`}
                  value={filters[key] || ""}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-neutral-700 rounded
                             bg-white dark:bg-neutral-800 text-gray-900 dark:text-white
                             focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ))}
          </div>
        )}

        {/* Results Info */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400">
          <span>
            Showing {filteredData.length} of {Data.length} records
            {selectedRows.size > 0 && ` (${selectedRows.size} selected)`}
          </span>
          {(searchTerm || Object.values(filters).some((f) => f.trim())) && (
            <span className="text-blue-600 dark:text-blue-400">
              Filtered results
            </span>
          )}
        </div>
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto border-x border-gray-200 dark:border-neutral-800"
        style={{
          maxHeight: footerHideAndShowPath
            ? "calc(100vh - 300px)"
            : "calc(100vh - 100px)",
        }}
      >
        <table ref={tableRef} className="w-full text-sm border-collapse">
          {/* Header */}
          <thead className="sticky top-0 z-10 bg-white dark:bg-[#171717] border-b border-gray-200 dark:border-neutral-800">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    filteredData.length > 0 &&
                    selectedRows.size === filteredData.length
                  }
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded 
                           focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 
                           dark:bg-neutral-700 dark:border-neutral-600"
                />
              </th>
              {tableHead.map((key) => (
                <th
                  key={key}
                  className={`px-4 py-3 font-semibold text-gray-900 dark:text-white ${
                    isNumberColumn(key, filteredData[0]?.[key])
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  {columnNames[key] || key}
                </th>
              ))}
              <th className="px-4 py-3 text-center font-semibold text-gray-900 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {filteredData.map((item, index) => (
              <tr
                key={item[rowKey] || index}
                ref={(el) => (rowRefs.current[index] = el)}
                tabIndex={0}
                className={`
                  cursor-pointer transition-all duration-150 border-b border-gray-100 dark:border-neutral-800
                  hover:bg-gray-50 dark:hover:bg-neutral-800/50
                  ${
                    selectedRows.has(index)
                      ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                      : "bg-white dark:bg-neutral-800"
                  }
                  ${
                    focusedRow === index
                      ? "ring-2 ring-blue-500 ring-inset"
                      : ""
                  }
                  text-gray-900 dark:text-white
                `}
                onFocus={() => setFocusedRow(index)}
                onDoubleClick={() => handleDoubleClick(index)}
                onContextMenu={(e) => handleRightClick(e, index)}
                onClick={(e) => {
                  if (
                    !e.target.closest('input[type="checkbox"]') &&
                    !e.target.closest("button")
                  ) {
                    setFocusedRow(index);
                  }
                }}
              >
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.has(index)}
                    onChange={(e) => handleRowSelect(index, e.shiftKey)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded 
                             focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 
                             dark:bg-neutral-700 dark:border-neutral-600"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                {tableHead.map((key) => (
                  <td
                    key={key}
                    className={`px-4 py-3 ${
                      isNumberColumn(key, item[key])
                        ? "text-right font-mono"
                        : "text-left"
                    }`}
                    title={String(item[key] || "")}
                  >
                    <div
                      className={`${
                        isNumberColumn(key, item[key]) &&
                        typeof item[key] === "number" &&
                        ![
                          "IsSigned",
                          "IsCleared",
                          "IsActive",
                          "Status",
                        ].includes(key)
                          ? "tabular-nums"
                          : ""
                      }`}
                    >
                      {["IsSigned", "IsCleared", "IsActive", "Status"].includes(
                        key
                      ) ? (
                        <StatusIndicator value={item[key]} />
                      ) : isNumberColumn(key, item[key]) &&
                        typeof item[key] === "number" ? (
                        item[key].toLocaleString("en-IN", {
                          minimumFractionDigits:
                            key.toLowerCase().includes("amt") ||
                            key.toLowerCase().includes("amount") ||
                            key.toLowerCase().includes("balance") ||
                            key.toLowerCase().includes("price") ||
                            key.toLowerCase().includes("cost")
                              ? 2
                              : 0,
                          maximumFractionDigits:
                            key.toLowerCase().includes("amt") ||
                            key.toLowerCase().includes("amount") ||
                            key.toLowerCase().includes("balance") ||
                            key.toLowerCase().includes("price") ||
                            key.toLowerCase().includes("cost")
                              ? 2
                              : 0,
                        })
                      ) : key.toLowerCase().includes("date") && item[key] ? (
                        new Date(item[key]).toLocaleDateString("en-GB", {
                          timeZone: "Asia/Kolkata",
                        })
                      ) : (
                        formatCellValue(key, item[key])
                      )}
                    </div>
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                      }}
                      className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 hover:bg-blue-700 
                               text-white transition-colors shadow-sm"
                      title="Edit (Enter or Double-click)"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteRowId(item[rowKey]);
                        setShowDeleteModal(true);
                      }}
                      className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-600 hover:bg-red-700 
                               text-white transition-colors shadow-sm"
                      title="Delete (Delete key)"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enhanced Footer */}
      {footerHideAndShowPath && (
        <div className="border-t border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-[#171717]">
          <div className="px-4 py-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="font-medium text-gray-700 dark:text-gray-300">
                <span className="text-blue-600 dark:text-blue-400">
                  Total Records:
                </span>{" "}
                {filteredData.length}
                {selectedRows.size > 0 && (
                  <span className="ml-3 text-green-600 dark:text-green-400">
                    Selected: {selectedRows.size}
                  </span>
                )}
              </div>
              <div className="font-medium text-gray-700 dark:text-gray-300">
                <span className="text-blue-600 dark:text-blue-400">
                  Total Amount:
                </span>{" "}
                <span className="font-mono text-lg">
                  ₹
                  {totalAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              {selectedRows.size > 0 && (
                <div className="font-medium text-gray-700 dark:text-gray-300">
                  <span className="text-green-600 dark:text-green-400">
                    Selected Amount:
                  </span>{" "}
                  <span className="font-mono text-lg">
                    ₹
                    {selectedAmount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {showActionMenu && (
        <div
          className={`fixed z-50 py-2 rounded-lg shadow-xl border min-w-32 backdrop-blur-sm 
          
              ? "bg-neutral-800/95 border-neutral-600 text-white"
         
          `}
          style={{
            left: actionMenuPosition.x,
            top: actionMenuPosition.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              handleEdit(filteredData[selectedRow]);
              setShowActionMenu(false);
            }}
            className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 
             
                hover:bg-neutral-700 text-gray-200
            
            `}
          >
            <span>🖊️</span> Edit
          </button>
          <button
            onClick={() => {
              setDeleteRowId(filteredData[selectedRow][rowKey]);
              setShowDeleteModal(true);
              setShowActionMenu(false);
            }}
            className={`w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2 ${
              isDark
                ? "hover:bg-red-900/50 text-red-400"
                : "hover:bg-red-50 text-red-600"
            }`}
          >
            <span>🗑️</span> Delete
          </button>
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div
            className={`p-6 rounded-xl shadow-2xl max-w-md w-full mx-4 border bg-white text-gray-900 border-gray-200`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <span className="text-red-600 dark:text-red-400 text-lg">
                  ⚠️
                </span>
              </div>
              <h3 className="text-lg font-semibold">Confirm Deletion</h3>
            </div>
            <p className={`text-sm mb-6 text-gray-600`}>
              This action cannot be undone. It will permanently delete this
              record from the database.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors border
                 
                     bg-neutral-700 hover:bg-neutral-600 text-white border-neutral-600
                 
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 
                         text-white transition-colors shadow-sm"
                autoFocus
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppTabel;
