import { Box, Button, Typography } from '@mui/material';

interface IProps {
  header: string;
  subheader: string;
  buttonText: string;
  onButtonClick: () => void;
  seconButtonText?: string;
  onSecondButtonClick?: () => void;
}

export default function SharedHeader({
  header,
  subheader,
  buttonText,
  onButtonClick,
  seconButtonText,
  onSecondButtonClick,
}: IProps) {
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
          {header}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: { xs: 'none', lg: 'block' } }}
        >
          {subheader}
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
            {seconButtonText}
          </Button>
        )}
        <Button
          variant="contained"
          size="large"
          onClick={onButtonClick}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: 1,
            fontWeight: 500,
            fontSize: { xs: '12px', lg: '16px' },
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          {buttonText}{' '}
        </Button>
      </Box>
    </Box>
  );
}
