import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Box,
  Breadcrumbs,
  Divider,
  Drawer,
  drawerClasses,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DashboardIcon from '@mui/icons-material/DashboardRounded';
import PeopleIcon from '@mui/icons-material/PeopleRounded';
import GroupsIcon from '@mui/icons-material/GroupsRounded';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWalletRounded';
import BrandMark from './BrandMark';
import ColorModeIconDropdown from '../theme/ColorModeIconDropdown';
import OptionsMenu from './OptionsMenu';

const DRAWER_WIDTH = 260;

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/registrations/individual': 'Individual registrations',
  '/registrations/team': 'Team registrations',
  '/withdrawals': 'Cash withdrawals',
  '/profile': 'Profile',
};

export default function Layout() {
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] || 'Dashboard';

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          boxSizing: 'border-box',
          [`& .${drawerClasses.paper}`]: {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        <Stack sx={{ height: '100%' }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', px: 2.5, py: 2.25 }}>
            <BrandMark />
            <Stack sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                Kopala ICR 2026
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                Admin dashboard
              </Typography>
            </Stack>
          </Stack>
          <Divider />

          <Stack sx={{ flexGrow: 1, px: 1.5, py: 1.5, overflowY: 'auto' }}>
            <List dense>
              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton component={NavLink} to="/" end selected={location.pathname === '/'}>
                  <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  component={NavLink}
                  to="/registrations/individual"
                  selected={location.pathname === '/registrations/individual'}
                >
                  <ListItemIcon><PeopleIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Individual" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  component={NavLink}
                  to="/registrations/team"
                  selected={location.pathname === '/registrations/team'}
                >
                  <ListItemIcon><GroupsIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Team (Relay)" />
                </ListItemButton>
              </ListItem>

              <ListItem disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                  component={NavLink}
                  to="/withdrawals"
                  selected={location.pathname === '/withdrawals'}
                >
                  <ListItemIcon><AccountBalanceWalletIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Cash withdrawals" />
                </ListItemButton>
              </ListItem>
            </List>
          </Stack>

          <Divider />
          <Stack sx={{ p: 1.5 }}>
            <OptionsMenu />
          </Stack>
        </Stack>
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, backgroundColor: 'background.default', minHeight: '100vh', overflow: 'auto' }}
      >
        <Stack spacing={2} sx={{ mx: 3, pb: 5, pt: 2 }}>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between', pt: 1.5 }}
          >
            <Breadcrumbs separator={<ChevronRightRoundedIcon fontSize="small" />}>
              <Typography variant="body1" color="text.secondary">Kopala ICR</Typography>
              <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {pageTitle}
              </Typography>
            </Breadcrumbs>
            <ColorModeIconDropdown />
          </Stack>
          <Outlet />
        </Stack>
      </Box>
    </Box>
  );
}
