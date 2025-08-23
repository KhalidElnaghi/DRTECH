/* eslint-disable no-nested-ternary */

'use client';

import { List, Paper, ListItem, Typography, ListItemText } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useDashboardPatients } from 'src/hooks/use-dashboard-query';

type Props = { limit?: number };

export default function RecentPatients({ limit = 5 }: Props) {
  const { t } = useTranslation();
  const { data, isLoading } = useDashboardPatients({ limit });

  const items = data?.Data?.Items || data?.Data || data?.items || [];

  return (
    <Paper
      elevation={1}
      sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        {t('TITLE.RECENT_PATIENTS')}
      </Typography>
      {isLoading ? (
        <Typography variant="body2" color="text.secondary">
          {t('LABEL.LOADING')}
        </Typography>
      ) : items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {t('LABEL.NO_PATIENTS')}
        </Typography>
      ) : (
        <List dense>
          {items.slice(0, limit).map((p: any) => (
            <ListItem key={p.Id || p.id} sx={{ px: 0 }}>
              <ListItemText
                primary={p.FullName || p.fullName}
                secondary={p.GenderName || p.gender}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}
