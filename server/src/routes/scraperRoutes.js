const express = require('express');
const router = express.Router();
const { runScraper, getScraperStatus } = require('../controllers/scraperController');
const { authenticateJWT, isAdmin } = require('../middleware/authMiddleware');

// Protected routes - only accessible by admins
router.get('/status', authenticateJWT, isAdmin, getScraperStatus);
router.post('/run/:source', authenticateJWT, isAdmin, runScraper);

module.exports = router;