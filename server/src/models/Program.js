const mongoose = require('mongoose');

const ProgramSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  institution: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  field: {
    type: [String], // Change from String to [String] to support multiple fields
    required: true,
    default: []
  },
  deadline: {
    type: Date,
    required: true
  },
  stipend: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  requirements: {
    type: String,
    trim: true,
    default: 'Please check the program website for specific eligibility requirements.'
  },
  link: {
    type: String,
    required: true,
    trim: true
  },
  applicationLink: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    required: true,
    enum: ['NSF', 'Science Pathways', 'User Suggested']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add text index for search functionality
// The schema is likely defined as ProgramSchema (capital P) but referenced as programSchema (lowercase p)
// Change this line:
ProgramSchema.index({
  title: 'text', 
  institution: 'text', 
  description: 'text',
  field: 'text',
  requirements: 'text'
});
// To this:
// Fix the index definition to use ProgramSchema instead of programSchema
ProgramSchema.index({
  title: 'text', 
  institution: 'text', 
  description: 'text',
  field: 'text',
  requirements: 'text'
});
// Fix the model creation to use ProgramSchema instead of programSchema
const Program = mongoose.model('Program', ProgramSchema);

module.exports = Program;