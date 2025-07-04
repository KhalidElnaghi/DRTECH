'use client';

import { useSnackbar } from 'notistack';
import { useDebounce } from 'use-debounce';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import { Theme, SxProps } from '@mui/material';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import InputAdornment from '@mui/material/InputAdornment';

import { useTranslate } from 'src/locales';

import Scrollbar from '../scrollbar';
import Iconify, { IconifyProps } from '../iconify';
import CustomPopover, { usePopover } from '../custom-popover';
import {
  emptyRows,
  TableProps,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom,
} from '../table';

type TableHeader = { id: string; label: string; align?: string };

interface SharedTableProps {
  table: TableProps;
  tableHeaders: TableHeader[];
  dataFiltered: any[];
  count: number;
  additionalTableProps: { [key: string]: (item: any) => void };
  handleFilters?: (name: string, value: string) => void;
  onImport?: (formData: FormData) => void;
  onExport?: () => Promise<any>;
  filters?: { name: string };
  enableActions?: boolean;
  enableExportImport?: boolean;
  enableAdd?: boolean;
  addButtonCustomizations?: {
    icon?: string;
    variant?: 'text' | 'outlined' | 'contained';
  };
  disablePagination?: boolean;
  showFromClients?: boolean;
  custom_add_title?: string;
  handleAdd?: () => void;
  actions?: {
    label: string;
    icon?: IconifyProps;
    onClick?: (selectedRow: any) => void;
    sx?: SxProps<Theme>;
    hideActionIf?: (selectedRow: any) => boolean;
  }[];
  onCellClick?: Record<string, (row: any) => void>;
  hidePaginationOnly?: boolean;
  additionalComponent?: React.ReactNode;
}

const SharedTable = (props: SharedTableProps) => {
  const {
    table,
    tableHeaders,
    dataFiltered,
    additionalTableProps,
    enableActions = false,
    actions,
    onCellClick,
    disablePagination,
    showFromClients,
    handleFilters,
    filters,
    count,
    enableExportImport = false,
    enableAdd = false,
    custom_add_title,
    addButtonCustomizations,
    handleAdd,
    onImport,
    onExport,
    hidePaginationOnly,
    additionalComponent,
  }: SharedTableProps = props;

  const [selectedRow, setSelectedRow] = useState<any>({});
  const popover = usePopover();
  const { i18n, t } = useTranslate();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const page =
    typeof searchParams?.get('page') === 'string' ? Number(searchParams?.get('page')) : 1;
  const limit =
    typeof searchParams?.get('limit') === 'string' ? Number(searchParams?.get('limit')) : 5;
  const search = typeof searchParams?.get('search') === 'string' ? searchParams?.get('search') : '';

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );
  const [query, setQuery] = useState(search);
  const [value] = useDebounce(query, 1000);

  useEffect(() => {
    if (!disablePagination) router.push(`${pathname}?${createQueryString('search', value ?? '')}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, router, value]);

  const handleSearchByName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  }, []);

  const getItem = (item: any, header: any, index: number): any => {
    const name = `onRender${header.id}`;
    if (additionalTableProps[name]) {
      return additionalTableProps[name](item);
    }
    return item[header?.id];
  };

  const handleExportItems = async () => {
    if (onExport) {
      try {
        const data = await onExport();
        const url = window.URL.createObjectURL(
          new Blob([data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          })
        );
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'sections.xlsx');
        document.body.appendChild(link);
        link.click();
        // clean up "a" element & remove ObjectURL
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        enqueueSnackbar(t('Exported successfully'), { variant: 'success' });
      } catch (error) {
        enqueueSnackbar(`${error}`, { variant: 'error' });
      }
    }
  };
  const handleImportItems = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (onImport) {
        try {
          const formdata = new FormData();
          formdata.append('flie', file);
          await onImport(formdata);
          event.target.value = '';
          enqueueSnackbar(t('Imported successfully'), { variant: 'success' });
        } catch (error) {
          enqueueSnackbar(`${error?.message}`, { variant: 'error' });
        }
      }
    }
  };
  return (
    <Card>
      {(enableAdd || !disablePagination) && (
        <Stack
          spacing={2}
          alignItems={{ xs: 'flex-end', md: 'center' }}
          direction={{
            xs: 'column',
            md: 'row',
          }}
          sx={{
            p: 2.5,
            pr: { xs: 2.5, md: 1 },
          }}
        >
          <Stack
            direction="row"
            justifyContent={!disablePagination ? 'space-between' : 'end'}
            alignItems="center"
            spacing={2}
            flexGrow={1}
            sx={{ width: 1 }}
          >
            {!disablePagination && (
              <TextField
                fullWidth
                value={query}
                onChange={handleSearchByName}
                placeholder={`${t('search')}...`}
                sx={{ maxWidth: '30%' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            <Stack direction="row" gap={1}>
              {additionalComponent && additionalComponent}
              {enableExportImport && (
                <Stack direction="row" spacing={1}>
                  <input
                    type="file"
                    name="file"
                    accept=".xlsx"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleImportItems}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => fileInputRef?.current?.click()}
                    startIcon={<Iconify icon="eva:cloud-upload-fill" />}
                  >
                    {t('Import')}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleExportItems()}
                    startIcon={<Iconify icon="solar:export-bold" />}
                  >
                    {t('Export')}
                  </Button>
                </Stack>
              )}
              {enableAdd && handleAdd && (
                <Button
                  variant={
                    addButtonCustomizations?.variant ? addButtonCustomizations.variant : 'outlined'
                  }
                  onClick={() => handleAdd()}
                  startIcon={
                    <Iconify
                      icon={
                        addButtonCustomizations?.icon
                          ? addButtonCustomizations.icon
                          : 'mingcute:add-line'
                      }
                    />
                  }
                >
                  {custom_add_title}
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>
      )}
      <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={enableActions ? [...tableHeaders, { id: '', label: '' }] : tableHeaders}
              rowCount={dataFiltered?.length}
              numSelected={table.selected.length}
              onSort={table.onSort}
            />

            <TableBody>
              {dataFiltered?.map((item: any) => (
                <TableRow
                  hover
                  key={item?.id}
                  sx={{
                    whiteSpace: 'nowrap',
                    ...item?.sx,
                  }}
                >
                  {tableHeaders?.map((header, index) => {
                    const isClickable = onCellClick && Object.keys(onCellClick).includes(header.id);
                    return (
                      <TableCell
                        key={header.id}
                        onClick={isClickable ? () => onCellClick[header.id](item) : undefined}
                        sx={{ cursor: isClickable ? 'pointer' : undefined }}
                      >
                        <Stack alignItems="center" direction="row" spacing={1}>
                          {getItem(item, header, index)}
                        </Stack>
                      </TableCell>
                    );
                  })}
                  {enableActions ? (
                    <TableCell align="right" sx={{ px: 1 }}>
                      <IconButton
                        color={popover.open ? 'inherit' : 'default'}
                        onClick={(event) => {
                          popover.onOpen(event);
                          if (selectedRow?.sx) {
                            delete selectedRow.sx;
                          }
                          setSelectedRow(item);
                        }}
                      >
                        <Iconify icon="eva:more-vertical-fill" />
                      </IconButton>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}

              {/* Actions Popover */}
              <CustomPopover
                open={popover.open}
                onClose={popover.onClose}
                arrow={i18n.language === 'ar' ? 'left-top' : 'right-top'}
                hiddenArrow
                // sx={{ width: 160 }}
              >
                {actions?.map(({ label, icon, onClick, sx, hideActionIf }) => {
                  if (hideActionIf) {
                    if (selectedRow?.sx) {
                      delete selectedRow.sx;
                    }
                    const isActionHidden = hideActionIf(selectedRow);
                    if (isActionHidden) return null;
                  }
                  return (
                    <MenuItem
                      key={label}
                      onClick={() => {
                        if (selectedRow?.sx) {
                          delete selectedRow.sx;
                        }
                        if (onClick) {
                          onClick(selectedRow);
                        }
                        popover.onClose();
                      }}
                      sx={sx}
                    >
                      {icon ? <Iconify icon={icon} /> : null}
                      {label}
                    </MenuItem>
                  );
                })}
              </CustomPopover>

              {/* Table Skeleton */}
              <TableEmptyRows
                emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered?.length)}
              />

              {/* NO data table view */}
              <TableNoData notFound={!dataFiltered?.length} />
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>

      {/* Table Pagination */}
      {!hidePaginationOnly && (!disablePagination || showFromClients) && (
        <TablePaginationCustom
          count={count}
          page={page - 1}
          rowsPerPage={limit}
          labelRowsPerPage={t('rows_per_page')}
          labelDisplayedRows={({ from, to, count: rows }: any) =>
            `${from}-${to} ${t('of')} ${rows !== -1 ? rows : `${t('more_than')} ${to}`}`
          }
          onPageChange={(event: any, newPage: number) => {
            router.push(`${pathname}?${createQueryString('page', `${newPage + 1}`)}`);
          }}
          onRowsPerPageChange={(e: any) => {
            const newLimit = e?.target?.value;
            router.push(`${pathname}?${createQueryString('limit', newLimit)}`);
          }}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      )}
    </Card>
  );
};

export default SharedTable;
