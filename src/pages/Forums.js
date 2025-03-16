import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  TextField,
  MenuItem,
  Paper,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton
} from '@mui/material';
import { 
  Search, 
  Comment, 
  Favorite, 
  Share,
  ArrowUpward,
  Category
} from '@mui/icons-material';

// Mock data for development
const mockThreads = [
  {
    id: 1,
    title: 'Tips for Writing Strong REU Applications',
    author: 'ResearchPro',
    category: 'Application Tips',
    date: '2023-08-15',
    comments: 25,
    likes: 42,
    views: 156,
    preview: 'Here are some key strategies I\'ve learned from successfully applying to multiple REU programs...'
  },
  {
    id: 2,
    title: 'My Experience at MIT Physics REU',
    author: 'PhysicsStudent',
    category: 'Success Stories',
    date: '2023-08-14',
    comments: 18,
    likes: 35,
    views: 128,
    preview: 'I wanted to share my amazing experience at the MIT Physics REU this summer...'
  },
  // Add more mock threads as needed...
];

const categories = [
  'All Categories',
  'Application Tips',
  'Success Stories',
  'Program Questions',
  'General Discussion',
  'Research Topics'
];

function Forums() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  const filteredThreads = mockThreads.filter(thread => {
    return (
      (searchTerm === '' || 
        thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.author.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoryFilter === 'All Categories' || thread.category === categoryFilter)
    );
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          REU Discussion Forums
        </Typography>
        <Typography variant="body1" paragraph>
          Connect with other students, share experiences, and get advice about REU programs.
        </Typography>

        {/* Filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Search Discussions"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search color="action" sx={{ mr: 1 }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Paper>

        {/* Create New Thread Button */}
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Comment />}
          >
            Start New Discussion
          </Button>
        </Box>

        {/* Threads List */}
        <List>
          {filteredThreads.map((thread) => (
            <React.Fragment key={thread.id}>
              <Paper sx={{ mb: 2 }}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Avatar>{thread.author[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                          {thread.title}
                        </Typography>
                        <Chip 
                          icon={<Category />} 
                          label={thread.category} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {thread.preview}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Posted by {thread.author} on {thread.date}
                          </Typography>
                          <Box sx={{ flexGrow: 1 }} />
                          <IconButton size="small">
                            <Comment fontSize="small" />
                          </IconButton>
                          <Typography variant="caption">{thread.comments}</Typography>
                          <IconButton size="small">
                            <Favorite fontSize="small" />
                          </IconButton>
                          <Typography variant="caption">{thread.likes}</Typography>
                          <IconButton size="small">
                            <Share fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              </Paper>
            </React.Fragment>
          ))}
        </List>

        {filteredThreads.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No discussions found matching your criteria.
            </Typography>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default Forums;