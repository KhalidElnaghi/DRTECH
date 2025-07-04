import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import TextField, { TextFieldProps } from '@mui/material/TextField';

// ----------------------------------------------------------------------

type Props = TextFieldProps & {
  name: string;
  rules?: { [key: string]: any };
  value?: any;
};

export default function RHFTextarea({
  rules,
  name,
  value,
  helperText,
  type,
  minRows,
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
      defaultValue=""
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          type={type}
          multiline
          rows={minRows || 3}
          value={field?.value}
          onChange={(event) => {
            if (type === 'number') {
              field.onChange(Number(event.target.value));
            } else {
              field.onChange(event.target.value);
            }
          }}
          error={!!error}
          helperText={error ? error?.message : helperText}
          {...other}
        />
      )}
    />
  );
}
