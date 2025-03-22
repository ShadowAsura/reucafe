import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  Alert,
  Avatar,
  Grid,
  Divider
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { setupStorage } from '../utils/supabaseStorage';

function Profile() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    avatar_url: '',
    bio: '',
    institution: '',
    field_of_study: '',
    research_interests: '',
    website: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileId, setProfileId] = useState(null);

  useEffect(() => {
    if (currentUser) {
      // Set up storage when component mounts
      setupStorage().catch(error => {
        console.error('Error setting up storage:', error);
        setMessage({
          type: 'warning',
          text: 'Avatar upload may not be available. Please contact support if you need to upload an avatar.'
        });
      });
      
      // Check if the profiles table exists and get its structure
      checkProfilesTable();
    }
  }, [currentUser]);

  const checkProfilesTable = async () => {
    try {
      console.log("Current user:", currentUser);
      
      // Check if we can access the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);

      console.log("Profiles table check:", data, error);

      if (error) {
        // Log the full error object for debugging
        console.error("Error checking profiles table:", JSON.stringify(error));
        setMessage({
          type: 'error',
          text: `Unable to access profile data: ${error.message || 'Unknown error'}`
        });
        return;
      }

      // If we get here, the table exists, so try to find the user's profile
      findUserProfile();
    } catch (error) {
      console.error("Error in checkProfilesTable:", error);
      setMessage({
        type: 'error',
        text: 'System error. Please try again later.'
      });
    }
  };

  const findUserProfile = async () => {
    try {
      console.log("Looking for profile with email:", currentUser.email);
      
      // Try to find a profile with a matching email
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', currentUser.email);
      
      console.log("Profile search result:", data, error);

      if (error) {
        // Log the full error object for debugging
        console.error("Error finding profile:", JSON.stringify(error));
        throw error;
      }

      if (data && data.length > 0) {
        // Found a profile
        const profile = data[0];
        console.log("Found existing profile:", profile);
        setProfileId(profile.id);
        
        // Update form data with profile values
        setFormData({
          full_name: profile.full_name || '',
          username: profile.username || '',
          avatar_url: profile.avatar_url || '',
          bio: profile.bio || '',
          institution: profile.institution || '',
          field_of_study: profile.field_of_study || '',
          research_interests: profile.research_interests || '',
          website: profile.website || ''
        });
      } else {
        // No profile found, create a new one
        createNewProfile();
      }
    } catch (error) {
      console.error("Error in findUserProfile:", error);
      setMessage({
        type: 'error',
        text: `Failed to load profile: ${error.message || 'Unknown error'}`
      });
    }
  };

  const createNewProfile = async () => {
    try {
      console.log("Creating new profile for user:", currentUser.email);
      
      // Create a new profile with basic info - using a simpler approach
      // Note: We're not setting the ID as it's auto-generated
      const newProfile = {
        email: currentUser.email,
        username: currentUser.email?.split('@')[0] || '',
        full_name: currentUser.email?.split('@')[0] || ''
      };
      
      console.log("Attempting to insert profile:", newProfile);
      
      // First, check if we have permission to insert
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
        
      console.log("Permission test:", testData, testError);
      
      if (testError) {
        console.error("Permission test error:", JSON.stringify(testError));
        throw new Error(`Permission issue: ${testError.message}`);
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(newProfile)
        .select();

      if (error) {
        // Log the full error object for debugging
        console.error("Profile creation error:", JSON.stringify(error));
        throw error;
      }
      
      console.log("New profile created:", data);
      
      if (data && data.length > 0) {
        setProfileId(data[0].id);
        setFormData({
          ...formData,
          username: data[0].username || '',
          full_name: data[0].full_name || ''
        });
        
        setMessage({
          type: 'success',
          text: 'New profile created! You can now update your information.'
        });
      } else {
        throw new Error("Profile created but no data returned");
      }
    } catch (error) {
      console.error("Error in createNewProfile:", error);
      
      // Show a more user-friendly message
      setMessage({
        type: 'error',
        text: 'Unable to create profile. This might be due to permission settings. Please contact support.'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!profileId) {
      setMessage({
        type: 'error',
        text: 'Profile not found. Please refresh the page and try again.'
      });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      console.log("Updating profile ID:", profileId);
      console.log("Form data:", formData);
      
      // Build an update object with only the fields that exist
      const updateData = {};
      
      // Always include these basic fields
      if (formData.full_name) updateData.full_name = formData.full_name;
      if (formData.username) updateData.username = formData.username;
      
      // Include optional fields if they have values
      if (formData.bio) updateData.bio = formData.bio;
      if (formData.institution) updateData.institution = formData.institution;
      if (formData.field_of_study) updateData.field_of_study = formData.field_of_study;
      if (formData.research_interests) updateData.research_interests = formData.research_interests;
      if (formData.website) updateData.website = formData.website;
      
      console.log("Update data:", updateData);
      
      // Update profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profileId);

      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
      }

      console.log("Profile updated successfully");
      
      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      // Create a unique filename using the current user's ID
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('Starting upload process...');
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: file.size,
        path: filePath,
        userId: currentUser.id
      });

      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      // Update the avatar_url in the profiles table using the current user's ID
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', currentUser.id)
        .select();

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw updateError;
      }

      if (!updateData || updateData.length === 0) {
        console.error('No profile found with ID:', currentUser.id);
        throw new Error('Profile not found. Please try refreshing the page.');
      }

      console.log('Profile updated successfully:', updateData[0]);

      // Update local state
      setFormData(prev => ({
        ...prev,
        avatar_url: publicUrl
      }));

      // Dispatch event to refresh profile in Navbar
      window.dispatchEvent(new Event('profileUpdated'));

      setMessage({
        type: 'success',
        text: 'Avatar updated successfully!'
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Error uploading avatar'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!currentUser) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ my: 4 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Please log in to view your profile
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              href="/login"
              sx={{ mt: 2 }}
            >
              Go to Login
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Your Profile
          </Typography>

          {message.text && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                src={formData.avatar_url} 
                alt={formData.full_name}
                sx={{ width: 100, height: 100 }}
              />
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                onChange={handleAvatarUpload}
              />
              <label htmlFor="avatar-upload">
                <Button
                  variant="outlined"
                  component="span"
                  size="small"
                  sx={{ 
                    position: 'absolute', 
                    bottom: -10, 
                    right: -10,
                    borderRadius: '50%',
                    minWidth: '30px',
                    width: '30px',
                    height: '30px',
                    p: 0
                  }}
                >
                  +
                </Button>
              </label>
            </Box>
          </Box>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="full_name"
                  label="Full Name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="bio"
                  label="Bio"
                  name="bio"
                  multiline
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Academic Information
                  </Typography>
                </Divider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="institution"
                  label="Institution"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="field_of_study"
                  label="Field of Study"
                  name="field_of_study"
                  value={formData.field_of_study}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="research_interests"
                  label="Research Interests"
                  name="research_interests"
                  multiline
                  rows={2}
                  value={formData.research_interests}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="website"
                  label="Website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Profile;