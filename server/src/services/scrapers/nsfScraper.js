const Program = require('../../models/Program');
const { delay, getAxiosInstance } = require('./utils');
const { standardizeFields } = require('./fieldStandardizer');

// Query NSF ETAP API for REU programs
exports.updateNsfPrograms = async () => {
  try {
    console.log('Starting NSF REU scraping...');
    const api = getAxiosInstance();
    
    // Add retry mechanism with exponential backoff
    const maxRetries = 3;
    let retryCount = 0;
    let response;

    while (retryCount < maxRetries) {
      try {
        console.log(`Attempt ${retryCount + 1}/${maxRetries} to access NSF ETAP API...`);
        
        // Query the NSF ETAP API
        response = await api.get('https://etap.nsf.gov/api/edge/awards/public/opportunities/search', {
          params: {
            s: 'REU',
            userId: '101164911'
          },
          headers: {
            'Authorization': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzcmVtbG9nYW5AZ21haWwuY29tIiwiZmlyc3RuYW1lIjoiU3JpcmFtIiwicm9sZXMiOiJBUFBMSUNBTlQiLCJpZCI6MTAxMTY0OTExLCJlbmMtdXNlcm5hbWUiOiIkMmEkMTAkVUU1Rk1jZkxONll3L251U011UUQwT2pLVFFiNXQuNnUyUkJ0bEZiLy90RzcxMFduUE5WbC4iLCJlbWFpbCI6InNyZW1sb2dhbkBnbWFpbC5jb20iLCJsYXN0bmFtZSI6IkxvZ2FuYXRoYW4iLCJ1c2VybmFtZSI6InNyZW1sb2dhbkBnbWFpbC5jb20iLCJpYXQiOjE3MTAzMDc4NzAsImlzcyI6Im5zZi1ldGFwIiwianRpIjoiOTExMWZkMWUtODE4MC00OGQ5LThkZTMtYjdhMGEwZmQ2NWU4IiwiZXhwIjoxNzEwMzExNDcwfQ.OHNVs_9u4-YQ7iB6bIX74uc_bLcMu-lO7tkJh0AigqY',
            'Accept': '*/*',
            'Content-Type': 'application/json'
          }
        });

        console.log('Successfully accessed NSF ETAP API');
        break; // Exit retry loop on success
      } catch (error) {
        console.error(`API request failed (attempt ${retryCount + 1}):`, {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          error: error.message,
          stack: error.stack
        });

        // Log the full error response for debugging
        if (error.response?.data?.response?.error) {
          console.error('Detailed error:', error.response.data.response.error);
        }

        retryCount++;
        if (retryCount === maxRetries) {
          throw new Error(`Failed to access NSF ETAP API after ${maxRetries} attempts: ${error.message}`);
        }

        // Exponential backoff
        const waitTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
        console.log(`Waiting ${waitTime}ms before retry...`);
        await delay(waitTime);
      }
    }
      
    const opportunities = response.data?.response?.body || [];
    console.log(`Retrieved ${opportunities.length} opportunities from API`);
    const programPromises = [];
    
    // Process each opportunity from the API response
    opportunities.forEach((opportunity) => {
      try {
        const award = opportunity.award || {};
        const opp = opportunity.opportunity || {};
        
        // Log opportunity data for debugging
        console.log('Processing opportunity:', {
          awardTitle: award.awardTitle,
          institution: award.institutionName,
          oppUrl: opp.url
        });

        const title = award.awardTitle;
        const institution = award.institutionName;
        const location = award.awardeeCity && award.awardeeStateCode ? `${award.awardeeCity}, ${award.awardeeStateCode}` : (award.institutionName || 'Location not specified');
        // Extract and standardize fields from multiple sources
const rawFields = [];

// Check for researchTopics field first (most reliable when available)
if (opportunity.researchTopics) {
  console.log('Found research topics:', opportunity.researchTopics);
  const topics = opportunity.researchTopics.split(';').map(f => f.trim());
  rawFields.push(...topics);
}

// Check for fieldOfStudies array
if (opportunity.fieldOfStudies && Array.isArray(opportunity.fieldOfStudies)) {
  console.log('Found field of studies:', opportunity.fieldOfStudies);
  rawFields.push(...opportunity.fieldOfStudies);
}

// Then try award.programElement
if (award.programElement) {
  console.log('Found program elements in award:', award.programElement);
  const elements = award.programElement.split(',').map(f => f.trim());
  rawFields.push(...elements);
}

// Then check award.programReference
if (award.programReference) {
  console.log('Found program references in award:', award.programReference);
  const references = award.programReference.split(',').map(f => f.trim());
  rawFields.push(...references);
}

// Check for directorate and division
if (award.directorate) {
  console.log('Found directorate:', award.directorate);
  rawFields.push(award.directorate);
}

if (award.division) {
  console.log('Found division:', award.division);
  rawFields.push(award.division);
}

// Check for fundProgramName
if (award.fundProgramName) {
  console.log('Found fund program name:', award.fundProgramName);
  rawFields.push(award.fundProgramName);
}

// Get description text from all possible sources
const description = award.abstractText || award.programOverview || award.description || award.awardAbstract || '';

// Use the standardizeFields function to properly extract and standardize fields
// Pass raw fields, description, and title to get the most accurate field categorization
const fields = standardizeFields(rawFields, description, title);
console.log('Extracted standardized fields:', fields);
        const link = opp.url;
        
        if (title && institution && link) {
          console.log(`Found program: ${title} at ${institution}`);
          
          // Create program object from API data
          const programPromise = (async () => {
            try {
              const description = award.programOverview || award.description || award.awardAbstract || `Research experience in ${fields.join(', ')} at ${institution}.`;
              const deadline = opp.endDate ? new Date(opp.endDate) : new Date('2024-02-15');
              const stipend = '$5,000-$6,000';
              const duration = '10 weeks';
              const requirements = 'U.S. citizenship or permanent residency typically required. Undergraduate students only.';
              const applicationLink = link;
              
              // Create detailed program object with standardized fields
return {
                title,
                institution,
                location,
                fields,
                deadline,
                stipend,
                duration,
                description,
                requirements,
                link,
                applicationLink,
                source: 'NSF',
                status: 'approved'
              };
            } catch (error) {
              console.error(`Error creating program object for ${title}:`, error.message);
              return null;
            }
          })();
          
          programPromises.push(programPromise);
        } else {
          console.warn('Skipping opportunity due to missing required fields:', {
            hasTitle: !!title,
            hasInstitution: !!institution,
            hasLink: !!link
          });
        }
      } catch (error) {
        console.error('Error processing opportunity:', error.message);
      }
    });
    
    // Wait for all program details to be fetched
    const results = await Promise.all(programPromises);
    const validPrograms = results.filter(program => program !== null);
    
    console.log(`Found ${validPrograms.length} NSF REU programs`);
    return validPrograms;
    
  } catch (error) {
    console.error('Error in NSF scraper:', error.message);
    return [];
  }
};
