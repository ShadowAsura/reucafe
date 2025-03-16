const { updateNsfPrograms } = require('../nsfScraper');
const axios = require('axios');
const { getAxiosInstance } = require('../utils');

// Mock axios and getAxiosInstance
jest.mock('axios');
jest.mock('../utils', () => ({
  getAxiosInstance: jest.fn(() => ({
    get: jest.fn()
  })),
  delay: jest.fn()
}));

const mockAxiosInstance = {
  get: jest.fn()
};

beforeEach(() => {
  jest.clearAllMocks();
  getAxiosInstance.mockReturnValue(mockAxiosInstance);
});

// Mock API response data
const mockApiResponse = {
  data: {
    response: {
      body: [
        {
          award: {
            awardTitle: 'REU Site: Research in Computer Science',
            institutionName: 'Test University',
            awardeeCity: 'Boston',
            awardeeStateCode: 'MA',
            programElement: 'Computer Science, Engineering',
            abstractText: 'Research experience in computer science and engineering.',
          },
          opportunity: {
            url: 'https://test.edu/reu',
            endDate: '2024-05-01'
          }
        }
      ]
    }
  }
};

describe('nsfScraper', () => {
  it('should extract program data correctly', async () => {
    mockAxiosInstance.get.mockResolvedValueOnce(mockApiResponse);

    const programs = await updateNsfPrograms();

    expect(programs).toHaveLength(1);
    expect(programs[0]).toMatchObject({
      title: 'REU Site: Research in Computer Science',
      institution: 'Test University',
      location: 'Boston, MA',
      field: 'Computer Science, Engineering',
      description: expect.stringContaining('computer science'),
      source: 'NSF'
    });
  });

  it('should handle API errors gracefully', async () => {
    mockAxiosInstance.get.mockRejectedValueOnce(new Error('API Error'));

    const programs = await updateNsfPrograms();
    expect(programs).toEqual([]);
  });

  it('should handle missing data fields', async () => {
    mockAxiosInstance.get.mockResolvedValueOnce({
      data: {
        response: {
          body: [{
            award: {
              awardTitle: 'Incomplete Program',
              institutionName: 'Test University'
            },
            opportunity: {}
          }]
        }
      }
    });

    const programs = await updateNsfPrograms();
    expect(programs).toHaveLength(1);
    expect(programs[0]).toMatchObject({
      title: 'Incomplete Program',
      institution: 'Test University',
      field: 'Field not specified'
    });
  });
});

describe('nsfScraper', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should extract fields and locations correctly', async () => {
    // Mock successful API response
    axios.get.mockResolvedValueOnce(mockApiResponse);

    const programs = await updateNsfPrograms();

    expect(programs).toHaveLength(2);

    // Test first program
    expect(programs[0]).toMatchObject({
      title: 'REU Site: Research in Computer Science',
      institution: 'Test University',
      location: 'Boston, MA',
      field: 'Computer Science, Engineering',
      description: expect.stringContaining('computer science'),
      source: 'NSF'
    });

    // Test second program
    expect(programs[1]).toMatchObject({
      title: 'REU Site: Biology Research Experience',
      institution: 'Another University',
      location: 'Seattle, WA',
      field: 'Biology, Life Sciences',
      description: expect.stringContaining('biology'),
      source: 'NSF'
    });
  });

  it('should handle missing fields gracefully', async () => {
    const incompleteResponse = {
      data: {
        response: {
          body: [
            {
              award: {
                awardTitle: 'Incomplete Program',
                institutionName: 'Test University'
              },
              opportunity: {
                url: 'https://test.edu/reu'
              }
            }
          ]
        }
      }
    };

    axios.get.mockResolvedValueOnce(incompleteResponse);

    const programs = await updateNsfPrograms();

    expect(programs).toHaveLength(1);
    expect(programs[0]).toMatchObject({
      title: 'Incomplete Program',
      institution: 'Test University',
      field: 'Field not specified',
      source: 'NSF'
    });
  });

  it('should handle API errors gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    const programs = await updateNsfPrograms();

    expect(programs).toEqual([]);
  });
});