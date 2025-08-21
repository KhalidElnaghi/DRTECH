import { Box, Button, Typography } from '@mui/material';

interface IProps {
  header: string;
  subheader: string;
  buttonText: string;
  onButtonClick: () => void;
}

export default function SharedHeader({ header, subheader, buttonText, onButtonClick }: IProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        mb: 3,
        pt: 1,
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 'bold' }}>
          {header}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subheader}
        </Typography>
      </Box>

      <Button
        variant="contained"
        size="large"
        onClick={onButtonClick}
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 1,
          fontWeight: 500,
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        }}
      >
        {buttonText}{' '}
      </Button>
    </Box>
  );
}
