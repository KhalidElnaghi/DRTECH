'use client';

import { getNameKeyLang } from 'src/utils/helperfunction';

import { useTranslate } from 'src/locales';
import RHFAutocomplete from '../hook-form/rhf-autocomplete';

interface IProps {
  items: ITems[];
  label: string;
  placeholder: string;
  name: string;
  isDisabled?: boolean;
  onCustomChange?: (value: any) => void;
  searchQuery?: string;
}
export interface ITems {
  product_id?: string;
  id: string;
  name: string;
  name_en: string;
  name_ar: string;
}
function CutomAutocompleteView({
  items,
  label,
  placeholder,
  name,
  isDisabled = false,
  onCustomChange,
  searchQuery,
}: IProps) {
  const { t } = useTranslate();
  return (
    <RHFAutocomplete
      onCustomChange={onCustomChange}
      name={name}
      label={t(label)}
      searchQuery={searchQuery}
      placeholder={t(placeholder)}
      disabled={isDisabled}
      fullWidth
      options={items ?? []}
      getOptionLabel={(option) =>
        (option as ITems)[getNameKeyLang()]
          ? (option as ITems)[getNameKeyLang()]
          : (option as ITems).name ?? ''
      }
      isOptionEqualToValue={(option, value) =>
        option.id ? option.id === value.id : option.product_id === value.product_id
      }
      renderOption={(props, item) => (
        <li {...props} key={item?.id ?? item?.product_id} value={item?.id ?? item?.product_id}>
          {item[getNameKeyLang()] ? item[getNameKeyLang()] : item.name}
        </li>
      )}
    />
  );
}

export default CutomAutocompleteView;
