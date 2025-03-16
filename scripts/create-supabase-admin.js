const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client with service role key for admin privileges
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Admin user details
// Admin user details - these should be set in .env file
const adminUser = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  user_metadata: {
    role: 'admin'
  }
};

// Verify environment variables
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  throw new Error('Missing admin credentials in environment variables. Please set ADMIN_EMAIL and ADMIN_PASSWORD in .env file');
}

async function createAdminUser() {
  try {
    console.log('Creating admin user in Supabase...');

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('auth.users')
      .select('*')
      .eq('email', adminUser.email)
      .single();

    if (existingUser) {
      console.log('Admin user already exists');
      
      // Update user role
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { user_metadata: { role: 'admin' } }
      );

      if (updateError) throw updateError;
      console.log('Updated admin role');
      return;
    }

    // Create new admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminUser.email,
      password: adminUser.password,
      user_metadata: adminUser.user_metadata,
      email_confirm: true
    });

    if (error) throw error;

    console.log('Admin user created successfully');
    console.log('Email:', adminUser.email);
    console.log('Password:', adminUser.password);

  } catch (error) {
    console.error('Error creating admin user:', error.message);
  }
}

createAdminUser();