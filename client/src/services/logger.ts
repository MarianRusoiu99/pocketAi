// Simple, centralized logging utility
type LogLevel = 'info' | 'warn' | 'error' | 'debug'

class Logger {
  private context: string

  constructor(context: string) {
    this.context = context
  }

  private log(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${this.context.toUpperCase()}] [${level.toUpperCase()}]`
    
    if (data) {
      console[level](prefix, message, data)
    } else {
      console[level](prefix, message)
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  error(message: string, data?: any) {
    this.log('error', message, data)
  }

  debug(message: string, data?: any) {
    if (import.meta.env.DEV) {
      this.log('debug', message, data)
    }
  }
}

export const createLogger = (context: string) => new Logger(context)
