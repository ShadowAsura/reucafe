import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Grid, 
  TextField, 
  CircularProgress,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import { useReu } from '../context/ReuContext';

function ReuList() {
  const { reus, loading, error, refreshReuData } = useReu();
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter REUs based on search term
  const filteredReus = reus.filter(reu => 
    reu.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reu.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reu.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle refresh button click
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshReuData();
    setRefreshing(false);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          REU Programs
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? <CircularProgress size={24} /> : 'Refresh Programs'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        label="Search REU Programs"
        variant="outlined"
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 3 }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredReus.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
          No REU programs found. Try a different search term or refresh the programs.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredReus.map((reu) => (
            <Grid item xs={12} md={6} lg={4} key={reu.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {reu.title}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    {reu.institution}
                  </Typography>
                  <Chip 
                    label={reu.source} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                    sx={{ mb: 2 }} 
                  />
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    {reu.description.length > 150 
                      ? `${reu.description.substring(0, 150)}...` 
                      : reu.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    href={reu.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Learn More
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default ReuList;