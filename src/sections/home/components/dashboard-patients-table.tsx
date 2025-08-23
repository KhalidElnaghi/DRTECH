'use client';

import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'next/navigation';

import { Box, Paper, Typography } from '@mui/material';

import { useDashboardPatients } from 'src/hooks/use-dashboard-query';

import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

import DashboardPatientsTableSkeleton from './skeletons/dashboard-patients-table-skeleton';

const TABLE_HEAD = [
  { id: 'FullName', label: 'LABEL.FULL_NAME' },
  { id: 'GenderName', label: 'LABEL.GENDER' },
  { id: 'DateOfBirth', label: 'LABEL.DATE_OF_BIRTH' },
  { id: 'Address', label: 'LABEL.ADDRESS' },
  { id: 'PhoneNumber', label: 'LABEL.PHONE_NUMBER' },
  { id: 'BloodTypeName', label: 'LABEL.BLOOD_TYPE' },
];

export default function DashboardPatientsTable() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || 10;

  const { data, isLoading } = useDashboardPatients({ page, limit });

  const items = data?.Data?.Items || data?.Data?.items || [];
  const totalCount = data?.Data?.TotalCount || data?.Data?.totalCount || 0;

  if (isLoading) {
    return <DashboardPatientsTableSkeleton />;
  }

  return (
    <Paper
      elevation={1}
      sx={{
        p: 0,
        width: '100%',
        maxWidth: '95vw',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
        px: 0,
      }}
    >
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="h6" sx={{ mb: 0.5 }} color="#666D80">
          {t('TITLE.RECENT_PATIENTS')}
        </Typography>
      </Box>
      <Box sx={{ overflow: 'auto', width: '100%' }}>
        <SharedTable
          count={totalCount}
          data={items.map((p: any) => ({ id: p.Id || p.id, ...p }))}
          tableHead={TABLE_HEAD}
          disablePagination={false}
        />
      </Box>
    </Paper>
  );
}
