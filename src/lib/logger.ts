import fs from 'fs';
import path from 'path';

interface LogLevel {
  DEBUG: 7;
  INFO: 6;
  NOTICE: 5;
  WARNING: 4;
  ERROR: 3;
  CRITICAL: 2;
  ALERT: 1;
  EMERGENCY: 0;
}

const LOG_LEVELS: LogLevel = {
  DEBUG: 7,
  INFO: 6,
  NOTICE: 5,
  WARNING: 4,
  ERROR: 3,
  CRITICAL: 2,
  ALERT: 1,
  EMERGENCY: 0
};

class Logger {
  private static instance: Logger;
  private appName: string = 'gg-woo-next';
  private isServer: boolean;

  private constructor() {
    this.isServer = typeof window === 'undefined';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: keyof LogLevel, context: string, message: string, error?: any): string {
    const timestamp = new Date().toISOString();
    let formattedMessage = `[${timestamp}][${level}][${context}] ${message}`;
    
    if (error) {
      const errorMessage = error.message || 'Unknown error';
      const errorStack = error.stack || '';
      const errorResponse = error.response?.data ? JSON.stringify(error.response.data) : '';
      formattedMessage += `\nError: ${errorMessage}\nStack: ${errorStack}\nResponse: ${errorResponse}`;
    }
    
    return formattedMessage;
  }

  private async serverLog(formattedMessage: string, level: keyof LogLevel) {
    // In production on the server, you could implement server-side logging here
    // For example, writing to a log file or sending to a logging service
    if (process.env.NODE_ENV === 'production') {
      // Production server-side logging would go here
      // For now, we'll just use console
      switch (level) {
        case 'ERROR':
        case 'CRITICAL':
        case 'ALERT':
        case 'EMERGENCY':
          console.error(formattedMessage);
          break;
        case 'WARNING':
          console.warn(formattedMessage);
          break;
        default:
          console.log(formattedMessage);
      }
    }
  }

  private log(level: keyof LogLevel, context: string, message: string, error?: any) {
    const formattedMessage = this.formatMessage(level, context, message, error);
    
    // In development or on the client, use console
    if (process.env.NODE_ENV !== 'production' || !this.isServer) {
      switch (level) {
        case 'ERROR':
        case 'CRITICAL':
        case 'ALERT':
        case 'EMERGENCY':
          console.error(formattedMessage);
          break;
        case 'WARNING':
          console.warn(formattedMessage);
          break;
        default:
          console.log(formattedMessage);
      }
    }

    // If we're on the server and in production, use server-side logging
    if (this.isServer && process.env.NODE_ENV === 'production') {
      this.serverLog(formattedMessage, level);
    }
  }

  public debug(context: string, message: string) {
    this.log('DEBUG', context, message);
  }

  public info(context: string, message: string) {
    this.log('INFO', context, message);
  }

  public warning(context: string, message: string) {
    this.log('WARNING', context, message);
  }

  public error(context: string, message: string, error?: any) {
    this.log('ERROR', context, message, error);
  }

  public critical(context: string, message: string, error?: any) {
    this.log('CRITICAL', context, message, error);
  }
}

export const logger = Logger.getInstance();
