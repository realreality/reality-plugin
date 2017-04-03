/* RR as Real Reality - this is utility module */

const LOG_PREFIX = '** Real Reality ** '

declare var process: any // value inserted via webpack.DefinePlugin()

export const GMAPS_API_KEY = process.env.GMAPS_API_KEY
export const IPR_REST_API = process.env.IPR_REST_API
export const MAPS_URL = 'https://maps.googleapis.com/maps/api'

const logDebug = console.debug
  ? console.debug.bind(window.console, LOG_PREFIX)
  : console.log.bind(window.console, LOG_PREFIX)

export default {
  logDebug,
  logInfo: console.info.bind(window.console, LOG_PREFIX),
  logError: console.error.bind(window.console, LOG_PREFIX),
}
