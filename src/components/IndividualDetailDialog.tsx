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
import { updateIndividualRegistration } from '../api/individual';
import type { IndividualRegistration } from '../types';
import { STATUS_OPTIONS } from '../types';
import { AGE_RANGE_OPTIONS, DIVISION_OPTIONS, GENDER_OPTIONS, TSHIRT_SIZE_OPTIONS } from '../utils/options';
import { dateTime, money } from '../utils/format';

interface EditableFields {
  full_name: string;
  phone: string;
  gender: string;
  age_range: string;
  country: string;
  t_shirt_size: string;
  division: string;
  town_or_city: string;
  club_or_institution: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_notes: string;
}

function fieldsFromRegistration(reg: IndividualRegistration): EditableFields {
  return {
    full_name: reg.participant.full_name,
    phone: reg.participant.phone,
    gender: reg.participant.gender,
    age_range: reg.participant.age_range,
    country: reg.participant.country,
    t_shirt_size: reg.t_shirt_size,
    division: reg.division,
    town_or_city: reg.town_or_city,
    club_or_institution: reg.club_or_institution,
    emergency_contact_name: reg.emergency_contact_name,
    emergency_contact_phone: reg.emergency_contact_phone,
    medical_notes: reg.medical_notes,
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

interface IndividualDetailDialogProps {
  registration: IndividualRegistration | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function IndividualDetailDialog({ registration, onClose, onSaved }: IndividualDetailDialogProps) {
  const [status, setStatus] = useState('');
  const [fields, setFields] = useState<EditableFields | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (registration) {
      setStatus(registration.status);
      setFields(fieldsFromRegistration(registration));
      setError('');
    }
  }, [registration]);

  if (!registration || !fields) return null;

  function updateField<K extends keyof EditableFields>(key: K, value: EditableFields[K]) {
    setFields((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  const original = fieldsFromRegistration(registration);
  const hasChanges = status !== registration.status || JSON.stringify(fields) !== JSON.stringify(original);

  async function handleSave() {
    if (!registration || !fields) return;
    setBusy(true);
    setError('');
    try {
      await updateIndividualRegistration(registration.id, { ...fields, status });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={!!registration} onClose={busy ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>Registration — {registration.registration_number || 'Unconfirmed'}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 0.5 }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}><ReadOnlyField label="Category" value={registration.category_name} /></Grid>
            <Grid item xs={6} sm={3}>
              <ReadOnlyField label="Amount" value={money(registration.amount, registration.currency)} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <ReadOnlyField label="Registered" value={dateTime(registration.registered_at)} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <ReadOnlyField label="Last updated" value={dateTime(registration.updated_at)} />
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

          <Typography variant="subtitle2" fontWeight={700}>Participant</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full name" fullWidth size="small" value={fields.full_name}
                onChange={(e) => updateField('full_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email" fullWidth size="small" value={registration.participant.email} disabled
                helperText="Email can't be changed after registration." />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone" fullWidth size="small" value={fields.phone}
                onChange={(e) => updateField('phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select label="Gender" fullWidth size="small" value={fields.gender}
                onChange={(e) => updateField('gender', e.target.value)}
              >
                <MenuItem value="">—</MenuItem>
                {GENDER_OPTIONS.map((g) => <MenuItem key={g.value} value={g.value}>{g.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select label="Age range" fullWidth size="small" value={fields.age_range}
                onChange={(e) => updateField('age_range', e.target.value)}
              >
                <MenuItem value="">—</MenuItem>
                {AGE_RANGE_OPTIONS.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country" fullWidth size="small" value={fields.country}
                onChange={(e) => updateField('country', e.target.value)}
              />
            </Grid>
          </Grid>

          <Divider />

          <Typography variant="subtitle2" fontWeight={700}>Race details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select label="T-shirt size" fullWidth size="small" value={fields.t_shirt_size}
                onChange={(e) => updateField('t_shirt_size', e.target.value)}
              >
                <MenuItem value="">—</MenuItem>
                {TSHIRT_SIZE_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select label="Division" fullWidth size="small" value={fields.division}
                onChange={(e) => updateField('division', e.target.value)}
              >
                <MenuItem value="">—</MenuItem>
                {DIVISION_OPTIONS.map((d) => <MenuItem key={d.value} value={d.value}>{d.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Town / city" fullWidth size="small" value={fields.town_or_city}
                onChange={(e) => updateField('town_or_city', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Club / institution" fullWidth size="small" value={fields.club_or_institution}
                onChange={(e) => updateField('club_or_institution', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Emergency contact name" fullWidth size="small" value={fields.emergency_contact_name}
                onChange={(e) => updateField('emergency_contact_name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Emergency contact phone" fullWidth size="small" value={fields.emergency_contact_phone}
                onChange={(e) => updateField('emergency_contact_phone', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Medical notes" fullWidth size="small" multiline minRows={2} value={fields.medical_notes}
                onChange={(e) => updateField('medical_notes', e.target.value)}
              />
            </Grid>
          </Grid>

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
