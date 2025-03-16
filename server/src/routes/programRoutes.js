const express = require('express');
const router = express.Router();
const Program = require('../models/Program');

// Get available fields - MOVED THIS ROUTE BEFORE THE ID ROUTE
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

// Search programs - MOVED THIS ROUTE BEFORE THE ID ROUTE
router.get('/search/query', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const programs = await Program.find({
      $and: [
        { status: 'approved' },
        {
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { institution: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { field: { $regex: query, $options: 'i' } },
            { location: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).limit(100);
    
    res.json(programs);
  } catch (error) {
    console.error('Error searching programs:', error);
    res.status(500).json({ message: 'Error searching programs', error: error.message });
  }
});

// Get all programs
router.get('/', async (req, res) => {
  try {
    // Add query parameters for filtering
    const filter = { status: 'approved' }; // Only return approved programs
    
    // If specific fields are requested
    if (req.query.field) {
      filter.field = req.query.field; // This will match programs that have this field in their array
    }
    
    // If specific source is requested
    if (req.query.source) {
      filter.source = req.query.source;
    }
    
    const programs = await Program.find(filter)
      .sort({ updatedAt: -1 })
      .limit(req.query.limit ? parseInt(req.query.limit) : 1000);
    
    res.json(programs);
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({ message: 'Error fetching programs', error: error.message });
  }
});

// Get program by ID - MOVED THIS ROUTE AFTER THE SPECIFIC ROUTES
router.get('/:id', async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }
    
    res.json(program);
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({ message: 'Error fetching program', error: error.message });
  }
});

// REMOVED THE NESTED ROUTE DEFINITION AND DUPLICATE /fields/list ROUTE

module.exports = router;