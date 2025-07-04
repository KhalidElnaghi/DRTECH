import { useDebounce } from 'use-debounce';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface IProps{
  searchQuery?:string
}
function useCostomSearchParams(props?: IProps) {
  const searchQuery = props?.searchQuery;
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState<string>();
  const [value] = useDebounce(query, 500);
  
  useEffect(() => {
    if(searchQuery)
     router.push(`${pathname}?${createQueryString(searchQuery, value ?? '')}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, router, value]);

  const createQueryString = useCallback(
    (name: string, val: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, val);

      return params.toString();
    },
    [searchParams]
  );
  const link =
    typeof searchParams?.get('link') === 'string'
      ? JSON.parse(searchParams?.get('link') ?? 'false')
      : false;
  const closeLink = useCallback(() => {
    router.replace(`${pathname}?${createQueryString('link', 'false')}`);
  }, [createQueryString, pathname, router]);

  const removeProduct_id = useCallback(() => {
    router.replace(`${pathname}?${createQueryString("product_id", "")}`);
  }, [createQueryString, pathname, router]);
  return { closeLink, link,createQueryString,pathname,router,setQuery,removeProduct_id };
}

export default useCostomSearchParams;
