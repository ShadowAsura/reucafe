const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { updateGoogleSheetsPrograms } = require('../services/scrapers/googleSheetsScraper');
const { updateSciencePathwaysPrograms } = require('../services/scrapers/sciencePathwaysScraper');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Admin dashboard - get program statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total count of programs
    const { count: totalCount, error: countError } = await supabase
      .from('programs')
      .count();

    if (countError) throw countError;

    // Get count by source
    const { data: sourceData, error: sourceError } = await supabase
      .from('programs')
      .select('source')
      .not('source', 'is', null);

    if (sourceError) throw sourceError;

    const sourceStats = sourceData.reduce((acc, curr) => {
      acc[curr.source] = (acc[curr.source] || 0) + 1;
      return acc;
    }, {});

    // Get count by field
    const { data: fieldData, error: fieldError } = await supabase
      .from('programs')
      .select('field');

    if (fieldError) throw fieldError;

    const fieldStats = fieldData.reduce((acc, curr) => {
      if (Array.isArray(curr.field)) {
        curr.field.forEach(field => {
          acc[field] = (acc[field] || 0) + 1;
        });
      }
      return acc;
    }, {});

    // Get count of recently added/updated programs
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { count: recentlyAdded, error: recentAddedError } = await supabase
      .from('programs')
      .select('id', { count: 'exact' })
      .gte('created_at', last24Hours);

    if (recentAddedError) throw recentAddedError;

    const { count: recentlyUpdated, error: recentUpdatedError } = await supabase
      .from('programs')
      .select('id', { count: 'exact' })
      .gte('updated_at', last24Hours);

    if (recentUpdatedError) throw recentUpdatedError;

    res.json({
      totalCount,
      sourceStats: Object.entries(sourceStats).map(([source, count]) => ({
        _id: source,
        count
      })),
      fieldStats: Object.entries(fieldStats).map(([field, count]) => ({
        _id: field,
        count
      })),
      recentlyAdded,
      recentlyUpdated
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

// Trigger scrapers manually
router.post('/run-scrapers', async (req, res) => {
  try {
    // Start scrapers in the background
    res.json({ message: 'Scrapers started in the background' });
    
    // Run scrapers after sending response
    console.log('Starting scrapers manually...');
    
    try {
      console.log('\n--- Google Sheets Scraper ---');
      await updateGoogleSheetsPrograms();
      console.log('Google Sheets scraper completed');
    } catch (error) {
      console.error('Error running Google Sheets scraper:', error);
    }
    
    try {
      console.log('\n--- Science Pathways Scraper ---');
      await updateSciencePathwaysPrograms();
      console.log('Science Pathways scraper completed');
    } catch (error) {
      console.error('Error running Science Pathways scraper:', error);
    }
    
    console.log('All scrapers completed');
  } catch (error) {
    console.error('Error starting scrapers:', error);
    res.status(500).json({ error: 'Failed to start scrapers' });
  }
});

// Get the most recently updated programs
router.get('/recent-programs', async (req, res) => {
  try {
    const { data: recentPrograms, error } = await supabase
      .from('programs')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    
    res.json(recentPrograms);
  } catch (error) {
    console.error('Error fetching recent programs:', error);
    res.status(500).json({ error: 'Failed to fetch recent programs' });
  }
});

// Get server logs
router.get('/logs', async (req, res) => {
  try {
    const logLevel = req.query.level || 'all';
    const logDir = path.join(__dirname, '../../logs');
    let logContent = '';
    
    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
      fs.writeFileSync(path.join(logDir, 'server.log'), 'Log file created\n');
      fs.writeFileSync(path.join(logDir, 'error.log'), 'Error log file created\n');
      fs.writeFileSync(path.join(logDir, 'scraper.log'), 'Scraper log file created\n');
    }
    
    // Determine which log file to read based on the requested level
    let logFile = 'server.log';
    
    if (logLevel === 'error') {
      logFile = 'error.log';
    } else if (logLevel === 'scraper') {
      logFile = 'scraper.log';
    }
    
    const logPath = path.join(logDir, logFile);
    
    // Check if log file exists
    if (fs.existsSync(logPath)) {
      // Read the last 500 lines of the log file
      const data = fs.readFileSync(logPath, 'utf8');
      const lines = data.split('\n');
      const lastLines = lines.slice(-500).join('\n');
      logContent = lastLines;
    } else {
      logContent = `Log file ${logFile} does not exist yet.`;
    }
    
    res.send(logContent);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).send('Error fetching logs: ' + error.message);
  }
});

module.exports = router;