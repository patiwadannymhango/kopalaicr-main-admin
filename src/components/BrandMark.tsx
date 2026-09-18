import Box from '@mui/material/Box';

export default function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        fontWeight: 800,
        fontSize: size * 0.4,
      }}
    >
      KI
    </Box>
  );
}
