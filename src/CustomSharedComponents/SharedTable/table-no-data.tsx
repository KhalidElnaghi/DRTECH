import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Theme, SxProps } from '@mui/material/styles';

import EmptyContent from 'src/components/empty-content';
// ----------------------------------------------------------------------

type Props = {
  notFound: boolean;
  sx?: SxProps<Theme>;
  colSpan?: number;
  iconUrl?: string;
};

export default function TableNoData({ notFound, sx, colSpan = 12, iconUrl }: Props) {
  return (
    <TableRow>
      {notFound ? (
        <TableCell colSpan={colSpan}>
          <EmptyContent
            filled
            title="No Data"
            imgUrl={iconUrl}
            sx={{
              py: 10,
              ...sx,
            }}
          />
        </TableCell>
      ) : (
        <TableCell colSpan={colSpan} sx={{ p: 12 }} />
      )}
    </TableRow>
  );
}
