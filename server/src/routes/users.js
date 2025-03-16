const express = require('express');
const router = express.Router();
const { 
  saveProgram, 
  unsaveProgram, 
  getSavedPrograms 
} = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Save a program
router.post('/save-program/:programId', saveProgram);

// Unsave a program
router.delete('/save-program/:programId', unsaveProgram);

// Get saved programs
router.get('/saved-programs', getSavedPrograms);

module.exports = router;