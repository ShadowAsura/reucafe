import React from 'react';
import { Box, Container, Typography, IconButton, Link } from '@mui/material';
import { GitHub, Favorite } from '@mui/icons-material';

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" align="center">
            Made with <Favorite sx={{ color: 'error.main', fontSize: 16, mx: 0.5 }} /> by{' '}
            <Link
              href="https://github.com/ShadowAsura"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textDecoration: 'none' }}
            >
              ShadowAsura
            </Link>
          </Typography>
          <Box sx={{ mt: 1 }}>
            <IconButton
              href="https://github.com/ShadowAsura/reucafe"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  transform: 'scale(1.1)',
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            >
              <GitHub />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            © {new Date().getFullYear()} REUCafe. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;