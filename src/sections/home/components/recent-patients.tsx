/* eslint-disable no-nested-ternary */

'use client';

import { List, Paper, ListItem, Typography, ListItemText } from '@mui/material';

import { useDashboardPatients } from 'src/hooks/use-dashboard-query';

type Props = { limit?: number };

export default function RecentPatients({ limit = 5 }: Props) {
  const { data, isLoading } = useDashboardPatients({ limit });

  const items = data?.Data?.Items || data?.Data || data?.items || [];

  return (
    <Paper
      elevation={1}
      sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        Recent Patients
      </Typography>
      {isLoading ? (
        <Typography variant="body2" color="text.secondary">
          Loading...
        </Typography>
      ) : items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No patients
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
