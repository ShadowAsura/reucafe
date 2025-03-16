const axios = require('axios');
const cheerio = require('cheerio');
const { updatePathwaysToSciencePrograms } = require('../pathwaysToScienceScraper');

// Mock axios
jest.mock('axios');

// Mock HTML responses
const mockMainPageHtml = `
  <div class="col-sm-7 text-left">
    <a href="/programs/view.aspx?progid=123">Program 1</a>
    <a href="/programs/view.aspx?progid=456">Program 2</a>
  </div>
`;

const mockProgramDetailHtml = `
  <div class="col-sm-7 text-left">
    <h1>Test Program</h1>
    <b>Description:</b> Test program description
    <b>Application Deadline:</b> March 1, 2024
    <b>Participating Institution(s):</b>
    <a href="#">Test University</a>
    <div>Academic Disciplines:</div>
    <span>Computer Science
Engineering</span>
    <div>Keywords:</div>
    <span>Research
Summer</span>
    <div class="well">
      <a href="http://test-program.com" target="_blank">Program Website</a>
    </div>
  </div>
`;

describe('pathwaysToScienceScraper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully scrape programs from the main page', async () => {
    // Mock main page response
    axios.get.mockImplementationOnce(() => Promise.resolve({
      data: mockMainPageHtml,
      status: 200
    }));

    // Mock program detail responses
    axios.get
      .mockImplementationOnce(() => Promise.resolve({
        data: mockProgramDetailHtml,
        status: 200
      }))
      .mockImplementationOnce(() => Promise.resolve({
        data: mockProgramDetailHtml,
        status: 200
      }));

    const programs = await updatePathwaysToSciencePrograms();

    expect(programs).toHaveLength(2);
    expect(programs[0]).toMatchObject({
      title: 'Test Program',
      institution: 'Test University',
      description: expect.any(String),
      deadline: expect.any(String),
      disciplines: expect.arrayContaining(['Computer Science', 'Engineering']),
      keywords: expect.arrayContaining(['Research', 'Summer']),
      source: 'Pathways to Science'
    });

    expect(axios.get).toHaveBeenCalledTimes(3);
  });

  it('should handle empty program listings gracefully', async () => {
    axios.get.mockImplementationOnce(() => Promise.resolve({
      data: '<div class="col-sm-7 text-left"></div>',
      status: 200
    }));

    const programs = await updatePathwaysToSciencePrograms();
    expect(programs).toHaveLength(0);
  });

  it('should handle network errors gracefully', async () => {
    axios.get.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

    await expect(updatePathwaysToSciencePrograms()).rejects.toThrow('Network error');
  });

  it('should handle malformed HTML in program details', async () => {
    // Mock main page with valid links
    axios.get.mockImplementationOnce(() => Promise.resolve({
      data: mockMainPageHtml,
      status: 200
    }));

    // Mock program detail with malformed HTML
    axios.get.mockImplementationOnce(() => Promise.resolve({
      data: '<div>Malformed HTML</div>',
      status: 200
    }));

    const programs = await updatePathwaysToSciencePrograms();
    expect(programs).toHaveLength(1);
    expect(programs[0]).toMatchObject({
      title: null,
      institution: null,
      description: '',
      deadline: '',
      disciplines: [],
      keywords: [],
      source: 'Pathways to Science'
    });
  });

  it('should handle rate limiting and timeouts', async () => {
    axios.get.mockImplementationOnce(() => Promise.reject({
      response: {
        status: 429,
        headers: { 'retry-after': '60' }
      }
    }));

    await expect(updatePathwaysToSciencePrograms()).rejects.toThrow();
  });

  it('should extract all required fields from program details', async () => {
    // Mock main page response
    axios.get.mockImplementationOnce(() => Promise.resolve({
      data: '<a href="/programs/view.aspx?progid=123">Program</a>',
      status: 200
    }));

    // Mock detailed program response
    axios.get.mockImplementationOnce(() => Promise.resolve({
      data: mockProgramDetailHtml,
      status: 200
    }));

    const programs = await updatePathwaysToSciencePrograms();
    expect(programs).toHaveLength(1);

    const program = programs[0];
    expect(program).toHaveProperty('title');
    expect(program).toHaveProperty('institution');
    expect(program).toHaveProperty('description');
    expect(program).toHaveProperty('deadline');
    expect(program).toHaveProperty('disciplines');
    expect(program).toHaveProperty('keywords');
    expect(program).toHaveProperty('url');
    expect(program).toHaveProperty('source');
    expect(program).toHaveProperty('created_at');

    expect(program.disciplines).toBeInstanceOf(Array);
    expect(program.keywords).toBeInstanceOf(Array);
    expect(new Date(program.created_at)).toBeInstanceOf(Date);
  });
});