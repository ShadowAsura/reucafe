const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
// Remove MongoDB dependency
// const Program = require('../../models/Program');
const { delay } = require('./utils');
const { standardizeFields } = require('./fieldStandardizer');
// Add this line to import the service account credentials
const serviceAccount = require('../../../../scripts/reu-cafe-4d8576c76e0d.json');

// Helper function to parse dates from various formats
function parseDate(dateValue) {
  if (!dateValue) return null;
  // Convert to string if it's not already
  const dateStr = dateValue.toString();
  try {
    // Try standard date parsing
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      // Validate year is within reasonable range (current year + 5 years)
      const year = date.getFullYear();
      const currentYear = new Date().getFullYear();
      if (year < 2000 || year > currentYear + 5) {
        console.log(`Invalid year ${year} for date ${dateStr}`);
        return null;
      }
      return date;
    }
    
    // Try MM/DD/YYYY format
    const mmddyyyy = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
    const mmddyyyyMatch = dateStr.match(mmddyyyy);
    if (mmddyyyyMatch) {
      const [_, month, day, year] = mmddyyyyMatch;
      // Validate year
      const currentYear = new Date().getFullYear();
      if (parseInt(year) < 2000 || parseInt(year) > currentYear + 5) {
        console.log(`Invalid year ${year} for date ${dateStr}`);
        return null;
      }
      return new Date(year, month - 1, day);
    }
    
    // Try text month format (e.g., "February 15, 2024")
    const textMonth = /([A-Za-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/;
    const textMonthMatch = dateStr.match(textMonth);
    if (textMonthMatch) {
      const [_, month, day, year] = textMonthMatch;
      // Validate year
      const currentYear = new Date().getFullYear();
      if (parseInt(year) < 2000 || parseInt(year) > currentYear + 5) {
        console.log(`Invalid year ${year} for date ${dateStr}`);
        return null;
      }
      const monthIndex = new Date(`${month} 1, 2000`).getMonth();
      return new Date(year, monthIndex, day);
    }
    
    return null;
  } catch (error) {
    console.error(`Error parsing date "${dateStr}":`, error.message);
    return null;
  }
}

// Scrape REU programs from Google Sheets
exports.updateGoogleSheetsPrograms = async () => {
  try {
    console.log('Starting Google Sheets REU scraping...');
    
    // Use service account directly instead of environment variables
    const serviceAccountEmail = serviceAccount.client_email;
    const privateKey = serviceAccount.private_key;
    
    if (!serviceAccountEmail || !privateKey) {
      console.error('Google Sheets credentials not found in service account file');
      return [];
    }
    
    const jwt = new JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    // Initialize the Google Spreadsheet with the JWT client
    const doc = new GoogleSpreadsheet('10CfYQmqppMnwZmZKFfe1t_uMoRrvFR1WahsGBBf6ccM', jwt);
    
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
    // Now extract data from the rows below the header
    const programs = [];
    const totalRows = sheet.rowCount;
    
    // Start from the row after the header
    for (let rowIndex = headerRow + 1; rowIndex < Math.min(totalRows, headerRow + 300); rowIndex++) {
      try {
        // Get program name from the 'REU Site Name' column
        let programNameCol = headers.findIndex(h => h && h.includes('REU Site Name'));
        if (programNameCol === -1) {
          // Fallback options if the exact header isn't found
          programNameCol = headers.findIndex(h => h && (
            h.includes('Program') || 
            h.includes('Title') || 
            h.includes('Site Name')
          ));
        }
        
        // If still not found, use default column
        if (programNameCol === -1) programNameCol = 9; // Default to column J (index 9)
        
        // Get the program name and clean it
        let programName = sheet.getCell(rowIndex, programNameCol).value;
        if (!programName) continue; // Skip rows without a program name
        
        // Convert to string and clean up
        programName = programName.toString().trim();
        
        // Clean up problematic titles (like those with "100% in person experience")
        if (programName.includes('100%') || 
            programName.toLowerCase().includes('in person') || 
            programName.toLowerCase().includes('in-person')) {
          
          // Find institution column for creating better title
          let institutionCol = headers.findIndex(h => h && (h.includes('Host institution') || h.includes('Institution')));
          if (institutionCol === -1) institutionCol = 12; // Default to column M (index 12)
          // Find field column
          let fieldCol = headers.findIndex(h => h && h.includes('Field'));
          if (fieldCol === -1) fieldCol = 10; // Default to column K (index 10)
          const institution = sheet.getCell(rowIndex, institutionCol).value?.toString() || '';
          const field = sheet.getCell(rowIndex, fieldCol).value?.toString() || 'STEM';
          // Create a better title
          if (institution && field) {
            programName = `${field} Research at ${institution}`;
          } else if (institution) {
            programName = `Research Experience at ${institution}`;
          } else {
            programName = 'Undergraduate Research Experience';
          }
        }
        // Find institution column
        let institutionCol = headers.findIndex(h => h && (h.includes('Host institution') || h.includes('Institution')));
        if (institutionCol === -1) institutionCol = 12; // Default to column M (index 12)
        // Find location column - try to find it or use institution as fallback
        let locationCol = headers.findIndex(h => h && h.includes('Location'));
        if (locationCol === -1) locationCol = institutionCol; // Use institution as fallback
        // Find field column
        let fieldCol = headers.findIndex(h => h && h.includes('Field'));
        if (fieldCol === -1) fieldCol = 10; // Default to column K (index 10)
        // Find deadline column - specifically look for the Summer 2025 deadline column
        let deadlineCol = -1;
        
        // First, try to find the exact column name for Summer 2025 deadlines
        for (let i = 0; i < headers.length; i++) {
          const header = headers[i];
          if (header && header.includes('SORTED IN BY Application Deadline for Summer 2025')) {
            deadlineCol = i;
            console.log(`Found 'SORTED IN BY Application Deadline for Summer 2025' column at index: ${deadlineCol}`);
            break;
          }
        }
        
        // If not found, try a more flexible search for Summer 2025 deadlines
        if (deadlineCol === -1) {
          for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            if (header && header.includes('Summer 2025') && header.includes('Deadline')) {
              deadlineCol = i;
              console.log(`Found Summer 2025 deadline column at index: ${deadlineCol}`);
              break;
            }
          }
        }
        
        // If still not found, try alternative deadline column names as fallback
        if (deadlineCol === -1) {
          deadlineCol = headers.findIndex(h => h && (
            h.includes('Deadline') || 
            h.includes('Application Deadline') ||
            h.includes('Due Date')
          ));
          console.log(`Fallback deadline column found at index: ${deadlineCol}`);
        }
        
        if (deadlineCol === -1) {
          console.log('No deadline column found, using default column E (index 4)');
          deadlineCol = 4; // Default to column E (index 4)
        }
        
        // Find description column
        let descriptionCol = headers.findIndex(h => h && h.includes('Description'));
        if (descriptionCol === -1) descriptionCol = 11; // Default to column L (index 11)
        
        // Find website column
        let websiteCol = headers.findIndex(h => h && h.includes('Website'));
        if (websiteCol === -1) websiteCol = 1; // Default to column B (index 1)
        if (websiteCol === -1) websiteCol = 1; // Default to column B (index 1)
        
        // Find stipend column
        let stipendCol = headers.findIndex(h => h && h.includes('Stipend'));
        if (stipendCol === -1) stipendCol = 5; // Default to a reasonable column
        
        // Get the deadline value and parse it
        const deadlineValue = sheet.getCell(rowIndex, deadlineCol).value;
        const deadline = parseDate(deadlineValue);
        
        // Get field value and standardize it
        const fieldValue = sheet.getCell(rowIndex, fieldCol).value?.toString() || 'STEM';
        const fieldArray = standardizeFields(fieldValue);
        
        // Get stipend value
        const stipendValue = sheet.getCell(rowIndex, stipendCol)?.value?.toString() || '';
        let stipend = stipendValue;
        
        // Only include stipend if it contains dollar amounts or numeric values
        if (stipend) {
          // Check if stipend contains dollar amounts or numeric values
          const hasDollarAmount = /\$|\d+[,\d]*(\.\d+)?/.test(stipend);
          
          if (!hasDollarAmount) {
            stipend = ''; // Clear stipend if no dollar amount found
          }
        }
        // Create program object
const program = {
  title: programName,
  institution: sheet.getCell(rowIndex, institutionCol).value?.toString() || '',
  location: sheet.getCell(rowIndex, locationCol).value?.toString() || 'United States',
  field: fieldArray, // Use the standardized field array
  deadline: deadline ? deadline.toISOString().split('T')[0] : null, // Store as YYYY-MM-DD format
  stipend: stipend || '', // This will be empty if no valid stipend was found
  duration: '10 weeks', // Default value
  description: sheet.getCell(rowIndex, descriptionCol).value?.toString() || '',
  requirements: 'Please check the program website for specific eligibility requirements.',
  link: sheet.getCell(rowIndex, websiteCol).value?.toString() || '',
  applicationLink: sheet.getCell(rowIndex, websiteCol).value?.toString() || '',
  source: 'googlesheets', // Change to 'googlesheets' to match the source in saveToFirestore
  status: 'active'
};
        
        programs.push(program);
        console.log(`Processed program: ${program.title} at ${program.institution}`);
      } catch (error) {
        console.error(`Error processing row ${rowIndex}:`, error.message);
      }
    }
    
    console.log(`Scraped ${programs.length} programs from Google Sheets`);
    return programs;
  } catch (error) {
    console.error('Error scraping Google Sheets:', error.message);
    return getFallbackData();
  }
};

// Add a fallback data function
const getFallbackData = () => {
  console.log('Using fallback data for Google Sheets scraper');
  return [
    {
      title: 'REU in Computer Science',
      institution: 'Example University',
      description: 'This is a fallback entry since Google Sheets authentication failed.',
      location: 'Remote',
      field: 'Computer Science',
      deadline: 'February 15, 2024',
      stipend: '$6,000',
      duration: '10 weeks',
      url: 'https://example.edu/reu',
      source: 'Google Sheets (Fallback)',
      createdAt: new Date().toISOString()
    },
    // Add more fallback entries if needed
  ];
};

// Helper function to generate requirements text
function generateRequirements(row, headers) {
  const requirements = [];
  // Citizenship requirements
  if (headers.includes('US CITIZENS or LPR') && row.get('US CITIZENS or LPR') === 'Yes') {
    requirements.push('U.S. citizenship or permanent residency required.');
  }
  if (headers.includes('INTERNATIONAL / non-us citizens') && row.get('INTERNATIONAL / non-us citizens') === 'Yes') {
    requirements.push('International students eligible.');
  }
  if (headers.includes('DACA students') && row.get('DACA students') === 'Yes') {
    requirements.push('DACA students eligible.');
  }
  // Academic level requirements
  const academicLevels = [];
  if (headers.includes('Rising SOPHOMORES') && row.get('Rising SOPHOMORES') === 'Yes') academicLevels.push('rising sophomores');
  if (headers.includes('Rising JUNIORS') && row.get('Rising JUNIORS') === 'Yes') academicLevels.push('rising juniors');
  if (headers.includes('Rising SENIORS') && row.get('Rising SENIORS') === 'Yes') academicLevels.push('rising seniors');
  if (headers.includes('2-YEAR College Students') && row.get('2-YEAR College Students') === 'Yes') academicLevels.push('community college students');
  if (academicLevels.length > 0) {
    requirements.push(`Open to ${academicLevels.join(', ')}.`);
  }
  // Prior experience
  if (headers.includes('PRIOR Reseach Experience') && row.get('PRIOR Reseach Experience') === 'Yes') {
    requirements.push('Prior research experience preferred.');
  }
  if (headers.includes('NO prior research experience') && row.get('NO prior research experience') === 'Yes') {
    requirements.push('No prior research experience required.');
  }
  // Add a default statement if no specific requirements were found
  if (requirements.length === 0) {
    return 'Please check the program website for specific eligibility requirements.';
  }
  return requirements.join(' ');
}