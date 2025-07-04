'use server';

import { Params } from 'src/utils/axios';

import CutomAutocompleteView from './CutomAutocompleteView';

interface props {
  fetchItems: (params: Params) => Promise<any>;
  label: string;
  placeholder: string;
  name: string;
  search?: string;
  searchQuery?: string;
}

export default async function CustomAutoCompelete({
  fetchItems,
  label,
  placeholder,
  name,
  search,
  searchQuery,
}: props) {
  const res = await fetchItems({
    page: 1,
    limit: 35,
    filters: search,
  });
  return (
    <CutomAutocompleteView
      searchQuery={searchQuery}
      items={res?.data?.data}
      label={label}
      placeholder={placeholder}
      name={name}
    />
  );
}
