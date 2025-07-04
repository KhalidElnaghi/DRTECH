import { ReactNode } from 'react';

import { SxProps, Theme } from '@mui/material';

export enum cellAlignment {
  left = 'left',
  center = 'center',
  right = 'right',
}

export type headCellType = {
  id: string;
  align?: cellAlignment;
  label?: string;
  width?: number;
};
export type Action<T> = {
  label: string;
  icon?: string;
  sx?: SxStyle;
  onClick: (row: T) => void;
  hide?: (row: T) => Boolean;
};
export interface SharedTableProps<T> {
  tableHead: headCellType[];
  data: T[];
  actions?: Action<T>[];
  disablePagination?: boolean;
  customRender?: Partial<Record<keyof T, (row: T) => ReactNode>>;
  count: number;
  headColor?: string;
}
export interface SharedTableRowProps<T> {
  row: T;
  actions?: Action<T>[];
  customRender?: Partial<Record<keyof T, (row: T) => ReactNode>>;
  headIds: (keyof T)[];
}
export type SxStyle = SxProps<Theme>;

// ----------------------------------------------------------------------

export type TableProps = {
  dense: boolean;
  //
  selected: string[];
  onSelectRow: (id: string) => void;
  onSelectAllRows: (checked: boolean, newSelecteds: string[]) => void;
  //
  onChangePage: (event: unknown, newPage: number) => void;
  onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeDense: (event: React.ChangeEvent<HTMLInputElement>) => void;
  //
  setDense: React.Dispatch<React.SetStateAction<boolean>>;
};
