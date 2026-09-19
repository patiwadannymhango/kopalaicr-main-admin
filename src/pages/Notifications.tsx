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
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { DataGrid, type GridColDef } from '@mui/x-data-grid';
import ReplayIcon from '@mui/icons-material/ReplayOutlined';
import { listNotifications, resendNotification } from '../api/notifications';
import type { NotificationRecord } from '../types';
import { dateTime } from '../utils/format';

const PAGE_SIZE = 25;

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'error'> = {
  SENT: 'success',
  PENDING: 'warning',
  FAILED: 'error',
};

export default function Notifications() {
  const [rows, setRows] = useState<NotificationRecord[]>([]);
  const [count, setCount] = useState(0);
  const [status, setStatus] = useState('');
  const [channel, setChannel] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [resendTarget, setResendTarget] = useState<NotificationRecord | null>(null);
  const [resendEmail, setResendEmail] = useState('');
  const [resendBusy, setResendBusy] = useState(false);
  const [resendError, setResendError] = useState('');

  // Takes the page to fetch explicitly rather than always reading the
  // `page` state — setPage(0) from a filter change doesn't take effect
  // until the next render, so a caller that just reset the page and
  // wants to load immediately needs to say so.
  function load(targetPage = page) {
    setLoading(true);
    setError('');
    listNotifications({ status, channel, search, page: targetPage + 1 })
      .then((data) => {
        setRows(data.results);
        setCount(data.count);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load.'))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page, status, channel]); // eslint-disable-line react-hooks/exhaustive-deps

  function runSearch() {
    setPage(0);
    load(0);
  }

  function openResendDialog(row: NotificationRecord) {
    setResendTarget(row);
    setResendEmail(row.recipient);
    setResendError('');
  }

  function closeResendDialog() {
    if (resendBusy) return;
    setResendTarget(null);
    setResendError('');
  }

  async function handleResend() {
    if (!resendTarget) return;
    setResendBusy(true);
    setResendError('');
    try {
      await resendNotification(resendTarget.id, resendEmail.trim());
      setNotice(`Email resent to ${resendEmail.trim()}.`);
      setResendTarget(null);
      load();
    } catch (err) {
      setResendError(err instanceof Error ? err.message : 'Failed to resend email.');
    } finally {
      setResendBusy(false);
    }
  }

  const columns: GridColDef<NotificationRecord>[] = [
    {
      field: 'channel',
      headerName: 'Channel',
      width: 90,
      renderCell: (params) => <Chip size="small" variant="outlined" label={params.value} />,
    },
    { field: 'notification_type', headerName: 'Type', width: 190 },
    { field: 'recipient', headerName: 'Recipient', flex: 1, minWidth: 200 },
    { field: 'subject', headerName: 'Subject', flex: 1, minWidth: 200 },
    { field: 'registration_number', headerName: 'Registration', width: 140, valueFormatter: (v) => v || '—' },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      renderCell: (params) => (
        <Chip size="small" label={params.value} color={STATUS_COLOR[params.value] || 'default'} />
      ),
    },
    {
      field: 'created_at',
      headerName: 'When',
      width: 170,
      valueFormatter: (v) => dateTime(v as string),
    },
    {
      field: 'actions',
      headerName: '',
      width: 110,
      sortable: false,
      filterable: false,
      renderCell: (params) =>
        params.row.channel === 'EMAIL' ? (
          <Button
            size="small"
            startIcon={<ReplayIcon fontSize="small" />}
            onClick={(e) => {
              e.stopPropagation();
              openResendDialog(params.row);
            }}
          >
            Resend
          </Button>
        ) : null,
    },
  ];

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>Notifications</Typography>
      <Typography variant="body2" color="text.secondary">
        Delivery log for every confirmation email and SMS this event has attempted to send.
      </Typography>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
      {notice && <Alert severity="success" onClose={() => setNotice('')}>{notice}</Alert>}

      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
        <TextField
          size="small"
          placeholder="Search recipient, subject, reference…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && runSearch()}
          sx={{ flex: 1, minWidth: 220 }}
        />
        <Select
          size="small"
          value={channel}
          onChange={(e) => { setChannel(e.target.value); setPage(0); }}
          displayEmpty
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All channels</MenuItem>
          <MenuItem value="EMAIL">Email</MenuItem>
          <MenuItem value="SMS">SMS</MenuItem>
        </Select>
        <Select
          size="small"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(0); }}
          displayEmpty
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          <MenuItem value="SENT">Sent</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="FAILED">Failed</MenuItem>
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
          density="compact"
          disableRowSelectionOnClick
        />
      </Box>

      <Dialog open={!!resendTarget} onClose={closeResendDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Resend email</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              {resendTarget?.subject}
              {resendTarget?.registration_number && ` — ${resendTarget.registration_number}`}
            </Typography>
            <TextField
              label="Send to"
              type="email"
              fullWidth
              size="small"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              helperText="Defaults to the original recipient — edit it to send to a different address."
            />
            {resendError && <Alert severity="error">{resendError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeResendDialog} disabled={resendBusy}>Cancel</Button>
          <Button variant="contained" onClick={handleResend} disabled={resendBusy || !resendEmail.trim()}>
            {resendBusy ? 'Sending…' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
