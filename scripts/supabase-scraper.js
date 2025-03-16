const { createClient } = require('@supabase/supabase-js');
const { updateNsfPrograms } = require('../server/src/services/scrapers/nsfScraper');
const { updatePathwaysToSciencePrograms } = require('../server/src/services/scrapers/pathwaysToScienceScraper');
const { updateGoogleSheetsPrograms } = require('../server/src/services/scrapers/googleSheetsScraper');
const { standardizeFields } = require('../server/src/services/scrapers/fieldStandardizer');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const saveToSupabase = async (programs, source) => {
  if (!programs || programs.length === 0) {
    console.log(`No programs to save for ${source}`);
    return [];
  }

  console.log(`Saving ${programs.length} programs from ${source} to Supabase...`);
  
  const BATCH_SIZE = 100;
  let validPrograms = programs.map(program => {
    console.log(`Processing URL for program: ${program.title}`);
    console.log(`Original URL: ${program.url || program.link || 'No URL provided'}`);
  
    let fieldArray = [];
    if (Array.isArray(program.field)) {
      fieldArray = program.field
        .filter(f => f !== null && f !== undefined && String(f).trim() !== '')
        .map(f => String(f).trim())
        .filter(f => f.length > 0);
    } else if (program.field) {
      const fieldStr = String(program.field).trim();
      if (fieldStr) {
        fieldArray = fieldStr
          .split(/[,;\/]|\s+and\s+|\s+&\s+/i)
          .map(f => f.trim())
          .filter(f => f.length > 0);
      }
    }
    
    fieldArray = standardizeFields(
      fieldArray, 
      program.description || '', 
      program.title || ''
    );
    
    fieldArray = [...new Set(fieldArray)];
  
    console.log(`Processed fields for ${program.title}:`, fieldArray);
  
    let cleanUrl = '';
    try {
      if (program.url) {
        cleanUrl = new URL(program.url).toString();
      } else if (program.link) {
        cleanUrl = new URL(program.link).toString();
      }
      console.log(`Cleaned URL: ${cleanUrl}`);
    } catch (error) {
      console.warn(`Invalid URL for program ${program.title}:`, error.message);
      cleanUrl = String(program.url || program.link || '');
    }
    
    let deadlineStr = null;
    if (program.deadline) {
      if (program.deadline instanceof Date) {
        deadlineStr = program.deadline.toISOString();
      } else if (typeof program.deadline === 'string') {
        deadlineStr = program.deadline;
      }
    }
  
    let processedDescription = String(program.description || '');
    
    if (processedDescription) {
      processedDescription = processedDescription
        .replace(/\.\.\.read more/gi, '')
        .replace(/\.\.\.$/g, '')
        .replace(/\.\.\./g, '')
        .replace(/\s*\(read more\)/gi, '')
        .replace(/read more/gi, '')
        .trim();
      
      processedDescription = processedDescription
        .replace(/\s*\n\s*/g, '\n\n')
        .replace(/\s+/g, ' ')
        .replace(/\n\n+/g, '\n\n')
        .trim();
    }
    
    return {
      title: String(program.title || 'Untitled Program'),
      institution: String(program.institution || 'Unknown Institution'),
      description: processedDescription,
      field: fieldArray,
      location: String(program.location || 'Unknown Location'),
      deadline: deadlineStr,
      url: cleanUrl,
      source: String(source),
      created_at: new Date().toISOString()
    };
  });

  const uniqueMap = new Map();
  validPrograms.forEach(program => {
    const key = `${program.title}|${program.institution}`;
    uniqueMap.set(key, program);
  });
  
  validPrograms = Array.from(uniqueMap.values());
  console.log(`After removing duplicates: ${validPrograms.length} programs`);

  for (let i = 0; i < validPrograms.length; i += BATCH_SIZE) {
    const batch = validPrograms.slice(i, i + BATCH_SIZE);
    console.log(`Inserting batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(validPrograms.length/BATCH_SIZE)}`);
    
    try {
      const { data, error } = await supabase
        .from('programs')
        .upsert(batch, { 
          onConflict: 'title,institution',
          ignoreDuplicates: false,
          returning: 'minimal',
          update: ['field', 'description', 'location', 'deadline', 'url', 'source', 'updated_at']
        });

      if (!error) {
        const { data: savedPrograms, error: verifyError } = await supabase
          .from('programs')
          .select('title,field')
          .in('title', batch.map(p => p.title));

        if (verifyError) {
          console.error('Error verifying saved programs:', verifyError);
        } else {
          savedPrograms.forEach(program => {
            if (!program.field || program.field.length === 0) {
              console.warn(`Warning: No fields saved for program ${program.title}`);
            } else {
              console.log(`Successfully saved fields for ${program.title}: ${program.field.join(', ')}`);
            }
          });
        }
      }
        
      if (error) {
        console.error(`Error inserting batch to Supabase:`, error);
        
        console.log('Attempting to insert records one by one...');
        for (const program of batch) {
          const { error: singleError } = await supabase
            .from('programs')
            .upsert([program], {
              onConflict: 'title,institution',
              ignoreDuplicates: false,
              returning: 'minimal',
              update: ['field', 'description', 'location', 'deadline', 'url', 'source']
            });
            
          if (singleError) {
            console.error(`Failed to insert program: ${program.title} at ${program.institution}`, singleError);
          }
        }
      } else {
        console.log(`Successfully inserted batch to Supabase`);
      }
    } catch (err) {
      console.error('Unexpected error during batch insert:', err);
    }
  }
  
  console.log(`Finished saving ${source} programs to Supabase`);
  return validPrograms;
};

const clearAllFields = async () => {
  try {
    console.log('Clearing all fields from programs table...');
    
    const { data, error } = await supabase
      .from('programs')
      .update({ field: [] })
      .not('id', 'is', null);
    
    if (error) {
      console.error('Error clearing fields:', error);
      return false;
    }
    
    console.log('Successfully cleared all fields from programs table');
    return true;
  } catch (err) {
    console.error('Unexpected error during field clearing:', err);
    return false;
  }
};

const cleanupExistingPrograms = async () => {
  console.log('Cleaning up existing programs...');
  try {
    const { error } = await supabase
      .from('programs')
      .delete()
      .not('id', 'is', null);
      
    if (error) {
      console.error('Error cleaning up programs:', error);
      return false;
    }
    
    console.log('Successfully cleaned up all existing programs');
    return true;
  } catch (err) {
    console.error('Unexpected error during program cleanup:', err);
    return false;
  }
};

const runScrapersAndSaveToSupabase = async () => {
  try {
    console.log('Starting scrapers...');
    
    const cleaned = await cleanupExistingPrograms();
    if (!cleaned) {
      console.error('Failed to clean up existing programs. Continuing with scraping anyway...');
    }
    
    try {
      const { data, error } = await supabase.from('programs').select('*').limit(1);
      if (error) {
        console.error('Error connecting to Supabase:', error);
        console.log('Creating programs table manually...');
        
        const { error: createError } = await supabase.rpc('create_programs_table');
        if (createError) {
          console.error('Failed to create table:', createError);
        }
      } else {
        console.log('Successfully connected to Supabase');
        
        console.log('Clearing all fields before running scrapers...');
        const fieldsCleared = await clearAllFields();
        if (!fieldsCleared) {
          console.error('Failed to clear fields. Continuing with scraping anyway...');
        }
      }
    } catch (error) {
      console.error('Failed to connect to Supabase:', error);
    }
    
    console.log('Running NSF scraper...');
    try {
      const nsfPrograms = await updateNsfPrograms();
      await saveToSupabase(nsfPrograms, 'nsf');
    } catch (error) {
      console.error('Error running NSF scraper:', error);
    }
    
    console.log('Running Science Pathways scraper...');
    try {
      const sciencePathwaysPrograms = await updatePathwaysToSciencePrograms();
      await saveToSupabase(sciencePathwaysPrograms, 'sciencepathways');
    } catch (error) {
      console.error('Error running Science Pathways scraper:', error);
    }
    
    console.log('Running Google Sheets scraper...');
    try {
      const googleSheetsPrograms = await updateGoogleSheetsPrograms();
      await saveToSupabase(googleSheetsPrograms, 'googlesheets');
    } catch (error) {
      console.error('Error running Google Sheets scraper:', error);
    }
    
    console.log('All scraping and saving completed successfully');
  } catch (error) {
    console.error('Error running scrapers:', error);
  }
};

const removeDuplicatesFromSupabase = async () => {
  console.log('Starting duplicate removal process...');
  
  try {
    const { data: programs, error } = await supabase
      .from('programs')
      .select('*');
      
    if (error) {
      console.error('Error fetching programs:', error);
      return;
    }
    
    console.log(`Found ${programs.length} total programs in database`);
    
    const uniquePrograms = new Map();
    const duplicateIds = [];
    
    programs.forEach(program => {
      const key = `${program.title}|${program.institution}`;
      
      if (uniquePrograms.has(key)) {
        duplicateIds.push(program.id);
      } else {
        uniquePrograms.set(key, program);
      }
    });
    
    console.log(`Found ${duplicateIds.length} duplicate programs to remove`);
    
    if (duplicateIds.length === 0) {
      console.log('No duplicates found. Database is clean.');
      return;
    }
    
    const BATCH_SIZE = 100;
    for (let i = 0; i < duplicateIds.length; i += BATCH_SIZE) {
      const batch = duplicateIds.slice(i, i + BATCH_SIZE);
      console.log(`Deleting batch ${Math.floor(i/BATCH_SIZE) + 1} of ${Math.ceil(duplicateIds.length/BATCH_SIZE)}`);
      
      const { error: deleteError } = await supabase
        .from('programs')
        .delete()
        .in('id', batch);
        
      if (deleteError) {
        console.error('Error deleting duplicates:', deleteError);
      } else {
        console.log(`Successfully deleted ${batch.length} duplicates`);
      }
    }
    
    console.log('Duplicate removal completed successfully');
  } catch (err) {
    console.error('Unexpected error during duplicate removal:', err);
  }
};

runScrapersAndSaveToSupabase();

module.exports = {
  saveToSupabase,
  runScrapersAndSaveToSupabase,
  removeDuplicatesFromSupabase
};