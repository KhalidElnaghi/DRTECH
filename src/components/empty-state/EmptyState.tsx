import { ComponentType } from 'react';
import { Box, Button, Typography } from '@mui/material';

import Iconify from 'src/components/iconify';
import { IconifyProps } from 'src/components/iconify/types';

interface EmptyStateProps {
  icon?: IconifyProps | ComponentType<any> | string;
  header: string;
  subheader: string;
  buttonText: string;
  onButtonClick: () => void;
  iconSize?: number;
  iconColor?: string;
}

export default function EmptyState({
  icon,
  header,
  subheader,
  buttonText,
  onButtonClick,
  iconSize = 120,
  iconColor = 'text.secondary',
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!icon) return null;

    // If it's a string, check if it's an SVG file path or iconify icon
    if (typeof icon === 'string') {
      // Check if it's an SVG file path (contains .svg or starts with /)
      if (icon.includes('.svg') || icon.startsWith('/')) {
        return (
          <Box
            component="img"
            src={icon}
            alt=""
            sx={{
              width: iconSize,
              height: iconSize,
              // Don't apply color filters to SVG files to preserve original colors
            }}
          />
        );
      }

      // Treat as iconify icon
      return <Iconify icon={icon} width={iconSize} sx={{ color: iconColor, mb: 3 }} />;
    }

    // If it's a component, render it
    const IconComponent = icon as ComponentType<any>;
    return <IconComponent />;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Icon */}
      {icon && <Box>{renderIcon()}</Box>}

      {/* Header */}
      <Typography
        sx={{
          fontFamily: '"Inter Tight", sans-serif',
          fontWeight: 600,
          fontStyle: 'normal',
          fontSize: '32px',
          lineHeight: 1.25,
          letterSpacing: 0,
        }}
      >
        {header}
      </Typography>

      {/* Subheader */}
      <Typography
        sx={{
          fontFamily: '"Inter Tight", sans-serif',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: '15px',
          lineHeight: 1.5,
          letterSpacing: '0.02em',
        }}
      >
        {subheader}
      </Typography>

      {/* Button */}
      <Button
        variant="contained"
        size="large"
        onClick={onButtonClick}
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 1,
          fontWeight: 500,
          px: 4,
          py: 2,
          '&:hover': {
            bgcolor: 'primary.dark',
          },
        }}
      >
        {buttonText}
      </Button>
    </Box>
  );
}
