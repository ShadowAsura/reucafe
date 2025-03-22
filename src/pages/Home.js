import React from 'react';
import { Container, Typography, Box, Button, Grid, Card, CardContent } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Search, Star, Forum } from '@mui/icons-material';
import AnimatedBackground from '../components/AnimatedBackground';

function Home() {
  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      <AnimatedBackground />
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            color: 'white',
            py: 8,
          }}
        >
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
              fontWeight: 700,
              mb: 4,
              color: 'white',
              textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
            }}
          >
            REU Cafe
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              mb: 6,
              color: 'white',
              textShadow: '0 0 5px rgba(255, 255, 255, 0.3)',
            }}
          >
            Your Gateway to Research Experience
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 8 }}>
            <Button
              component={RouterLink}
              to="/programs"
              variant="contained"
              size="large"
              sx={{
                background: 'linear-gradient(45deg, #1a237e 30%, #ff3d00 90%)',
                boxShadow: '0 3px 5px 2px rgba(26, 35, 126, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #0d47a1 30%, #dd2c00 90%)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Browse Programs
            </Button>
            <Button
              component={RouterLink}
              to="/register"
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Get Started
            </Button>
          </Box>

          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    transition: 'transform 0.3s ease',
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Search sx={{ fontSize: 40, color: '#ff3d00' }} />
                  </Box>
                  <Typography variant="h5" component="h3" align="center" gutterBottom sx={{ color: 'white' }}>
                    Find Programs
                  </Typography>
                  <Typography variant="body1" align="center" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Discover research opportunities that match your interests and goals
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    transition: 'transform 0.3s ease',
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Star sx={{ fontSize: 40, color: '#ff3d00' }} />
                  </Box>
                  <Typography variant="h5" component="h3" align="center" gutterBottom sx={{ color: 'white' }}>
                    Track Applications
                  </Typography>
                  <Typography variant="body1" align="center" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Keep track of your applications and deadlines in one place
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    transition: 'transform 0.3s ease',
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Forum sx={{ fontSize: 40, color: '#ff3d00' }} />
                  </Box>
                  <Typography variant="h5" component="h3" align="center" gutterBottom sx={{ color: 'white' }}>
                    Connect
                  </Typography>
                  <Typography variant="body1" align="center" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Join a community of researchers and share experiences
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default Home;