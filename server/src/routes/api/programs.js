const express = require('express');
const router = express.Router();
const Program = require('../../models/Program');
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

// Update the order of routes to ensure specific routes come before parameter routes

// @route   GET api/programs
// @desc    Get all programs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const programs = await Program.find().sort({ deadline: 1 });
    res.json(programs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/programs/fields
// @desc    Get all unique fields
// @access  Public
router.get('/fields', async (req, res) => {
  try {
    // Get all programs
    const programs = await Program.find({}, 'field');
    
    // Extract all unique fields
    const fields = new Set();
    programs.forEach(program => {
      if (Array.isArray(program.field)) {
        program.field.forEach(field => fields.add(field));
      } else if (program.field) {
        fields.add(program.field);
      }
    });
    
    // Convert to array and sort alphabetically
    const sortedFields = Array.from(fields).sort();
    
    res.json({
      success: true,
      count: sortedFields.length,
      data: sortedFields
    });
  } catch (error) {
    console.error('Error fetching fields:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @route   GET api/programs/:id
// @desc    Get program by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({ msg: 'Program not found' });
    }
    
    res.json(program);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Program not found' });
    }
    res.status(500).send('Server Error');
  }
});

// Add other routes for CRUD operations...

module.exports = router;