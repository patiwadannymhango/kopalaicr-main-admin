import { useState } from 'react';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import { bulkUploadIndividual, downloadIndividualBulkTemplate } from '../api/individual';
import { triggerDownload } from '../api/client';
import type { BulkUploadReport } from '../types';

interface BulkUploadWizardProps {
  open: boolean;
  onClose: () => void;
  onUploaded: () => void;
}

export default function BulkUploadWizard({ open, onClose, onUploaded }: BulkUploadWizardProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<BulkUploadReport | null>(null);

  function reset() {
    setUploading(false);
    setError('');
    setReport(null);
  }

  function handleClose() {
    if (uploading) return;
    reset();
    onClose();
  }

  async function handleDownloadTemplate() {
    const blob = await downloadIndividualBulkTemplate();
    triggerDownload(blob, 'individual-bulk-upload-template.xlsx');
  }

  async function handleFileChosen(file: File) {
    setUploading(true);
    setError('');
    try {
      const result = await bulkUploadIndividual(file);
      setReport(result);
      if (result.created_count > 0) onUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Bulk upload individual registrations</DialogTitle>

      {!report ? (
        <>
          <DialogContent>
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Download the template, fill it in (one row per person — <code>full_name</code> and{' '}
                <code>category_code</code> are required), then upload it here. Rows default to{' '}
                <code>CONFIRMED</code> and record a matching cash payment unless you set a different status.
                One bad row won't stop the rest of the batch — you'll get a report of what failed.
              </Typography>
              <Button startIcon={<DownloadIcon />} variant="outlined" onClick={handleDownloadTemplate} sx={{ alignSelf: 'flex-start' }}>
                Download Excel template
              </Button>
              <Button component="label" variant="contained" disabled={uploading} sx={{ alignSelf: 'flex-start' }}>
                {uploading ? 'Uploading…' : 'Choose file (CSV or XLSX)'}
                <input
                  type="file"
                  hidden
                  accept=".csv,.xlsx"
                  disabled={uploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileChosen(file);
                    e.target.value = '';
                  }}
                />
              </Button>
              {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={uploading}>Close</Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogContent>
            <Stack spacing={2}>
              <Alert severity={report.created_count > 0 ? 'success' : 'warning'}>
                Created {report.created_count} registration{report.created_count === 1 ? '' : 's'}.
              </Alert>
              {report.error_count > 0 && (
                <Alert severity="error">
                  {report.error_count} row{report.error_count === 1 ? '' : 's'} failed:
                  <Box component="ul" sx={{ m: '8px 0 0', pl: 2.25 }}>
                    {report.errors.map((e, i) => <li key={i}>Row {e.row}: {e.error}</li>)}
                  </Box>
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={reset}>Upload another file</Button>
            <Button variant="contained" onClick={handleClose}>Done</Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
