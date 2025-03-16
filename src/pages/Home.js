import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Button, 
  Card, 
  CardContent,
  CardMedia,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
  Zoom
} from '@mui/material';
import { 
  School, 
  Search, 
  Star, 
  Forum, 
  Assignment,
  ArrowForward,
  Explore,
  EmojiEvents,
  Psychology
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import InteractiveParticles from '../components/InteractiveParticles';

function Home() {
  return (
    <Box>
      {/* Animated Background */}
      <InteractiveParticles />
      
      {/* Hero Section */}
      <Box 
        sx={{ 
          background: 'linear-gradient(135deg, #1a237e 0%, #283593 50%, #303f9f 100%)', // Ultramarine blue gradient
          color: 'white', 
          py: 10,
          mb: 6,
          borderRadius: { xs: 0, md: '0 0 20px 20px' },
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Fade in={true} timeout={1000}>
                <Box>
                  <Typography 
                    variant="h2" 
                    component="h1" 
                    gutterBottom
                    sx={{ 
                      fontWeight: 700,
                      textShadow: '0 2px 10px rgba(0,0,0,0.2)',
                      fontSize: { xs: '2.5rem', md: '3.5rem' }
                    }}
                  >
                    REU Cafe
                  </Typography>
                  <Typography 
                    variant="h5" 
                    paragraph
                    sx={{ 
                      fontWeight: 500,
                      textShadow: '0 1px 5px rgba(0,0,0,0.1)',
                      fontSize: { xs: '1.2rem', md: '1.5rem' }
                    }}
                  >
                    Your one-stop platform for Research Experiences for Undergraduates (REU) programs
                  </Typography>
                  <Typography 
                    variant="body1" 
                    paragraph 
                    sx={{ 
                      mb: 4,
                      maxWidth: '90%',
                      fontSize: { xs: '1rem', md: '1.1rem' }
                    }}
                  >
                    Discover, save, and apply to REU programs across various STEM fields. 
                    Share your experiences and connect with fellow researchers.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Button 
                      variant="contained" 
                      size="large"
                      component={RouterLink}
                      to="/programs"
                      endIcon={<ArrowForward />}
                      sx={{ 
                        px: 3, 
                        py: 1.5, 
                        borderRadius: 2,
                        bgcolor: '#FF5722', // Red-orange accent color
                        color: 'white',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: '#E64A19', // Darker red-orange on hover
                          transform: 'translateY(-3px)',
                          boxShadow: '0 6px 15px rgba(0,0,0,0.2)'
                        }
                      }}
                    >
                      Browse Programs
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="inherit" 
                      size="large"
                      component={RouterLink}
                      to="/register"
                      sx={{ 
                        px: 3, 
                        py: 1.5, 
                        borderRadius: 2,
                        borderWidth: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderWidth: 2,
                          bgcolor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      Sign Up
                    </Button>
                  </Box>
                </Box>
              </Fade>
            </Grid>
            <Grid item xs={12} md={5}>
              <Zoom in={true} timeout={1000} style={{ transitionDelay: '300ms' }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: '100%'
                }}>
                  <Box 
                    sx={{ 
                      width: '280px',
                      height: '280px',
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(5px)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      p: 2
                    }}
                  >
                    <School sx={{ fontSize: 120, color: 'white', opacity: 0.9 }} />
                  </Box>
                </Box>
              </Zoom>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Why Use REU Cafe?
        </Typography>
        <Typography variant="body1" align="center" paragraph sx={{ mb: 6 }}>
          We make finding and applying to REU programs easier than ever
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Search fontSize="large" color="primary" />
                </Box>
                <Typography variant="h5" component="h3" align="center" gutterBottom>
                  Find Programs
                </Typography>
                <Typography variant="body1" align="center">
                  Browse through hundreds of REU programs across various institutions and research fields. 
                  Filter by field, deadline, and more to find the perfect match for your interests.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Star fontSize="large" color="primary" />
                </Box>
                <Typography variant="h5" component="h3" align="center" gutterBottom>
                  Save & Track
                </Typography>
                <Typography variant="body1" align="center">
                  Save your favorite programs, track application deadlines, and manage your REU journey 
                  all in one place. Never miss an important deadline again.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Forum fontSize="large" color="primary" />
                </Box>
                <Typography variant="h5" component="h3" align="center" gutterBottom>
                  Share Experiences
                </Typography>
                <Typography variant="body1" align="center">
                  Connect with other students, share your application experiences, and learn from 
                  those who have participated in REU programs before.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Home;