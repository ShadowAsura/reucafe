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
  CardActions,
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
  Divider,
  Avatar,
  IconButton
} from '@mui/material';
import { ThumbUp, Comment, Delete, Edit } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { useNavigate } from 'react-router-dom';

function Decisions() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    program_name: '',
    university: '',
    decision_type: '',
    year: new Date().getFullYear(),
    gpa: '',
    major: '',
    research_experience: '',
    thoughts: ''
  });
  const [profileId, setProfileId] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [activeCommentDecision, setActiveCommentDecision] = useState(null);

  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
      fetchDecisions();
    }
  }, [currentUser]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', currentUser.email)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setProfileId(data.id);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchDecisions = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('decisions')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setDecisions(data || []);
      
      // Fetch comments for each decision
      for (const decision of data || []) {
        fetchComments(decision.id);
      }
    } catch (error) {
      console.error('Error fetching decisions:', error);
    } finally {
      setLoading(false);
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

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      program_name: '',
      university: '',
      decision_type: '',
      year: new Date().getFullYear(),
      gpa: '',
      major: '',
      research_experience: '',
      thoughts: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!profileId) return;
    
    try {
      const { data, error } = await supabase
        .from('decisions')
        .insert({
          ...formData,
          user_id: profileId
        })
        .select();
      
      if (error) throw error;
      
      handleCloseDialog();
      fetchDecisions();
    } catch (error) {
      console.error('Error creating decision:', error);
    }
  };

  const handleLike = async (decision) => {
    try {
      const { error } = await supabase
        .from('decisions')
        .update({ likes: (decision.likes || 0) + 1 })
        .eq('id', decision.id);
      
      if (error) throw error;
      
      fetchDecisions();
    } catch (error) {
      console.error('Error liking decision:', error);
    }
  };

  const handleDelete = async (decisionId) => {
    try {
      const { error } = await supabase
        .from('decisions')
        .delete()
        .eq('id', decisionId);
      
      if (error) throw error;
      
      fetchDecisions();
    } catch (error) {
      console.error('Error deleting decision:', error);
    }
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleAddComment = async () => {
    if (!profileId || !activeCommentDecision || !newComment.trim()) return;
    
    try {
      const { error } = await supabase
        .from('decision_comments')
        .insert({
          decision_id: activeCommentDecision,
          user_id: profileId,
          comment: newComment.trim()
        });
      
      if (error) throw error;
      
      setNewComment('');
      fetchComments(activeCommentDecision);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const getDecisionColor = (type) => {
    switch (type) {
      case 'Accepted': return 'success';
      case 'Rejected': return 'error';
      case 'Waitlisted': return 'warning';
      case 'Pending': return 'info';
      default: return 'default';
    }
  };

  // Add a function to navigate to user profile
  const navigateToUserProfile = (userId) => {
    if (userId) {
      navigate(`/user-profile/${userId}`);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            REU Decisions
          </Typography>
          {currentUser && (
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleOpenDialog}
            >
              Share Your Decision
            </Button>
          )}
        </Box>

        {loading ? (
          <Typography>Must be logged in to view :3</Typography>
        ) : decisions.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              No decisions have been shared yet. Be the first to share your REU decision!
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {decisions.map((decision) => (
              <Grid item xs={12} key={decision.id}>
                <Card>
                  <CardContent>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2,
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.8
                        }
                      }}
                      onClick={() => navigateToUserProfile(decision.user_id)}
                    >
                      <Avatar 
                        src={decision.profiles?.avatar_url} 
                        alt={decision.profiles?.username || 'User'}
                        sx={{ mr: 2 }}
                      />
                      <Box>
                        <Typography variant="subtitle1">
                          {decision.profiles?.username || 'Anonymous'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(decision.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">
                        {decision.program_name} at {decision.university}
                      </Typography>
                      <Chip 
                        label={decision.decision_type} 
                        color={getDecisionColor(decision.decision_type)}
                        size="small"
                      />
                    </Box>
                    
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Year: {decision.year}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          GPA: {decision.gpa || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Major: {decision.major || 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    {decision.research_experience && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Research Experience:</Typography>
                        <Typography variant="body2">{decision.research_experience}</Typography>
                      </Box>
                    )}
                    
                    {decision.thoughts && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2">Thoughts:</Typography>
                        <Typography variant="body2">{decision.thoughts}</Typography>
                      </Box>
                    )}
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box>
                      <Typography variant="subtitle2">
                        Comments ({(comments[decision.id] || []).length})
                      </Typography>
                      
                      {(comments[decision.id] || []).map((comment) => (
                        <Box key={comment.id} sx={{ display: 'flex', mt: 2 }}>
                          <Avatar 
                            src={comment.profiles?.avatar_url} 
                            alt={comment.profiles?.username || 'User'}
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              mr: 1,
                              cursor: 'pointer'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigateToUserProfile(comment.user_id);
                            }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                  mr: 1,
                                  cursor: 'pointer',
                                  '&:hover': {
                                    textDecoration: 'underline'
                                  }
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigateToUserProfile(comment.user_id);
                                }}
                              >
                                {comment.profiles?.username || 'Anonymous'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Typography variant="body2">{comment.comment}</Typography>
                          </Box>
                        </Box>
                      ))}
                      
                      {currentUser && (
                        <Box sx={{ display: 'flex', mt: 2 }}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Add a comment..."
                            value={activeCommentDecision === decision.id ? newComment : ''}
                            onChange={handleCommentChange}
                            onFocus={() => setActiveCommentDecision(decision.id)}
                          />
                          <Button 
                            variant="contained" 
                            color="primary"
                            size="small"
                            sx={{ ml: 1 }}
                            disabled={!newComment.trim() || activeCommentDecision !== decision.id}
                            onClick={handleAddComment}
                          >
                            Post
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<ThumbUp />}
                      onClick={() => handleLike(decision)}
                    >
                      Like ({decision.likes || 0})
                    </Button>
                    
                    {profileId === decision.user_id && (
                      <Button 
                        size="small" 
                        color="error" 
                        startIcon={<Delete />}
                        onClick={() => handleDelete(decision.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Add Decision Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Share Your REU Decision</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Program Name"
                name="program_name"
                value={formData.program_name}
                onChange={handleChange}
                required
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Major"
                name="major"
                value={formData.major}
                onChange={handleChange}
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
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
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
