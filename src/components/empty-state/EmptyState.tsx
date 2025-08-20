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
      return <Iconify icon={icon} width={iconSize} sx={{ color: iconColor }} />;
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
        textAlign: 'center',
        py: 8,
        px: 2,
        minHeight: '400px',
        width: '100%',
        height: '100%',
      }}
    >
      {/* Icon */}
      {icon && <Box sx={{ mb: 3 }}>{renderIcon()}</Box>}

      {/* Header */}
      <Typography
        sx={{
          mb: 1,
          fontWeight: 'bold',
          color: 'text.primary',
          fontSize: '32px',
        }}
      >
        {header}
      </Typography>

      {/* Subheader */}
      <Typography
        sx={{
          mb: 4,
          color: 'text.secondary',

          fontSize: '16px',
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
          px: 3,
          py: 1.5,
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
