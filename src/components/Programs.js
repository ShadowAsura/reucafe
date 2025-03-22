import React, { useState, useEffect } from 'react';
import { db } from '../supabase';
import './Programs.css';
import { 
  CircularProgress, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Button, 
  Alert,
  Card,
  CardContent,
  CardActions,
  Typography,
  Grid,
  Container,
  Box,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  Link
} from '@mui/material';
import { 
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  AccessTime as TimeIcon,
  Link as LinkIcon,
  School,
  LocationOn,
  CalendarToday
} from '@mui/icons-material';


import { useNavigate } from 'react-router-dom';
import { useTheme, ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import CssBaseline from '@mui/material/CssBaseline';
import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { useReu } from '../context/ReuContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

function Programs() {
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);
  const { programs: reuPrograms, loading: reuLoading, error: reuError } = useReu();
  const { currentUser } = useAuth();
  // Removed modal state variables as they're no longer needed
  const [programs, setPrograms] = useState([]);
  const [filteredPrograms, setFilteredPrograms] = useState([]);
  const [displayedPrograms, setDisplayedPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedField, setSelectedField] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [debugInfo, setDebugInfo] = useState({});
  const [scraperStatus, setScraperStatus] = useState({ loading: false, error: null, success: false });
  const [directScraperStatus, setDirectScraperStatus] = useState({ loading: false, error: null, success: false });
  const [showFilters, setShowFilters] = useState(true);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25); // Changed to 25 programs per page for better usability
  const [availableFields, setAvailableFields] = useState(['all']);
  const [availableLocations, setAvailableLocations] = useState(['all']);
  const [availableInstitutions, setAvailableInstitutions] = useState(['all']);
  const [activeFilters, setActiveFilters] = useState([]);

  // Debounce search term to avoid filtering on every keystroke
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Use programs from ReuContext if available
  useEffect(() => {
    if (reuPrograms && reuPrograms.length > 0) {
      setPrograms(reuPrograms);
      setLoading(false);
    } else if (!reuLoading) {
      fetchPrograms();
    }
  }, [reuPrograms, reuLoading]);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const debug = {
        totalDocuments: 0,
        bySource: {},
        byField: {},
        errors: []
      };

      const { data: programs, error } = await db.from('programs').select('*');
      
      if (error) throw error;
      
      debug.totalDocuments = programs.length;
      
      // Simplified field processing
      const fieldSet = new Set(['all']);
      const locationSet = new Set(['all']);
      const institutionSet = new Set(['all']);
      
      const allPrograms = programs.map(data => {
        // Process fields once, ensuring it's always an array
        let fields = [];
        if (data.field) {
          // Handle both string and array inputs
          const rawFields = Array.isArray(data.field) ? data.field : data.field.split(',');
          fields = rawFields
            .filter(field => field && typeof field === 'string')
            .map(field => field.trim())
            .filter(field => field.length > 0 && field !== 'null' && field !== 'undefined');
            
          // Add unique fields to the set
          fields.forEach(field => {
            fieldSet.add(field);
            debug.byField[field] = (debug.byField[field] || 0) + 1;
          });
        }

        // Add location to set if it exists
        if (data.location && typeof data.location === 'string' && data.location.trim()) {
          locationSet.add(data.location.trim());
        }
        
        // Add institution to set if it exists
        if (data.institution && typeof data.institution === 'string' && data.institution.trim()) {
          institutionSet.add(data.institution.trim());
        }

        // Rest of the program processing
        return {
          id: data.id,
          title: data.title || 'Untitled Program',
          institution: data.institution || 'Unknown Institution',
          description: truncateDescription(data.description || ''),
          location: data.location || '',
          field: fields.length > 0 ? fields : ['STEM'], // Default to STEM if no fields
          url: data.url || data.link || '',
          deadline: formatDeadline(data.deadline),
          stipend: formatStipend(data.stipend),
          duration: data.duration || 'Not specified',
          source: data.source || 'Unknown',
          rawDeadline: data.deadline,
          rawDeadlineDate: data.deadline ? new Date(data.deadline) : null,
          isPastDeadline: data.deadline ? new Date(data.deadline) < new Date() : false
        };
      });

      // Update available fields (sorted alphabetically except 'all')
      const sortedFields = Array.from(fieldSet)
        .filter(field => field && typeof field === 'string')
        .sort((a, b) => {
          if (a === 'all') return -1;
          if (b === 'all') return 1;
          return a.localeCompare(b);
        });

      // Update available locations (sorted alphabetically except 'all')
      const sortedLocations = Array.from(locationSet)
        .filter(location => location && typeof location === 'string')
        .sort((a, b) => {
          if (a === 'all') return -1;
          if (b === 'all') return 1;
          return a.localeCompare(b);
        });

      // Update available institutions (sorted alphabetically except 'all')
      const sortedInstitutions = Array.from(institutionSet)
        .filter(institution => institution && typeof institution === 'string')
        .sort((a, b) => {
          if (a === 'all') return -1;
          if (b === 'all') return 1;
          return a.localeCompare(b);
        });

      setAvailableFields(sortedFields);
      setAvailableLocations(sortedLocations);
      setAvailableInstitutions(sortedInstitutions);
      setPrograms(allPrograms);
      setDebugInfo(debug);
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError(`Failed to load programs: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper function for deadline formatting
  const formatDeadline = (deadline) => {
    if (!deadline || deadline === 'N/A' || deadline === null) return 'N/A';
    
    try {
      const date = new Date(deadline);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch (err) {
      console.error('Error formatting date:', err);
    }
    return 'N/A';
  };

  // Helper function for stipend formatting
  const formatStipend = (stipend) => {
    if (!stipend || stipend.trim() === '') return 'Not specified';
    return /\$|\d+[,\d]*(\.\d+)?/.test(stipend) ? stipend : 'Not specified';
  };

  // Add this function to run scrapers
  const runScrapers = async (source) => {
    try {
      setScraperStatus({ loading: true, error: null, success: false });
      
      // Make API call to run scrapers
      const response = await fetch(`/api/scrapers/run/${source}`);
      
      if (!response.ok) {
        throw new Error(`Failed to run ${source} scraper: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log(`Scraper ${source} result:`, result);
      
      setScraperStatus({ 
        loading: false, 
        error: null, 
        success: true, 
        message: `Successfully ran ${source} scraper. Refresh to see new data.` 
      });
      
      // Refresh data after a short delay
      setTimeout(() => {
        fetchPrograms();
      }, 2000);
      
    } catch (err) {
      console.error(`Error running ${source} scraper:`, err);
      setScraperStatus({ 
        loading: false, 
        error: `Failed to run scraper: ${err.message}. Make sure your backend server is running on port 5000.`, 
        success: false 
      });
    }
  };

  // Add this function to run scrapers directly
  const runScraperDirectly = async () => {
    try {
      setDirectScraperStatus({ loading: true, error: null, success: false });
      
      // Make a fetch request to a custom endpoint that will run the scraper script
      const response = await fetch('/run-scraper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ runAll: true })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to run scraper: ${response.statusText}`);
      }
      
      setDirectScraperStatus({ 
        loading: false, 
        error: null, 
        success: true, 
        message: 'Successfully ran scrapers. Refreshing data...' 
      });
      
      // Refresh data after a short delay
      setTimeout(() => {
        fetchPrograms();
      }, 2000);
      
    } catch (err) {
      console.error('Error running scrapers directly:', err);
      setDirectScraperStatus({ 
        loading: false, 
        error: `Failed to run scrapers: ${err.message}. Try running the script manually.`, 
        success: false 
      });
    }
  };

  // Only fetch programs once on component mount
  useEffect(() => {
    fetchPrograms();
  }, []);

  // Add a filter chip
  const addFilter = (field) => {
    if (!field || typeof field !== 'string') return;
    
    const normalizedField = field.trim();
    if (!normalizedField) return;
    
    if (normalizedField.toLowerCase() === 'all') {
      setActiveFilters([]);
      setSelectedField('all');
    } else {
      // Check if this field is already in activeFilters (case insensitive)
      const isAlreadyAdded = activeFilters.some(
        f => f.toLowerCase() === normalizedField.toLowerCase()
      );
      
      if (!isAlreadyAdded) {
        const newFilters = [...activeFilters, normalizedField];
        setActiveFilters(newFilters);
        setSelectedField(normalizedField);
      }
    }
  };

  // Remove a filter chip
  const removeFilter = (field) => {
    const newFilters = activeFilters.filter(f => f !== field);
    setActiveFilters(newFilters);
    setSelectedField(newFilters.length > 0 ? newFilters[0] : 'all');
  };

  // Filter and sort programs based on search term, selected field, and sort option
  useEffect(() => {
    if (!programs.length) return;
    
    // Apply field filter
    let filtered = programs;
    
    if (activeFilters.length > 0) {
      filtered = programs.filter(program => {
        // Ensure program.field is always an array
        const programFields = Array.isArray(program.field) ? program.field : [program.field];
        
        // Filter out invalid fields and normalize them
        const normalizedProgramFields = programFields
          .filter(f => f && typeof f === 'string')
          .map(f => f.trim().toLowerCase());
        
        // Check if any of the active filters match any of the program's fields
        return activeFilters.some(filter => 
          normalizedProgramFields.includes(filter.toLowerCase())
        );
      });
    }
    
    // Apply location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(program => 
        program.location && program.location.trim().toLowerCase() === locationFilter.toLowerCase()
      );
    }
    
    // Apply institution filter
    if (institutionFilter !== 'all') {
      filtered = filtered.filter(program => 
        program.institution && program.institution.trim().toLowerCase() === institutionFilter.toLowerCase()
      );
    }
    
    // Apply deadline filter
    if (deadlineFilter !== 'all') {
      const today = new Date();
      
      if (deadlineFilter === 'upcoming') {
        // Filter for programs with future deadlines
        filtered = filtered.filter(program => 
          program.rawDeadlineDate && program.rawDeadlineDate > today
        );
      } else if (deadlineFilter === 'past') {
        // Filter for programs with past deadlines
        filtered = filtered.filter(program => 
          program.rawDeadlineDate && program.rawDeadlineDate < today
        );
      } else if (deadlineFilter === 'custom' && startDate && endDate) {
        // Filter for programs with deadlines in the custom date range
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // Set to end of day
        
        filtered = filtered.filter(program => 
          program.rawDeadlineDate && 
          program.rawDeadlineDate >= start && 
          program.rawDeadlineDate <= end
        );
      }
    }
    
    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(program => 
        (program.title && program.title.toLowerCase().includes(searchLower)) ||
        (program.institution && program.institution.toLowerCase().includes(searchLower)) ||
        (program.description && program.description.toLowerCase().includes(searchLower)) ||
        (program.location && program.location.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'deadline') {
        // Special handling for deadline sorting
        if (a.deadline === 'N/A' && b.deadline !== 'N/A') return 1;
        if (a.deadline !== 'N/A' && b.deadline === 'N/A') return -1;
        return a.deadline.localeCompare(b.deadline);
      } else {
        // Handle potential undefined values
        const aVal = a[sortBy] || '';
        const bVal = b[sortBy] || '';
        return aVal.localeCompare(bVal);
      }
    });
    
    setFilteredPrograms(filtered);
    setPage(1); // Reset to first page when filters change
  }, [programs, activeFilters, debouncedSearchTerm, sortBy, locationFilter, institutionFilter, deadlineFilter, startDate, endDate]);

  // Update displayed programs when page or filteredPrograms changes
  useEffect(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedPrograms(filteredPrograms.slice(startIndex, endIndex));
    
    // Log pagination info for debugging
    console.log(`Pagination: Page ${page}, showing items ${startIndex+1}-${Math.min(endIndex, filteredPrograms.length)} of ${filteredPrograms.length}`);
    console.log(`Items per page: ${itemsPerPage}`);
  }, [filteredPrograms, page, itemsPerPage]);

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    window.scrollTo(0, 0); // Scroll to top when changing pages
  };

  if (loading && programs.length === 0) return (
    <Container className="programs-container loading">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Loading programs...</Typography>
      </Box>
    </Container>
  );

  if (error) return (
    <Container className="programs-container error">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" color="error">Error</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>{error}</Typography>
        <Button variant="contained" onClick={fetchPrograms} sx={{ mt: 2 }}>Retry</Button>
        <Box className="debug-info" sx={{ mt: 4 }}>
          <Typography variant="h6">Debug Information</Typography>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </Box>
      </Box>
    </Container>
  );

  if (filteredPrograms.length === 0) {
    return (
      <Container className="programs-container empty">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h4">No Programs Found</Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>Try adjusting your search criteria or filters.</Typography>
          <Button 
            variant="contained" 
            onClick={() => {
              setSelectedField('all');
              setSearchTerm('');
              setSortBy('deadline');
            }}
            sx={{ mt: 2 }}
          >
            Reset Filters
          </Button>
          <Box className="debug-info" sx={{ mt: 4 }}>
            <Typography variant="h6">Debug Information</Typography>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="programs-container">
      <Box sx={{ 
        mt: 4, 
        mb: 4,
        color: darkMode ? 'white' : 'inherit',
        backgroundColor: darkMode ? '#121212' : 'inherit',
        borderRadius: 2,
        p: 2
      }}>
        <Typography variant="h4" component="h1" gutterBottom>
          REU Programs ({filteredPrograms.length})
        </Typography>
        
        {debugInfo.totalDocuments < 20 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Only {debugInfo.totalDocuments} programs found in the database. 
            You may need to run the scrapers to populate more data.
          </Alert>
        )}
        
        {scraperStatus.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {scraperStatus.error}
          </Alert>
        )}
        
        {scraperStatus.success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {scraperStatus.message}
          </Alert>
        )}
        
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SearchIcon sx={{ mr: 1 }} />
              <TextField
                className="search-bar"
                label="Search programs"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                size="small"
              />
              <Tooltip title="Toggle Filters">
                <IconButton onClick={() => setShowFilters(!showFilters)} sx={{ ml: 1 }}>
                  <FilterIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh Data">
                <IconButton onClick={fetchPrograms} sx={{ ml: 1 }}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
            
            {/* Active filter chips */}
            {activeFilters.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {activeFilters.map(filter => (
                  <Chip
                    key={filter}
                    label={filter}
                    onDelete={() => removeFilter(filter)}
                    color="primary"
                    size="small"
                    sx={{ 
                      backgroundColor: darkMode ? '#90CAF9' : '#1976d2',
                      color: darkMode ? '#000' : '#fff'
                    }}
                  />
                ))}
                {activeFilters.length > 0 && (
                  <Chip
                    label="Clear All"
                    onClick={() => setActiveFilters([])}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            )}
            
            {showFilters && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Field</InputLabel>
                  <Select
                    value={selectedField}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedField(value);
                      if (value === 'all') {
                        setActiveFilters([]);
                      } else if (!activeFilters.includes(value)) {
                        addFilter(value);
                      }
                    }}
                    label="Field"
                  >
                    {availableFields.map(field => (
                      <MenuItem key={field} value={field}>
                        {field}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Institution</InputLabel>
                  <Select
                    value={institutionFilter}
                    onChange={(e) => setInstitutionFilter(e.target.value)}
                    label="Institution"
                  >
                    {availableInstitutions.map(institution => (
                      <MenuItem key={institution} value={institution}>
                        {institution}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Location</InputLabel>
                  <Select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    label="Location"
                  >
                    {availableLocations.map(location => (
                      <MenuItem key={location} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Deadline</InputLabel>
                  <Select
                    value={deadlineFilter}
                    onChange={(e) => setDeadlineFilter(e.target.value)}
                    label="Deadline"
                  >
                    <MenuItem value="all">All Deadlines</MenuItem>
                    <MenuItem value="upcoming">Upcoming Deadlines</MenuItem>
                    <MenuItem value="past">Past Deadlines</MenuItem>
                    <MenuItem value="custom">Custom Range</MenuItem>
                  </Select>
                </FormControl>
                
                {deadlineFilter === 'custom' && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <TextField
                      label="Start Date"
                      type="date"
                      size="small"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: 150 }}
                    />
                    <Typography variant="body2" sx={{ mx: 0.5 }}>to</Typography>
                    <TextField
                      label="End Date"
                      type="date"
                      size="small"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: 150 }}
                    />
                  </Box>
                )}
                
                <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sort By"
                  >
                    <MenuItem value="deadline">Deadline</MenuItem>
                    <MenuItem value="title">Title</MenuItem>
                    <MenuItem value="institution">Institution</MenuItem>
                  </Select>
                </FormControl>
                
                <Button 
                  variant="outlined" 
                  onClick={() => {
                    setSelectedField('all');
                    setSearchTerm('');
                    setSortBy('deadline');
                    setActiveFilters([]);
                    setLocationFilter('all');
                    setInstitutionFilter('all');
                    setDeadlineFilter('all');
                    setStartDate('');
                    setEndDate('');
                  }}
                >
                  Reset Filters
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {displayedPrograms.map((program) => (
            <Grid item xs={12} key={program.id}>
              <Card sx={{ 
                mb: 2,
                backgroundColor: darkMode ? '#1e1e1e' : 'white',
                color: darkMode ? 'white' : 'inherit'
              }}>
                <CardContent>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {program.title}
                  </Typography>
                  
                  {/* Institution and Location */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SchoolIcon sx={{ mr: 1 }} />
                      <Typography variant="body1">{program.institution}</Typography>
                    </Box>
                    {program.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationIcon sx={{ mr: 1 }} />
                        <Typography variant="body1">{program.location}</Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Add to Applications Button */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button
                      variant="contained"
                      onClick={() => {
                        if (!currentUser) {
                          navigate('/login');
                          return;
                        }
                        const applicationData = {
                          program_name: program.title,
                          university: program.institution,
                          deadline: program.rawDeadline,
                          status: 'Not Started',
                          decision: 'Pending',
                          notes: `${program.description || ''}

URL: ${program.url || 'Not provided'}
Stipend: ${program.stipend || 'Not specified'}
Duration: ${program.duration || 'Not specified'}`
                        };
                        const { error } = await supabase
                          .from('applications')
                          .insert([{
                            ...applicationData,
                            user_id: currentUser.id,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                          }]);
                        
                        if (error) {
                          console.error('Error adding to applications:', error);
                          return;
                        }
                        
                        // Show success message or notification
                        alert('Program added to your applications!');
                      }}
                      sx={{
                        background: 'linear-gradient(45deg, #1a237e 30%, #ff3d00 90%)',
                        color: 'white',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #0d47a1 30%, #dd2c00 90%)',
                          transform: 'scale(1.05)'
                        },
                        transition: 'all 0.3s ease',
                        boxShadow: '0 3px 5px 2px rgba(26, 35, 126, 0.3)'
                      }}
                    >
                      Add to Applications
                    </Button>
                  </Box>

                  {/* Fields Display */}
                  {program.field && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Fields of Study:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {(Array.isArray(program.field) ? program.field : [program.field])
                          .filter(field => field && typeof field === 'string')
                          .map((field, index) => (
                            <Chip
                              key={`${program.id}-${field}-${index}`}
                              label={field.trim()}
                              size="small"
                              onClick={() => addFilter(field.trim())}
                              sx={{ 
                                backgroundColor: darkMode ? '#2c3e50' : '#e3f2fd',
                                color: darkMode ? '#ecf0f1' : '#1976d2',
                                '&:hover': {
                                  backgroundColor: darkMode ? '#34495e' : '#bbdefb',
                                  transform: 'scale(1.05)',
                                  transition: 'all 0.2s ease-in-out',
                                  cursor: 'pointer'
                                },
                                fontWeight: 500,
                                border: '1px solid',
                                borderColor: darkMode ? '#3498db' : '#90caf9',
                                borderRadius: '16px',
                                padding: '4px 8px',
                                boxShadow: darkMode ? '0 2px 4px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'
                              }}
                            />
                          ))}
                      </Box>
                    </Box>
                  )}

                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Pagination */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={Math.ceil(filteredPrograms.length / itemsPerPage)}
            page={page}
            onChange={handlePageChange}
            color={darkMode ? "secondary" : "primary"}
            size="large"
          />
        </Box>
        
        <Box sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/')}
            sx={{ 
              mr: 2,
              borderRadius: '20px',
              color: darkMode ? '#90CAF9' : '#1976d2',
              borderColor: darkMode ? '#90CAF9' : '#1976d2'
            }}
          >
            Back to Home
          </Button>
          
          <Button 
            variant="contained" 
            onClick={fetchPrograms}
            color={darkMode ? "secondary" : "primary"}
            sx={{ borderRadius: '20px' }}
          >
            Refresh Data
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Programs;


const truncateDescription = (description) => {
  if (!description) return '';
  return description;
};
const [deadlineFilter, setDeadlineFilter] = useState('all'); // 'all', 'upcoming', 'past', 'custom'
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');
const [locationFilter, setLocationFilter] = useState('all');
const [institutionFilter, setInstitutionFilter] = useState('all');
const [availableLocations, setAvailableLocations] = useState(['all']);
const [availableInstitutions, setAvailableInstitutions] = useState(['all']);