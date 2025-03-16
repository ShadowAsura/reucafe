// Remove this line
// require('./utils/consoleInterceptor');

// Keep the rest of the server.js code as is

// Define Routes - make sure we're using the correct route file
app.use('/api/programs', require('./routes/api/programs'));
// If there's a duplicate route, comment it out:
// app.use('/api/programs', require('./routes/programRoutes'));

// Add this line with the other route imports
const scraperRoutes = require('./routes/scraperRoutes');

// Add this line with the other app.use statements
app.use('/api/scrapers', scraperRoutes);