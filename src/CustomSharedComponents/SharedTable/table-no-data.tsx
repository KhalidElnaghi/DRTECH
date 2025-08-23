import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { Theme, SxProps } from '@mui/material/styles';

import { useTranslate } from 'src/locales';

import EmptyContent from 'src/components/empty-content';
// ----------------------------------------------------------------------

type Props = {
  notFound: boolean;
  sx?: SxProps<Theme>;
  colSpan?: number;
  iconUrl?: string;
};

export default function TableNoData({ notFound, sx, colSpan = 12, iconUrl }: Props) {
  const { t } = useTranslate();
  return (
    <TableRow>
      {notFound ? (
        <TableCell colSpan={colSpan}>
          <EmptyContent
            filled
            title={t('LABEL.NO_DATA')}
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
