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
  Alert
} from '@mui/material';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';

function ProgramDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  
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
        
        // Fetch program details from Supabase
        const { data, error } = await supabase
          .from('programs')
          .select('*')
          .eq('id', id);
          
        if (error) throw error;
        
        // Check if we got exactly one result
        if (data && data.length === 1) {
          // Use the first (and only) result
          const programData = data[0];
          
          // Create a deep copy of the data to avoid direct mutation
          const processedData = JSON.parse(JSON.stringify(programData));
          
          // Process the description to ensure it's complete and clean
          if (processedData.description) {
            // Remove any truncation markers completely
            processedData.description = processedData.description
              .replace(/\.\.\.read more/gi, '')
              .replace(/\.\.\.$/g, '')
              .replace(/\.\.\./g, '')
              .replace(/\s*\(read more\)/gi, '')
              .replace(/read more/gi, '')
              .trim();
            
            // Remove deadline information that might be mixed in with the description
            processedData.description = processedData.description
              .replace(/deadline:?\s*[\w\d\s,]+\d{4}/gi, '') // Remove "Deadline: Month Day, Year"
              .replace(/application\s+deadline:?\s*[\w\d\s,]+\d{4}/gi, '') // Remove "Application Deadline: Month Day, Year"
              .replace(/due\s+date:?\s*[\w\d\s,]+\d{4}/gi, '') // Remove "Due Date: Month Day, Year"
              .replace(/applications?\s+due:?\s*[\w\d\s,]+\d{4}/gi, '') // Remove "Applications Due: Month Day, Year"
              .replace(/date:?\s*[\w\d\s,]+\d{4}/gi, '') // Remove "Date: Month Day, Year"
              .replace(/\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/g, '') // Remove date formats like MM/DD/YYYY
              .replace(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{1,2}(st|nd|rd|th)?\s*,?\s*\d{4}\b/gi, '') // Remove month names with dates
              .trim();
            
            // Preserve paragraph breaks but normalize excessive whitespace
            processedData.description = processedData.description
              .replace(/\s*\n\s*/g, '\n\n') // Normalize line breaks to double line breaks
              .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
              .replace(/\n\n+/g, '\n\n') // Replace multiple consecutive line breaks with just two
              .trim();
          }
          
          setProgram(processedData);
        } else {
          setError('Program not found');
        }
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
          <Typography variant="h4" component="h1" gutterBottom>
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
                {program.description ? program.description : 'No description available.'}
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
                    variant={saved ? "contained" : "outlined"}
                    color={saved ? "success" : "secondary"}
                    fullWidth 
                    sx={{ mt: 2 }}
                    onClick={handleSaveProgram}
                  >
                    {saved ? "Saved" : "Save Program"}
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
    </Container>
  );
}

export default ProgramDetail;