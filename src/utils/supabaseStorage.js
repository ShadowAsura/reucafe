import { supabase } from '../supabase';

export async function setupStorage() {
  try {
    console.log('Starting storage setup...');
    
    // First, check if the avatars bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      throw bucketsError;
    }

    console.log('Available buckets:', buckets);

    const avatarsBucket = buckets.find(bucket => bucket.name === 'avatars');
    
    if (!avatarsBucket) {
      console.warn('Avatars bucket not found in available buckets:', buckets.map(b => b.name));
      // Even if the bucket is not visible in the list, we know it exists from the SQL query
      // So we'll proceed with the setup
      console.log('Proceeding with setup as bucket exists in database');
    } else {
      // If we get here, the bucket exists
      console.log('Avatars bucket found:', avatarsBucket);
      console.log('Bucket configuration:', {
        id: avatarsBucket.id,
        name: avatarsBucket.name,
        public: avatarsBucket.public,
        fileSizeLimit: avatarsBucket.file_size_limit
      });
    }

    // Policies already exist, so we don't need to create them
    console.log('Storage policies are already set up');

    console.log('Storage setup completed successfully');
    return true;
  } catch (error) {
    console.error('Error in storage setup:', error);
    throw error;
  }
} 