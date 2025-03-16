const express = require('express');
const router = express.Router();
const { 
  getPrograms, 
  getProgramById, 
  suggestProgram, 
  approveProgram, 
  rejectProgram 
} = require('../controllers/programController');
const { authenticate, isAdmin } = require('../middleware/auth');

// Get all programs
router.get('/', getPrograms);

// Get program by ID
router.get('/:id', getProgramById);

// Suggest a new program (requires authentication)
router.post('/suggest', authenticate, suggestProgram);

// Admin routes
router.put('/:id/approve', authenticate, isAdmin, approveProgram);
router.put('/:id/reject', authenticate, isAdmin, rejectProgram);

module.exports = router;