import React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { useTranslate } from 'src/locales';
import { useTheme } from '@emotion/react';
// Custom chevron icons using SVG
const ChevronLeftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
  </svg>
);

interface CustomPaginationProps {
  count: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange?: (newRowsPerPage: number) => void;
}

export default function CustomPagination({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: CustomPaginationProps) {
  const { t } = useTranslate();
  const theme = useTheme();
  const totalPages = Math.ceil(count / rowsPerPage);
  const currentPage = page + 1;

  // Debug logging

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 4; i += 1) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 3; i <= totalPages; i += 1) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i += 1) {
        pages.push(i);
      }
      pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      // The useTable hook expects (event, newPage) signature
      onPageChange(null, newPage - 1);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 2,
        px: 1,
        borderTop: '1px solid',
        borderColor: 'divider',
        flexWrap: 'nowrap',
        minHeight: 56,
      }}
    >
      {/* Page info */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          flexShrink: 0,
          whiteSpace: 'nowrap',
          mr: 2,
        }}
      >
        {t('LABEL.PAGE')} {currentPage} {t('LABEL.OF')} {totalPages}
      </Typography>

      {/* Pagination controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
        {/* Previous button */}
        <IconButton
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          sx={{
            color: currentPage <= 1 ? 'text.disabled' : 'primary.main',
            border: '1px solid black',
            borderColor: currentPage <= 1 ? 'divider' : 'primary.main',
            borderRadius: 1,
            transform: (theme as any)?.direction === 'rtl' ? 'rotate(180deg)' : 'none',
          }}
        >
          <ChevronLeftIcon />
        </IconButton>

        {/* Page numbers */}
        <Box
          sx={{
            mx: 2,
            border: '1px solid #DFE1E7',
            borderRadius: 1,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            minWidth: 'fit-content',
            maxWidth: 'none',
          }}
        >
          {getPageNumbers().map((pageNum, index) => (
            <React.Fragment key={index}>
              {pageNum === '...' ? (
                <Box
                  sx={{
                    px: 1,
                    color: 'text.secondary',
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 24,
                    height: 40,
                  }}
                >
                  ...
                </Box>
              ) : (
                <Button
                  variant={pageNum === currentPage ? 'contained' : 'text'}
                  onClick={() => handlePageChange(pageNum as number)}
                  sx={{
                    minWidth: 40,
                    height: 40,
                    borderRadius: 0,
                    fontWeight: 600,
                    color: pageNum === currentPage ? 'white' : 'text.primary',
                    bgcolor: pageNum === currentPage ? 'primary.main' : 'transparent',
                    '&:hover': {
                      bgcolor: pageNum === currentPage ? 'primary.dark' : 'action.hover',
                    },
                  }}
                >
                  {pageNum}
                </Button>
              )}
            </React.Fragment>
          ))}
        </Box>

        {/* Next button */}
        <IconButton
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          sx={{
            // color: currentPage >= totalPages ? 'text.disabled' : 'primary.main',
            border: '1px solid black',
            borderColor: currentPage >= totalPages ? 'divider' : 'primary.main',
            borderRadius: 1,
            transform: (theme as any)?.direction === 'rtl' ? 'rotate(180deg)' : 'none',
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
