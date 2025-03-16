import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  TextField,
  MenuItem,
  Paper,
  Chip,
  Divider,
  CardMedia,
  Pagination,
  CircularProgress,
  Alert
} from '@mui/material';
import { Search, School, LocationOn, CalendarToday } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useReu } from '../context/ReuContext';

function Programs() {
  const { programs, loading, error } = useReu();
  const [searchTerm, setSearchTerm] = useState('');
  const [fieldFilter, setFieldFilter] = useState('All Fields');
  const [page, setPage] = useState(1);
  // Change the programs per page from 4 to 25
  const [programsPerPage, setProgramsPerPage] = useState(25);

  // Extract unique fields from programs
  // Extract unique fields from programs, handling arrays of fields
  const uniqueFields = ['All Fields', ...new Set(programs.flatMap(program => 
    Array.isArray(program.field) ? program.field : [program.field]
  ).filter(Boolean))];

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = searchTerm === '' || 
      (program.title && program.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (program.institution && program.institution.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesField = fieldFilter === 'All Fields' || 
      (Array.isArray(program.field) ? 
        program.field.includes(fieldFilter) : 
        program.field === fieldFilter);
    
    return matchesSearch && matchesField;
  });

  const pageCount = Math.ceil(filteredPrograms.length / programsPerPage);
  const displayedPrograms = filteredPrograms.slice(
    (page - 1) * programsPerPage,
    page * programsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo(0, 0);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          REU Programs
        </Typography>
        <Typography variant="body1" paragraph>
          Discover Research Experiences for Undergraduates across various fields and institutions.
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button 
            component={RouterLink} 
            to="/suggest-program" 
            variant="outlined" 
            color="primary"
          >
            Suggest a Program
          </Button>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Search Programs"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Field"
                value={fieldFilter}
                onChange={(e) => setFieldFilter(e.target.value)}
              >
                {uniqueFields.map((field) => (
                  <MenuItem key={field} value={field}>
                    {field}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* Loading and Error States */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Programs Grid */}
        {!loading && !error && (
          <>
            {displayedPrograms.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                No programs found matching your criteria. Try adjusting your filters or suggest a new program.
              </Alert>
            ) : (
              <Grid container spacing={3}>
                {displayedPrograms.map((program) => (
                  <Grid item xs={12} sm={6} key={program.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {program.image && (
                        <CardMedia
                          component="img"
                          height="140"
                          image={program.image}
                          alt={program.title}
                        />
                      )}
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h5" component="h2" gutterBottom>
                          {program.title}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                          <School fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                          {program.institution}
                        </Typography>
                        
      
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                          {program.field && Array.isArray(program.field) && program.field.map((field, index) => (
                            <Chip
                              key={`${program.id}-${field}-${index}`}
                              label={field}
                              color="primary"
                              variant="outlined"
                              size="small"
                            />
                          ))}
                        </Box>
                        
                        {program.deadline && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            <CalendarToday fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Deadline: {program.deadline}
                          </Typography>
                        )}
                        
                        <Divider sx={{ my: 1.5 }} />
                        
                        <Typography variant="body2" paragraph>
                          {program.description && program.description.length > 250 
                            ? `${program.description.substring(0, 250)}...` 
                            : program.description}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          component={RouterLink} 
                          to={`/programs/${program.id}`}
                        >
                          View Details
                        </Button>
                        {program.link && (
                          <Button 
                            size="small" 
                            href={program.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            Visit Website
                          </Button>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
            
            {/* Pagination */}
            {pageCount > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={pageCount} 
                  page={page} 
                  onChange={handlePageChange} 
                  color="primary" 
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
}

export default Programs;