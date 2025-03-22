import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Grid, 
  Chip, 
  Button, 
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem
} from '@mui/material';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';

function ProgramDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser: user } = useAuth();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [openTrackerDialog, setOpenTrackerDialog] = useState(false);
  const [trackerData, setTrackerData] = useState({
    program_name: '',
    university: '',
    deadline: '',
    status: 'Not Started',
    decision: 'Pending',
    notes: '',
    stipend: '',
    location: '',
    duration: '',
    link: ''
  });
  
  // Check if program is saved by user
  useEffect(() => {
    if (user && id) {
      const checkSavedStatus = async () => {
        const { data, error } = await supabase
          .from('saved_programs')
          .select('*')
          .eq('user_id', user.id)
          .eq('program_id', id)
          .single();
          
        if (data && !error) {
          setSaved(true);
        }
      };
      
      checkSavedStatus();
    }
  }, [user, id]);
  
  // Fetch program details
  useEffect(() => {
    const fetchProgram = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching program with ID:', id);
        
        if (!id) {
          setError('No program ID provided');
          setLoading(false);
          return;
        }
        
        // Fetch program details from Supabase
        const { data, error } = await supabase
          .from('programs')
          .select('*')
          .eq('id', id)
          .single(); // Use single() instead of checking array length
          
        if (error) {
          console.error('Supabase error:', error);
          setError(error.message || 'Failed to load program details');
          setLoading(false);
          return;
        }
        
        if (!data) {
          console.error('No program found');
          setError('Program not found');
          setLoading(false);
          return;
        }
        
        console.log('Fetched program data:', data);
        
        // Process the data
        const processedData = {
          ...data,
          description: data.description ? data.description
            .replace(/\.\.\.read more/gi, '')
            .replace(/\.\.\.$/g, '')
            .replace(/\.\.\./g, '')
            .replace(/\s*\(read more\)/gi, '')
            .replace(/read more/gi, '')
            .replace(/deadline:?\s*[\w\d\s,]+\d{4}/gi, '')
            .replace(/application\s+deadline:?\s*[\w\d\s,]+\d{4}/gi, '')
            .replace(/due\s+date:?\s*[\w\d\s,]+\d{4}/gi, '')
            .replace(/applications?\s+due:?\s*[\w\d\s,]+\d{4}/gi, '')
            .replace(/date:?\s*[\w\d\s,]+\d{4}/gi, '')
            .replace(/\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/g, '')
            .replace(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(st|nd|rd|th)?\s*,?\s*\d{4}\b/gi, '')
            .replace(/\s*\n\s*/g, '\n\n')
            .replace(/\s+/g, ' ')
            .replace(/\n\n+/g, '\n\n')
            .trim() : 'No description available.'
        };
        
        console.log('Setting processed program data:', processedData);
        setProgram(processedData);
      } catch (err) {
        console.error('Error fetching program:', err);
        setError(err.message || 'Failed to load program details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProgram();
  }, [id]);
  
  const handleSaveProgram = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/programs/${id}` } });
      return;
    }
    
    try {
      if (saved) {
        // Remove from saved programs
        const { error } = await supabase
          .from('saved_programs')
          .delete()
          .eq('user_id', user.id)
          .eq('program_id', id);
          
        if (error) throw error;
        setSaved(false);
      } else {
        // Add to saved programs
        const { error } = await supabase
          .from('saved_programs')
          .insert([{
            user_id: user.id,
            program_id: id,
            saved_at: new Date().toISOString()
          }]);
          
        if (error) throw error;
        setSaved(true);
      }
    } catch (err) {
      console.error('Error saving program:', err);
      // You could add a notification here
    }
  };
  
  const handleOpenTrackerDialog = () => {
    if (!user) {
      navigate('/login', { state: { from: `/programs/${id}` } });
      return;
    }
    
    setTrackerData({
      program_name: program.title,
      university: program.institution,
      deadline: program.deadline,
      status: 'Not Started',
      decision: 'Pending',
      notes: program.description || '',
      stipend: program.stipend || '',
      location: program.location || '',
      duration: program.duration || '',
      link: program.link || program.url || program.website || ''
    });
    setOpenTrackerDialog(true);
  };

  const handleCloseTrackerDialog = () => {
    setOpenTrackerDialog(false);
  };

  const handleTrackerDataChange = (field) => (event) => {
    setTrackerData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleAddToTracker = async () => {
    try {
      const { error } = await supabase
        .from('applications')
        .insert([{
          ...trackerData,
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
        
      if (error) throw error;
      
      handleCloseTrackerDialog();
      // You could add a success notification here
    } catch (err) {
      console.error('Error adding to tracker:', err);
      setError('Failed to add program to tracker');
    }
  };
  
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading program details...
        </Typography>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/programs')}
        >
          Back to Programs
        </Button>
      </Container>
    );
  }
  
  if (!program) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="warning">Program not found</Alert>
        <Button 
          variant="contained" 
          sx={{ mt: 2 }}
          onClick={() => navigate('/programs')}
        >
          Back to Programs
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md">
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      ) : program ? (
        <Box sx={{ mt: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
          >
            {program.title}
          </Typography>
          
          {/* Fields Display - Keep only this one, remove the duplicate below */}
          {program.field && Array.isArray(program.field) && program.field.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>Fields of Study</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {program.field.map((field, index) => (
                  <Chip
                    key={`${program.id}-${field}-${index}`}
                    label={field}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
          
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {program.institution}
          </Typography>
          
          {/* Keep only this deadline display */}
          {program.deadline && (
            <Box sx={{ my: 2 }}>
              <Chip 
                label={`Deadline: ${new Date(program.deadline).toLocaleDateString()}`} 
                color="secondary" 
                sx={{ mr: 1, mb: 1 }} 
              />
            </Box>
          )}
          
          {/* Removed duplicate fields display */}
          
          <Divider sx={{ my: 3 }} />
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Program Description
              </Typography>
              <Typography 
                variant="body1" 
                paragraph 
                sx={{ 
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}
              >
                {program.description}
              </Typography>
              
              {program.requirements && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Requirements
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {program.requirements}
                  </Typography>
                </>
              )}
              
              {program.benefits && (
                <>
                  <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                    Benefits
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {program.benefits}
                  </Typography>
                </>
              )}
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Program Details
                </Typography>
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" component="span">
                    Location:
                  </Typography>
                  <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                    {program.location || 'Not specified'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" component="span">
                    Duration:
                  </Typography>
                  <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                    {program.duration || 'Not specified'}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 1 }}>
                  <Typography variant="subtitle2" component="span">
                    Stipend:
                  </Typography>
                  <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                    {program.stipend || 'Not specified'}
                  </Typography>
                </Box>
                
                {(program.link || program.url || program.website) && (
                  <Button 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    sx={{ mt: 2, py: 1, fontWeight: 'bold' }}
                    href={program.link || program.url || program.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apply Now
                  </Button>
                )}
                
                {user && (
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/applications', { 
                      state: { 
                        program: {
                          program_name: program.title,
                          university: program.institution,
                          deadline: program.deadline,
                          status: 'Not Started',
                          decision: 'Pending',
                          notes: `${program.description}\n\nDuration: ${program.duration}\nStipend: ${program.stipend}\nLocation: ${program.location}`,
                          link: program.link || program.url || program.website || ''
                        }
                      }
                    })}
                  >
                    Add to Applications
                  </Button>
                )}

                {program.link && (
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    fullWidth 
                    sx={{ mt: 2 }}
                    href={program.link} 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Website
                  </Button>
                )}
              </Paper>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-start' }}>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/programs')}
            >
              Back to Programs
            </Button>
          </Box>
        </Box>
      ) : (
        <Alert severity="info" sx={{ mt: 4 }}>Program not found</Alert>
      )}

      {/* Add to Tracker Dialog */}
      <Dialog 
        open={openTrackerDialog} 
        onClose={handleCloseTrackerDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Program to Tracker</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Program Name"
              value={trackerData.program_name}
              onChange={handleTrackerDataChange('program_name')}
              fullWidth
            />
            <TextField
              label="University"
              value={trackerData.university}
              onChange={handleTrackerDataChange('university')}
              fullWidth
            />
            <TextField
              label="Deadline"
              type="date"
              value={trackerData.deadline}
              onChange={handleTrackerDataChange('deadline')}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Status"
              select
              value={trackerData.status}
              onChange={handleTrackerDataChange('status')}
              fullWidth
            >
              <MenuItem value="Not Started">Not Started</MenuItem>
              <MenuItem value="In Progress">In Progress</MenuItem>
              <MenuItem value="Submitted">Submitted</MenuItem>
              <MenuItem value="Accepted">Accepted</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </TextField>
            <TextField
              label="Decision"
              select
              value={trackerData.decision}
              onChange={handleTrackerDataChange('decision')}
              fullWidth
            >
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Accepted">Accepted</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </TextField>
            <TextField
              label="Stipend"
              value={trackerData.stipend}
              onChange={handleTrackerDataChange('stipend')}
              fullWidth
            />
            <TextField
              label="Location"
              value={trackerData.location}
              onChange={handleTrackerDataChange('location')}
              fullWidth
            />
            <TextField
              label="Duration"
              value={trackerData.duration}
              onChange={handleTrackerDataChange('duration')}
              fullWidth
            />
            <TextField
              label="Website Link"
              value={trackerData.link}
              onChange={handleTrackerDataChange('link')}
              fullWidth
            />
            <TextField
              label="Notes"
              value={trackerData.notes}
              onChange={handleTrackerDataChange('notes')}
              multiline
              rows={4}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTrackerDialog}>Cancel</Button>
          <Button onClick={handleAddToTracker} variant="contained" color="primary">
            Add to Tracker
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ProgramDetail;