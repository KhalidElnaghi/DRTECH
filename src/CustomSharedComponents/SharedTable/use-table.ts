import { useState, useCallback } from 'react';

import { TableProps } from './types';

import { useQueryString } from 'src/hooks/use-queryString';
// ----------------------------------------------------------------------

type ReturnType = TableProps;

export type UseTableProps = {
  defaultDense?: boolean;
};

export default function useTable(props?: UseTableProps): Partial<ReturnType> {
  const [dense, setDense] = useState(!!props?.defaultDense);
  const { createQueryString } = useQueryString();

  const onChangeDense = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  }, []);
  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newLimit = event.target.value;
      createQueryString([{ name: 'limit', value: newLimit }]);
    },
    [createQueryString]
  );

  const onChangePage = useCallback(
    (event: unknown, newPage: number) => {
      createQueryString([
        {
          name: 'page',
          value: String(newPage + 1),
        },
      ]);
    },
    [createQueryString]
  );

  return {
    dense,
    //
    onChangePage,
    onChangeDense,
    onChangeRowsPerPage,
    //
    setDense,
  };
}
