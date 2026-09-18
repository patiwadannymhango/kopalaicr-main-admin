import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/AddOutlined';
import { getIndividualDashboard } from '../api/individual';
import { getTeamDashboard } from '../api/team';
import { createWithdrawal, listWithdrawals } from '../api/withdrawals';
import type { DashboardStats, Withdrawal } from '../types';
import { dateTime, money } from '../utils/format';

type EntryType = 'INDIVIDUAL' | 'TEAM';

const columns: GridColDef<Withdrawal>[] = [
  { field: 'amount', headerName: 'Amount', width: 130, valueFormatter: (v, row) => money(v as string, row.currency) },
  { field: 'narration', headerName: 'Narration', flex: 1, minWidth: 200 },
  { field: 'withdrawn_by_name', headerName: 'Withdrawn by', width: 180, valueFormatter: (v) => v || '—' },
  { field: 'withdrawn_at', headerName: 'Withdrawn at', width: 190, valueFormatter: (v) => dateTime(v as string) },
];

export default function Withdrawals() {
  const [entryType, setEntryType] = useState<EntryType>('INDIVIDUAL');
  const [rows, setRows] = useState<Withdrawal[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState('');

  function load() {
    setLoading(true);
    setError('');
    Promise.all([
      listWithdrawals(entryType),
      entryType === 'INDIVIDUAL' ? getIndividualDashboard() : getTeamDashboard(),
    ])
      .then(([withdrawals, dashboardStats]) => {
        setRows(withdrawals.results);
        setStats(dashboardStats);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [entryType]); // eslint-disable-line react-hooks/exhaustive-deps

  function openForm() {
    setAmount('');
    setNarration('');
    setFormError('');
    setFormOpen(true);
  }

  async function handleSubmit() {
    setBusy(true);
    setFormError('');
    try {
      await createWithdrawal({ entry_type: entryType, amount, narration });
      setFormOpen(false);
      setNotice('Withdrawal recorded.');
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to record withdrawal.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" fontWeight={800}>Cash withdrawals</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={openForm}>Record withdrawal</Button>
      </Stack>

      <Tabs value={entryType} onChange={(_e, v) => setEntryType(v)}>
        <Tab label="Individual" value="INDIVIDUAL" />
        <Tab label="Team (Relay)" value="TEAM" />
      </Tabs>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}

      {stats && (
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Card variant="outlined" sx={{ minWidth: 200 }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Revenue collected</Typography>
              <Typography variant="h6" fontWeight={800}>{money(stats.revenue_confirmed)}</Typography>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ minWidth: 200 }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Cash withdrawn</Typography>
              <Typography variant="h6" fontWeight={800}>{money(stats.cash_withdrawn)}</Typography>
            </CardContent>
          </Card>
          <Card variant="outlined" sx={{ minWidth: 200, borderColor: 'primary.main' }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Cash available</Typography>
              <Typography variant="h6" fontWeight={800} color="primary.main">{money(stats.cash_available)}</Typography>
            </CardContent>
          </Card>
        </Stack>
      )}

      <Box sx={{ height: 520 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          hideFooter
          disableRowSelectionOnClick
          density="compact"
        />
      </Box>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Record a {entryType === 'INDIVIDUAL' ? 'individual' : 'team'} cash withdrawal</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            {stats && (
              <Typography variant="body2" color="text.secondary">
                Cash available: <strong>{money(stats.cash_available)}</strong>
              </Typography>
            )}
            <TextField
              label="Amount" type="number" value={amount} fullWidth
              onChange={(e) => setAmount(e.target.value)}
            />
            <TextField
              label="Narration" value={narration} fullWidth multiline minRows={2}
              placeholder="What the cash was withdrawn for"
              onChange={(e) => setNarration(e.target.value)}
            />
            {formError && <Alert severity="error">{formError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)} disabled={busy}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={busy || !amount}>
            {busy ? 'Saving…' : 'Record'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
