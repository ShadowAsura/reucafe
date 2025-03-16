const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

async function checkSummerPathwaysWebsite() {
  console.log('Checking Summer Research Pathways to Science website...');
  
  try {
    // Use the exact URL from the user's prompt
    const url = 'https://www.pathwaystoscience.org/programs.aspx?u=Undergrads_Undergraduate+Students&sm=&sd=&sy=&dd=SummerResearch_Summer+Research+Opportunity&submit=y&dhub=SummerResearch_Summer+Research+Opportunity&all=all';
    
    console.log(`Fetching content from: ${url}`);
    
    // Use browser-like headers
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 30000
    });
    
    console.log(`Response status: ${response.status}`);
    console.log(`Content length: ${response.data.length} characters`);
    
    // Save the HTML for inspection
    fs.writeFileSync('debug_summer_pathways.html', response.data);
    console.log('Saved HTML content to debug_summer_pathways.html');
    
    // Load HTML into cheerio
    const $ = cheerio.load(response.data);
    
    // Check for program listings with progigert class
    const progigertElements = $('.progigert');
    console.log(`Found ${progigertElements.length} elements with class 'progigert'`);
    
    // Check for other potential program containers
    const alternativeSelectors = [
      '.programlisting',
      '.program-listing',
      '.program',
      '.views-row',
      '.result-item',
      '#ctl00_ContentPlaceHolder1_SearchResults tr',
      '#ctl00_ContentPlaceHolder1_SearchResults td',
      '.panel12'
    ];
    
    for (const selector of alternativeSelectors) {
      const elements = $(selector);
      console.log(`Selector '${selector}': found ${elements.length} elements`);
    }
    
    // Look for any links containing 'program' or 'progid'
    const programLinks = $('a').filter((i, el) => {
      const href = $(el).attr('href') || '';
      return href.includes('progid=');
    });
    
    console.log(`Found ${programLinks.length} links with 'progid=' parameter`);
    
    if (programLinks.length > 0) {
      console.log('\nSample program links:');
      programLinks.slice(0, 5).each((i, el) => {
        console.log(`${i+1}. Text: "${$(el).text().trim()}", URL: ${$(el).attr('href')}`);
      });
    }
    
    // Check main content panel 12 as mentioned by the user
    const panel12 = $('.panel12');
    console.log(`Found ${panel12.length} elements with class 'panel12'`);
    
    if (panel12.length > 0) {
      console.log('Content of panel12:');
      console.log(panel12.html().substring(0, 500) + '...');
    }
    
  } catch (error) {
    console.error('Error checking website:', error.message);
    if (error.response) {
      console.error(`Status code: ${error.response.status}`);
      console.error(`Headers:`, error.response.headers);
    }
  }
}

checkSummerPathwaysWebsite();