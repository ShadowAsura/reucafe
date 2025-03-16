const mongoose = require('mongoose');
const { updateGoogleSheetsPrograms } = require('../services/scrapers/googleSheetsScraper');
require('dotenv').config();

async function testScraper() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Run the Google Sheets scraper
    console.log('Starting Google Sheets scraper test...');
    const programs = await updateGoogleSheetsPrograms();
    
    console.log(`Successfully scraped ${programs.length} programs from Google Sheets`);
    
    // Print the first 3 programs as a sample
    console.log('\nSample of scraped programs:');
    programs.slice(0, 3).forEach((program, index) => {
      console.log(`\n--- Program ${index + 1} ---`);
      console.log(`Title: ${program.title}`);
      console.log(`Institution: ${program.institution}`);
      console.log(`Field: ${program.field}`);
      console.log(`Deadline: ${program.deadline}`);
    });

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    console.log('\nScraper test completed successfully!');
  } catch (error) {
    console.error('Error testing scraper:', error);
  }
}

testScraper();