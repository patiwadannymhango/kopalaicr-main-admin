import { useEffect, useState } from 'react';
import { Alert, Card, CardContent, Grid, Stack, Tab, Tabs, Typography } from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { getIndividualDashboard } from '../api/individual';
import { getTeamDashboard } from '../api/team';
import type { DashboardStats } from '../types';
import { money } from '../utils/format';

function StatCard({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Card variant="outlined" sx={{ borderColor: highlight ? 'primary.main' : undefined }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">{label}</Typography>
        <Typography variant="h5" fontWeight={800} color={highlight ? 'primary.main' : 'text.primary'}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function EntryTypeDashboard({ stats }: { stats: DashboardStats }) {
  const statusCount = (status: string) => stats.by_status.find((s) => s.status === status)?.count ?? 0;

  const pending =
    statusCount('PENDING_PAYMENT') + statusCount('PAYMENT_PROCESSING');

  const pieData = stats.by_status
    .filter((s) => s.count > 0)
    .map((s, i) => ({ id: i, value: s.count, label: s.status }));

  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard label="Total registrations" value={String(stats.total_registrations)} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard label="Registered today" value={String(stats.today_count)} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard label="Confirmed" value={String(statusCount('CONFIRMED'))} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard label="Pending / processing" value={String(pending)} />
        </Grid>
        {/* <Grid item xs={12} sm={6} md={4}>
          <StatCard label="Revenue collected" value={money(stats.revenue_confirmed)} highlight />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard label="Revenue today" value={money(stats.revenue_today)} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard label="Revenue pending" value={money(stats.revenue_pending)} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard label="Total potential income" value={money(stats.total_income)} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard label="Cash available" value={money(stats.cash_available)} />
        </Grid> */}
      </Grid>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>Registrations by status</Typography>
          {pieData.length > 0 ? (
            <PieChart
              series={[{ data: pieData, innerRadius: 40, paddingAngle: 2 }]}
              height={260}
              slotProps={{ legend: { direction: 'column' } }}
            />
          ) : (
            <Typography color="text.secondary" variant="body2">No registrations yet.</Typography>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState<'individual' | 'team'>('individual');
  const [individualStats, setIndividualStats] = useState<DashboardStats | null>(null);
  const [teamStats, setTeamStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getIndividualDashboard(), getTeamDashboard()])
      .then(([individual, team]) => {
        setIndividualStats(individual);
        setTeamStats(team);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard.'));
  }, []);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!individualStats || !teamStats) {
    return <Typography color="text.secondary">Loading dashboard…</Typography>;
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h5" fontWeight={800}>Dashboard</Typography>

      <Tabs value={tab} onChange={(_e, v) => setTab(v)}>
        <Tab label="Individual" value="individual" />
        <Tab label="Team (Relay)" value="team" />
      </Tabs>

      {tab === 'individual' ? (
        <EntryTypeDashboard stats={individualStats} />
      ) : (
        <EntryTypeDashboard stats={teamStats} />
      )}
    </Stack>
  );
}
