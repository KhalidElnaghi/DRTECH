import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import { useTranslate } from 'src/locales';
import { SxProps, Theme } from '@mui/material/styles';
import FormControlLabel from '@mui/material/FormControlLabel';
import TablePagination, { TablePaginationProps } from '@mui/material/TablePagination';

import { tableRowsPerPageOptions } from '../constant';

// ----------------------------------------------------------------------

type Props = {
  dense?: boolean;
  onChangeDense?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sx?: SxProps<Theme>;
};

export default function TablePaginationCustom({
  dense,
  onChangeDense,
  rowsPerPageOptions = tableRowsPerPageOptions,
  sx,
  ...other
}: Props & TablePaginationProps) {
  const { t } = useTranslate();
  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <TablePagination
        {...other}
        rowsPerPageOptions={rowsPerPageOptions}
        component="div"
        sx={{
          color: 'secondary.main',
          borderTopColor: 'transparent',
        }}
      />

      {onChangeDense && (
        <FormControlLabel
          label={t('TABLE.DENSE')}
          control={<Switch checked={dense} onChange={onChangeDense} color="secondary" />}
          sx={{
            pl: 2,
            py: 1.5,
            top: 0,
            color: 'secondary.main',
            position: {
              sm: 'absolute',
            },
          }}
        />
      )}
    </Box>
  );
}
