const mongoose = require('mongoose');
const { updateGoogleSheetsPrograms } = require('../services/scrapers/googleSheetsScraper');
require('dotenv').config();

// Check if NSF scraper exists and import it if it does
let nsfScraper;
try {
  nsfScraper = require('../services/scrapers/nsfScraper');
} catch (error) {
  console.log('NSF scraper module not found, skipping...');
}

// Check if Science Pathways scraper exists and import it if it does
let sciencePathwaysScraper;
try {
  sciencePathwaysScraper = require('../services/scrapers/sciencePathwaysScraper');
} catch (error) {
  console.log('Science Pathways scraper module not found, skipping...');
}

async function runAllScrapers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Run all scrapers
    console.log('Starting all scrapers...');
    
    // Run NSF scraper if available
    if (nsfScraper && typeof nsfScraper.updateNSFREUPrograms === 'function') {
      console.log('\n--- NSF Scraper ---');
      await nsfScraper.updateNSFREUPrograms();
    } else {
      console.log('\n--- NSF Scraper ---');
      console.log('NSF scraper not available or not properly exported');
    }
    
    // Run Google Sheets scraper
    console.log('\n--- Google Sheets Scraper ---');
    await updateGoogleSheetsPrograms();
    
    // Run Science Pathways scraper if available
    if (sciencePathwaysScraper && typeof sciencePathwaysScraper.updateSciencePathwaysPrograms === 'function') {
      console.log('\n--- Science Pathways Scraper ---');
      await sciencePathwaysScraper.updateSciencePathwaysPrograms();
    } else {
      console.log('\n--- Science Pathways Scraper ---');
      console.log('Science Pathways scraper not available or not properly exported');
    }
    
    console.log('\nAll scrapers completed successfully!');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error running scrapers:', error);
    process.exit(1);
  }
}

runAllScrapers();