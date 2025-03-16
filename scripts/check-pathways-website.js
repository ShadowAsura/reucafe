const axios = require('axios');
const cheerio = require('cheerio');

async function checkWebsite() {
  console.log('Checking Pathways to Science website...');
  
  try {
    // Use the same URL as in the scraper
    const url = 'https://www.pathwaystoscience.org/programs.aspx?u=Undergrads_Undergraduate+Students&sm=&sd=REU_NSF+Research+Experience+for+Undergraduates&i=&fp=&dd=&ft=&submit=y&sort=';
    
    console.log(`Fetching content from: ${url}`);
    
    // Use browser-like headers
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
    
    console.log(`Response status: ${response.status}`);
    console.log(`Content length: ${response.data.length} characters`);
    
    // Load HTML into cheerio
    const $ = cheerio.load(response.data);
    
    // Check for program listings
    const programElements = $('.programlisting');
    console.log(`Found ${programElements.length} program elements with class 'programlisting'`);
    
    // Check for alternative selectors
    const alternativeSelectors = [
      '.program-listing',
      '.program',
      '.views-row',
      '.result-item'
    ];
    
    for (const selector of alternativeSelectors) {
      const elements = $(selector);
      console.log(`Selector '${selector}': found ${elements.length} elements`);
    }
    
    // Look for any links containing 'program' or 'reu'
    const programLinks = $('a').filter((i, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text() || '';
      return href.toLowerCase().includes('program') || 
             text.toLowerCase().includes('program') ||
             href.toLowerCase().includes('reu') || 
             text.toLowerCase().includes('reu');
    });
    
    console.log(`Found ${programLinks.length} links related to programs or REU`);
    
    if (programLinks.length > 0) {
      console.log('\nSample program links:');
      programLinks.slice(0, 5).each((i, el) => {
        console.log(`${i+1}. Text: "${$(el).text().trim()}", URL: ${$(el).attr('href')}`);
      });
    }
    
    // Check if the website structure has changed significantly
    console.log('\nAnalyzing page structure:');
    const bodyClasses = $('body').attr('class') || '';
    console.log(`Body classes: ${bodyClasses}`);
    
    // Look for main content containers
    const mainContainers = [
      '#content',
      '#main-content',
      '.main-container',
      '.content-area'
    ];
    
    for (const container of mainContainers) {
      if ($(container).length) {
        console.log(`Found main content container: ${container}`);
        break;
      }
    }
    
  } catch (error) {
    console.error('Error checking website:', error.message);
    if (error.response) {
      console.error(`Status code: ${error.response.status}`);
      console.error(`Headers:`, error.response.headers);
    }
  }
}

checkWebsite();