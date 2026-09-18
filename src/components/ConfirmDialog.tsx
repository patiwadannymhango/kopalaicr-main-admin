import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmberOutlined';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: React.ReactNode;
  busy: boolean;
  error: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmLabel?: string;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  busy,
  error,
  onConfirm,
  onClose,
  confirmLabel = 'Delete',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box
          sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: '50%',
            bgcolor: 'error.main', color: 'error.contrastText', opacity: 0.9,
          }}
        >
          <WarningAmberIcon fontSize="small" />
        </Box>
        {title}
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">{message}</Typography>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="contained" color="error" onClick={onConfirm} disabled={busy}>
          {busy ? 'Working…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
