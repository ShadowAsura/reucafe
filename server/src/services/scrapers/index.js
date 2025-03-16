const nsfScraper = require('./nsfScraper');
const pathwaysToScienceScraper = require('./pathwaysToScienceScraper');
const googleSheetsScraper = require('./googleSheetsScraper');

module.exports = {
  updateNsfPrograms: nsfScraper.updateNsfPrograms,
  updatePathwaysToSciencePrograms: pathwaysToScienceScraper.updatePathwaysToSciencePrograms,
  updateGoogleSheetsPrograms: googleSheetsScraper.updateGoogleSheetsPrograms
};