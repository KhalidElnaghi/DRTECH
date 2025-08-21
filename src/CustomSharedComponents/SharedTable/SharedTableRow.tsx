/* eslint-disable no-nested-ternary */
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { SxStyle, SharedTableRowProps } from './types';

export default function SharedTableRow<T extends { id: string | number }>({
  row,
  actions,
  customRender,
  headIds,
  index,
}: SharedTableRowProps<T>) {
  let rowStyle: SxStyle = {};

  if (Object.hasOwn(row, 'rowSx')) {
    rowStyle = (row as any).rowSx as SxStyle;
  }

  const popover = usePopover();

  return (
    <>
      <TableRow hover sx={rowStyle}>
        {headIds.map((x, cellIdx) => (
          <TableCell key={cellIdx} sx={{ whiteSpace: 'nowrap', color: 'info.dark' }}>
            {x === ('auto_index' as unknown as keyof T)
              ? index
              : customRender && x in customRender
                ? customRender[x]!(row)
                : (row as any)[x]}
          </TableCell>
        ))}

        {!!actions?.length && (
          <TableCell align="left" sx={{ px: 1, whiteSpace: 'nowrap' }}>
            <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </TableCell>
        )}
      </TableRow>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 'fit-content' }}
      >
        {actions
          ?.filter((action) => (action.hide ? !action.hide(row) : true))
          // eslint-disable-next-line @typescript-eslint/no-shadow
          .map((action, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                action.onClick(row);
                popover.onClose();
              }}
              sx={action.sx}
            >
              <Iconify icon={action?.icon || 'solar:pen-bold'} />
              {action.label}
            </MenuItem>
          ))}
      </CustomPopover>
    </>
  );
}
