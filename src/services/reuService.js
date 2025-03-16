import axios from 'axios';
import * as cheerio from 'cheerio';


export const scrapeNsfReus = async () => {
  console.log('Fetching NSF REUs...');
  
  try {
    const response = await axios.get('https://www.nsf.gov/crssprgm/reu/list_result.jsp?unitid=5049');
    const $ = cheerio.load(response.data);
    const programs = [];

    // Parse each program entry
    $('.results-row').each((i, element) => {
      const title = $(element).find('h3').text().trim();
      const institution = $(element).find('.institution').text().trim();
      const description = $(element).find('.description').text().trim();
      const location = $(element).find('.location').text().trim();
      const deadline = $(element).find('.deadline').text().trim();
      const url = $(element).find('a').attr('href');

      if (title && institution) {
        programs.push({
          title,
          institution,
          description,
          location,
          deadline,
          url,
          source: 'NSF',
          field: 'Computer Science', // Default field for NSF CS REUs
          createdAt: new Date().toISOString()
        });
      }
    });

    console.log(`Found ${programs.length} NSF REU programs`);
    return programs;
  } catch (error) {
    console.error('Error scraping NSF REUs:', error);
    throw error;
  }
};

export const scrapeSciencePathwaysReus = async () => {
  console.log('Fetching Science Pathways REUs...');
  
  try {
    const response = await axios.get('https://www.pathwaystoscience.org/programs.aspx?u=Undergrads&sm=REU');
    const $ = cheerio.load(response.data);
    const programs = [];

    // Parse each program entry
    $('.program-listing').each((i, element) => {
      const title = $(element).find('.program-title').text().trim();
      const institution = $(element).find('.institution-name').text().trim();
      const description = $(element).find('.program-description').text().trim();
      const location = $(element).find('.location').text().trim();
      const deadline = $(element).find('.deadline-date').text().trim();
      const stipend = $(element).find('.stipend').text().trim();
      const url = $(element).find('.program-link').attr('href');
      const field = $(element).find('.field-of-study').text().trim();

      if (title && institution) {
        programs.push({
          title,
          institution,
          description,
          location,
          deadline,
          stipend,
          url,
          field: field || 'Various',
          source: 'Science Pathways',
          createdAt: new Date().toISOString()
        });
      }
    });

    console.log(`Found ${programs.length} Science Pathways REU programs`);
    return programs;
  } catch (error) {
    console.error('Error scraping Science Pathways REUs:', error);
    throw error;
  }
};

// For testing purposes, return mock data
export const getMockNsfPrograms = () => {
  return [
    {
      id: 'nsf-1',
      title: 'REU in Computer Science',
      institution: 'Stanford University',
      location: 'Stanford, CA',
      field: 'Computer Science',
      deadline: '2023-02-15',
      stipend: '$6,000',
      duration: '10 weeks',
      description: 'Research experience in artificial intelligence, machine learning, and data science.',
      source: 'NSF'
    }
  ];
};

// For testing purposes, return mock data
export const getMockSciencePathwaysPrograms = () => {
  return [
    {
      id: 'sp-1',
      title: 'REU in Chemistry',
      institution: 'Harvard University',
      location: 'Cambridge, MA',
      field: 'Chemistry',
      deadline: '2023-02-10',
      stipend: '$5,800',
      duration: '10 weeks',
      description: 'Research experience in organic chemistry and biochemistry.',
      link: 'https://example.com/harvard-reu',
      source: 'Science Pathways'
    },
    {
      id: 'sp-2',
      title: 'REU in Mathematics',
      institution: 'Princeton University',
      location: 'Princeton, NJ',
      field: 'Mathematics',
      deadline: '2023-02-05',
      stipend: '$5,200',
      duration: '8 weeks',
      description: 'Research experience in pure and applied mathematics.',
      link: 'https://example.com/princeton-reu',
      source: 'Science Pathways'
    },
    {
      id: 'sp-3',
      title: 'REU in Environmental Science',
      institution: 'University of Washington',
      location: 'Seattle, WA',
      field: 'Environmental Science',
      deadline: '2023-01-25',
      stipend: '$4,800',
      duration: '9 weeks',
      description: 'Research experience in ecology and environmental conservation.',
      link: 'https://example.com/uw-reu',
      source: 'Science Pathways'
    }
  ];
};