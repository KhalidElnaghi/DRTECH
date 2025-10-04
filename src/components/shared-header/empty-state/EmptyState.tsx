import { Box, Button, Typography } from '@mui/material';

import { useTranslate } from 'src/locales';

interface IProps {
  header: string;
  subheader: string;
  buttonText: string;
  onButtonClick: () => void;
  seconButtonText?: string;
  onSecondButtonClick?: () => void;
  buttonDisabled?: boolean;
}

export default function SharedHeader({
  header,
  subheader,
  buttonText,
  onButtonClick,
  seconButtonText,
  onSecondButtonClick,
  buttonDisabled = false,
}: IProps) {
  const { t } = useTranslate();
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        mb: 3,
        pt: 1,
        px: { xs: 1, lg: 0 },
      }}
    >
      <Box>
        <Typography
          variant="h4"
          sx={{ mb: 1, fontWeight: 'bold', fontSize: { xs: '20px', lg: '24px' } }}
        >
          {t(header)}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: { xs: 'none', lg: 'block' } }}
        >
          {t(subheader)}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {' '}
        {seconButtonText && (
          <Button
            variant="outlined"
            size="large"
            color="primary"
            onClick={onSecondButtonClick}
            sx={{ fontSize: { xs: '12px', lg: '16px' } }}
          >
            {t(seconButtonText)}
          </Button>
        )}
        <Button
          variant="contained"
          size="large"
          onClick={onButtonClick}
          disabled={buttonDisabled}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: 1,
            fontWeight: 500,
            fontSize: { xs: '12px', lg: '16px' },
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            '&:disabled': {
              bgcolor: 'action.disabled',
              color: 'action.disabled',
            },
          }}
        >
          {t(buttonText)}{' '}
        </Button>
      </Box>
    </Box>
  );
}
