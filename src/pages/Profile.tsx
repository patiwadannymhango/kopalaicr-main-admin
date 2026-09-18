import { Alert, Avatar, Box, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return <Alert severity="info">Loading profile…</Alert>;

  const initials = `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() || user.email[0].toUpperCase();

  return (
    <Stack spacing={3} maxWidth={560}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 20 }}>{initials}</Avatar>
        <Box>
          <Typography variant="h5" fontWeight={800}>{user.full_name || user.email}</Typography>
          <Typography variant="body2" color="text.secondary">{user.email}</Typography>
        </Box>
      </Stack>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>Account details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" display="block">First name</Typography>
              <Typography variant="body2" fontWeight={600}>{user.first_name || '—'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" display="block">Last name</Typography>
              <Typography variant="body2" fontWeight={600}>{user.last_name || '—'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" display="block">Email</Typography>
              <Typography variant="body2" fontWeight={600}>{user.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary" display="block">Phone</Typography>
              <Typography variant="body2" fontWeight={600}>{user.phone || '—'}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>Access</Typography>
              <Stack direction="row" spacing={1}>
                {user.is_superuser && <Chip label="Superuser" size="small" color="primary" />}
                {user.is_staff && <Chip label="Staff" size="small" variant="outlined" />}
              </Stack>
            </Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
            Profile and password changes go through Django admin (/django-admin/), not this dashboard.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}
