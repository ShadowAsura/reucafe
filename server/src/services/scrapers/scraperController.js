const { updateNsfPrograms } = require('./nsfScraper');
const { updateGoogleSheetsPrograms } = require('./googleSheetsScraper');
const { updateSciencePathwaysPrograms } = require('./sciencePathwaysScraper'); // Fixed the import name with 's'
const { updatePathwaysToSciencePrograms } = require('./pathwaysToScienceScraper');
const { updateEtapPrograms } = require('./etapScraper'); // Added new ETAP scraper

// Function to run all scrapers
exports.runAllScrapers = async () => {
  try {
    console.log('Starting all scrapers...');
    
    // Run scrapers in parallel
    const results = await Promise.allSettled([
      updateNsfPrograms(),
      updateGoogleSheetsPrograms(),
      updateSciencePathwaysPrograms(), // Fixed function name with 's'
      updateEtapPrograms() // Added ETAP scraper
    ]);
    
    // Check results
    results.forEach((result, index) => {
      const scraperNames = ['NSF', 'Google Sheets', 'Science Pathways', 'ETAP']; // Added ETAP scraper name
      if (result.status === 'fulfilled') {
        console.log(`${scraperNames[index]} scraper completed successfully`);
      } else {
        console.error(`${scraperNames[index]} scraper failed:`, result.reason);
      }
    });
    
    console.log('All scrapers completed');
    return results;
  } catch (error) {
    console.error('Error running scrapers:', error);
    throw error;
  }
};

// Individual scraper functions
exports.runNsfScraper = async () => {
  try {
    return await updateNsfPrograms();
  } catch (error) {
    console.error('Error running NSF scraper:', error);
    throw error;
  }
};

exports.runGoogleSheetsScraper = async () => {
  try {
    return await updateGoogleSheetsPrograms();
  } catch (error) {
    console.error('Error running Google Sheets scraper:', error);
    throw error;
  }
};

exports.runSciencePathwayScraper = async () => { // Keep this function name for backward compatibility
  try {
    return await updateSciencePathwaysPrograms(); // Call the correct function
  } catch (error) {
    console.error('Error running Science Pathways scraper:', error);
    throw error;
  }
};

exports.runEtapScraper = async () => {
  try {
    return await updateEtapPrograms();
  } catch (error) {
    console.error('Error running ETAP scraper:', error);
    throw error;
  }
};