import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const logDir = path.join(__dirname, '../logs');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`;
  })
);

const dailyRotateFileTransport = new DailyRotateFile({
  filename: path.join(logDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      ),
    }),
    dailyRotateFileTransport,
  ],
});

class ApplicationLogger {
  log(message: string, meta?: any[]): void {
    logger.info(message, { meta });
  }

  error(message: string, meta?: any[]): void {
    logger.error(message, { meta });
  }

  warn(message: string, meta?: any[]): void {
    logger.warn(message, { meta });
  }

  debug(message: string, meta?: any[]): void {
    logger.debug(message, { meta });
  }
}

export const applicationLogger = new ApplicationLogger();
export default logger;
