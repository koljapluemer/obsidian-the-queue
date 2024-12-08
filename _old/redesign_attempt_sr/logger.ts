import log from 'loglevel';

// Set default log level (can be changed dynamically)
log.setDefaultLevel('info'); // Levels: 'trace', 'debug', 'info', 'warn', 'error', 'silent'

// Export the logger instance for use throughout the plugin
export default log;