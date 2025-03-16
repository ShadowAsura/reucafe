import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Button, Paper, Grid, Alert, CircularProgress, 
  Table, TableBody, TableCell, TableHead, TableRow, TextField, Stack, Divider,
  Tabs, Tab, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItem, ListItemText, ListItemSecondaryAction, Switch
} from '@mui/material';
import { supabase } from '../supabase';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [users, setUsers] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [newProgram, setNewProgram] = useState({
    title: '',
    institution: '',
    description: '',
    location: '',
    deadline: '',
    stipend: '',
    url: '',
  });
  const [editProgram, setEditProgram] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [programStats, setProgramStats] = useState({
    total: 0,
    active: 0,
    bySource: {}
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch programs
        const { data: programsData, error: programsError } = await supabase
          .from('programs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (programsError) throw programsError;
        setPrograms(programsData || []);

        // Calculate program stats
        const stats = {
          total: programsData?.length || 0,
          active: programsData?.filter(p => p.status === 'active').length || 0,
          bySource: {}
        };

        programsData?.forEach(program => {
          const source = program.source || 'unknown';
          if (!stats.bySource[source]) {
            stats.bySource[source] = 0;
          }
          stats.bySource[source]++;
        });

        setProgramStats(stats);

        // Fetch users
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (usersError) throw usersError;
        setUsers(usersData || []);

        // Fetch recent scraper jobs
        const { data: jobsData, error: jobsError } = await supabase
          .from('scraper_jobs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (jobsError) throw jobsError;
        setRecentJobs(jobsData || []);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscriptions
    const programsSubscription = supabase
      .channel('public:programs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'programs' }, fetchData)
      .subscribe();

    return () => {
      programsSubscription.unsubscribe();
    };
  }, []);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleProgramChange = (e) => {
    const { name, value } = e.target;
    if (editProgram) {
      setEditProgram(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setNewProgram(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const addProgram = async () => {
    if (loading) return;

    setLoading(true);
    setMessage(null);
    setError(null);
    
    try {
      // Enhanced validation
      const requiredFields = ['title', 'institution'];
      const missingFields = requiredFields.filter(field => !newProgram[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Required fields missing: ${missingFields.join(', ')}`);
      }

      // URL validation if provided
      if (newProgram.url && !newProgram.url.startsWith('http')) {
        throw new Error('Invalid URL format');
      }
      
      // Add program to Supabase
      const { error } = await supabase.from('programs').insert([{
        ...newProgram,
        source: 'manual',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }]);
      
      // Reset form
      setNewProgram({
        title: '',
        institution: '',
        description: '',
        location: '',
        deadline: '',
        stipend: '',
        url: '',
      });
      
      setMessage('Program added successfully');
    } catch (err) {
      console.error('Error adding program:', err);
      setError(`Error adding program: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const openEditDialog = (program) => {
    setEditProgram(program);
    setOpenDialog(true);
  };
  
  const closeDialog = () => {
    setEditProgram(null);
    setOpenDialog(false);
  };
  
  const updateProgram = async () => {
    if (loading || !editProgram) return;

    setLoading(true);
    setMessage(null);
    setError(null);
    
    try {
      // Enhanced validation
      const requiredFields = ['title', 'institution'];
      const missingFields = requiredFields.filter(field => !editProgram[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Required fields missing: ${missingFields.join(', ')}`);
      }

      // URL validation if provided
      if (editProgram.url && !editProgram.url.startsWith('http')) {
        throw new Error('Invalid URL format');
      }
      
      // Update program in Supabase
      const { error } = await supabase
        .from('programs')
        .update({
          ...editProgram,
          updated_at: new Date().toISOString()
        })
        .eq('id', editProgram.id);

      if (error) throw error;
      
      setMessage('Program updated successfully');
      closeDialog();
    } catch (err) {
      console.error('Error updating program:', err);
      setError(`Error updating program: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const toggleProgramStatus = async (program) => {
    try {
      const newStatus = program.status === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('programs')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', program.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error toggling program status:', err);
      setError(`Error toggling program status: ${err.message}`);
    }
  };
  
  const deleteProgram = async (programId) => {
    if (!window.confirm('Are you sure you want to delete this program?')) return;
    
    try {
      const { error } = await supabase
        .from('programs')
        .delete()
        .eq('id', programId);

      if (error) throw error;
      setMessage('Program deleted successfully');
    } catch (err) {
      console.error('Error deleting program:', err);
      setError(`Error deleting program: ${err.message}`);
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label="Dashboard" />
          <Tab label="Programs" />
          <Tab label="Users" />
          <Tab label="Scrapers" />
        </Tabs>
      </Box>
      
      {/* Dashboard Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 240 }}>
              <Typography variant="h6" gutterBottom>
                Program Statistics
              </Typography>
              <Typography variant="h3" component="div">
                {programStats.total}
              </Typography>
              <Typography color="text.secondary">
                Total Programs
              </Typography>
              <Typography sx={{ mt: 2 }}>
                Active: {programStats.active}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box>
                {Object.entries(programStats.bySource).map(([source, count]) => (
                  <Typography key={source} variant="body2">
                    {source}: {count}
                  </Typography>
                ))}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 240 }}>
              <Typography variant="h6" gutterBottom>
                User Statistics
              </Typography>
              <Typography variant="h3" component="div">
                {users.length}
              </Typography>
              <Typography color="text.secondary">
                Registered Users
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 240 }}>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List dense>
                {recentJobs.slice(0, 3).map((job) => (
                  <ListItem key={job.id}>
                    <ListItemText 
                      primary={`${job.source} scraper`} 
                      secondary={`${job.status} - ${job.createdAt}`} 
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Programs
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Institution</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {programs.slice(0, 5).map((program) => (
                    <TableRow key={program.id}>
                      <TableCell>{program.title}</TableCell>
                      <TableCell>{program.institution}</TableCell>
                      <TableCell>{program.source}</TableCell>
                      <TableCell>{program.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {/* Programs Tab */}
      {tabValue === 1 && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Add Program Manually
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Title"
                name="title"
                value={newProgram.title}
                onChange={handleProgramChange}
                fullWidth
                required
              />
              <TextField
                label="Institution"
                name="institution"
                value={newProgram.institution}
                onChange={handleProgramChange}
                fullWidth
                required
              />
              <TextField
                label="Description"
                name="description"
                value={newProgram.description}
                onChange={handleProgramChange}
                fullWidth
                multiline
                rows={4}
              />
              <TextField
                label="Location"
                name="location"
                value={newProgram.location}
                onChange={handleProgramChange}
                fullWidth
              />
              <TextField
                label="Application Deadline"
                name="deadline"
                value={newProgram.deadline}
                onChange={handleProgramChange}
                fullWidth
              />
              <TextField
                label="Stipend"
                name="stipend"
                value={newProgram.stipend}
                onChange={handleProgramChange}
                fullWidth
              />
              <TextField
                label="Website URL"
                name="url"
                value={newProgram.url}
                onChange={handleProgramChange}
                fullWidth
              />
              <Button
                variant="contained"
                color="primary"
                onClick={addProgram}
                disabled={loading}
              >
                Add Program
              </Button>
            </Stack>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Manage Programs
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Institution</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {programs.map((program) => (
                  <TableRow key={program.id}>
                    <TableCell>{program.title}</TableCell>
                    <TableCell>{program.institution}</TableCell>
                    <TableCell>{program.source}</TableCell>
                    <TableCell>{program.status}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => openEditDialog(program)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => toggleProgramStatus(program)}>
                        {program.status === 'active' ? 
                          <VisibilityIcon fontSize="small" /> : 
                          <VisibilityOffIcon fontSize="small" />
                        }
                      </IconButton>
                      <IconButton size="small" onClick={() => deleteProgram(program.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          
          <Dialog open={openDialog} onClose={closeDialog} maxWidth="md" fullWidth>
            <DialogTitle>Edit Program</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <TextField
                  label="Title"
                  name="title"
                  value={editProgram?.title || ''}
                  onChange={handleProgramChange}
                  fullWidth
                  required
                />
                <TextField
                  label="Institution"
                  name="institution"
                  value={editProgram?.institution || ''}
                  onChange={handleProgramChange}
                  fullWidth
                  required
                />
                <TextField
                  label="Description"
                  name="description"
                  value={editProgram?.description || ''}
                  onChange={handleProgramChange}
                  fullWidth
                  multiline
                  rows={4}
                />
                <TextField
                  label="Location"
                  name="location"
                  value={editProgram?.location || ''}
                  onChange={handleProgramChange}
                  fullWidth
                />
                <TextField
                  label="Application Deadline"
                  name="deadline"
                  value={editProgram?.deadline || ''}
                  onChange={handleProgramChange}
                  fullWidth
                />
                <TextField
                  label="Stipend"
                  name="stipend"
                  value={editProgram?.stipend || ''}
                  onChange={handleProgramChange}
                  fullWidth
                />
                <TextField
                  label="Website URL"
                  name="url"
                  value={editProgram?.url || ''}
                  onChange={handleProgramChange}
                  fullWidth
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDialog}>Cancel</Button>
              <Button onClick={updateProgram} variant="contained" color="primary">
                Save Changes
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
      
      {/* Users Tab */}
      {tabValue === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            User Management
          </Typography>
          {users.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.displayName || 'N/A'}</TableCell>
                    <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}</TableCell>
                    <TableCell>{user.status || 'active'}</TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography>No users found</Typography>
          )}
        </Paper>
      )}
      
      {/* Scrapers Tab */}
      {tabValue === 3 && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Program Scrapers
            </Typography>
            <Typography paragraph>
              Run scrapers to update the program database with the latest information.
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => window.open('scripts/scraper.js', '_blank')}
                  disabled={loading}
                >
                  View Scraper Script
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => window.open('https://github.com/your-username/reucafe/blob/main/scripts/scraper.js', '_blank')}
                  disabled={loading}
                >
                  View on GitHub
                </Button>
              </Grid>
            </Grid>
            
            <Box mt={3}>
              <Typography variant="h6" gutterBottom>
                Instructions
              </Typography>
              <Typography paragraph>
                To run the scraper script manually:
              </Typography>
              <ol>
                <li>Open a terminal in the project root directory</li>
                <li>Run <code>node scripts/scraper.js</code></li>
                <li>The script will scrape REU programs from NSF and Science Pathways websites</li>
                <li>Results will be saved directly to your Firestore database</li>
              </ol>
              <Typography paragraph>
                For automated scraping, consider setting up a cron job or using a service like GitHub Actions.
              </Typography>
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Recent Scraper Jobs
            </Typography>
            {recentJobs.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Source</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Programs Added</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>{job.source}</TableCell>
                      <TableCell>{job.status}</TableCell>
                      <TableCell>{job.createdAt}</TableCell>
                      <TableCell>{job.programsAdded || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography>No recent jobs found</Typography>
            )}
          </Paper>
        </>
      )}
      
      {message && (
        <Box mt={2}>
          <Alert severity="success" onClose={() => setMessage(null)}>
            {message}
          </Alert>
        </Box>
      )}
      
      {error && (
        <Box mt={2}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}
    </Container>
  );
};

export default AdminDashboard;
