import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        background: 'linear-gradient(90deg, #1a237e 0%, #3949ab 100%)',
        color: 'white',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
      }}
    >
      <Container maxWidth="sm">
        <Typography variant="body1" align="center" sx={{ fontWeight: 500 }}>
          © {new Date().getFullYear()} REU Cafe
        </Typography>
        <Typography variant="body2" color="rgba(255,255,255,0.8)" align="center" sx={{ mt: 1 }}>
          <Link color="inherit" href="/" sx={{ transition: 'all 0.2s ease', '&:hover': { color: '#FF5722' } }}>
            Home
          </Link>{' | '}
          <Link color="inherit" href="/programs" sx={{ transition: 'all 0.2s ease', '&:hover': { color: '#FF5722' } }}>
            Programs
          </Link>{' | '}
          <Link color="inherit" href="/decisions" sx={{ transition: 'all 0.2s ease', '&:hover': { color: '#FF5722' } }}>
            Decisions
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;