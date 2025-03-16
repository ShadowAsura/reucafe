import React from 'react';
import { Container, Typography, Paper, Box, Divider, List, ListItem, ListItemText } from '@mui/material';

const PatchNotes = () => {
  const patchNotes = [
    {
      date: '2025-03-15',
      version: '1.1.0',
      author: 'REUCafe Team',
      changes: [
        'Fixed and improved scrapers for more reliable program data collection',
        'Added ETAP NSF scraper for more programs',
        'Implemented auto sort by deadline date',
        'Added anonymous user functionality similar to GradCafe for privacy-conscious users',
        'Coming soon: GitHub repository release for open-source contributions',
        'Coming soon: Application tracker to help manage your program applications'
      ]
    },
    {
      date: '2025-03-10',
      version: '1.0.0',
      author: 'REUCafe Team',
      changes: [
        'Initial release of REU Cafe',
        'Browse and search REU programs across various institutions',
        'Filter programs by research field and deadline',
        'User account system with profile management',
      ]
    }
    // Add more updates here when new versions are released
  ];

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: '#f6f8fa' }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontFamily: '"Roboto Mono", monospace', 
            fontWeight: 600,
            color: '#1a237e'
          }}
        >
          Patch Notes
        </Typography>
        <Typography 
          variant="subtitle1" 
          paragraph 
          sx={{ 
            color: '#586069',
            fontFamily: '"Roboto Mono", monospace',
          }}
        >
          Track the latest updates and improvements to REU Cafe
        </Typography>
      </Paper>
      
      {patchNotes.map((note, index) => (
        <Paper 
          key={index} 
          elevation={1} 
          sx={{ 
            mt: 3, 
            p: 3, 
            borderRadius: 2,
            border: '1px solid #e1e4e8',
            boxShadow: 'none'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography 
                variant="h6" 
                component="h2"
                sx={{ 
                  fontFamily: '"Roboto Mono", monospace',
                  fontWeight: 600,
                  color: '#1a237e'
                }}
              >
                Version {note.version}
              </Typography>
              <Typography 
                variant="subtitle2" 
                color="text.secondary"
                sx={{ 
                  fontFamily: '"Roboto Mono", monospace',
                }}
              >
                {note.date} • {note.author}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <List sx={{ pl: 2 }}>
            {note.changes.map((change, changeIndex) => (
              <ListItem 
                key={changeIndex} 
                sx={{ 
                  display: 'list-item',
                  listStyleType: 'disc',
                  py: 0.5,
                  px: 0
                }}
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{ 
                        fontFamily: '"Roboto Mono", monospace',
                        color: '#24292e'
                      }}
                    >
                      {change}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      ))}
    </Container>
  );
};

export default PatchNotes;