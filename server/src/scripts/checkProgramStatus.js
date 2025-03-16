const mongoose = require('mongoose');
const Program = require('../models/Program');
require('dotenv').config();

async function checkProgramStatus() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Count total programs
    const totalCount = await Program.countDocuments();
    console.log(`Total programs in database: ${totalCount}`);
    
    // Count by status
    const statusCounts = await Program.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n--- Programs by Status ---');
    statusCounts.forEach(status => {
      console.log(`${status._id || 'undefined'}: ${status.count}`);
    });
    
    // Count by source
    const sourceCounts = await Program.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n--- Programs by Source ---');
    sourceCounts.forEach(source => {
      console.log(`${source._id || 'undefined'}: ${source.count}`);
    });
    
    // Fix programs with missing status
    const missingStatusCount = await Program.countDocuments({ status: { $exists: false } });
    if (missingStatusCount > 0) {
      console.log(`\nFixing ${missingStatusCount} programs with missing status...`);
      await Program.updateMany(
        { status: { $exists: false } },
        { $set: { status: 'approved' } }
      );
      console.log('Fixed missing status fields');
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkProgramStatus();