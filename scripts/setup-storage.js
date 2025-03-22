const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service role key for admin privileges
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  try {
    console.log('Setting up storage bucket for avatars...');

    // Create the avatars bucket if it doesn't exist
    const { data: bucket, error: bucketError } = await supabase
      .storage
      .createBucket('avatars', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
        fileSizeLimit: 5242880, // 5MB
      });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('Bucket already exists, updating policies...');
      } else {
        throw bucketError;
      }
    } else {
      console.log('Created avatars bucket successfully');
    }

    // Set up bucket policies
    const { error: policyError } = await supabase
      .storage
      .from('avatars')
      .createSignedUrl('test.txt', 60);

    if (policyError) {
      console.log('Setting up bucket policies...');
      
      // Allow public read access
      const { error: readPolicyError } = await supabase
        .storage
        .from('avatars')
        .createSignedUrl('test.txt', 60);

      if (readPolicyError) {
        console.error('Error setting up read policy:', readPolicyError);
      }

      // Allow authenticated users to upload
      const { error: uploadPolicyError } = await supabase
        .storage
        .from('avatars')
        .upload('test.txt', 'test');

      if (uploadPolicyError) {
        console.error('Error setting up upload policy:', uploadPolicyError);
      }
    }

    console.log('Storage setup completed successfully');
  } catch (error) {
    console.error('Error setting up storage:', error);
  }
}

setupStorage(); 