import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Pagination
} from '@mui/material';
import { ThumbUp } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

function Decisions() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState({});
  const [likedDecisions, setLikedDecisions] = useState(new Set());
  const [message, setMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const DECISIONS_PER_PAGE = 9;

  const [formData, setFormData] = useState({
    program_name: '',
    university: '',
    decision_type: 'Pending',
    year: new Date().getFullYear(),
    gpa: '',
    major: '',
    research_experience: '',
    thoughts: ''
  });
  const [openDialog, setOpenDialog] = useState(false);
  const fetchUserProfile = async () => {
    try {
      if (!currentUser?.id) {
        console.error('No current user ID found');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', currentUser.id)  // Use the current user's ID instead of email
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: currentUser.id,
              email: currentUser.email,
              username: currentUser.email.split('@')[0],
              avatar_url: currentUser.user_metadata?.avatar_url,
              created_at: new Date().toISOString()
            })
            .select('id')
            .single();

          if (createError) {
            console.error('Error creating profile:', createError);
            return;
          }
          
          if (newProfile) {
            setProfileId(newProfile.id);
            return;
          }
        }
        throw error;
      }
      
      if (data) {
        setProfileId(data.id);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
      fetchDecisions();
    }
  }, [currentUser, page]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      program_name: '',
      university: '',
      decision_type: 'Pending',
      year: new Date().getFullYear(),
      gpa: '',
      major: '',
      research_experience: '',
      thoughts: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profileId) {
      console.error('No profile ID found');
      return;
    }

    try {
      console.log('Starting decision submission...');
      console.log('Form data:', formData);

      // First check if program exists
      const { data: existingProgram, error: programError } = await supabase
        .from('programs')
        .select('id')
        .eq('title', formData.program_name)
        .eq('institution', formData.university)
        .single();
        
      if (programError && programError.code !== 'PGRST116') {
        console.error('Error checking existing program:', programError);
        throw programError;
      }

      // If no program exists, we'll create the decision without a program reference
      const programId = existingProgram?.id || null;
      
      // Now insert decision
      console.log('Creating decision with program ID:', programId);
      const { data: decisionData, error: decisionError } = await supabase
        .from('decisions')
        .insert({
          program_id: programId,
          user_id: profileId,
          program_name: formData.program_name,
          university: formData.university,
          decision_type: formData.decision_type,
          year: parseInt(formData.year),
          gpa: formData.gpa ? parseFloat(formData.gpa) : null,
          major: formData.major,
          research_experience: formData.research_experience,
          thoughts: formData.thoughts,
          status: formData.decision_type,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (decisionError) {
        console.error('Error creating decision:', decisionError);
        throw decisionError;
      }

      console.log('Successfully created decision:', decisionData);
      handleCloseDialog();
      fetchDecisions();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      // Show error message to user
      setMessage({
        type: 'error',
        text: error.message || 'Failed to create decision. Please try again.'
      });
    }
  };

  const handleAddComment = async (decisionId) => {
    if (!currentUser || !newComment.trim()) return;

    try {
      const { error } = await supabase
        .from('decision_comments')
        .insert({
          decision_id: decisionId,
          user_id: currentUser.id,
          content: newComment.trim(),
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setNewComment('');
      await fetchComments(decisionId);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const fetchComments = async (decisionId) => {
    try {
      const { data, error } = await supabase
        .from('decision_comments')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('decision_id', decisionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setComments(prev => ({
        ...prev,
        [decisionId]: data || []
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchDecisions = async () => {
    try {
      setLoading(true);
      
      // First get the total count
      const { count, error: countError } = await supabase
        .from('decisions')
        .select('*', { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      setTotalCount(count);
      setTotalPages(Math.ceil(count / DECISIONS_PER_PAGE));
      
      // Then fetch the paginated data
      const { data, error } = await supabase
        .from('decisions')
        .select(`
          *,
          profiles!decisions_user_id_fkey (username, avatar_url),
          programs!decisions_program_id_fkey (title, institution)
        `)
        .order('created_at', { ascending: false })
        .range((page - 1) * DECISIONS_PER_PAGE, page * DECISIONS_PER_PAGE - 1);
      
      if (error) throw error;
      
      setDecisions(data || []);
    } catch (error) {
      console.error('Error fetching decisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (e, decision) => {
    e.stopPropagation();
    if (!currentUser || likedDecisions.has(decision.id)) return;
    
    try {
      // Check if user has already liked this decision
      const { data: existingLike, error: likeCheckError } = await supabase
        .from('decision_likes')
        .select('id')
        .eq('decision_id', decision.id)
        .eq('user_id', currentUser.id)
        .single();
      
      if (likeCheckError && likeCheckError.code !== 'PGRST116') throw likeCheckError;
      if (existingLike) return; // User has already liked this decision
      
      // Insert new like
      const { error: insertError } = await supabase
        .from('decision_likes')
        .insert({
          decision_id: decision.id,
          user_id: currentUser.id
        });
      
      if (insertError) throw insertError;
      
      // Update decision likes count
      const { data: likeCount, error: countError } = await supabase
        .from('decision_likes')
        .select('id', { count: 'exact' })
        .eq('decision_id', decision.id);
      
      if (countError) throw countError;
      
      setLikedDecisions(prev => new Set([...prev, decision.id]));
      setDecisions(prev => prev.map(d => 
        d.id === decision.id ? { ...d, likes: likeCount.length } : d
      ));
    } catch (error) {
      console.error('Error liking decision:', error);
    }
  };

  const navigateToUserProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };
    


  const getDecisionColor = (type) => {
    switch (type) {
      case 'Accepted': return '#2e7d32';  // Green
      case 'Rejected': return '#d32f2f';  // Red
      case 'Waitlisted': return '#f57c00';  // Orange
      case 'Pending': return '#1a237e';  // Blue
      default: return '#1a237e';
    }
  };

  const getDecisionTextColor = (type) => {
    switch (type) {
      case 'Accepted': return '#ffffff';
      case 'Rejected': return '#ffffff';
      case 'Waitlisted': return '#ffffff';
      case 'Pending': return '#ffffff';
      default: return '#ffffff';
    }
  };

  const filteredDecisions = decisions.filter(decision => {
    const programTitle = decision.programs?.title || decision.program_name || '';
    return programTitle.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{
        mb: 4,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(45deg, rgba(26, 35, 126, 0.9) 30%, rgba(255, 61, 0, 0.9) 90%)',
        padding: 3,
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        color: 'white'
      }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Decision Board
        </Typography>
        {currentUser && (
          <Button
            variant="outlined"
            onClick={() => setOpenDialog(true)}
            size="large"
            sx={{
              color: 'white',
              borderColor: 'white',
              '&:hover': { 
                borderColor: 'white', 
                backgroundColor: 'rgba(255,255,255,0.1)' 
              }
            }}
          >
            Share Decision
          </Button>
        )}
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search decisions by program title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'white',
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(26, 35, 126, 0.5)'
                }
              }
            }
          }}
        />
      </Box>

      {!currentUser ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Please log in to view and share decisions.
          </Typography>
        </Paper>
      ) : loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : filteredDecisions.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {searchQuery ? 'No decisions found matching your search.' : 'No decisions have been shared yet.'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {searchQuery ? 'Try adjusting your search terms.' : 'Be the first to share your REU decision!'}
          </Typography>
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {filteredDecisions.map((decision) => (
              <Grid item xs={12} sm={6} md={4} key={decision.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                    transition: 'transform 0.2s ease-in-out',
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backgroundColor: '#1a237e',
                    color: 'white',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                  onClick={() => navigate(`/decisions/${decision.id}`)}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" noWrap sx={{ flex: 1, mr: 2 }}>
                        {decision.programs?.title || decision.program_name || 'Unknown Program'}
                      </Typography>
                      <Chip 
                        label={decision.decision_type} 
                        size="small"
                        sx={{ 
                          backgroundColor: decision.decision_type === 'Accepted' ? '#2e7d32' :
                                         decision.decision_type === 'Rejected' ? '#d32f2f' :
                                         decision.decision_type === 'Waitlisted' ? '#f57c00' :
                                         '#1a237e',
                          color: 'white',
                          '& .MuiChip-label': { color: 'white' }
                        }}
                      />
                    </Box>
                    <Typography variant="body1" sx={{ mb: 2, opacity: 0.8 }}>
                      {decision.university}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      mt: 2,
                      pt: 2,
                      borderTop: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {new Date(decision.created_at).toLocaleDateString()}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ThumbUp sx={{ fontSize: 16, mr: 0.5, opacity: 0.8 }} />
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {decision.likes || 0} likes
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#1a237e',
                  '&.Mui-selected': {
                    backgroundColor: '#1a237e',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#1a237e',
                    }
                  }
                }
              }}
            />
          </Box>
        </>
      )}

      {/* Add Decision Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(45deg, rgba(26, 35, 126, 0.9) 30%, rgba(255, 61, 0, 0.9) 90%)',
          color: 'white'
        }}>
          Share Your REU Decision
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Program Name"
                name="program_name"
                value={formData.program_name}
                onChange={handleChange}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="University"
                name="university"
                value={formData.university}
                onChange={handleChange}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Decision</InputLabel>
                <Select
                  name="decision_type"
                  value={formData.decision_type}
                  onChange={handleChange}
                  label="Decision"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                >
                  <MenuItem value="Accepted">Accepted</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Waitlisted">Waitlisted</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GPA"
                name="gpa"
                type="number"
                inputProps={{ step: 0.01, min: 0, max: 4.0 }}
                value={formData.gpa}
                onChange={handleChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Major"
                name="major"
                value={formData.major}
                onChange={handleChange}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Research Experience"
                name="research_experience"
                value={formData.research_experience}
                onChange={handleChange}
                multiline
                rows={3}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Thoughts"
                name="thoughts"
                value={formData.thoughts}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="Share your thoughts about the decision, application process, etc."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ 
              color: '#1a237e',
              '&:hover': { backgroundColor: 'rgba(26, 35, 126, 0.1)' }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            sx={{
              background: 'linear-gradient(45deg, rgba(26, 35, 126, 0.9) 30%, rgba(255, 61, 0, 0.9) 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, rgba(26, 35, 126, 1) 50%, rgba(255, 61, 0, 1) 100%)'
              }
            }}
            disabled={!formData.program_name || !formData.university || !formData.decision_type}
          >
            Share
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Decisions;

