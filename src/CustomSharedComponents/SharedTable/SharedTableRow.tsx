import Iconify from 'src/components/iconify';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { SharedTableRowProps, SxStyle } from './types';

export default function SharedTableRow<T extends { id: string }>({
  row,
  actions,
  customRender,
  headIds,
}: SharedTableRowProps<T>) {
  let rowStyle: SxStyle = {};

  if (Object.hasOwn(row, 'rowSx')) {
    rowStyle = (row as any).rowSx as SxStyle;
  }

  const popover = usePopover();

  return (
    <>
      <TableRow hover sx={rowStyle}>
        {headIds.map((x, index) => (
          <TableCell key={index} sx={{ whiteSpace: 'nowrap', color:"info.dark" }}>
            {customRender && x in customRender ? customRender[x]!(row) : (row as any)[x]}
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
        sx={{ width: "fit-content" }}
      >
        {actions
          ?.filter((action) => (action.hide ? !action.hide(row) : true))
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
