import { useTranslate } from 'src/locales';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';

import { headCellType } from './types';

// ----------------------------------------------------------------------

type Props = {
  headLabel: headCellType[];
  headColor?: string;
};

export default function TableHeadCustom({ headLabel, headColor }: Props) {
  const { t } = useTranslate();
  return (
    <TableHead>
      <TableRow>
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            sx={{
              width: headCell.width,
              textWrap: 'nowrap',
              color: headColor ? headColor : 'secondary.main',
            }}
          >
            {t(headCell?.label || '')}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
