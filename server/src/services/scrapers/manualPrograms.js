const Program = require('../../models/Program');

// Add more REU programs manually
exports.addManualPrograms = async () => {
  try {
    console.log('Adding manual REU programs...');
    
    const manualPrograms = [
      {
        title: 'REU in Computer Science and Engineering',
        institution: 'University of Notre Dame',
        location: 'Notre Dame, IN',
        field: 'Computer Science',
        deadline: new Date('2024-02-15'),
        stipend: '$6,000',
        duration: '10 weeks',
        description: 'The Notre Dame REU in Computer Science and Engineering offers research opportunities in artificial intelligence, machine learning, cybersecurity, and software engineering.',
        requirements: 'Open to undergraduate students majoring in computer science, computer engineering, or related fields. Students must have completed at least two years of undergraduate study. U.S. citizenship or permanent residency required.',
        link: 'https://cse.nd.edu/undergraduate/research-experiences-for-undergraduates/',
        applicationLink: 'https://cse.nd.edu/undergraduate/research-experiences-for-undergraduates/apply/',
        source: 'NSF',
        status: 'approved'
      },
      {
        title: 'Summer Research in Neuroscience',
        institution: 'Emory University',
        location: 'Atlanta, GA',
        field: 'Neuroscience',
        deadline: new Date('2024-02-01'),
        stipend: '$5,800',
        duration: '10 weeks',
        description: 'This program provides research experience in neuroscience, focusing on brain development, neurological disorders, and cognitive neuroscience.',
        requirements: 'Undergraduate students who have completed at least one year of college with coursework in biology, psychology, or neuroscience. GPA of 3.0 or higher preferred. U.S. citizenship or permanent residency required.',
        link: 'https://www.emory.edu/neuroscience/reu',
        applicationLink: 'https://www.emory.edu/neuroscience/reu/apply',
        source: 'NSF',
        status: 'approved'
      },
      {
        title: 'REU in Marine Sciences',
        institution: 'University of Hawaii',
        location: 'Honolulu, HI',
        field: 'Marine Biology',
        deadline: new Date('2024-02-10'),
        stipend: '$6,000',
        duration: '10 weeks',
        description: 'This REU program offers research opportunities in marine biology, oceanography, and marine conservation. Students will conduct field work in Hawaii\'s unique marine ecosystems.',
        requirements: 'Open to undergraduate students majoring in biology, environmental science, or related fields. Snorkeling experience required, SCUBA certification preferred. U.S. citizenship or permanent residency required.',
        link: 'https://www.hawaii.edu/marine-sciences/reu',
        applicationLink: 'https://www.hawaii.edu/marine-sciences/reu/apply',
        source: 'Science Pathways',
        status: 'approved'
      }
    ];
    
    // Update database with manual programs
    for (const program of manualPrograms) {
      // Check if program already exists
      const existingProgram = await Program.findOne({
        title: program.title,
        institution: program.institution
      });
      
      if (existingProgram) {
        // Update existing program
        Object.assign(existingProgram, program);
        existingProgram.updatedAt = Date.now();
        await existingProgram.save();
      } else {
        // Create new program
        await Program.create(program);
      }
    }
    
    console.log(`Added ${manualPrograms.length} manual REU programs`);
    return manualPrograms;
  } catch (error) {
    console.error('Error adding manual programs:', error);
    throw error;
  }
};