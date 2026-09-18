import * as React from 'react';
import Brightness4RoundedIcon from '@mui/icons-material/Brightness4Rounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import IconButton from '@mui/material/IconButton';
import type { IconButtonOwnProps } from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import { useColorScheme } from '@mui/material/styles';

export default function ColorModeIconDropdown(props: IconButtonOwnProps) {
  const { mode, setMode } = useColorScheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  if (!mode) return null;

  const icon =
    mode === 'dark' ? (
      <DarkModeRoundedIcon fontSize="small" />
    ) : mode === 'light' ? (
      <LightModeRoundedIcon fontSize="small" />
    ) : (
      <Brightness4RoundedIcon fontSize="small" />
    );

  const handleMode = (target: 'system' | 'light' | 'dark') => () => {
    setMode(target);
    setAnchorEl(null);
  };

  return (
    <React.Fragment>
      <Tooltip title="Theme">
        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} {...props}>
          {icon}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem selected={mode === 'system'} onClick={handleMode('system')}>
          System
        </MenuItem>
        <MenuItem selected={mode === 'light'} onClick={handleMode('light')}>
          Light
        </MenuItem>
        <MenuItem selected={mode === 'dark'} onClick={handleMode('dark')}>
          Dark
        </MenuItem>
      </Menu>
    </React.Fragment>
  );
}
