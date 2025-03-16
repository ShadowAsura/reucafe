import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper,
  Link,
  Grid,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { generateUsername } from '../utils/usernameGenerator';
import RefreshIcon from '@mui/icons-material/Refresh';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '' // Add username field
  });
  const [useRandomUsername, setUseRandomUsername] = useState(true); // Add state for toggle
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { signup } = useAuth();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Add function to generate and set random username
  const generateRandomUsername = () => {
    const randomUsername = generateUsername();
    setFormData({
      ...formData,
      username: randomUsername
    });
  };
  
  // Generate a random username when component mounts or when toggle is switched on
  useEffect(() => {
    if (useRandomUsername) {
      generateRandomUsername();
    }
  }, [useRandomUsername]);
  
  // Handle toggle change
  const handleToggleChange = (e) => {
    setUseRandomUsername(e.target.checked);
    if (!e.target.checked) {
      // Clear username when switching to manual entry
      setFormData({
        ...formData,
        username: ''
      });
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    // Add username validation
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Register user with Supabase Auth
      const { data: authData, error: authError } = await signup(formData.email, formData.password);
      
      // Log the response for debugging
      console.log("Signup response:", authData);
      
      if (authError) throw authError;
      
      // Don't throw an error if user is null - this is expected with Supabase
      // when email confirmation is required
      const user = authData?.user;
      
      // If we have a user, try to create a profile
      if (user) {
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              avatar_url: '',
              username: formData.username,
              updated_at: new Date().toISOString()
            }]);
    
          if (profileError) {
            console.warn("Profile creation error:", profileError);
            // Don't throw the error, just log it
          }
        } catch (profileErr) {
          console.warn("Profile creation exception:", profileErr);
          // Don't let profile errors affect registration success
        }
      }
    
      // Set success and clear any existing error
      setSuccess(true);
      setError('');
      
      // Navigate to login page after successful registration
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Registration successful! Please log in with your credentials.' } 
        });
      }, 1500);
    } catch (err) {

    } finally {
      setLoading(false);
    }
  };
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Create Account
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Registration successful! Redirecting to login page...
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Add username field with toggle and refresh button */}
            <FormControlLabel
              control={
                <Switch
                  checked={useRandomUsername}
                  onChange={handleToggleChange}
                  name="useRandomUsername"
                  color="primary"
                />
              }
              label="Use random username"
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                disabled={loading || useRandomUsername}
                sx={{ mr: 1 }}
              />
              
              {useRandomUsername && (
                <Button 
                  variant="outlined" 
                  onClick={generateRandomUsername}
                  disabled={loading}
                  sx={{ mt: 2, minWidth: 'auto' }}
                >
                  <RefreshIcon />
                </Button>
              )}
            </Box>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || success}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component={RouterLink} to="/login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Register;