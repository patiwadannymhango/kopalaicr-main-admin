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
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import AddIcon from '@mui/icons-material/AddOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import TeamDetailDialog from '../components/TeamDetailDialog';
import ConfirmDialog from '../components/ConfirmDialog';
import { triggerDownload } from '../api/client';
import {
  createTeamRegistration,
  deleteTeamRegistration,
  downloadTeamExport,
  getTeamFilters,
  listTeamRegistrations,
} from '../api/team';
import type { TeamFilterOptions, TeamRegistration } from '../types';
import { STATUS_COLORS, STATUS_OPTIONS } from '../types';
import { GENDER_OPTIONS, PAYMENT_METHOD_OPTIONS, RELAY_CATEGORY_OPTIONS } from '../utils/options';
import { date, money } from '../utils/format';

const PAGE_SIZE = 25;
// Matches settings.TEAM_FREE_RUNNER_LIMIT's default in the backend
// (backend/config/settings/base.py) — not itself exposed by the admin
// filters endpoint, so this is a UI guardrail rather than the source of
// truth; the server still enforces its own configured limit.
const DEFAULT_FREE_RUNNER_LIMIT = 8;

const emptyManualForm = {
  team_name: '', company_or_institution: '', relay_category: 'mixed-team',
  captain_first_name: '', captain_last_name: '', captain_email: '', captain_phone: '',
  status: 'CONFIRMED', payment_method: 'CASH',
};

interface RosterEntry {
  fullName: string;
  gender: string;
}

export default function TeamRegistrations() {
  const [rows, setRows] = useState<TeamRegistration[]>([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [relayCategoryFilter, setRelayCategoryFilter] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [exportBusy, setExportBusy] = useState(false);

  const [filters, setFilters] = useState<TeamFilterOptions | null>(null);

  const [manualOpen, setManualOpen] = useState(false);
  const [manualBusy, setManualBusy] = useState(false);
  const [manualForm, setManualForm] = useState(emptyManualForm);
  const [roster, setRoster] = useState<RosterEntry[]>([]);

  const [deleteTarget, setDeleteTarget] = useState<TeamRegistration | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [detailTarget, setDetailTarget] = useState<TeamRegistration | null>(null);

  useEffect(() => {
    getTeamFilters().then(setFilters).catch(() => {});
  }, []);

  function load(targetPage = page) {
    setLoading(true);
    setError('');
    listTeamRegistrations({
      search,
      status: statusFilter,
      category: categoryFilter,
      relay_category: relayCategoryFilter,
      ordering: '-registered_at',
      page: targetPage + 1,
    })
      .then((data) => {
        setRows(data.results);
        setCount(data.count);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page, statusFilter, categoryFilter, relayCategoryFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  function runSearch() {
    setPage(0);
    load(0);
  }

  function openDeleteDialog(row: TeamRegistration) {
    setDeleteTarget(row);
    setDeleteError('');
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    setDeleteError('');
    try {
      await deleteTeamRegistration(deleteTarget.id);
      setDeleteTarget(null);
      setNotice('Team deleted.');
      load();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete.');
    } finally {
      setDeleteBusy(false);
    }
  }

  async function handleExport() {
    setExportBusy(true);
    setError('');
    try {
      const blob = await downloadTeamExport();
      triggerDownload(blob, 'kopala-icr-team-registrations.xlsx');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setExportBusy(false);
    }
  }

  function openManualDialog() {
    setManualForm(emptyManualForm);
    setRoster([]);
    setManualOpen(true);
  }

  function addRosterRow() {
    setRoster((prev) => [...prev, { fullName: '', gender: '' }]);
  }

  function updateRosterRow(index: number, patch: Partial<RosterEntry>) {
    setRoster((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function removeRosterRow(index: number) {
    setRoster((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleManualCreate() {
    setManualBusy(true);
    setError('');
    try {
      await createTeamRegistration({
        ...manualForm,
        roster: roster.filter((r) => r.fullName.trim()).map((r) => ({ fullName: r.fullName, gender: r.gender })),
      });
      setNotice('Team registered.');
      setManualOpen(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register team.');
    } finally {
      setManualBusy(false);
    }
  }

  const columns: GridColDef<TeamRegistration>[] = [
    { field: 'registration_number', headerName: 'Reference', width: 130, valueFormatter: (v) => v || 'Unconfirmed' },
    { field: 'team_name', headerName: 'Team name', flex: 1, minWidth: 160 },
    { field: 'company_or_institution', headerName: 'Company / institution', flex: 1, minWidth: 180 },
    { field: 'relay_category', headerName: 'Division', width: 130 },
    {
      field: 'captain', headerName: 'Captain', flex: 1, minWidth: 160,
      valueGetter: (_value, row) => `${row.captain_first_name} ${row.captain_last_name}`,
    },
    { field: 'captain_phone', headerName: 'Captain phone', width: 140 },
    {
      field: 'roster', headerName: 'Roster', width: 90,
      valueGetter: (_value, row) => `${row.roster.length}/${row.free_runner_limit}`,
    },
    { field: 'amount', headerName: 'Amount', width: 110, valueFormatter: (v, row) => money(v as string, row.currency) },
    {
      field: 'status', headerName: 'Status', width: 170,
      renderCell: (params) => <Chip label={params.value} size="small" color={STATUS_COLORS[params.value] ?? 'default'} />,
    },
    {
      field: 'registered_at', headerName: 'Registered', width: 120,
      valueFormatter: (v) => date(v as string),
    },
    {
      field: 'actions', headerName: '', width: 60, sortable: false, filterable: false,
      renderCell: (params) => (
        <Button
          size="small"
          color="error"
          onClick={(e) => { e.stopPropagation(); openDeleteDialog(params.row); }}
          sx={{ minWidth: 0 }}
        >
          <DeleteIcon fontSize="small" />
        </Button>
      ),
    },
  ];

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={800}>Team (Relay) registrations</Typography>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<AddIcon />} variant="outlined" onClick={openManualDialog}>
            Add team
          </Button>
          <Button startIcon={<DownloadIcon />} variant="contained" onClick={handleExport} disabled={exportBusy}>
            {exportBusy ? 'Exporting…' : 'Export'}
          </Button>
        </Stack>
      </Stack>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}

      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
        <TextField
          size="small"
          placeholder="Search team, company, captain, reference…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runSearch()}
          sx={{ flex: 1, minWidth: 220 }}
        />
        <Select
          size="small" displayEmpty sx={{ minWidth: 170 }}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
        >
          <MenuItem value="">All statuses</MenuItem>
          {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </Select>
        <Select
          size="small" displayEmpty sx={{ minWidth: 170 }}
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(0); }}
        >
          <MenuItem value="">All categories</MenuItem>
          {(filters?.categories ?? []).map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
        </Select>
        <Select
          size="small" displayEmpty sx={{ minWidth: 170 }}
          value={relayCategoryFilter}
          onChange={(e) => { setRelayCategoryFilter(e.target.value); setPage(0); }}
        >
          <MenuItem value="">All divisions</MenuItem>
          {(filters?.relay_categories ?? []).map((r) => (
            <MenuItem key={r} value={r}>{RELAY_CATEGORY_OPTIONS.find((o) => o.value === r)?.label ?? r}</MenuItem>
          ))}
        </Select>
        <Button variant="contained" onClick={runSearch}>Search</Button>
      </Stack>

      <Box sx={{ height: 720 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          paginationMode="server"
          rowCount={count}
          paginationModel={{ page, pageSize: PAGE_SIZE }}
          onPaginationModelChange={(m) => setPage(m.page)}
          pageSizeOptions={[PAGE_SIZE]}
          disableRowSelectionOnClick
          density="compact"
          onRowClick={(params: GridRowParams<TeamRegistration>) => setDetailTarget(params.row)}
        />
      </Box>

      <Dialog open={manualOpen} onClose={() => setManualOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Register a team</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 0.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>Team</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Team name" value={manualForm.team_name} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, team_name: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Company / institution" value={manualForm.company_or_institution} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, company_or_institution: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select label="Division" value={manualForm.relay_category} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, relay_category: e.target.value })}
                >
                  {RELAY_CATEGORY_OPTIONS.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select label="Status" value={manualForm.status} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, status: e.target.value })}
                >
                  {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Grid>
              {manualForm.status === 'CONFIRMED' && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    select label="Payment method" value={manualForm.payment_method} fullWidth size="small"
                    helperText="Recorded as the payment behind this confirmed team entry."
                    onChange={(e) => setManualForm({ ...manualForm, payment_method: e.target.value })}
                  >
                    {PAYMENT_METHOD_OPTIONS.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                  </TextField>
                </Grid>
              )}
            </Grid>

            <Typography variant="subtitle2" fontWeight={700}>Captain</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="First name" value={manualForm.captain_first_name} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, captain_first_name: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Last name" value={manualForm.captain_last_name} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, captain_last_name: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Email" value={manualForm.captain_email} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, captain_email: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Phone" value={manualForm.captain_phone} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, captain_phone: e.target.value })} />
              </Grid>
            </Grid>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" fontWeight={700}>
                Roster ({roster.length}/{DEFAULT_FREE_RUNNER_LIMIT})
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={addRosterRow}
                disabled={roster.length >= DEFAULT_FREE_RUNNER_LIMIT}
              >
                Add runner
              </Button>
            </Stack>
            <Stack spacing={1}>
              {roster.map((entry, index) => (
                <Stack key={index} direction="row" spacing={1} alignItems="center">
                  <TextField
                    label="Runner name" value={entry.fullName} size="small" fullWidth
                    onChange={(e) => updateRosterRow(index, { fullName: e.target.value })}
                  />
                  <TextField
                    select label="Gender" value={entry.gender} size="small" sx={{ minWidth: 140 }}
                    onChange={(e) => updateRosterRow(index, { gender: e.target.value })}
                  >
                    <MenuItem value="">—</MenuItem>
                    {GENDER_OPTIONS.map((g) => <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>)}
                  </TextField>
                  <IconButton size="small" onClick={() => removeRosterRow(index)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
              {roster.length === 0 && (
                <Typography variant="body2" color="text.secondary">No runners added yet.</Typography>
              )}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleManualCreate}
            disabled={
              manualBusy ||
              !manualForm.team_name ||
              !manualForm.company_or_institution ||
              !manualForm.captain_first_name ||
              !manualForm.captain_last_name ||
              !manualForm.captain_email ||
              !manualForm.captain_phone
            }
          >
            {manualBusy ? 'Saving…' : 'Register team'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete team?"
        message={
          <>
            Are you sure you want to delete{' '}
            <strong>{deleteTarget?.registration_number || deleteTarget?.team_name}</strong>? This cannot be undone.
          </>
        }
        busy={deleteBusy}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onClose={() => { if (!deleteBusy) { setDeleteTarget(null); setDeleteError(''); } }}
      />

      <TeamDetailDialog
        team={detailTarget}
        onClose={() => setDetailTarget(null)}
        onSaved={() => {
          setNotice('Team updated.');
          load();
        }}
      />
    </Stack>
  );
}
