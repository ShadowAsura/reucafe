const mongoose = require('mongoose');
const Program = require('../models/Program');
require('dotenv').config();

async function viewPrograms() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Query programs from Science Pathways
    const programs = await Program.find({ source: 'Science Pathways' })
      .sort({ updatedAt: -1 })
      .limit(20); // Limit to 20 most recently updated programs

    console.log(`Found ${programs.length} Science Pathways programs`);
    
    // Display program details
    programs.forEach((program, index) => {
      console.log(`\n--- Program ${index + 1} ---`);
      console.log(`Title: ${program.title}`);
      console.log(`Institution: ${program.institution}`);
      console.log(`Location: ${program.location}`);
      console.log(`Field: ${program.field}`);
      console.log(`Deadline: ${program.deadline}`);
      console.log(`Link: ${program.link}`);
    });

    // Count programs by field
    const fieldCounts = await Program.aggregate([
      { $match: { source: 'Science Pathways' } },
      { $group: { _id: '$field', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n--- Programs by Field ---');
    fieldCounts.forEach(field => {
      console.log(`${field._id}: ${field.count}`);
    });

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

viewPrograms();