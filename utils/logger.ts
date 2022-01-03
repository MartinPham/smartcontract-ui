import logger from 'loglevel'

logger.setLevel(process.env.NODE_ENV === 'development' ? 'trace' : 'warn')

export const trace = logger.trace
export const log = logger.debug
export const warn = logger.warn
export const fatal = logger.error
