const { updateAllPrograms, addManualPrograms } = require('../services/scraper');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reucafe')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Run scrapers
const runScrapers = async () => {
  try {
    console.log('Starting manual scraper run...');
    
    // Run web scrapers
    const result = await updateAllPrograms();
    console.log(`NSF Programs: ${result.nsfPrograms.length}`);
    console.log(`Science Pathways Programs: ${result.sciencePathwaysPrograms.length}`);
    
    // Add manual programs
    const manualPrograms = await addManualPrograms();
    console.log(`Manual Programs: ${manualPrograms.length}`);
    
    console.log('Scraping completed successfully');
    console.log(`Total Programs: ${result.nsfPrograms.length + result.sciencePathwaysPrograms.length + manualPrograms.length}`);
    
    // Disconnect from MongoDB before exiting
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Error running scrapers:', error);
    
    // Attempt to disconnect from MongoDB even if there was an error
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (disconnectError) {
      console.error('Error disconnecting from MongoDB:', disconnectError);
    }
    
    process.exit(1);
  }
};

runScrapers();