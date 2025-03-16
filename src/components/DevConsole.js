import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  Divider, 
  List, 
  ListItem, 
  ListItemText,
  Collapse,
  IconButton
} from '@mui/material';
import { ExpandMore, ExpandLess, Code } from '@mui/icons-material';
import { seedProgramSuggestions } from '../utils/seedData';
import { scrapeNsfReus, scrapeSciencePathwaysReus } from '../services/reuService';

function DevConsole() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState([]);

  const toggleConsole = () => {
    setOpen(!open);
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { message, type, timestamp }]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const handleSeedData = async () => {
    addLog('Starting to seed program suggestions...', 'info');
    try {
      await seedProgramSuggestions();
      addLog('Successfully seeded program suggestions!', 'success');
    } catch (error) {
      addLog(`Error seeding data: ${error.message}`, 'error');
    }
  };

  const handleTestNsfScraping = async () => {
    addLog('Testing NSF REU scraping...', 'info');
    try {
      const programs = await scrapeNsfReus();
      addLog(`Successfully fetched ${programs.length} NSF programs!`, 'success');
    } catch (error) {
      addLog(`Error scraping NSF: ${error.message}`, 'error');
    }
  };

  const handleTestSciencePathwaysScraping = async () => {
    addLog('Testing Science Pathways REU scraping...', 'info');
    try {
      const programs = await scrapeSciencePathwaysReus();
      addLog(`Successfully fetched ${programs.length} Science Pathways programs!`, 'success');
    } catch (error) {
      addLog(`Error scraping Science Pathways: ${error.message}`, 'error');
    }
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 0, right: 20, zIndex: 1000 }}>
      <IconButton 
        onClick={toggleConsole} 
        color="primary" 
        sx={{ 
          bgcolor: 'background.paper', 
          boxShadow: 2,
          '&:hover': { bgcolor: 'background.paper' }
        }}
      >
        <Code />
      </IconButton>
      
      <Collapse in={open}>
        <Paper 
          sx={{ 
            p: 2, 
            mt: 1, 
            width: 400, 
            maxHeight: 400, 
            overflow: 'auto',
            boxShadow: 3
          }}
        >
          <Typography variant="h6" gutterBottom>
            Development Console
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ mb: 2 }}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleSeedData}
              sx={{ mr: 1, mb: 1 }}
            >
              Seed Test Data
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleTestNsfScraping}
              sx={{ mr: 1, mb: 1 }}
            >
              Test NSF Scraping
            </Button>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={handleTestSciencePathwaysScraping}
              sx={{ mr: 1, mb: 1 }}
            >
              Test Science Pathways
            </Button>
            <Button 
              variant="outlined" 
              color="secondary" 
              size="small" 
              onClick={clearLogs}
              sx={{ mb: 1 }}
            >
              Clear Logs
            </Button>
          </Box>
          
          <Typography variant="subtitle2" gutterBottom>
            Console Output:
          </Typography>
          <List dense sx={{ bgcolor: '#f5f5f5', borderRadius: 1, p: 1 }}>
            {logs.length === 0 ? (
              <ListItem>
                <ListItemText 
                  primary="No logs yet. Run a test function to see output." 
                  primaryTypographyProps={{ color: 'text.secondary', fontSize: 14 }}
                />
              </ListItem>
            ) : (
              logs.map((log, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemText 
                    primary={`[${log.timestamp}] ${log.message}`}
                    primaryTypographyProps={{ 
                      color: log.type === 'error' ? 'error.main' : 
                             log.type === 'success' ? 'success.main' : 
                             'text.primary',
                      fontSize: 14
                    }}
                  />
                </ListItem>
              ))
            )}
          </List>
        </Paper>
      </Collapse>
    </Box>
  );
}

export default DevConsole;