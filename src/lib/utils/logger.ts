type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private module: string;
  private static isProduction = process.env.NODE_ENV === 'production';

  constructor(module: string) {
    this.module = module;
  }

  private log(level: LogLevel, message: string, ...args: any[]) {
    if (Logger.isProduction && level === 'debug') return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.module}]`;

    if (Logger.isProduction) {
      // In production, we might want to send logs to a service like Sentry or CloudWatch
      // For now, we'll just use console but with less verbose output
      if (level === 'error') {
        console.error(prefix, message, ...args);
      } else if (level === 'warn') {
        console.warn(prefix, message, ...args);
      } else {
        console.log(prefix, message);
      }
    } else {
      // In development, log everything with full details
      console.log(prefix, message, ...args);
    }
  }

  debug(message: string, ...args: any[]) {
    this.log('debug', message, ...args);
  }

  info(message: string, ...args: any[]) {
    this.log('info', message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log('warn', message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log('error', message, ...args);
  }
}

export const createLogger = (module: string) => new Logger(module);
