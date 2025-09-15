"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import { Button } from "/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
} from "/src/components/ui/dropdown-menu";
import { Input } from "/src/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "/src/components/ui/table";

export function DataTable({
  title,
  columns,
  data,
  filterCols,
  canAdd = false,
  setOpenModal,
  settypeOfSubmit,
}) {
  const [sorting, setSorting] = React.useState([{ id: 'id', desc: true }]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({ id: false });
  const [rowSelection, setRowSelection] = React.useState({});

  const extendedColumns = React.useMemo(() => [
    {
      id: 'id',
      header: 'ID',
      accessorKey: 'id',
      enableSorting: true,
      sortDescFirst: true,
    },
    ...columns,
  ], [columns]);

  const table = useReactTable({
    data,
    columns: extendedColumns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const buttonStyle = {
    backgroundColor: '#1E3A8A',
    color: '#fff',
    border: '1px solid #6B7280',
    borderRadius: '4px',
    padding: '10px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div className="w-full my-6">
      <h1 style={{ fontFamily: 'Roboto, sans-serif', fontSize: '1.5rem', fontWeight: 'bold', color: '#333', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)', paddingBottom: '10px', borderBottom: '2px solid #ccc' }}>
        {title}
      </h1>

      <div className="flex items-center py-4">
        <div className="flex-grow flex items-center space-x-4">
        {filterCols.map((col) => (
  <Input
    key={col}
    placeholder={`Rechercher dans ${col}`}
    value={(table.getColumn(col)?.getFilterValue() ?? "")}
    onChange={(event) =>
      table.getColumn(col)?.setFilterValue(event.target.value)
    }
    style={{
      padding: '8px 12px',
      fontSize: '16px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      width: '300px',
    }}
  />
))}
           
          <DropdownMenu>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {canAdd && (
          <div className="ml-auto">
            <Button
              variant="solid"
              onClick={() => {
                setOpenModal(true);
                settypeOfSubmit("create");
              }}
              style={buttonStyle}
            >
              + Ajouter {title.slice(0, -1)}
            </Button>
          </div>
        )}
      </div>
      <div className="rounded-md border">
        <Table className="custom-table" style={{ background: '#f2f2f2', backgroundSize: '200% 100%', animation: 'backgroundAnimation 10s linear infinite' }}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} style={{ backgroundColor: 'transparent' }}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} style={{ color: '#333', fontSize: '16px', fontWeight: 'bold', fontFamily: 'Nunito, sans-serif',  textAlign: 'right',  }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} style={{ color: '#333' }}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Aucun résultat trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Précédent
        </Button>
        <span className="text-sm text-muted-foreground" style={{ margin: '0 8px' }}>
          {table.getState().pagination.pageIndex + 1}/{table.getPageCount()}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
