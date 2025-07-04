import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import TextField, { TextFieldProps } from '@mui/material/TextField';

// ----------------------------------------------------------------------

type Props = TextFieldProps & {
  name: string;
  rules?: { [key: string]: any };
  type?: 'text' | 'number';
};

export default function RHFTextField({
  rules,
  value,
  name,
  helperText,
  type = 'text',
  ...other
}: Props) {
  const { control, setValue } = useFormContext();
  useEffect(() => {
    setValue(name, value);
  }, [setValue, name, value]);
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      defaultValue={type === 'number' && value === 0 ? '' : value || ''}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          value={type === 'number' && field.value === 0 ? '' : field.value || ''}
          onChange={(event) => {
            if (type === 'number') {
              const newValue = event.target.value.replace(/[^\d]/g, '');
              field.onChange(typeof newValue === 'number' ? undefined : Number(newValue));
            } else {
              field.onChange(event.target.value);
            }
          }}
          error={!!error}
          helperText={error ? error?.message : helperText}
          {...other}
          sx={{ '& input': { textAlign: 'left' } }}
        />
      )}
    />
  );
}
