const { createLogger, transports, format } = require('winston');
const expressWinston = require('express-winston');

// Setup format of logging
const myFormat = format.printf(({ level, meta, message, timestamp }) => {
  return `${timestamp} ${level.toUpperCase()}: ${message} ${meta ? JSON.stringify(meta.res.statusCode) : ''}`;
});

// Setup a logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.json(),
    format.timestamp(),
    myFormat,
  ),
  transports: [
    new transports.File({
      level: 'info',
      filename: 'logs/app.log'
    }),
    new transports.File({
      level: 'error',
      filename: 'logs/errors.log',
      handleExceptions: true
    })
  ]
});

if (process.env.ENVIRONMENT !== 'production') {
  logger.add(new transports.Console({
    handleExceptions: true
  }));
};

// Setup a logger for express app
const appLogger = expressWinston.logger({
  winstonInstance: logger,
  meta: true,
  statusLevels: true,
  colorize: false, // To prevent ANSI codes in log message
  expressFormat: true,
});

module.exports = { logger, appLogger };
