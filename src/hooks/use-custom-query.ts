import { AxiosRequestConfig } from 'axios';
import { useQuery } from '@tanstack/react-query';

import axiosInstance from 'src/utils/axios';

interface IProps {
  queryKey: string[];
  url: string;
  config?: AxiosRequestConfig;
}

const useCustomQuery = ({ queryKey, url, config }: IProps) =>
  useQuery({
    queryKey,
    queryFn: () => axiosInstance.get(url, config),
  });

export default useCustomQuery;
