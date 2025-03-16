const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Log file paths
const serverLogPath = path.join(logDir, 'server.log');
const errorLogPath = path.join(logDir, 'error.log');
const scraperLogPath = path.join(logDir, 'scraper.log');

// Format timestamp
const timestamp = () => {
  return new Date().toISOString();
};

// Write to log file
const writeToLog = (filePath, message) => {
  const logMessage = `[${timestamp()}] ${message}\n`;
  fs.appendFileSync(filePath, logMessage);
};

// Logger functions
const logger = {
  info: (message) => {
    console.log(`[INFO] ${message}`);
    writeToLog(serverLogPath, `INFO: ${message}`);
  },
  
  error: (message, error) => {
    const errorMsg = error ? `${message}: ${error.message}\n${error.stack}` : message;
    console.error(`[ERROR] ${errorMsg}`);
    writeToLog(serverLogPath, `ERROR: ${errorMsg}`);
    writeToLog(errorLogPath, `ERROR: ${errorMsg}`);
  },
  
  scraper: (message) => {
    console.log(`[SCRAPER] ${message}`);
    writeToLog(serverLogPath, `SCRAPER: ${message}`);
    writeToLog(scraperLogPath, `${message}`);
  }
};

module.exports = logger;