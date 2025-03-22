import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Avatar,
  TextField,
  IconButton,
  Divider,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Card,
  CardContent,
  Fade,
  CircularProgress
} from '@mui/material';
import { ThumbUp, ArrowBack, Send } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import md5 from 'md5';

function DecisionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [decision, setDecision] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState(null);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchUserProfile();
      fetchDecision();
      fetchComments();
    }
  }, [currentUser, id]);

  const fetchUserProfile = async () => {
    try {
      // First try to get the profile
      const { data: profile, error: fetchError } = await supabase
        .from('profiles')
        .select('id, email, username, avatar_url')
        .eq('id', currentUser.id)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      
      if (profile) {
        setProfileId(profile.id);
        return;
      }
      
      // If no profile exists, create a new one
      const username = currentUser.email.split('@')[0];
      const avatarUrl = currentUser.user_metadata?.avatar_url || null;
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: currentUser.id,
          email: currentUser.email,
          username: username,
          full_name: currentUser.user_metadata?.full_name || null,
          avatar_url: avatarUrl,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();
        
      if (createError) {
        console.error('Error creating profile:', createError);
        // If we get a conflict error, try to fetch the profile again
        if (createError.code === '23505') {
          const { data: existingProfile, error: retryError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', currentUser.id)
            .single();
            
          if (retryError) throw retryError;
          if (existingProfile) {
            setProfileId(existingProfile.id);
            return;
          }
        }
        throw createError;
      }
      
      if (newProfile) {
        setProfileId(newProfile.id);
      }
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
    }
  };

  const fetchDecision = async () => {
    try {
      const { data, error } = await supabase
        .from('decisions')
        .select(`
          *,
          profiles!decisions_user_id_fkey (
            id,
            email,
            username,
            avatar_url
          ),
          programs!decisions_program_id_fkey (
            id,
            title,
            institution
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Update the decision data
      const decisionData = {
        ...data,
        profiles: {
          ...data.profiles,
          avatar_url: data.profiles?.avatar_url || null
        }
      };
      
      setDecision(decisionData);
    } catch (error) {
      console.error('Error fetching decision:', error);
      navigate('/decisions');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('decision_comments')
        .select(`
          *,
          profiles!decision_comments_user_id_fkey (
            id,
            email,
            username,
            avatar_url
          )
        `)
        .eq('decision_id', id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Update the comment data
      const transformedComments = data.map(comment => ({
        ...comment,
        profiles: {
          ...comment.profiles,
          avatar_url: comment.profiles?.avatar_url || null
        }
      }));
      
      setComments(transformedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Add a subscription to profile changes
  useEffect(() => {
    if (currentUser) {
      const subscription = supabase
        .channel('profile_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles'
          },
          (payload) => {
            console.log('Profile updated:', payload);
            // Refresh the decision and comments to get updated avatars
            fetchDecision();
            fetchComments();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [currentUser]);

  const handleLike = async () => {
    if (!currentUser || !profileId || isLiking) return;
    
    try {
      setIsLiking(true);
      
      // Check if user has already liked this decision
      const { data: existingLike, error: likeCheckError } = await supabase
        .from('decision_likes')
        .select('id')
        .eq('decision_id', decision.id)
        .eq('user_id', profileId)
        .single();
      
      if (likeCheckError && likeCheckError.code !== 'PGRST116') throw likeCheckError;
      
      if (existingLike) {
        // Unlike the decision
        const { error: deleteError } = await supabase
          .from('decision_likes')
          .delete()
          .eq('id', existingLike.id);
        
        if (deleteError) throw deleteError;
      } else {
        // Like the decision
        const { error: insertError } = await supabase
          .from('decision_likes')
          .insert({
            decision_id: decision.id,
            user_id: profileId
          });
        
        if (insertError) throw insertError;
      }
      
      // Update decision likes count
      const { data: likeCount, error: countError } = await supabase
        .from('decision_likes')
        .select('id', { count: 'exact' })
        .eq('decision_id', decision.id);
      
      if (countError) throw countError;
      
      const { error: updateError } = await supabase
        .from('decisions')
        .update({ likes: likeCount.length })
        .eq('id', decision.id);
      
      if (updateError) throw updateError;
      
      await fetchDecision();
    } catch (error) {
      console.error('Error liking decision:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser || !profileId || isCommenting) return;

    try {
      setIsCommenting(true);
      
      const { error } = await supabase
        .from('decision_comments')
        .insert({
          content: newComment.trim(),
          decision_id: decision.id,
          user_id: profileId,
          created_at: new Date().toISOString()
        });
      
      if (error) throw error;
      
      setNewComment('');
      await fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
    } finally {
      setIsCommenting(false);
    }
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!decision) return null;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/decisions')}
        sx={{ mb: 3 }}
      >
        Back to Decisions
      </Button>

      <Card sx={{
        mb: 4,
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        backgroundColor: '#1a237e',
        color: 'white'
      }}>
        <CardContent sx={{ color: 'white', p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar
              src={decision.profiles?.avatar_url}
              sx={{ width: 56, height: 56, mr: 2 }}
            />
            <Box>
              <Typography variant="h6">{decision.profiles?.username}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                {new Date(decision.created_at).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>

          <Typography variant="h4" sx={{ mb: 2 }}>
            {decision.program_name}
          </Typography>
          <Typography variant="h5" sx={{ mb: 2, opacity: 0.9 }}>
            {decision.university}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Chip
              label={`Year: ${decision.year}`}
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '& .MuiChip-label': { color: 'white' }
              }}
            />
            <Chip
              label={`GPA: ${decision.gpa}`}
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '& .MuiChip-label': { color: 'white' }
              }}
            />
            <Chip
              label={decision.decision_type}
              sx={{ 
                backgroundColor: decision.decision_type === 'Accepted' ? '#2e7d32' :
                               decision.decision_type === 'Rejected' ? '#d32f2f' :
                               decision.decision_type === 'Waitlisted' ? '#f57c00' :
                               '#1a237e',
                color: 'white',
                '& .MuiChip-label': { color: 'white' }
              }}
            />
          </Stack>

          <Typography variant="h6" sx={{ mb: 1 }}>Major</Typography>
          <Typography sx={{ mb: 3 }}>{decision.major}</Typography>

          <Typography variant="h6" sx={{ mb: 1 }}>Research Experience</Typography>
          <Typography sx={{ mb: 3 }}>{decision.research_experience}</Typography>

          <Typography variant="h6" sx={{ mb: 1 }}>Thoughts</Typography>
          <Typography sx={{ mb: 3 }}>{decision.thoughts}</Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              startIcon={<ThumbUp />}
              onClick={handleLike}
              disabled={isLiking}
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
              variant="outlined"
            >
              {isLiking ? 'Updating...' : `${decision.likes || 0} Likes`}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Comments</Typography>
        <Box component="form" onSubmit={handleSubmitComment} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            variant="outlined"
            sx={{ mb: 1 }}
            disabled={isCommenting}
          />
          <Button
            type="submit"
            variant="contained"
            endIcon={<Send />}
            disabled={!newComment.trim() || isCommenting}
            sx={{
              backgroundColor: '#ff3d00',
              color: 'white',
              '&:hover': {
                backgroundColor: '#e65100'
              }
            }}
          >
            {isCommenting ? 'Posting...' : 'Post Comment'}
          </Button>
        </Box>

        <List>
          {comments.map((comment, index) => (
            <React.Fragment key={comment.id}>
              {index > 0 && <Divider component="li" />}
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar src={comment.profiles?.avatar_url} />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography component="span" variant="subtitle2">
                      {comment.username}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                        sx={{ display: 'block', mb: 0.5 }}
                      >
                        {comment.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Container>
  );
}

export default DecisionDetail;