
export type FormInput =
    'multiCheckbox'
  | 'textField'
  | 'switch'
  | 'select'
  | 'uploadFile'
  | 'uploadImage'
  | 'otpInput'
  | 'checkbox'
  | 'radioGroup'
  | 'autocomplete'
  | 'textarea'
  ;
export type  Input = {
  label: string;
  name: string;
  value?: any;
  inputType: FormInput;
  sx?: any;
  fullGrid?: number;
  rules?: any;
  [key: string]: any;
};
