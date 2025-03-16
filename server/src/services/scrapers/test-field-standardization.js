// Test script for field standardization without requiring Google Sheets access
require('dotenv').config({ path: '../../../.env' });

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

// Mock data from Google Sheets
const mockGoogleSheetsData = [
  {
    rowIndex: 1,
    fieldValue: "Biology, Chemistry"
  },
  {
    rowIndex: 2,
    fieldValue: "Computer Science"
  },
  {
    rowIndex: 3,
    fieldValue: "Biomedical Engineering"
  },
  {
    rowIndex: 4,
    fieldValue: "This program offers a 10-week summer research experience"
  },
  {
    rowIndex: 5,
    fieldValue: "Multiple Disciplines"
  },
  {
    rowIndex: 6,
    fieldValue: "Forming a community of scholars"
  },
  {
    rowIndex: 7,
    fieldValue: "Based on interest in science"
  },
  {
    rowIndex: 8,
    fieldValue: "Developing skills for graduate school"
  },
  {
    rowIndex: 9,
    fieldValue: "Weekly seminars on contemporary research"
  },
  {
    rowIndex: 10,
    fieldValue: "Conduct original research with faculty mentors"
  }
];

// Test with mock data
console.log('Testing field standardization with mock Google Sheets data...\n');

mockGoogleSheetsData.forEach(row => {
  const standardizedFields = standardizeFields(row.fieldValue);
  
  console.log(`Row ${row.rowIndex}:`);
  console.log(`  Original field: "${row.fieldValue}"`);
  console.log(`  Standardized: ${JSON.stringify(standardizedFields)}`);
  console.log('---');
});

// Test with program context
console.log('\nTesting with program context...\n');

const programContextTests = [
  {
    title: "Summer Research in Mathematics",
    description: "This REU program focuses on applied mathematics and computational methods.",
    institution: "University of Mathematics",
    field: "Research Experience"
  },
  {
    title: "Biomedical Engineering Research Experience",
    description: "Students will work on cutting-edge biomedical engineering projects.",
    institution: "Medical Research Institute",
    field: "Summer Program"
  },
  {
    title: "Environmental Science Field Studies",
    description: "Field-based research in environmental science and ecology.",
    institution: "Field Research Station",
    field: "Field Work"
  },
  {
    title: "Physics and Astronomy REU",
    description: "Research in astrophysics and observational astronomy.",
    institution: "Observatory Institute",
    field: "The program offers"
  }
];

programContextTests.forEach(program => {
  console.log(`Program: "${program.title}"`);
  console.log(`Description: "${program.description}"`);
  console.log(`Institution: "${program.institution}"`);
  
  const standardizedFields = standardizeFields(program.field);
  console.log(`Vague field: "${program.field}"`);
  console.log(`Standardized: ${JSON.stringify(standardizedFields)}`);
  console.log("---");
});

console.log('Field standardization testing complete!');