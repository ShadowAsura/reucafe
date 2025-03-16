const User = require('../models/User');
const Program = require('../models/Program');

// Save a program
exports.saveProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    
    // Check if program exists
    const program = await Program.findById(programId);
    
    if (!program) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    // Get user
    const user = await User.findById(req.user.id);
    
    // Check if program is already saved
    if (user.savedPrograms.includes(programId)) {
      return res.status(400).json({
        success: false,
        message: 'Program already saved'
      });
    }
    
    // Add program to saved programs
    user.savedPrograms.push(programId);
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Program saved',
      savedPrograms: user.savedPrograms
    });
  } catch (error) {
    console.error('Error saving program:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Unsave a program
exports.unsaveProgram = async (req, res) => {
  try {
    const { programId } = req.params;
    
    // Get user
    const user = await User.findById(req.user.id);
    
    // Check if program is saved
    if (!user.savedPrograms.includes(programId)) {
      return res.status(400).json({
        success: false,
        message: 'Program not saved'
      });
    }
    
    // Remove program from saved programs
    user.savedPrograms = user.savedPrograms.filter(
      id => id.toString() !== programId
    );
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Program unsaved',
      savedPrograms: user.savedPrograms
    });
  } catch (error) {
    console.error('Error unsaving program:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get saved programs
exports.getSavedPrograms = async (req, res) => {
  try {
    // Get user with populated saved programs
    const user = await User.findById(req.user.id).populate('savedPrograms');
    
    res.status(200).json({
      success: true,
      savedPrograms: user.savedPrograms
    });
  } catch (error) {
    console.error('Error getting saved programs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};