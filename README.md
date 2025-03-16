# REU Cafe

A web application for discovering and managing Research Experience for Undergraduates (REU) programs.

## Project Overview

REU Cafe is a platform that helps students find and track REU programs across various institutions. The application aggregates program data from multiple sources and provides a user-friendly interface for searching, filtering, and managing REU opportunities.

## Key Features

- Automated REU program scraping from multiple sources
- Advanced search and filtering system
- User authentication and profile management
- Program suggestion system
- Interactive UI with dark/light mode support

## Tech Stack

- Frontend: React.js with Material-UI
- Backend: Node.js
- Database: Supabase
- Build Tool: Vite

## Important Components

### Scrapers

Located in `/scripts` directory:

- `scraper.js` - Main scraper utility
- `supabase-scraper.js` - Supabase integration for scraping
- `check-pathways-website.js` - Science Pathways specific scraper
- `check-summer-pathways.js` - Summer programs scraper

### Web Components

Located in `/src/components`:

- `Programs.js` - Main program listing and filtering
- `SuggestReu.js` - Program suggestion interface
- `DevConsole.js` - Development tools and testing

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file based on `.env.example`
   - Add your Supabase credentials

4. Start the development server:
   ```bash
   npm run dev
   ```

## Contributing

### Areas for Contribution

1. **Scrapers**
   - Improving existing scrapers
   - Adding new data sources
   - Enhancing data validation

2. **User Interface**
   - Enhancing search functionality
   - Improving accessibility
   - Adding new filtering options

3. **Features**
   - Application tracking system
   - Email notifications
   - Program analytics

### Development Guidelines

1. **Code Style**
   - Follow existing code formatting
   - Use meaningful component and variable names
   - Add appropriate comments for complex logic

2. **Testing**
   - Write unit tests for new features
   - Test across different browsers
   - Verify mobile responsiveness

3. **Pull Requests**
   - Create feature-specific branches
   - Include clear descriptions
   - Reference related issues

## Project Structure

```
/
├── src/                # Source code
│   ├── components/     # React components
│   ├── context/        # Context providers
│   ├── pages/          # Page components
│   ├── services/       # API services
│   └── utils/          # Utility functions
├── scripts/            # Scraper scripts
├── public/             # Static assets
└── server/            # Backend server code
```
## License

MIT

## Contact

For questions or suggestions, please open an issue in the repository or DM me on Discord @asurazu
