import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Avatar,
  Divider,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import { ThumbUp, ArrowBack } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';

function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchUserDecisions();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      setProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserDecisions = async () => {
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setDecisions(data || []);
    } catch (error) {
      console.error('Error fetching user decisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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

  if (loading && !profile) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography>Loading profile...</Typography>
        </Box>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography>User not found</Typography>
          <Button 
            startIcon={<ArrowBack />} 
            onClick={() => navigate(-1)}
            sx={{ mt: 2 }}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate(-1)}
          sx={{ mb: 3 }}
        >
          Back
        </Button>
        
        <Paper sx={{ p: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar 
              src={profile.avatar_url} 
              alt={profile.username || 'User'}
              sx={{ width: 80, height: 80, mr: 3 }}
            />
            <Box>
              <Typography variant="h4" component="h1">
                {profile.username || 'Anonymous'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {profile.bio || 'No bio provided'}
              </Typography>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2}>
            {profile.major && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Major:</Typography>
                <Typography variant="body1">{profile.major}</Typography>
              </Grid>
            )}
            {profile.university && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">University:</Typography>
                <Typography variant="body1">{profile.university}</Typography>
              </Grid>
            )}
            {profile.graduation_year && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Graduation Year:</Typography>
                <Typography variant="body1">{profile.graduation_year}</Typography>
              </Grid>
            )}
          </Grid>
        </Paper>
        
        <Box sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Decisions" />
            <Tab label="Comments" />
          </Tabs>
        </Box>
        
        {activeTab === 0 && (
          <>
            <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
              Recent Decisions
            </Typography>
            
            {decisions.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                  This user hasn't shared any decisions yet.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3}>
                {decisions.map((decision) => (
                  <Grid item xs={12} key={decision.id}>
                    <Card>
                      <CardContent>
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
                      </CardContent>
                      <CardActions>
                        <Typography variant="body2" color="text.secondary">
                          Posted on {new Date(decision.created_at).toLocaleDateString()}
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Button 
                          size="small" 
                          startIcon={<ThumbUp />}
                          disabled
                        >
                          {decision.likes || 0}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
        
        {activeTab === 1 && (
          <>
            <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
              Comments
            </Typography>
            
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1">
                Comments feature coming soon!
              </Typography>
            </Paper>
          </>
        )}
      </Box>
    </Container>
  );
}

export default UserProfile;