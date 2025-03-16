const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Set up Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearFields() {
  try {
    console.log('Clearing fields from programs table...');
    
    const { data, error } = await supabase
      .from('programs')
      .update({ field: [] })
      .not('id', 'is', null);
    
    if (error) {
      console.error('Error clearing fields:', error);
      return;
    }
    
    console.log('Successfully cleared all fields from programs table');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

clearFields();