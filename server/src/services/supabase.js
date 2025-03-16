const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

exports.clearPrograms = async () => {
  try {
    console.log('Clearing all programs from Supabase...');
    const { error } = await supabase
      .from('programs')
      .delete()
      .neq('id', 0);

    if (error) {
      console.error('Error clearing programs:', error);
      throw error;
    }
    console.log('Successfully cleared all programs');
  } catch (error) {
    console.error('Error in clearPrograms:', error);
    throw error;
  }
};

exports.updatePrograms = async (programs) => {
  try {
    console.log(`Attempting to update ${programs.length} programs in Supabase...`);
    
    for (const program of programs) {
      const { data: existingProgram } = await supabase
        .from('programs')
        .select('id')
        .or(`url.eq.${program.url},title.ilike.${program.title}`)
        .single();
      
      if (existingProgram) {
        const { error: updateError } = await supabase
          .from('programs')
          .update({
            ...program,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingProgram.id);
          
        if (updateError) {
          console.error(`Error updating program ${program.title}:`, updateError);
        } else {
          console.log(`Updated program: ${program.title}`);
        }
      } else {
        const { error: insertError } = await supabase
          .from('programs')
          .insert([{
            ...program,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }]);
          
        if (insertError) {
          console.error(`Error inserting program ${program.title}:`, insertError);
        } else {
          console.log(`Inserted new program: ${program.title}`);
        }
      }
    }
    
    console.log('Program update completed');
  } catch (error) {
    console.error('Error updating programs in Supabase:', error);
    throw error;
  }
};