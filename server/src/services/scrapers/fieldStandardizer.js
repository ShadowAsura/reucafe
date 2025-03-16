// Utility function to standardize field names across all scrapers
exports.standardizeFields = function(fields, description = '', title = '') {
  // Define standard field categories with keywords
  const standardFields = {
    'Biology': ['biology', 'biomedical', 'biomed', 'bio', 'genomics', 'neuroscience', 'ecology', 'molecular', 'biochemistry', 'bioinformatics', 'microbiology', 'genetics', 'cell', 'physiology', 'biotechnology', 'immunology', 'marine biology', 'zoology', 'botany', 'developmental', 'virology', 'pathology', 'pharmacology', 'systems biology', 'synthetic biology', 'evolutionary biology', 'structural biology', 'plant science', 'parasitology', 'histology', 'embryology', 'endocrinology', 'entomology', 'biomedicine', 'biophysics', 'computational biology', 'neuroscience', 'biotechnology', 'biomedical science', 'molecular biology', 'cell biology', 'developmental biology', 'cancer biology', 'stem cell', 'proteomics', 'metabolomics', 'systems biology', 'marine biology', 'conservation biology', 'population biology', 'organismal biology', 'plant biology', 'animal biology', 'microbial biology'],
    'Chemistry': ['chemistry', 'chem', 'biochem', 'organic', 'inorganic', 'analytical', 'physical chemistry', 'materials chemistry', 'polymer', 'synthesis', 'catalysis', 'electrochemistry', 'spectroscopy', 'computational chemistry', 'medicinal chemistry', 'photochemistry', 'thermochemistry', 'radiochemistry', 'nuclear chemistry', 'surface chemistry', 'crystallography', 'green chemistry', 'organometallic', 'quantum chemistry', 'stereochemistry', 'biochemistry', 'materials science', 'analytical chemistry', 'synthetic chemistry', 'organic synthesis', 'inorganic synthesis', 'chemical biology', 'chemical physics', 'chemical engineering', 'pharmaceutical chemistry', 'environmental chemistry', 'atmospheric chemistry', 'food chemistry', 'forensic chemistry', 'industrial chemistry', 'nanochemistry'],
    'Physics': ['physics', 'astrophysics', 'astronomy', 'astro', 'quantum', 'optics', 'mechanics', 'particle', 'condensed matter', 'plasma', 'nuclear', 'theoretical', 'experimental physics', 'cosmology', 'relativity', 'atomic physics', 'molecular physics', 'biophysics', 'geophysics', 'thermodynamics', 'electromagnetism', 'acoustics', 'fluid dynamics', 'statistical physics', 'high energy physics', 'laser physics', 'nanophysics', 'nanoscience', 'quantum mechanics', 'quantum field theory', 'string theory', 'gravitational physics', 'particle physics', 'nuclear physics', 'solid state physics', 'materials physics', 'optical physics', 'plasma physics', 'computational physics', 'mathematical physics', 'medical physics'],
    'Engineering': ['engineering', 'mechanical', 'electrical', 'civil', 'chemical', 'bioengineering', 'aerospace', 'materials', 'robotics', 'control systems', 'industrial', 'manufacturing', 'systems engineering', 'nanotechnology', 'biomechanical', 'environmental engineering', 'software engineering', 'computer engineering', 'structural engineering', 'mechatronics', 'automotive', 'nuclear engineering', 'petroleum engineering', 'telecommunications', 'microelectronics', 'photonics', 'power systems', 'renewable energy', 'systems science', 'biomedical engineering', 'tissue engineering', 'genetic engineering', 'neural engineering', 'biomaterials', 'biosystems', 'agricultural engineering', 'food engineering', 'process engineering', 'reliability engineering', 'quality engineering', 'safety engineering', 'construction engineering', 'transportation engineering', 'water resources engineering'],
    'Computer Science': ['computer', 'computing', 'computational', 'cs', 'data science', 'machine learning', 'artificial intelligence', 'ai', 'ml', 'software', 'programming', 'algorithms', 'cybersecurity', 'networks', 'database', 'web development', 'cloud computing', 'systems', 'computer vision', 'natural language processing', 'robotics', 'parallel computing', 'distributed systems', 'operating systems', 'computer graphics', 'human-computer interaction', 'information security', 'blockchain', 'quantum computing', 'embedded systems', 'mobile computing', 'internet of things', 'iot', 'data analytics', 'information science', 'bioinformatics', 'deep learning', 'neural networks', 'reinforcement learning', 'computer architecture', 'compiler design', 'software engineering', 'web technologies', 'mobile development', 'cloud architecture', 'devops', 'big data', 'data mining', 'information retrieval', 'computer networks', 'network security'],
    'Mathematics': ['mathematics', 'math', 'applied mathematics', 'statistics', 'calculus', 'algebra', 'geometry', 'topology', 'number theory', 'analysis', 'probability', 'discrete math', 'mathematical modeling', 'operations research', 'cryptography', 'differential equations', 'numerical analysis', 'optimization', 'graph theory', 'combinatorics', 'mathematical physics', 'mathematical biology', 'financial mathematics', 'actuarial science', 'game theory', 'chaos theory', 'category theory', 'logic', 'linear algebra', 'abstract algebra', 'real analysis', 'complex analysis', 'functional analysis', 'algebraic geometry', 'differential geometry', 'algebraic topology', 'dynamical systems', 'stochastic processes', 'mathematical statistics', 'computational mathematics', 'mathematical logic', 'set theory', 'number theory', 'coding theory'],
    'Earth Science': ['earth', 'geology', 'environmental', 'climate', 'oceanography', 'atmospheric', 'geography', 'geophysics', 'meteorology', 'hydrology', 'seismology', 'soil science', 'sustainability', 'paleontology', 'mineralogy', 'petrology', 'volcanology', 'glaciology', 'climatology', 'biogeochemistry', 'remote sensing', 'geochemistry', 'planetary science', 'marine science', 'coastal science', 'natural resources', 'conservation', 'environmental science', 'atmospheric science', 'climate science', 'earth system science', 'geomorphology', 'hydrogeology', 'sedimentology', 'stratigraphy', 'tectonics', 'quaternary science', 'environmental geology', 'economic geology', 'petroleum geology', 'engineering geology', 'environmental geochemistry', 'paleoclimatology', 'paleoecology', 'paleobiology'],
    'Social Science': ['psychology', 'sociology', 'anthropology', 'economics', 'political', 'social', 'behavioral', 'cognitive', 'linguistics', 'archaeology', 'human development', 'education research', 'criminology', 'demography', 'geography', 'urban studies', 'public policy', 'international relations', 'cultural studies', 'gender studies', 'communication studies', 'social psychology', 'developmental psychology', 'neuroscience psychology', 'clinical psychology', 'cognitive science', 'science education', 'science communication', 'science policy', 'environmental psychology', 'organizational psychology', 'educational psychology', 'forensic psychology', 'health psychology', 'industrial psychology', 'community psychology', 'counseling psychology', 'evolutionary psychology', 'positive psychology', 'sports psychology', 'behavioral economics', 'political economy', 'social anthropology', 'cultural anthropology', 'linguistic anthropology'],
    'STEM': ['stem', 'science', 'technology', 'engineering', 'mathematics', 'research', 'innovation', 'discovery', 'experimentation', 'laboratory', 'technical', 'scientific method', 'empirical research', 'applied science', 'fundamental research', 'food science', 'agricultural science', 'health science', 'data science', 'materials science', 'cognitive science', 'computer science', 'information science', 'library science', 'management science', 'network science', 'systems science', 'web science', 'interdisciplinary science', 'multidisciplinary research', 'translational research', 'experimental design', 'research methodology', 'scientific computing', 'scientific visualization']
  };
  
  // List of words/phrases to exclude as standalone fields
  const excludedTerms = [
    'other', 'on', 'forming a', 'week summer', 'the', 'based', 'developing', 's', 
    'this', 'interest in', 'or', 'term', 'lter', 'reu provides', 'person', 'weekly', 
    'on contemporar', 'depth', 'present', 'our undergraduate', 'edge', 'related', 
    'conduct original', 'tours of institution', 'doctoral', 'craft robust', 
    'to conduct', 'then a', 'sponsored', 'offers a', 'paid', 'work', 'summer',
    'reu', 'multiple disciplines', 'institutional', 'funded', 'research', 'study',
    'program', 'experience', 'opportunity', 'project', 'lab', 'laboratory',
    'student', 'students', 'faculty', 'mentor', 'mentors', 'university', 'college',
    'department', 'institute', 'center', 'school', 'academy', 'program', 'programs',
    'research', 'studies', 'education', 'learning', 'teaching', 'training', 'workshop',
    'seminar', 'conference', 'symposium', 'course', 'class', 'session', 'year',
    'semester', 'quarter', 'spring', 'summer', 'fall', 'winter', 'academic',
    'undergraduate', 'graduate', 'phd', 'postdoc', 'professor', 'assistant', 'associate'
  ];

  // Function to check if a string contains numeric patterns
  const containsNumericPattern = (str) => {
    // Check for standalone numbers, dates, or numeric patterns
    return /\d+/.test(str) || // Contains any number
           /\d{4}/.test(str) || // Year-like numbers
           /\d{1,2}[-/]\d{1,2}/.test(str) || // Date-like patterns
           /^\d+[a-z]+$/.test(str) || // Numbers with letters (e.g., "2nd")
           /^[a-z]+\d+$/.test(str); // Letters with numbers (e.g., "page2")
  };
  
  // If input is a string, convert to array
  if (typeof fields === 'string') {
    fields = fields.split(/[,;]|\sand\s/).map(f => f.trim()).filter(f => f);
    if (fields.length === 0) fields = [fields];
  }
  
  // Add words from title and description if provided
  const allText = [
    ...(title ? title.split(/[\s,;.()[\]{}]+/) : []),
    ...(description ? description.split(/[\s,;.()[\]{}]+/) : []),
    ...fields
  ]
    .map(word => word.toLowerCase().trim())
    .filter(word => word.length > 2);
  
  // Map each field to a standard category
  const standardized = new Set(); // Use Set to avoid duplicates
  
  allText.forEach(text => {
    if (!text) return; // Skip empty text
    
    const lowercaseText = text.toLowerCase();
    
    // Skip excluded terms and numeric patterns
    if (excludedTerms.some(term => lowercaseText === term) || containsNumericPattern(lowercaseText)) {
      return;
    }
    
    // Check if the text contains any keywords from standard fields
    for (const [standardField, keywords] of Object.entries(standardFields)) {
      if (keywords.some(keyword => lowercaseText.includes(keyword.toLowerCase()))) {
        standardized.add(standardField);
      }
    }
  });
  
  // If no fields were mapped, return N/A
  if (standardized.size === 0) {
    standardized.add('N/A');
  }
  
  return Array.from(standardized);
};

// Update the ETAP helper to include title
exports.extractFieldsFromEtap = function(payload) {
  return exports.standardizeFields(
    [payload.academicArea, payload.subject].filter(Boolean),
    payload.description,
    payload.title
  );
};