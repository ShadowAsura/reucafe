const { updateSciencePathwaysPrograms } = require('../services/scrapers/sciencePathwaysScraper');
const { updateNsfPrograms } = require('../services/scrapers/nsfScraper');

// Controller to handle scraper operations
exports.runScraper = async (req, res) => {
  try {
    const { source } = req.params;
    let result;
    
    console.log(`Starting scraper for source: ${source}`);
    
    switch (source) {
      case 'sciencepathways':
        result = await updateSciencePathwaysPrograms();
        break;
      case 'nsf':
        result = await updateNsfPrograms();
        break;
      default:
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid source. Available sources: sciencepathways, nsf' 
        });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: `Successfully scraped ${result.length} programs from ${source}`,
      count: result.length
    });
  } catch (error) {
    console.error(`Error running scraper: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: `Error running scraper: ${error.message}` 
    });
  }
};

// Get scraper status - placeholder for future implementation
exports.getScraperStatus = async (req, res) => {
  try {
    return res.status(200).json({ 
      success: true, 
      status: 'idle',
      lastRun: new Date().toISOString(),
      message: 'Scraper is currently idle'
    });
  } catch (error) {
    console.error(`Error getting scraper status: ${error.message}`);
    return res.status(500).json({ 
      success: false, 
      message: `Error getting scraper status: ${error.message}` 
    });
  }
};