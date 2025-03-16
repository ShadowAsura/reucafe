const { getAxiosInstance } = require('./utils');

async function analyzeNsfFields() {
  try {
    console.log('Starting NSF API field analysis...');
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

    const opportunities = response.data?.response?.body || [];
    console.log(`Retrieved ${opportunities.length} opportunities from API`);
    
    // Field analysis statistics
    const fieldStats = {
      programElement: 0,
      programReference: 0,
      programElementText: [],
      programReferenceText: [],
      directorate: 0,
      division: 0,
      directorateText: [],
      divisionText: [],
      abstractText: 0,
      programOverview: 0,
      description: 0,
      awardAbstract: 0,
      fundProgramName: 0,
      fundProgramNameText: []
    };
    
    // Analyze each opportunity for field availability
    opportunities.forEach((opportunity, index) => {
      const award = opportunity.award || {};
      
      // Check for program elements
      if (award.programElement) {
        fieldStats.programElement++;
        fieldStats.programElementText.push(award.programElement);
      }
      
      // Check for program references
      if (award.programReference) {
        fieldStats.programReference++;
        fieldStats.programReferenceText.push(award.programReference);
      }
      
      // Check for directorate
      if (award.directorate) {
        fieldStats.directorate++;
        fieldStats.directorateText.push(award.directorate);
      }
      
      // Check for division
      if (award.division) {
        fieldStats.division++;
        fieldStats.divisionText.push(award.division);
      }
      
      // Check for abstract text
      if (award.abstractText) {
        fieldStats.abstractText++;
      }
      
      // Check for program overview
      if (award.programOverview) {
        fieldStats.programOverview++;
      }
      
      // Check for description
      if (award.description) {
        fieldStats.description++;
      }
      
      // Check for award abstract
      if (award.awardAbstract) {
        fieldStats.awardAbstract++;
      }
      
      // Check for fund program name
      if (award.fundProgramName) {
        fieldStats.fundProgramName++;
        fieldStats.fundProgramNameText.push(award.fundProgramName);
      }
      
      // Print detailed info for first 3 opportunities
      if (index < 3) {
        console.log(`\nOpportunity #${index + 1}:`);
        console.log(`Title: ${award.awardTitle || 'N/A'}`);
        console.log(`Institution: ${award.institutionName || 'N/A'}`);
        console.log(`Program Element: ${award.programElement || 'N/A'}`);
        console.log(`Program Reference: ${award.programReference || 'N/A'}`);
        console.log(`Directorate: ${award.directorate || 'N/A'}`);
        console.log(`Division: ${award.division || 'N/A'}`);
        console.log(`Fund Program Name: ${award.fundProgramName || 'N/A'}`);
      }
    });
    
    // Print field availability statistics
    console.log('\nField Availability Statistics:');
    console.log(`Total Opportunities: ${opportunities.length}`);
    console.log(`Program Element: ${fieldStats.programElement}/${opportunities.length} (${Math.round(fieldStats.programElement/opportunities.length*100)}%)`);
    console.log(`Program Reference: ${fieldStats.programReference}/${opportunities.length} (${Math.round(fieldStats.programReference/opportunities.length*100)}%)`);
    console.log(`Directorate: ${fieldStats.directorate}/${opportunities.length} (${Math.round(fieldStats.directorate/opportunities.length*100)}%)`);
    console.log(`Division: ${fieldStats.division}/${opportunities.length} (${Math.round(fieldStats.division/opportunities.length*100)}%)`);
    console.log(`Abstract Text: ${fieldStats.abstractText}/${opportunities.length} (${Math.round(fieldStats.abstractText/opportunities.length*100)}%)`);
    console.log(`Program Overview: ${fieldStats.programOverview}/${opportunities.length} (${Math.round(fieldStats.programOverview/opportunities.length*100)}%)`);
    console.log(`Description: ${fieldStats.description}/${opportunities.length} (${Math.round(fieldStats.description/opportunities.length*100)}%)`);
    console.log(`Award Abstract: ${fieldStats.awardAbstract}/${opportunities.length} (${Math.round(fieldStats.awardAbstract/opportunities.length*100)}%)`);
    console.log(`Fund Program Name: ${fieldStats.fundProgramName}/${opportunities.length} (${Math.round(fieldStats.fundProgramName/opportunities.length*100)}%)`);
    
    // Print sample values for key fields
    console.log('\nSample Program Element values:');
    console.log(fieldStats.programElementText.slice(0, 5));
    
    console.log('\nSample Program Reference values:');
    console.log(fieldStats.programReferenceText.slice(0, 5));
    
    console.log('\nSample Directorate values:');
    console.log(fieldStats.directorateText.slice(0, 5));
    
    console.log('\nSample Division values:');
    console.log(fieldStats.divisionText.slice(0, 5));
    
    console.log('\nSample Fund Program Name values:');
    console.log(fieldStats.fundProgramNameText.slice(0, 5));
    
  } catch (error) {
    console.error('Error in NSF API field analysis:', error.message);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
  }
}

// Run the analysis function
analyzeNsfFields();