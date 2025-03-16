// Test script for Google Sheets scraper
require('dotenv').config({ path: '../../../.env' });
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const { delay } = require('./utils');

// Import the standardizeFields function
function standardizeFields(fields) {
  // Define standard field categories with keywords
  const standardFields = {
    'Biology': ['biology', 'biomedical', 'biomed', 'bio', 'genomics', 'neuroscience', 'ecology', 'molecular', 'biochemistry', 'bioinformatics', 'microbiology', 'genetics', 'cell', 'physiology'],
    'Chemistry': ['chemistry', 'chem', 'biochem', 'organic', 'inorganic', 'analytical'],
    'Physics': ['physics', 'astrophysics', 'astronomy', 'astro', 'quantum', 'optics', 'mechanics'],
    'Engineering': ['engineering', 'mechanical', 'electrical', 'civil', 'chemical', 'bioengineering', 'aerospace', 'materials'],
    'Computer Science': ['computer', 'computing', 'computational', 'cs', 'data science', 'machine learning', 'artificial intelligence', 'ai', 'ml', 'software', 'programming'],
    'Mathematics': ['mathematics', 'math', 'applied mathematics', 'statistics', 'calculus', 'algebra', 'geometry'],
    'Earth Science': ['earth', 'geology', 'environmental', 'climate', 'oceanography', 'atmospheric', 'geography', 'geophysics'],
    'Social Science': ['psychology', 'sociology', 'anthropology', 'economics', 'political', 'social', 'behavioral'],
    'STEM': ['stem', 'science', 'technology', 'engineering', 'mathematics']
  };
  
  // List of words/phrases to exclude as standalone fields
  const excludedTerms = [
    'other', 'on', 'forming a', 'week summer', 'the', 'based', 'developing', 's', 
    'this', 'interest in', 'or', 'term', 'lter', 'reu provides', 'person', 'weekly', 
    'on contemporar', 'depth', 'present', 'our undergraduate', 'edge', 'related', 
    'conduct original', 'tours of institution', 'doctoral', 'craft robust', 
    'to conduct', 'then a', 'sponsored', 'offers a', 'paid', 'work', 'summer',
    'reu', 'multiple disciplines', 'institutional', 'funded'
  ];
  
  // If input is a string, convert to array
  if (typeof fields === 'string') {
    fields = fields.split(/[,;]|\sand\s/).map(f => f.trim()).filter(f => f);
    if (fields.length === 0) fields = [fields];
  }
  
  // Map each field to a standard category
  const standardized = new Set(); // Use Set to avoid duplicates
  
  fields.forEach(field => {
    if (!field) return; // Skip empty fields
    
    const lowercaseField = field.toLowerCase();
    
    // Skip excluded terms
    if (excludedTerms.some(term => lowercaseField === term)) {
      return;
    }
    
    // If field is already 1-2 words and not too long, keep it (unless it's in excluded terms)
    if (field.split(/\s+/).length <= 2 && field.length <= 25) {
      if (!excludedTerms.some(term => 
          lowercaseField === term || 
          lowercaseField.includes(term))) {
        standardized.add(field.split(/\s+/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' '));
        return;
      }
    }
    
    // Check if the field contains any keywords from standard fields
    let matched = false;
    for (const [standardField, keywords] of Object.entries(standardFields)) {
      if (keywords.some(keyword => lowercaseField.includes(keyword))) {
        standardized.add(standardField);
        matched = true;
        break;
      }
    }
    
    // If no match found, check individual words
    if (!matched) {
      const words = field.split(/\s+/);
      for (const word of words) {
        if (word.length <= 3 || excludedTerms.includes(word.toLowerCase())) continue;
        
        for (const [standardField, keywords] of Object.entries(standardFields)) {
          if (keywords.some(keyword => word.toLowerCase().includes(keyword))) {
            standardized.add(standardField);
            matched = true;
            break;
          }
        }
        if (matched) break;
      }
    }
  });
  
  // If no fields were mapped, use STEM as default
  if (standardized.size === 0) {
    standardized.add('STEM');
  }
  
  return Array.from(standardized);
}

// Test function to read fields from Google Sheets and standardize them
async function testGoogleSheetsFieldStandardization() {
  try {
    console.log('Starting Google Sheets field standardization test...');
    
    // Create a JWT client for authentication
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });
    
    // Initialize the Google Sheets document with the JWT client
    const doc = new GoogleSpreadsheet('10CfYQmqppMnwZmZKFfe1t_uMoRrvFR1WahsGBBf6ccM', serviceAccountAuth);
    
    // Load document properties and worksheets
    await doc.loadInfo();
    console.log(`Loaded document: ${doc.title}`);
    
    // Get the first sheet (assuming it contains the REU data)
    const sheet = doc.sheetsByIndex[0];
    
    // Get all cells to analyze the structure
    await sheet.loadCells();
    console.log(`Loaded cells from sheet: ${sheet.title}`);
    
    // Find the actual header row by scanning the first few rows
    let headerRow = -1;
    let headers = [];
    const columnsToCheck = 10; // Check first 10 columns
    const rowsToCheck = 10;    // Check first 10 rows
    
    // Look for a row that has "REU Site Name" or similar
    for (let row = 0; row < rowsToCheck; row++) {
      let potentialHeaders = [];
      for (let col = 0; col < columnsToCheck; col++) {
        const cell = sheet.getCell(row, col);
        if (cell.value) {
          potentialHeaders.push(cell.value.toString());
        }
      }
      
      // Check if this row looks like a header row
      if (potentialHeaders.some(header => 
          header.includes('REU') || 
          header.includes('Program') || 
          header.includes('Institution') ||
          header.includes('Deadline'))) {
        headerRow = row;
        headers = potentialHeaders;
        console.log(`Found header row at index ${headerRow}:`, headers);
        break;
      }
    }
    
    if (headerRow === -1) {
      console.log("Couldn't find a header row. Using row 1 as header.");
      headerRow = 1;
      headers = Array(columnsToCheck).fill().map((_, i) => sheet.getCell(headerRow, i).value?.toString() || `Column${i+1}`);
    }
    
    // Find field column
    let fieldCol = headers.findIndex(h => h && h.includes('Field'));
    if (fieldCol === -1) fieldCol = 10; // Default to column K (index 10)
    
    console.log(`\nTesting field standardization from Google Sheets...\n`);
    
    // Test the first 10 rows after the header
    for (let rowIndex = headerRow + 1; rowIndex < headerRow + 11; rowIndex++) {
      try {
        const fieldValue = sheet.getCell(rowIndex, fieldCol).value?.toString() || 'STEM';
        const standardizedFields = standardizeFields(fieldValue);
        
        console.log(`Row ${rowIndex}:`);
        console.log(`  Original field: "${fieldValue}"`);
        console.log(`  Standardized: ${JSON.stringify(standardizedFields)}`);
        console.log('---');
      } catch (err) {
        console.error(`Error processing row ${rowIndex}:`, err.message);
      }
      
      // Add a small delay between processing rows
      await delay(50);
    }
    
    console.log('Google Sheets field standardization test completed');
  } catch (error) {
    console.error('Error in Google Sheets field standardization test:', error);
  }
}

// Run the test
testGoogleSheetsFieldStandardization();