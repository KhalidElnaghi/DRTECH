import { forwardRef } from 'react';
import { Box, BoxProps } from '@mui/material';

// ----------------------------------------------------------------------

interface Props extends BoxProps {
  width?: number;
  height?: number;
  color?: string;
}

const AppointmentIcon = forwardRef<SVGElement, Props>(
  ({ width = 24, height = 24, color = 'currentColor', ...other }, ref) => (
    <Box
      ref={ref}
      component="svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...other}
    >
      <path
        d="M8 2V5M16 2V5M3.5 4H20.5M21 8.5V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V8.5C3 7.39543 3.89543 6.5 5 6.5H19C20.1046 6.5 21 7.39543 21 8.5Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 12H12.01M8 12H8.01M16 12H16.01M8 16H8.01M12 16H12.01M16 16H16.01"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Box>
  )
);

AppointmentIcon.displayName = 'AppointmentIcon';

export default AppointmentIcon;
