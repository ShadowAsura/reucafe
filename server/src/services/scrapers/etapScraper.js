const axios = require('axios');
const { delay } = require('./utils');
const { standardizeFields } = require('./fieldStandardizer');

/**
 * Queries the NSF ETAP API for REU opportunities
 * 
 * @param {string} searchTerm - The search keyword (default: "REU")
 * @param {string} userId - The user ID required by the API
 * @param {string} token - The Bearer token for authorization
 * @returns {Array} - Array of opportunity objects
 */
async function queryEtapReu(searchTerm = "REU", userId = "101164911", token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzcmVtbG9nYW5AZ21haWwuY29tIiwiZmlyc3RuYW1lIjoiU3JpcmFtIiwicm9sZXMiOiJBUFBMSUNBTlQiLCJpZCI6MTAxMTY0OTExLCJlbmMtdXNlcm5hbWUiOiIkMmEkMTAkVUU1Rk1jZkxONll3L251U011UUQwT2pLVFFiNXQuNnUyUkJ0bEZiLy90RzcxMFduUE5WbC4iLCJlbWFpbCI6InNyZW1sb2dhbkBnbWFpbC5jb20iLCJsYXN0bmFtZSI6IkxvZ2FuYXRoYW4iLCJ1c2VybmFtZSI6InNyZW1sb2dhbkBnbWFpbC5jb20iLCJpYXQiOjE3NDE2NjE5NTksImlzcyI6Im5zZi1ldGFwIiwianRpIjoiOTExMWZkMWUtODE4MC00OGQ5LThkZTMtYjdhMGEwZmQ2NWU4IiwiZXhwIjoxNzQxNjY1NTU5fQ.OHNVs_9u4-YQ7iB6bIX74uc_bLcMu-lO7tkJh0AigqY") {
  try {
    const url = "https://etap.nsf.gov/api/edge/awards/public/opportunities/search";
    const params = {
      s: searchTerm,
      userId: userId
    };
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Accept": "*/*"
    };
    
    console.log(`Querying ETAP API for "${searchTerm}" opportunities...`);
    
    const response = await axios.get(url, { params, headers });
    const opportunities = response.data?.response?.body || [];
    
    console.log(`Found ${opportunities.length} opportunities from ETAP API`);
    return opportunities;
  } catch (error) {
    console.error("Error querying ETAP API:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    return [];
  }
}

/**
 * Processes a single opportunity from ETAP API into our standard program format
 * 
 * @param {Object} opportunity - The opportunity object from ETAP API
 * @returns {Object} - Standardized program object
 */
function processOpportunity(opportunity) {
  try {
    const award = opportunity.award || {};
    const opp = opportunity.opportunity || {};
    
    // Extract basic information
    const title = award.awardTitle || "Untitled REU Program";
    const institution = award.institutionName || "Unknown Institution";
    const location = award.institutionAddress?.city && award.institutionAddress?.stateCode ? 
      `${award.institutionAddress.city}, ${award.institutionAddress.stateCode}` : 
      "United States";
    
    // Extract dates
    const startDate = opp.startDate ? new Date(opp.startDate) : null;
    const endDate = opp.endDate ? new Date(opp.endDate) : null;
    
    // Calculate duration in weeks if both dates are available
    let duration = "10 weeks"; // Default
    if (startDate && endDate) {
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationWeeks = Math.round(durationMs / (7 * 24 * 60 * 60 * 1000));
      if (durationWeeks > 0) {
        duration = `${durationWeeks} weeks`;
      }
    }
    
    // Extract deadline if available
    let deadline = null;
    if (opp.applicationDeadline) {
      try {
        deadline = new Date(opp.applicationDeadline);
      } catch (e) {
        console.warn(`Could not parse deadline: ${opp.applicationDeadline}`);
      }
    }
    
    // Extract field/discipline
    let field = "STEM";
    if (award.programElement && award.programElement.length > 0) {
      const programElements = award.programElement.map(pe => pe.text).filter(Boolean);
      if (programElements.length > 0) {
        field = programElements.join(", ");
      }
    }
    
    // Standardize the field
    const fieldArray = standardizeFields(field);
    
    // Extract description
    let description = opp.description || award.abstractText || "";
    
    // Clean up description
    if (description) {
      // Remove any truncation markers completely
      description = description
        .replace(/\.\.\.read more/gi, '')
        .replace(/\.\.\.$/g, '')
        .replace(/\.\.\./g, '')
        .replace(/\s*\(read more\)/gi, '')
        .replace(/read more/gi, '')
        .trim();
      
      // Preserve paragraph breaks but normalize excessive whitespace
      description = description
        .replace(/\s*\n\s*/g, '\n\n') // Normalize line breaks to double line breaks
        .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
        .replace(/\n\n+/g, '\n\n') // Replace multiple consecutive line breaks with just two
        .trim();
    }
    
    // Extract stipend information if available
    let stipend = "";
    if (opp.stipendAmount) {
      stipend = `$${opp.stipendAmount}`;
    }
    
    // Extract URL
    const url = opp.url || "";
    
    // Extract requirements
    let requirements = opp.eligibility || "U.S. citizenship or permanent residency typically required. Undergraduate students only.";
    
    // Extract benefits
    let benefits = opp.benefits || "";
    
    return {
      title,
      institution,
      location,
      field: fieldArray,
      deadline: deadline ? deadline.toISOString().split('T')[0] : null, // Store as YYYY-MM-DD
      stipend,
      duration,
      description,
      requirements,
      benefits,
      link: url,
      applicationLink: url,
      source: "ETAP",
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error processing opportunity:", error);
    return null;
  }
}

/**
 * Updates REU programs from the NSF ETAP API
 * 
 * @returns {Array} - Array of processed programs
 */
exports.updateEtapPrograms = async () => {
  try {
    console.log('Starting NSF ETAP REU scraping...');
    
    // Query the ETAP API for REU opportunities
    const opportunities = await queryEtapReu();
    
    if (!opportunities || opportunities.length === 0) {
      console.log('No opportunities found from ETAP API');
      return [];
    }
    
    console.log(`Processing ${opportunities.length} opportunities from ETAP API...`);
    
    // Process each opportunity with a delay to avoid overwhelming the API
    const programs = [];
    for (const opportunity of opportunities) {
      try {
        const program = processOpportunity(opportunity);
        if (program) {
          programs.push(program);
        }
        await delay(100); // Small delay between processing
      } catch (error) {
        console.error('Error processing opportunity:', error);
      }
    }
    
    console.log(`Successfully processed ${programs.length} programs from ETAP API`);
    return programs;
  } catch (error) {
    console.error('Error updating ETAP programs:', error);
    return [];
  }
};