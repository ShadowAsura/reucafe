// Script to analyze field distribution in the database
require('dotenv').config();
const mongoose = require('mongoose');
const Program = require('./models/Program');

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI;

// Add standardizeFields function to fix field names
async function analyzeAndFixFields() {
  try {
    // Get all programs
    const programs = await Program.find({});
    console.log(`Analyzing and fixing fields for ${programs.length} programs...`);
    
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
    
    // Count field occurrences before fixing
    const beforeFieldCounts = {};
    let beforeTotalFieldInstances = 0;
    
    programs.forEach(program => {
      if (Array.isArray(program.field)) {
        program.field.forEach(field => {
          beforeFieldCounts[field] = (beforeFieldCounts[field] || 0) + 1;
          beforeTotalFieldInstances++;
        });
      } else if (typeof program.field === 'string') {
        beforeFieldCounts[program.field] = (beforeFieldCounts[program.field] || 0) + 1;
        beforeTotalFieldInstances++;
      }
    });
    
    // Function to standardize a field name
    function standardizeField(field, program, existingFields) {
      if (!field) return 'Other';
      
      // List of words/phrases to exclude as standalone fields
      const excludedTerms = [
        'other', 'on', 'forming a', 'week summer', 'the', 'based', 'developing', 's', 
        'this', 'interest in', 'or', 'term', 'lter', 'reu provides', 'person', 'weekly', 
        'on contemporar', 'depth', 'present', 'our undergraduate', 'edge', 'related', 
        'conduct original', 'tours of institution', 'doctoral', 'craft robust', 
        'to conduct', 'then a', 'sponsored', 'offers a', 'paid', 'work', 'summer',
        'Reu', 'Multiple Disciplines', 'Institutional', 'Funded'
      ];
      
      // If field is just an excluded term, don't use it
      if (excludedTerms.some(term => field.toLowerCase() === term.toLowerCase())) {
        // Skip to program context analysis instead
        // We'll handle this below by not returning here
      }
      // If field is already 1-2 words and not too long, keep it (unless it's in excluded terms)
      else if (field.split(/\s+/).length <= 2 && field.length <= 25) {
        // Check if it's not in excluded terms
        if (!excludedTerms.some(term => 
            field.toLowerCase() === term.toLowerCase() || 
            field.toLowerCase().includes(term.toLowerCase()))) {
          // Capitalize first letter of each word
          return field.split(/\s+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        }
      }
      
      // Check if the field contains any keywords from standard fields
      const lowercaseField = field.toLowerCase();
      for (const [standardField, keywords] of Object.entries(standardFields)) {
        if (keywords.some(keyword => lowercaseField.includes(keyword))) {
          return standardField;
        }
      }
      
      // If no match found, check individual words
      const words = field.split(/\s+/);
      for (const word of words) {
        // Skip excluded terms and short words
        if (word.length <= 3 || excludedTerms.includes(word.toLowerCase())) continue;
        
        for (const [standardField, keywords] of Object.entries(standardFields)) {
          if (keywords.some(keyword => word.toLowerCase().includes(keyword))) {
            return standardField;
          }
        }
      }
      
      // If still no match, look at program title and description
      const programText = [
        program.title || '',
        program.description || '',
        program.institution || ''
      ].join(' ').toLowerCase();
      
      // Check if program text contains keywords
      for (const [standardField, keywords] of Object.entries(standardFields)) {
        if (keywords.some(keyword => programText.includes(keyword))) {
          return standardField;
        }
      }
      
      // Check against existing popular fields
      if (existingFields && existingFields.length > 0) {
        // Try to match with existing popular fields based on similarity
        for (const [existingField, count] of existingFields) {
          // Skip excluded terms
          if (excludedTerms.some(term => existingField.toLowerCase() === term.toLowerCase())) {
            continue;
          }
          
          // Check if any word in the field matches the existing field
          for (const word of words) {
            if (word.length > 3 && 
                !excludedTerms.includes(word.toLowerCase()) && 
                existingField.toLowerCase().includes(word.toLowerCase())) {
              return existingField;
            }
          }
        }
      }
      
      // If still no match, put in "STEM" category as a better default than "Other"
      return 'STEM';
    }
    
    // Fix fields for each program
    let updatedCount = 0;
    
    // First, get the most common existing fields for reference
    const sortedBeforeFields = Object.entries(beforeFieldCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20); // Use top 20 most common fields as reference
    
    for (const program of programs) {
      let needsUpdate = false;
      let newFields = [];
      
      if (Array.isArray(program.field)) {
        // Process each field in the array
        const standardizedFields = new Set(); // Use Set to avoid duplicates
        
        program.field.forEach(field => {
          const standardized = standardizeField(field, program, sortedBeforeFields);
          standardizedFields.add(standardized);
        });
        
        newFields = Array.from(standardizedFields);
        
        // Check if fields have changed
        if (newFields.length !== program.field.length || 
            !newFields.every(f => program.field.includes(f))) {
          needsUpdate = true;
        }
      } else if (typeof program.field === 'string') {
        // Convert string field to standardized array
        newFields = [standardizeField(program.field, program, sortedBeforeFields)];
        needsUpdate = true;
      }
      
      // Update program if fields have changed
      if (needsUpdate) {
        program.field = newFields;
        await program.save();
        updatedCount++;
        
        if (updatedCount % 50 === 0) {
          console.log(`Updated ${updatedCount} programs so far...`);
        }
      }
    }
    
    console.log(`\nField standardization complete. Updated ${updatedCount} programs.`);
    
    // Get updated field statistics
    const afterFieldCounts = {};
    let afterTotalFieldInstances = 0;
    
    // Refresh programs from database
    const updatedPrograms = await Program.find({});
    
    updatedPrograms.forEach(program => {
      if (Array.isArray(program.field)) {
        program.field.forEach(field => {
          afterFieldCounts[field] = (afterFieldCounts[field] || 0) + 1;
          afterTotalFieldInstances++;
        });
      }
    });
    
    // Sort fields by frequency
    const sortedAfterFields = Object.entries(afterFieldCounts)
      .sort((a, b) => b[1] - a[1]);
    
    // Display results
    console.log('\n===== FIELD DISTRIBUTION AFTER STANDARDIZATION =====');
    console.log(`Total programs: ${updatedPrograms.length}`);
    console.log(`Total field instances: ${afterTotalFieldInstances}`);
    console.log(`Average fields per program: ${(afterTotalFieldInstances / updatedPrograms.length).toFixed(2)}`);
    console.log(`Unique fields: ${sortedAfterFields.length} (reduced from ${Object.keys(beforeFieldCounts).length})`);
    
    console.log('\n===== TOP FIELDS AFTER STANDARDIZATION =====');
    sortedAfterFields.forEach(([field, count], index) => {
      const percentage = ((count / updatedPrograms.length) * 100).toFixed(1);
      console.log(`${index + 1}. ${field}: ${count} programs (${percentage}%)`);
    });
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\nField analysis and standardization completed');
  } catch (error) {
    console.error('Error analyzing and fixing fields:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Replace analyzeFields with analyzeAndFixFields
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to MongoDB for field analysis and standardization');
    analyzeAndFixFields();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function analyzeFields() {
  try {
    // Get all programs
    const programs = await Program.find({});
    console.log(`Analyzing fields for ${programs.length} programs...`);
    
    // Count field occurrences
    const fieldCounts = {};
    let totalFieldInstances = 0;
    
    // Track programs by source
    const programsBySource = {};
    
    programs.forEach(program => {
      // Track source
      const source = program.source || 'Unknown';
      programsBySource[source] = (programsBySource[source] || 0) + 1;
      
      if (Array.isArray(program.field)) {
        program.field.forEach(field => {
          fieldCounts[field] = (fieldCounts[field] || 0) + 1;
          totalFieldInstances++;
        });
      } else if (typeof program.field === 'string') {
        fieldCounts[program.field] = (fieldCounts[program.field] || 0) + 1;
        totalFieldInstances++;
      }
    });
    
    // Sort fields by frequency
    const sortedFields = Object.entries(fieldCounts)
      .sort((a, b) => b[1] - a[1]);
    
    // Display results
    console.log('\n===== PROGRAM SOURCES =====');
    Object.entries(programsBySource)
      .sort((a, b) => b[1] - a[1])
      .forEach(([source, count]) => {
        console.log(`${source}: ${count} programs`);
      });
    
    console.log('\n===== FIELD DISTRIBUTION =====');
    console.log(`Total programs: ${programs.length}`);
    console.log(`Total field instances: ${totalFieldInstances}`);
    console.log(`Average fields per program: ${(totalFieldInstances / programs.length).toFixed(2)}`);
    console.log(`Unique fields: ${sortedFields.length}`);
    
    console.log('\n===== TOP 20 FIELDS =====');
    sortedFields.slice(0, 20).forEach(([field, count], index) => {
      const percentage = ((count / programs.length) * 100).toFixed(1);
      console.log(`${index + 1}. ${field}: ${count} programs (${percentage}%)`);
    });
    
    // Identify potential problematic fields (very low occurrence)
    console.log('\n===== POTENTIAL PROBLEMATIC FIELDS (< 1% of programs) =====');
    const threshold = programs.length * 0.01;
    const problematicFields = sortedFields.filter(([_, count]) => count < threshold);
    
    console.log(`Found ${problematicFields.length} fields with < 1% occurrence`);
    console.log(`Top 20 least common fields:`);
    
    problematicFields.slice(0, 20).forEach(([field, count]) => {
      const percentage = ((count / programs.length) * 100).toFixed(1);
      console.log(`${field}: ${count} programs (${percentage}%)`);
    });
    
    // Analyze field length
    console.log('\n===== FIELD NAME LENGTH ANALYSIS =====');
    const fieldLengths = sortedFields.map(([field, _]) => ({
      field,
      words: field.split(/\s+/).length,
      chars: field.length
    }));
    
    const longFields = fieldLengths.filter(f => f.words > 3);
    console.log(`Fields with more than 3 words: ${longFields.length}`);
    longFields.slice(0, 10).forEach(f => {
      console.log(`- "${f.field}" (${f.words} words, ${f.chars} chars)`);
    });
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\nField analysis completed');
  } catch (error) {
    console.error('Error analyzing fields:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}