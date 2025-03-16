import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { useReu } from '../context/ReuContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function SuggestReu() {
  const { submitReuSuggestion } = useReu();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    institution: '',
    description: '',
    link: '',
    additionalInfo: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Handle form input changes
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
  
  // Validate form inputs
  const validate = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.institution.trim()) newErrors.institution = 'Institution is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.link && !/^https?:\/\/.+/.test(formData.link)) {
      newErrors.link = 'Link must be a valid URL starting with http:// or https://';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to suggest an REU program.');
      navigate('/login');
      return;
    }
    
    if (!validate()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await submitReuSuggestion({
        ...formData,
        source: 'User Suggestion'
      });
      
      if (result) {
        setSuccess(true);
        // Reset form after successful submission
        setFormData({
          title: '',
          institution: '',
          description: '',
          link: '',
          additionalInfo: ''
        });
      } else {
        setError('Failed to submit your suggestion. Please try again later.');
      }
    } catch (err) {
      console.error('Error submitting REU suggestion:', err);
      setError(err.message || 'Failed to submit your suggestion. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Suggest an REU Program
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Thank you for your suggestion! Our team will review it shortly.
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Program Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Institution"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                error={!!errors.institution}
                helperText={errors.institution}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Program Description"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Program Website URL"
                name="link"
                placeholder="https://example.com"
                value={formData.link}
                onChange={handleChange}
                error={!!errors.link}
                helperText={errors.link || "Please include the full URL starting with http:// or https://"}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Information"
                name="additionalInfo"
                multiline
                rows={3}
                value={formData.additionalInfo}
                onChange={handleChange}
                placeholder="Any additional details about the program, application deadlines, etc."
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Suggestion'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}

export default SuggestReu;