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
              backgroundColor: 'grey.100',
              color: 'grey.700',
              fontWeight: 500,
              fontStyle: 'normal',
              fontSize: '12px',
              lineHeight: '150%',
              letterSpacing: '2%',
              border: '1px solid !important',
              borderColor: '#E0E5E7 !important',
              padding: '12px 16px',
            }}
          >
            {t(headCell?.label || '')}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
