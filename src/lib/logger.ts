/**
 * Structured logger using pino (or console fallback in environments where pino is unavailable).
 * Logs orders, payments, errors, and auth events with timestamps and context.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogContext {
  [key: string]: unknown
}

function formatLog(level: LogLevel, msg: string, ctx?: LogContext): string {
  return JSON.stringify({
    level,
    time: new Date().toISOString(),
    msg,
    ...ctx,
  })
}

let _pino: any = null

async function getPino() {
  if (_pino) return _pino
  try {
    const pino = await import('pino')
    _pino = pino.default({
      level: process.env.LOG_LEVEL || 'info',
      formatters: {
        level(label: string) { return { level: label } },
      },
    })
    return _pino
  } catch {
    return null
  }
}

class Logger {
  private context: string

  constructor(context: string) {
    this.context = context
  }

  private async log(level: LogLevel, msg: string, ctx?: LogContext) {
    const payload = { context: this.context, ...ctx }
    try {
      const pino = await getPino()
      if (pino) {
        pino[level](payload, msg)
        return
      }
    } catch {}
    // Fallback to console
    const line = formatLog(level, msg, payload)
    if (level === 'error') console.error(line)
    else if (level === 'warn') console.warn(line)
    else console.log(line)
  }

  info(msg: string, ctx?: LogContext) { return this.log('info', msg, ctx) }
  warn(msg: string, ctx?: LogContext) { return this.log('warn', msg, ctx) }
  error(msg: string, ctx?: LogContext) { return this.log('error', msg, ctx) }
  debug(msg: string, ctx?: LogContext) { return this.log('debug', msg, ctx) }
}

export const orderLogger = new Logger('orders')
export const paymentLogger = new Logger('payments')
export const authLogger = new Logger('auth')
export const errorLogger = new Logger('errors')

export default Logger
