'use client';

import Image from 'next/image';
import { useState } from 'react';

import {
  Box,
  Stack,
  Paper,
  Button,
  Typography,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDeleteInpatient } from 'src/hooks/use-inpatients-query';

import { useTranslate } from 'src/locales';
import SharedTable from 'src/CustomSharedComponents/SharedTable/SharedTable';

import EmptyState from 'src/components/empty-state';
import { ConfirmDialog } from 'src/components/custom-dialog';
import SharedHeader from 'src/components/shared-header/empty-state';
import InpatientDialog from 'src/components/dialogs/inpatient-dialog';

import { IRoom } from 'src/types/room';
import { IPatient } from 'src/types/patient';
import { IInpatient } from 'src/types/inpatient';

interface IProps {
  inpatients: IInpatient[];
  totalCount: number;
  patients: IPatient[];
  rooms: IRoom[];
}

const formatDateLocal = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export default function InpatientsPage({ inpatients, totalCount, patients, rooms }: IProps) {
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const { t } = useTranslate();
  const [selectedInpatient, setSelectedInpatient] = useState<IInpatient | undefined>();
  const [selectedId, setSelectedId] = useState<number>(0);
  const confirmDelete = useBoolean();
  const [isDeleting, setIsDeleting] = useState(false);

  // React Query mutations
  const deleteInpatientMutation = useDeleteInpatient();

  const handleOpenAddDialog = () => {
    setSelectedInpatient(undefined); // Clear any previously selected inpatient
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setSelectedInpatient(undefined);
  };

  const handleEditInpatient = (inpatient: IInpatient) => {
    setSelectedInpatient(inpatient);
    setOpenAddDialog(true);
  };

  const handleDeleteInpatient = async (inpatientId: number) => {
    try {
      setIsDeleting(true);
      await deleteInpatientMutation.mutateAsync(inpatientId);
      confirmDelete.onFalse();
      setIsDeleting(false);
    } catch (error) {
      console.error('Delete inpatient error:', error);
      setIsDeleting(false);
    }
  };

  // Table configuration for SharedTable
  const TABLE_HEAD = [
    { id: 'PatientName', label: t('LABEL.PATIENT_NAME') || 'Patient Name' },
    { id: 'RoomNumber', label: t('LABEL.ROOM_NUMBER') || 'Room Number' },
    { id: 'AdmissionDate', label: t('LABEL.ADMISSION_DATE') || 'Admission Date' },
    { id: 'DischargeDate', label: t('LABEL.DISCHARGE_DATE') || 'Discharge Date' },
    { id: 'Diagnosis', label: t('LABEL.DIAGNOSIS') || 'Diagnosis' },
    { id: '', label: '', width: 80 },
  ];

  // Show no data message if no inpatients, but keep header and search/filter functionality
  if (!inpatients || (inpatients.length === 0 )) {
    return (
      <>
        {/* No Data Found Message */}
        <EmptyState
          icon="/assets/images/inpatients/icon.svg"
          header={t('TITLE.NO_INPATIENTS_YET') || 'No inpatients yet'}
          subheader={t('TITLE.NO_INPATIENTS_YET_START_BY_ADDING_NEW_ONE') || 'You haven&apos;t added any inpatients yet. Start by adding a new one.'}
          buttonText={t('BUTTON.ADD_NEW_INPATIENT') || 'Add New Inpatient'}
          onButtonClick={ handleOpenAddDialog}
          iconSize={150}
        />

        {/* Inpatient Dialog */}
        <InpatientDialog
          key={selectedInpatient ? `edit-${selectedInpatient.Id}` : 'new-inpatient'}
          open={openAddDialog}
          onClose={handleCloseAddDialog}
          patients={patients}
          rooms={rooms}
          inpatient={null}
        />
      </>
    );
  }

  return (
    <>
      <Stack spacing={3}>
        {/* Header Section */}

        <SharedHeader
        header={t('TITLE.INPATIENTS') || 'Inpatients'}
        subheader={t('TITLE.LATEST_UPDATES_FROM_THE_PAST_7_DAYS') || 'Latest updates from the past 7 days.'}
        buttonText={t('BUTTON.ADD_NEW_INPATIENT') || 'Add New Inpatient'}
        onButtonClick={handleOpenAddDialog}
      />
        {/* Search and Filter Bar */}
        <Paper
          elevation={1}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            px: 0,
            mb: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 2,
              py: 2,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ mb: 0.5, color: 'text.secondary' }}>
                {t('TITLE.INPATIENTS') || 'Inpatients'}
              </Typography>
            </Box>
          </Box>

          {/* Inpatients Table using SharedTable */}
          <SharedTable
            count={totalCount}
            data={inpatients.map((inpatient) => ({
              id: inpatient.Id,
              ...inpatient,
            }))}
            tableHead={TABLE_HEAD}
            actions={[
              // {
              //   sx: { color: 'primary.main' },
              //   label: 'Edit',
              //   icon: 'solar:pen-bold',
              //   onClick: (inpatient: IInpatient) => handleEditInpatient(inpatient),
              // },
              {
                sx: { color: 'error.dark' },
                label: t('BUTTON.DELETE') || 'Delete',
                icon: 'material-symbols:delete-outline-rounded',
                onClick: (inpatient: IInpatient) => {
                  setSelectedId(inpatient.Id);
                  confirmDelete.onTrue();
                },
              },
            ]}
            customRender={{
              AdmissionDate: ({ AdmissionDate }: IInpatient) => (
                <Box>{formatDateLocal(AdmissionDate)}</Box>
              ),
              DischargeDate: ({ DischargeDate }: IInpatient) => (
                <Box>{formatDateLocal(DischargeDate)}</Box>
              ),
              Diagnosis: ({ Diagnosis }: IInpatient) => (
                <Box
                  sx={{
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={Diagnosis}
                >
                  {Diagnosis}
                </Box>
              ),
            }}
            emptyIcon="/assets/images/inpatients/icon.svg"
          />
        </Paper>
      </Stack>

      {/* Inpatient Dialog */}
      <InpatientDialog
        key={selectedInpatient ? `edit-${selectedInpatient.Id}` : 'new-inpatient'}
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        patients={patients}
        rooms={rooms}
        inpatient={selectedInpatient}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title={t('TITLE.DELETE_INPATIENT') || 'Delete Inpatient'}
        icon={<Image src="/assets/images/global/delete.svg" alt="delete" width={84} height={84} />}
        content={t('TITLE.DELETE_INPATIENT_CONFIRMATION') || 'Are you sure you want to delete this inpatient?'}
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => handleDeleteInpatient(selectedId)}
            disabled={isDeleting}
            sx={{
              width: { xs: '100%', lg: 175 },
              height: 56,
              borderRadius: 2,
              padding: '8px 16px',
              bgcolor: '#DF1C41',
              '&:hover': {
                bgcolor: '#DF1C60',
              },
            }}
          >
            {isDeleting ? t('BUTTON.DELETING') || 'Deleting...' : t('BUTTON.DELETE') || 'Delete'}
          </Button>
        }
      />
    </>
  );
}
