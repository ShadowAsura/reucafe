const { getAxiosInstance } = require('./utils');

async function debugNsfResponse() {
  try {
    console.log('Starting NSF API debug...');
    const api = getAxiosInstance();
    
    const response = await api.get('https://etap.nsf.gov/api/edge/awards/public/opportunities/search', {
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

    // Log the complete response structure
    console.log('\nComplete API Response Structure:');
    console.log(JSON.stringify(response.data, null, 2));

    // Analyze specific fields
    const opportunities = response.data?.response?.body || [];
    if (opportunities.length > 0) {
      console.log('\nAnalyzing first opportunity structure:');
      const firstOpp = opportunities[0];
      console.log('\nAward fields:');
      console.log(JSON.stringify(firstOpp.award, null, 2));
      console.log('\nOpportunity fields:');
      console.log(JSON.stringify(firstOpp.opportunity, null, 2));
    }

  } catch (error) {
    console.error('Error in NSF API debug:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
  }
}

// Run the debug function
debugNsfResponse();