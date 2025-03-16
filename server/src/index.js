const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cron = require('node-cron');

// Import routes
const programRoutes = require('./routes/programRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const scraperRoutes = require('./routes/scraperRoutes');

// Import services
const { updateNsfPrograms, updateSciencePathwaysPrograms } = require('./services/scraper');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Welcome to REU Cafe API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      programs: '/api/programs',
      auth: '/api/auth',
      users: '/api/users'
    }
  });
});

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reucafe';
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Routes
app.use('/api/programs', programRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/scrapers', scraperRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Serve static files
app.use(express.static('public'));

// Schedule scraping jobs
// Run every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running scheduled scraping jobs...');
  try {
    await updateNsfPrograms();
    await updateSciencePathwaysPrograms();
    console.log('Scraping jobs completed successfully');
  } catch (error) {
    console.error('Error running scraping jobs:', error);
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});