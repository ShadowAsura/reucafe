const fs = require('fs');
const path = require('path');
const util = require('util');

// Ensure logs directory exists
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const consoleLogPath = path.join(logDir, 'console.log');

// Save original console methods
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

// Format timestamp
const timestamp = () => {
  return new Date().toISOString();
};

// Write to console log file
const writeToConsoleLog = (type, args) => {
  const formattedArgs = args.map(arg => {
    if (typeof arg === 'object') {
      return util.inspect(arg, { depth: null });
    }
    return String(arg);
  }).join(' ');
  
  const logMessage = `[${timestamp()}] [${type}] ${formattedArgs}\n`;
  fs.appendFileSync(consoleLogPath, logMessage);
};

// Override console methods to capture output
console.log = function() {
  writeToConsoleLog('LOG', Array.from(arguments));
  originalConsoleLog.apply(console, arguments);
};

console.error = function() {
  writeToConsoleLog('ERROR', Array.from(arguments));
  originalConsoleError.apply(console, arguments);
};

console.warn = function() {
  writeToConsoleLog('WARN', Array.from(arguments));
  originalConsoleWarn.apply(console, arguments);
};

console.info = function() {
  writeToConsoleLog('INFO', Array.from(arguments));
  originalConsoleInfo.apply(console, arguments);
};

module.exports = {
  // Export a function to reset console if needed
  resetConsole: () => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
    console.info = originalConsoleInfo;
  }
};