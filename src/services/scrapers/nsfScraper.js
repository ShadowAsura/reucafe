const { delay, getAxiosInstance } = require('./utils');
const { standardizeFields } = require('../../../server/src/services/scrapers/fieldStandardizer');

exports.updateNsfPrograms = async () => {
  try {
    console.log('Starting NSF REU scraping...');
    const api = getAxiosInstance();
    
    try {
      const response = await api.get('https://etap.nsf.gov/api/edge/awards/public/opportunities/search', {
        params: {
          s: 'REU',
          userId: '101164911'
        },
        headers: {
          'Authorization': 'Bearer ' + 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzcmVtbG9nYW5AZ21haWwuY29tIiwiZmlyc3RuYW1lIjoiU3JpcmFtIiwicm9sZXMiOiJBUFBMSUNBTlQiLCJpZCI6MTAxMTY0OTExLCJlbmMtdXNlcm5hbWUiOiIkMmEkMTAkVUU1Rk1jZkxONll3L251U011UUQwT2pLVFFiNXQuNnUyUkJ0bEZiLy90RzcxMFduUE5WbC4iLCJlbWFpbCI6InNyZW1sb2dhbkBnbWFpbC5jb20iLCJsYXN0bmFtZSI6IkxvZ2FuYXRoYW4iLCJ1c2VybmFtZSI6InNyZW1sb2dhbkBnbWFpbC5jb20iLCJpYXQiOjE3NDE2NjE5NTksImlzcyI6Im5zZi1ldGFwIiwianRpIjoiOTExMWZkMWUtODE4MC00OGQ5LThkZTMtYjdhMGEwZmQ2NWU4IiwiZXhwIjoxNzQxNjY1NTU5fQ.OHNVs_9u4-YQ7iB6bIX74uc_bLcMu-lO7tkJh0AigqY',
          'Accept': '*/*'
        }
      });
      
      console.log('Successfully accessed NSF ETAP API');
      const opportunities = response.data?.response?.body || [];
      const programPromises = [];
      
      opportunities.forEach((opportunity) => {
        try {
          const award = opportunity.award || {};
          const opp = opportunity.opportunity || {};
          
          const title = award.awardTitle;
          const institution = award.institutionName;
          const location = award.awardeeCity + ', ' + award.awardeeStateCode;
          const description = award.abstractText || `Research experience in ${award.programElement} at ${institution}.`;
          
          // Initialize fields and extract from award data
          const rawFields = [];
          
          if (award.programElement) rawFields.push(award.programElement);
          if (award.programReference) rawFields.push(award.programReference);
          if (award.nsfDirectorate) rawFields.push(award.nsfDirectorate);
          if (award.nsfOrganization) rawFields.push(award.nsfOrganization);
          
          if (title && institution && opp.url) {
            console.log(`Found program: ${title} at ${institution}`);
            
            const programPromise = (async () => {
              try {
                const deadline = opp.endDate ? new Date(opp.endDate) : new Date('2024-02-15');
                
                // Ensure field is always defined
                let fields;
                try {
                  fields = standardizeFields(rawFields, description, title);
                } catch (error) {
                  fields = ['STEM'];
                }
                
                // If fields is undefined or empty, set default
                if (!fields || !Array.isArray(fields) || fields.length === 0) {
                  fields = ['STEM'];
                }
            
                return {
                  title,
                  institution,
                  location,
                  fields: fields || ['STEM'], // Changed field to fields and added fallback
                  deadline,
                  stipend: '$5,000-$6,000',
                  duration: '10 weeks',
                  description,
                  requirements: 'U.S. citizenship or permanent residency typically required. Undergraduate students only.',
                  link: opp.url,
                  applicationLink: opp.url,
                  source: 'NSF',
                  status: 'approved'
                };
              } catch (error) {
                console.error(`Error creating program object for ${title}:`, error.message);
                return null;
              }
            })();
            
            programPromises.push(programPromise);
          }
        } catch (error) {
          console.error('Error processing opportunity:', error.message);
        }
      });
      
      const results = await Promise.all(programPromises);
      const validPrograms = results.filter(program => program !== null);
      
      console.log(`Found ${validPrograms.length} NSF REU programs`);
      return validPrograms;
      
    } catch (error) {
      console.error('Error accessing NSF ETAP API:', error.message);
      return [];
    }
  } catch (error) {
    console.error('Error in NSF scraper:', error.message);
    return [];
  }
};