/**
 * Structured logging utility for the application
 * Provides consistent error logging and prevents sensitive data exposure
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  userId?: string;
  restaurantId?: string;
  requestId?: string;
  method?: string;
  path?: string;
  [key: string]: any;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, context?: LogContext, error?: Error): string {
    const timestamp = new Date().toISOString();
    const baseLog = {
      timestamp,
      level,
      message,
      ...context,
    };

    if (error) {
      return JSON.stringify({
        ...baseLog,
        error: {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
      });
    }

    return JSON.stringify(baseLog);
  }

  info(message: string, context?: LogContext): void {
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, context?: LogContext, error?: Error): void {
    console.error(this.formatMessage('error', message, context, error));
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('debug', message, context));
    }
  }
}

export const logger = new Logger();

/**
 * Generic error messages for API responses
 * Prevents leaking sensitive information to clients
 */
export const ErrorMessages = {
  INTERNAL_ERROR: 'An internal error occurred. Please try again later.',
  UNAUTHORIZED: 'Authentication required.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  BAD_REQUEST: 'Invalid request parameters.',
  VALIDATION_ERROR: 'Validation failed for the provided data.',
} as const;
