'use client';

import { useSearchParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import Scrollbar from 'src/components/scrollbar';

import useTable from './use-table';
import TableNoData from './table-no-data';
import { SharedTableProps } from './types';
import SharedTableRow from './SharedTableRow';
import TableHeadCustom from './table-head-custom';
import CustomPagination from './custom-pagination';
// ----------------------------------------------------------------------
export default function SharedTable<T extends { id: string | number }>({
  data,
  actions,
  tableHead,
  disablePagination,
  customRender,
  count,
  headColor,
  emptyIcon,
}: SharedTableProps<T>) {
  const table = useTable();
  const searchParams = useSearchParams();

  const hasPage = searchParams.get('page');

  const page = hasPage ? Number(searchParams.get('page')) - 1 : 0;
  const limit = Number(searchParams.get('limit')) || 10;
  return (
    <Box>
      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <Scrollbar>
          <Table
            size={table.dense ? 'small' : 'medium'}
            sx={{
              minWidth: 400,
              borderCollapse: 'collapse',
              '& .MuiTableCell-root': {
                border: '1px solid',
                borderColor: 'divider',
                padding: '12px 16px',
              },
              // Restore bottom border that MUI removes on last row by default
              '& .MuiTableRow-root:last-child .MuiTableCell-root': {
                borderBottom: '1px solid',
                borderColor: 'divider',
              },

              '& .MuiTableBody-root .MuiTableCell-root': {
                color: 'black',
                fontFamily: 'Inter Tight',
                fontWeight: '500',
                fontStyle: 'normal',
                fontSize: '14px',
                lineHeight: '150%',
                letterSpacing: '0.02em',
              },
              // Ensure inner elements (e.g., Typography) inherit the cell typography
          
              '& .MuiTableBody-root .MuiTableRow-root:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <TableHeadCustom headLabel={tableHead} headColor={headColor} />

            <TableBody>
              {data?.length ? (
                data.map((row) => (
                  <SharedTableRow<T>
                    key={row.id}
                    row={row}
                    actions={actions}
                    customRender={customRender}
                    headIds={
                      tableHead
                        .map((x) => x.id)
                        .filter((x) => x !== '' && x !== 'rowsActions') as (keyof T)[]
                    }
                  />
                ))
              ) : (
                <TableNoData notFound colSpan={tableHead.length} iconUrl={emptyIcon} />
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      {!disablePagination && (data?.length ?? 0) > 0 && (
        <CustomPagination
          count={count}
          page={page}
          rowsPerPage={limit}
          onPageChange={table.onChangePage!}
        />
      )}
    </Box>
  );
}
