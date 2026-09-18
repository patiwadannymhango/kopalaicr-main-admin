import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { updateTeamRegistration } from '../api/team';
import type { TeamRegistration } from '../types';
import { STATUS_OPTIONS } from '../types';
import { RELAY_CATEGORY_OPTIONS } from '../utils/options';
import { dateTime, money } from '../utils/format';

interface EditableFields {
  team_name: string;
  company_or_institution: string;
  relay_category: string;
  captain_first_name: string;
  captain_last_name: string;
  captain_phone: string;
}

function fieldsFromTeam(team: TeamRegistration): EditableFields {
  return {
    team_name: team.team_name,
    company_or_institution: team.company_or_institution,
    relay_category: team.relay_category,
    captain_first_name: team.captain_first_name,
    captain_last_name: team.captain_last_name,
    captain_phone: team.captain_phone,
  };
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="body2" fontWeight={600}>{value || '—'}</Typography>
    </Box>
  );
}

interface TeamDetailDialogProps {
  team: TeamRegistration | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function TeamDetailDialog({ team, onClose, onSaved }: TeamDetailDialogProps) {
  const [status, setStatus] = useState('');
  const [fields, setFields] = useState<EditableFields | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (team) {
      setStatus(team.status);
      setFields(fieldsFromTeam(team));
      setError('');
    }
  }, [team]);

  if (!team || !fields) return null;

  function updateField<K extends keyof EditableFields>(key: K, value: EditableFields[K]) {
    setFields((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  const original = fieldsFromTeam(team);
  const hasChanges = status !== team.status || JSON.stringify(fields) !== JSON.stringify(original);

  async function handleSave() {
    if (!team || !fields) return;
    setBusy(true);
    setError('');
    try {
      await updateTeamRegistration(team.id, { ...fields, status });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={!!team} onClose={busy ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>Team — {team.registration_number || 'Unconfirmed'}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 0.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}><ReadOnlyField label="Category" value={team.category_name} /></Grid>
            <Grid item xs={6} sm={3}>
              <ReadOnlyField label="Amount" value={money(team.amount, team.currency)} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <ReadOnlyField label="Registered" value={dateTime(team.registered_at)} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <ReadOnlyField label="Roster limit" value={`${team.roster.length} / ${team.free_runner_limit}`} />
            </Grid>
          </Grid>

          <Divider />

          <Box>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>Status</Typography>
            <Select size="small" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 220 }}>
              {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </Box>

          <Divider />

          <Typography variant="subtitle2" fontWeight={700}>Team</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Team name" fullWidth size="small" value={fields.team_name}
                onChange={(e) => updateField('team_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Company / institution" fullWidth size="small" value={fields.company_or_institution}
                onChange={(e) => updateField('company_or_institution', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select label="Relay category" fullWidth size="small" value={fields.relay_category}
                onChange={(e) => updateField('relay_category', e.target.value)}
              >
                {RELAY_CATEGORY_OPTIONS.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>

          <Divider />

          <Typography variant="subtitle2" fontWeight={700}>Captain</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First name" fullWidth size="small" value={fields.captain_first_name}
                onChange={(e) => updateField('captain_first_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last name" fullWidth size="small" value={fields.captain_last_name}
                onChange={(e) => updateField('captain_last_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email" fullWidth size="small" value={team.captain_email} disabled
                helperText="Email can't be changed after registration." />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone" fullWidth size="small" value={fields.captain_phone}
                onChange={(e) => updateField('captain_phone', e.target.value)}
              />
            </Grid>
          </Grid>

          <Divider />

          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Roster ({team.roster.length})
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
              Roster changes go through Django admin, not this dashboard.
            </Typography>
            {team.roster.length > 0 ? (
              <Stack spacing={0.5}>
                {team.roster.map((runner) => (
                  <Typography key={runner.id} variant="body2">
                    {runner.full_name}{runner.gender ? ` (${runner.gender})` : ''}
                  </Typography>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">No roster submitted.</Typography>
            )}
          </Box>

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Close</Button>
        <Button variant="contained" onClick={handleSave} disabled={busy || !hasChanges}>
          {busy ? 'Saving…' : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
