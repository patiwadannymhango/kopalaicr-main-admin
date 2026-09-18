import type { Components, Theme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';
import { gray } from './themePrimitives';

// Component-level overrides shared by both color schemes — the classic
// MD2 "flat card + soft shadow + pill chip" look used throughout the MUI
// dashboard template.
export const componentCustomizations: Components<Theme> = {
  MuiCssBaseline: {
    styleOverrides: {
      body: { scrollbarWidth: 'thin' },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: { backgroundImage: 'none' },
    },
    defaultProps: { elevation: 0 },
  },
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 12,
        boxShadow: 'none',
      }),
    },
  },
  MuiCardHeader: {
    styleOverrides: {
      root: { paddingBottom: 0 },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: { textTransform: 'none', borderRadius: 8, fontWeight: 500 },
      contained: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
    },
    defaultProps: { disableElevation: true },
  },
  MuiIconButton: {
    styleOverrides: {
      root: { borderRadius: 8 },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: { borderRadius: 999, fontWeight: 500 },
      label: { paddingLeft: 10, paddingRight: 10 },
    },
  },
  MuiTextField: {
    defaultProps: { size: 'small' },
  },
  MuiFormControl: {
    defaultProps: { size: 'small' },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: { borderRadius: 8 },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: ({ theme }) => ({
        boxShadow: 'none',
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundImage: 'none',
      }),
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }) => ({
        borderRight: `1px solid ${theme.palette.divider}`,
        backgroundImage: 'none',
        backgroundColor: theme.palette.background.paper,
      }),
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 8,
        '&.Mui-selected': {
          backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.24 : 0.12),
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.32 : 0.18),
          },
        },
      }),
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: ({ theme }) => ({ borderBottom: `1px solid ${theme.palette.divider}` }),
      head: { fontWeight: 600, color: gray[600] },
    },
  },
  MuiDialogTitle: {
    styleOverrides: {
      root: { fontSize: '1.1rem', fontWeight: 600 },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: { borderRadius: 6, fontSize: '0.7rem' },
    },
  },
  MuiDataGrid: {
    defaultProps: {
      showCellVerticalBorder: true,
      showColumnVerticalBorder: true,
    },
    styleOverrides: {
      root: ({ theme }) => ({
        border: `1px solid ${theme.palette.divider}`,
        '--DataGrid-rowBorderColor': theme.palette.divider,
        '--DataGrid-containerBackground': theme.palette.mode === 'dark' ? alpha(gray[800], 0.4) : gray[50],
      }),
      columnHeaders: ({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? alpha(gray[800], 0.4) : gray[50],
        borderRadius: 0,
      }),
      row: {
        '&:hover': { cursor: 'pointer' },
      },
    },
  },
};
