import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useEffect, useCallback } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import { Theme, SxProps } from '@mui/material/styles';
import FormControlLabel from '@mui/material/FormControlLabel';
import TablePagination, { TablePaginationProps } from '@mui/material/TablePagination';

import { useTranslate } from 'src/locales';

import { RHFTextField } from '../hook-form';
import FormProvider from '../hook-form/form-provider';

// ----------------------------------------------------------------------

type Props = {
  dense?: boolean;
  onChangeDense?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  sx?: SxProps<Theme>;
};

export default function TablePaginationCustom({
  dense,
  onChangeDense,
  rowsPerPageOptions = [5, 10, 25],
  page,
  sx,
  ...other
}: Props & TablePaginationProps) {
  const { t } = useTranslate();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = searchParams.get('page');
  const schema = Yup.object().shape({
    page: Yup.number()
      .positive('')
      .min(1, '')
      .max(Math.ceil(other.count / other.rowsPerPage), ''),
  });
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      page: Number(searchParams.get('page')) || 0,
    },
    mode: 'onChange',
  });
  const { setValue, handleSubmit } = methods;
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );
  const onSubmit = handleSubmit((e) => {
    router.push(`${pathname}?${createQueryString('page', `${e?.page ? e.page : '1'}`)}`);
  });

  useEffect(() => {
    setValue('page', page + 1);
  }, [currentPage, setValue, page]);
  return (
    <Stack direction="row" justifyContent="space-between" sx={{ position: 'relative', ...sx }}>
      {onChangeDense && (
        <FormControlLabel
          label={t('Dense')}
          control={<Switch checked={dense} onChange={onChangeDense} />}
          sx={{
            pl: 2,
            py: 1.5,
            top: 0,
            position: {
              // sm: 'absolute',
            },
          }}
        />
      )}
      <Stack direction="row" alignItems="center">
        <FormProvider methods={methods} onSubmit={onSubmit}>
          <RHFTextField
            name="page"
            size="small"
            type="number"
            placeholder={t('enter_page_number')}
            sx={{
              minWidth: '150px',
            }}
          />
        </FormProvider>
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          page={page}
          {...other}
          sx={{
            borderTopColor: 'transparent',
          }}
        />
      </Stack>
    </Stack>
  );
}
