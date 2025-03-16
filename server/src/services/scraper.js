// Main scraper file that exports all scraper functionality
const scrapers = require('./scrapers');

// Export all scraper functions
module.exports = {
  updateNsfPrograms: scrapers.updateNsfPrograms,
  updateSciencePathwaysPrograms: scrapers.updateSciencePathwaysPrograms,
  updateAllPrograms: scrapers.updateAllPrograms,
  addManualPrograms: scrapers.addManualPrograms
};