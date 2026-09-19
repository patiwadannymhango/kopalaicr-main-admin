import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/AddOutlined';
import { createAdminUser, listAdminUsers, updateAdminUser } from '../api/adminUsers';
import type { AdminUser } from '../types';
import { useAuth } from '../context/AuthContext';

const emptyForm = {
  email: '',
  first_name: '',
  last_name: '',
  phone: '',
  password: '',
  is_superuser: false,
};

export default function AdminUsers() {
  const { user: me } = useAuth();

  const [rows, setRows] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function load() {
    setLoading(true);
    setError('');
    listAdminUsers(search)
      .then(setRows)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate() {
    setCreateBusy(true);
    setError('');
    try {
      await createAdminUser(form);
      setNotice('User created.');
      setCreateOpen(false);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user.');
    } finally {
      setCreateBusy(false);
    }
  }

  async function handleToggleActive(user: AdminUser) {
    try {
      await updateAdminUser(user.id, { is_active: !user.is_active });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user.');
    }
  }

  async function handleToggleSuperuser(user: AdminUser) {
    try {
      await updateAdminUser(user.id, { is_superuser: !user.is_superuser });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user.');
    }
  }

  const columns: GridColDef<AdminUser>[] = [
    { field: 'full_name', headerName: 'Name', flex: 1, minWidth: 160 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'phone', headerName: 'Phone', width: 140, valueFormatter: (v) => v || '—' },
    {
      field: 'is_superuser',
      headerName: 'Superuser',
      width: 120,
      renderCell: (params) => (
        <Switch
          size="small"
          checked={params.row.is_superuser}
          disabled={params.row.id === me?.id}
          onChange={() => handleToggleSuperuser(params.row)}
        />
      ),
    },
    {
      field: 'is_active',
      headerName: 'Active',
      width: 100,
      renderCell: (params) =>
        params.row.id === me?.id ? (
          <Chip size="small" label="You" />
        ) : (
          <Switch size="small" checked={params.row.is_active} onChange={() => handleToggleActive(params.row)} />
        ),
    },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={800}>Admin users</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => setCreateOpen(true)}>
          New user
        </Button>
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Staff accounts that can sign into this dashboard. Only superusers can manage other admin accounts.
      </Typography>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}

      <Stack direction="row" spacing={2}>
        <TextField
          size="small"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
          sx={{ flex: 1, maxWidth: 360 }}
        />
        <Button variant="outlined" onClick={load}>Search</Button>
      </Stack>

      <Box sx={{ height: 560 }}>
        <DataGrid rows={rows} columns={columns} loading={loading} density="compact" disableRowSelectionOnClick />
      </Box>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>New user</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth />
            <TextField label="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} fullWidth />
            <TextField label="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} fullWidth />
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} fullWidth />
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              helperText="At least 8 characters. Share this with them directly — there's no invite email yet."
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.is_superuser}
                  onChange={(e) => setForm({ ...form, is_superuser: e.target.checked })}
                />
              }
              label="Superuser (can manage other admin accounts)"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={createBusy || !form.email || !form.first_name || !form.last_name || form.password.length < 8}
          >
            {createBusy ? 'Creating…' : 'Create user'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
