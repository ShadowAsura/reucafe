import React, { useContext } from 'react';
import { Container, Typography, Button, Box, Grid, Paper, Card, CardContent, CardMedia } from '@mui/material';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../contexts/ThemeContext';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import './Home.css';

function Home() {
  const { darkMode } = useContext(ThemeContext);

  return (
    <Box sx={{ 
      backgroundColor: darkMode ? '#121212' : '#f5f5f5',
      minHeight: '100vh',
      pt: 4
    }}>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          backgroundColor: darkMode ? '#1E1E1E' : '#fff',
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          mb: 6
        }}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              color: darkMode ? '#fff' : '#333',
              mb: 2
            }}
          >
            Find Your Perfect REU Program
          </Typography>
          <Typography 
            variant="h5" 
            component="p" 
            gutterBottom
            sx={{ 
              maxWidth: '800px',
              mx: 'auto',
              mb: 4,
              color: darkMode ? '#ccc' : '#666'
            }}
          >
            Explore hundreds of Research Experiences for Undergraduates across the United States
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            component={Link} 
            to="/programs"
            sx={{ 
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
            }}
          >
            Browse Programs
          </Button>
        </Box>

        {/* Features Section */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%',
              backgroundColor: darkMode ? '#2D2D2D' : '#fff',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <SchoolIcon sx={{ fontSize: 60, color: darkMode ? '#90CAF9' : '#1976d2', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Prestigious Programs
                </Typography>
                <Typography variant="body1" color={darkMode ? '#ccc' : 'text.secondary'}>
                  Access top research opportunities at leading institutions across the country.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%',
              backgroundColor: darkMode ? '#2D2D2D' : '#fff',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <SearchIcon sx={{ fontSize: 60, color: darkMode ? '#90CAF9' : '#1976d2', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Easy Search
                </Typography>
                <Typography variant="body1" color={darkMode ? '#ccc' : 'text.secondary'}>
                  Filter by field, deadline, and institution to find the perfect match for your interests.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              height: '100%',
              backgroundColor: darkMode ? '#2D2D2D' : '#fff',
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-8px)'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <TrendingUpIcon sx={{ fontSize: 60, color: darkMode ? '#90CAF9' : '#1976d2', mb: 2 }} />
                <Typography variant="h5" component="h2" gutterBottom>
                  Boost Your Career
                </Typography>
                <Typography variant="body1" color={darkMode ? '#ccc' : 'text.secondary'}>
                  Enhance your resume with valuable research experience and prepare for graduate school.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Call to Action */}
        <Box sx={{ 
          textAlign: 'center', 
          py: 6,
          backgroundColor: darkMode ? '#1E1E1E' : '#fff',
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          mb: 8
        }}>
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              mb: 3
            }}
          >
            Ready to find your next research opportunity?
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large" 
            component={Link} 
            to="/programs"
            sx={{ 
              py: 1.5,
              px: 4,
              fontSize: '1.1rem',
              fontWeight: 600
            }}
          >
            Explore Programs Now
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default Home;