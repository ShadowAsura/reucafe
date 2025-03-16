const Program = require('../models/Program');

// Get all programs with filtering, sorting, and pagination
exports.getPrograms = async (req, res) => {
  try {
    const { 
      field, 
      institution, 
      search, 
      sort = 'deadline', 
      order = 'asc',
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build query
    const query = { status: 'approved' };
    
    if (field && field !== 'All Fields') {
      query.field = field;
    }
    
    if (institution) {
      query.institution = institution;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    // Count total documents
    const total = await Program.countDocuments(query);
    
    // Execute query with pagination
    const programs = await Program.find(query)
      .sort({ [sort]: order === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: programs.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      programs
    });
  } catch (error) {
    console.error('Error getting programs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get program by ID
exports.getProgramById = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    res.status(200).json({
      success: true,
      program
    });
  } catch (error) {
    console.error('Error getting program by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Suggest a new program
exports.suggestProgram = async (req, res) => {
  try {
    const { 
      title, 
      institution, 
      location, 
      field, 
      deadline, 
      stipend, 
      duration, 
      description, 
      link 
    } = req.body;
    
    // Create new program
    const program = new Program({
      title,
      institution,
      location,
      field,
      deadline,
      stipend,
      duration,
      description,
      link,
      source: 'User Suggested',
      status: 'pending',
      userId: req.user.id
    });
    
    await program.save();
    
    res.status(201).json({
      success: true,
      message: 'Program suggestion submitted for review',
      program
    });
  } catch (error) {
    console.error('Error suggesting program:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Approve a program (admin only)
exports.approveProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    program.status = 'approved';
    program.updatedAt = Date.now();
    
    await program.save();
    
    res.status(200).json({
      success: true,
      message: 'Program approved',
      program
    });
  } catch (error) {
    console.error('Error approving program:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Reject a program (admin only)
exports.rejectProgram = async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    program.status = 'rejected';
    program.updatedAt = Date.now();
    
    await program.save();
    
    res.status(200).json({
      success: true,
      message: 'Program rejected',
      program
    });
  } catch (error) {
    console.error('Error rejecting program:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};