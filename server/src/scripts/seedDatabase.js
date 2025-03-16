const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Program = require('../models/Program');
const User = require('../models/User');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/reucafe')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Sample programs data
const programsData = [
  {
    title: 'REU in Computer Science',
    institution: 'Stanford University',
    location: 'Stanford, CA',
    field: 'Computer Science',
    deadline: new Date('2023-02-15'),
    stipend: '$6,000',
    duration: '10 weeks',
    description: 'Research experience in artificial intelligence, machine learning, and data science.',
    link: 'https://example.com/stanford-reu',
    source: 'NSF',
    status: 'approved'
  },
  {
    title: 'REU in Physics',
    institution: 'MIT',
    location: 'Cambridge, MA',
    field: 'Physics',
    deadline: new Date('2023-02-01'),
    stipend: '$5,500',
    duration: '8 weeks',
    description: 'Research experience in quantum physics and astrophysics.',
    link: 'https://example.com/mit-reu',
    source: 'NSF',
    status: 'approved'
  },
  {
    title: 'REU in Chemistry',
    institution: 'Harvard University',
    location: 'Cambridge, MA',
    field: 'Chemistry',
    deadline: new Date('2023-02-10'),
    stipend: '$5,800',
    duration: '10 weeks',
    description: 'Research experience in organic chemistry and biochemistry.',
    link: 'https://example.com/harvard-reu',
    source: 'Science Pathways',
    status: 'approved'
  }
];

// Seed database
const seedDatabase = async () => {
  try {
    // Clear existing data
    await Program.deleteMany({});
    console.log('Cleared existing programs');

    // Insert new programs
    const programs = await Program.insertMany(programsData);
    console.log(`Added ${programs.length} programs`);

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@reucafe.com' });
    
    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@reucafe.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('Created admin user');
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();