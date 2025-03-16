import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper,
  Grid,
  MenuItem,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Snackbar,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitResult } from '../services/database';

// Application status options
const statusOptions = [
  'Accepted',
  'Rejected',
  'Waitlisted',
  'Withdrawn',
  'No Response'
];

// Fields of study
const fields = [
  'Physics',
  'Chemistry',
  'Computer Science',
  'Biology',
  'Mathematics',
  'Engineering',
  'Astronomy',
  'Neuroscience',
  'Environmental Science',
  'Psychology',
  'Other'
];

const years = ['Freshman', 'Sophomore', 'Junior', 'Senior'];
const statuses = ['Accepted', 'Rejected', 'Waitlisted', 'Interview', 'Pending'];

function SubmitResult() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    programName: '',
    institution: '',
    field: '',
    year: new Date().getFullYear(),
    status: '',
    gpa: '',
    major: '',
    classStanding: '',
    hasResearchExperience: false,
    comments: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
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
  
  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value === 'true'
    });
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.programName.trim()) newErrors.programName = 'Program name is required';
    if (!formData.institution.trim()) newErrors.institution = 'Institution is required';
    if (!formData.field) newErrors.field = 'Field is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.major.trim()) newErrors.major = 'Major is required';
    if (!formData.classStanding.trim()) newErrors.classStanding = 'Class standing is required';
    
    if (formData.gpa && (isNaN(formData.gpa) || formData.gpa < 0 || formData.gpa > 4.0)) {
      newErrors.gpa = 'GPA must be a number between 0 and 4.0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('You must be logged in to submit a result');
      return;
    }
    
    if (!validate()) return;
    
    setLoading(true);
    setError('');
    
    try {
      await submitResult(formData, currentUser.uid);
      setSuccess(true);
      
      // Reset form after successful submission
      setFormData({
        programName: '',
        institution: '',
        field: '',
        year: new Date().getFullYear(),
        status: '',
        gpa: '',
        major: '',
        classStanding: '',
        hasResearchExperience: false,
        comments: ''
      });
      
      // Redirect to results page after a short delay
      setTimeout(() => {
        navigate('/results');
      }, 2000);
    } catch (err) {
      console.error('Error submitting result:', err);
      setError('Failed to submit result. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSuccess(false);
  };
  
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Submit Application Result
        </Typography>
        <Typography variant="body1" paragraph>
          Share your REU application outcome to help other students. All submissions are anonymous.
        </Typography>
        
        <Paper sx={{ p: 3, mt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="h6" gutterBottom>
              Program Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="programName"
                  name="programName"
                  label="Program Name"
                  value={formData.programName}
                  onChange={handleChange}
                  error={!!errors.programName}
                  helperText={errors.programName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="institution"
                  name="institution"
                  label="Institution"
                  value={formData.institution}
                  onChange={handleChange}
                  error={!!errors.institution}
                  helperText={errors.institution}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  select
                  fullWidth
                  id="field"
                  name="field"
                  label="Field of Study"
                  value={formData.field}
                  onChange={handleChange}
                  error={!!errors.field}
                  helperText={errors.field}
                >
                  {fields.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  select
                  fullWidth
                  id="status"
                  name="status"
                  label="Application Status"
                  value={formData.status}
                  onChange={handleChange}
                  error={!!errors.status}
                  helperText={errors.status}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="year"
                  name="year"
                  label="Application Year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  InputProps={{ inputProps: { min: 2000, max: 2100 } }}
                />
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Applicant Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="major"
                  name="major"
                  label="Major"
                  value={formData.major}
                  onChange={handleChange}
                  error={!!errors.major}
                  helperText={errors.major}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="classStanding"
                  name="classStanding"
                  label="Class Standing (e.g., Sophomore, Junior)"
                  value={formData.classStanding}
                  onChange={handleChange}
                  error={!!errors.classStanding}
                  helperText={errors.classStanding}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="gpa"
                  name="gpa"
                  label="GPA (out of 4.0)"
                  type="number"
                  inputProps={{ step: 0.01, min: 0, max: 4.0 }}
                  value={formData.gpa}
                  onChange={handleChange}
                  error={!!errors.gpa}
                  helperText={errors.gpa}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Previous Research Experience?</FormLabel>
                  <RadioGroup
                    row
                    name="hasResearchExperience"
                    value={formData.hasResearchExperience.toString()}
                    onChange={handleRadioChange}
                  >
                    <FormControlLabel value="true" control={<Radio />} label="Yes" />
                    <FormControlLabel value="false" control={<Radio />} label="No" />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="comments"
                  name="comments"
                  label="Additional Comments"
                  multiline
                  rows={4}
                  value={formData.comments}
                  onChange={handleChange}
                  placeholder="Share any additional information about your application or experience (optional)"
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="button"
                variant="outlined"
                sx={{ mr: 2 }}
                onClick={() => navigate(-1)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Submit Result'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
      
      <Snackbar
        open={success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Result submitted successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default SubmitResult;