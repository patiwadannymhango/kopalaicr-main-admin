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
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRowParams } from '@mui/x-data-grid';
import UploadFileIcon from '@mui/icons-material/UploadFileOutlined';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import AddIcon from '@mui/icons-material/AddOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import IndividualDetailDialog from '../components/IndividualDetailDialog';
import BulkUploadWizard from '../components/BulkUploadWizard';
import ConfirmDialog from '../components/ConfirmDialog';
import { triggerDownload } from '../api/client';
import {
  createIndividualRegistration,
  deleteIndividualRegistration,
  downloadIndividualExport,
  getIndividualFilters,
  listIndividualRegistrations,
} from '../api/individual';
import type { IndividualFilterOptions, IndividualRegistration } from '../types';
import { STATUS_COLORS, STATUS_OPTIONS } from '../types';
import { AGE_RANGE_OPTIONS, DIVISION_OPTIONS, GENDER_OPTIONS, PAYMENT_METHOD_OPTIONS, TSHIRT_SIZE_OPTIONS } from '../utils/options';
import { date, money } from '../utils/format';

const PAGE_SIZE = 25;

const emptyManualForm = {
  category_id: '', full_name: '', email: '', phone: '',
  gender: '', age_range: '', country: '', t_shirt_size: '', division: '',
  town_or_city: '', club_or_institution: '', emergency_contact_name: '',
  emergency_contact_phone: '', medical_notes: '',
  status: 'CONFIRMED', payment_method: 'CASH',
};

export default function IndividualRegistrations() {
  const [rows, setRows] = useState<IndividualRegistration[]>([]);
  const [count, setCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [organisationFilter, setOrganisationFilter] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [exportBusy, setExportBusy] = useState(false);

  const [filters, setFilters] = useState<IndividualFilterOptions | null>(null);

  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

  const [manualOpen, setManualOpen] = useState(false);
  const [manualBusy, setManualBusy] = useState(false);
  const [manualForm, setManualForm] = useState(emptyManualForm);

  const [deleteTarget, setDeleteTarget] = useState<IndividualRegistration | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const [detailTarget, setDetailTarget] = useState<IndividualRegistration | null>(null);

  useEffect(() => {
    getIndividualFilters().then(setFilters).catch(() => {});
  }, []);

  function load(targetPage = page) {
    setLoading(true);
    setError('');
    listIndividualRegistrations({
      search,
      status: statusFilter,
      category: categoryFilter,
      gender: genderFilter,
      organisation: organisationFilter,
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

  useEffect(load, [page, statusFilter, categoryFilter, genderFilter, organisationFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  function runSearch() {
    setPage(0);
    load(0);
  }

  function openDeleteDialog(row: IndividualRegistration) {
    setDeleteTarget(row);
    setDeleteError('');
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    setDeleteError('');
    try {
      await deleteIndividualRegistration(deleteTarget.id);
      setDeleteTarget(null);
      setNotice('Registration deleted.');
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
      const blob = await downloadIndividualExport();
      triggerDownload(blob, 'kopala-icr-individual-registrations.xlsx');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setExportBusy(false);
    }
  }

  async function handleManualCreate() {
    setManualBusy(true);
    setError('');
    try {
      await createIndividualRegistration(manualForm);
      setNotice('Person registered.');
      setManualOpen(false);
      setManualForm(emptyManualForm);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register participant.');
    } finally {
      setManualBusy(false);
    }
  }

  const columns: GridColDef<IndividualRegistration>[] = [
    { field: 'registration_number', headerName: 'Reference', width: 130, valueFormatter: (v) => v || 'Unconfirmed' },
    {
      field: 'name', headerName: 'Name', flex: 1, minWidth: 160,
      valueGetter: (_value, row) => row.participant.full_name,
    },
    {
      field: 'email', headerName: 'Email', flex: 1, minWidth: 190,
      valueGetter: (_value, row) => row.participant.email,
    },
    {
      field: 'phone', headerName: 'Phone', width: 130,
      valueGetter: (_value, row) => row.participant.phone,
    },
    { field: 'category_name', headerName: 'Category', width: 170 },
    { field: 'division', headerName: 'Division', width: 120 },
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
        <Typography variant="h5" fontWeight={800}>Individual registrations</Typography>
        <Stack direction="row" spacing={1}>
          <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setManualOpen(true)}>
            Add person
          </Button>
          <Button startIcon={<UploadFileIcon />} variant="outlined" onClick={() => setBulkUploadOpen(true)}>
            Bulk upload
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
          placeholder="Search name, email, phone, reference…"
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
          size="small" displayEmpty sx={{ minWidth: 140 }}
          value={genderFilter}
          onChange={(e) => { setGenderFilter(e.target.value); setPage(0); }}
        >
          <MenuItem value="">All genders</MenuItem>
          {(filters?.genders ?? []).map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
        </Select>
        <Select
          size="small" displayEmpty sx={{ minWidth: 170 }}
          value={organisationFilter}
          onChange={(e) => { setOrganisationFilter(e.target.value); setPage(0); }}
        >
          <MenuItem value="">All clubs/institutions</MenuItem>
          {(filters?.organisations ?? []).map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
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
          onRowClick={(params: GridRowParams<IndividualRegistration>) => setDetailTarget(params.row)}
        />
      </Box>

      <BulkUploadWizard
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
        onUploaded={() => {
          setNotice('Bulk upload complete.');
          load();
        }}
      />

      <Dialog open={manualOpen} onClose={() => setManualOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Register a participant</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 0.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>Participant</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="Full name" value={manualForm.full_name} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, full_name: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Email" value={manualForm.email} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Phone" value={manualForm.phone} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select label="Race category" value={manualForm.category_id} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, category_id: e.target.value })}
                >
                  <MenuItem value="">Select a race…</MenuItem>
                  {(filters?.categories ?? []).map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name} — {money(c.price, c.currency)}</MenuItem>
                  ))}
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
                    helperText="Recorded as the payment behind this confirmed registration."
                    onChange={(e) => setManualForm({ ...manualForm, payment_method: e.target.value })}
                  >
                    {PAYMENT_METHOD_OPTIONS.map((p) => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                  </TextField>
                </Grid>
              )}
            </Grid>

            <Typography variant="subtitle2" fontWeight={700}>Additional details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select label="Gender" value={manualForm.gender} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, gender: e.target.value })}
                >
                  <MenuItem value="">—</MenuItem>
                  {GENDER_OPTIONS.map((g) => <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select label="Age range" value={manualForm.age_range} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, age_range: e.target.value })}
                >
                  <MenuItem value="">—</MenuItem>
                  {AGE_RANGE_OPTIONS.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Country" value={manualForm.country} fullWidth size="small" placeholder="Zambia"
                  onChange={(e) => setManualForm({ ...manualForm, country: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select label="T-shirt size" value={manualForm.t_shirt_size} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, t_shirt_size: e.target.value })}
                >
                  <MenuItem value="">—</MenuItem>
                  {TSHIRT_SIZE_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select label="Division" value={manualForm.division} fullWidth size="small"
                  helperText="Only for 5KM/10KM/21KM individual races."
                  onChange={(e) => setManualForm({ ...manualForm, division: e.target.value })}
                >
                  <MenuItem value="">—</MenuItem>
                  {DIVISION_OPTIONS.map((d) => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Town / city" value={manualForm.town_or_city} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, town_or_city: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Club / institution" value={manualForm.club_or_institution} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, club_or_institution: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Emergency contact name" value={manualForm.emergency_contact_name} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, emergency_contact_name: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Emergency contact phone" value={manualForm.emergency_contact_phone} fullWidth size="small"
                  onChange={(e) => setManualForm({ ...manualForm, emergency_contact_phone: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Medical notes" value={manualForm.medical_notes} fullWidth size="small" multiline minRows={2}
                  onChange={(e) => setManualForm({ ...manualForm, medical_notes: e.target.value })} />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleManualCreate}
            disabled={manualBusy || !manualForm.full_name || !manualForm.category_id}
          >
            {manualBusy ? 'Saving…' : 'Register'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete registration?"
        message={
          <>
            Are you sure you want to delete{' '}
            <strong>{deleteTarget?.registration_number || deleteTarget?.participant.full_name}</strong>? This
            cannot be undone.
          </>
        }
        busy={deleteBusy}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        onClose={() => { if (!deleteBusy) { setDeleteTarget(null); setDeleteError(''); } }}
      />

      <IndividualDetailDialog
        registration={detailTarget}
        onClose={() => setDetailTarget(null)}
        onSaved={() => {
          setNotice('Registration updated.');
          load();
        }}
      />
    </Stack>
  );
}
