const RR = {}; /* RR as Real Reality - this is utility module */

// constants
RR.LOG_PREFIX = '** Real Reality ** ';
RR.ADDRESS_CHANGED_EVENT = 'rr:addressChanged';

// functions
RR.logDebug = console.debug.bind(window.console, RR.LOG_PREFIX);

RR.logInfo = console.info.bind(window.console, RR.LOG_PREFIX);

RR.logError = console.error.bind(window.console, RR.LOG_PREFIX);

RR.String = {};
RR.String.isBlank = function(str) {
  return (!str || /^\s*$/.test(str));
};

RR.String.isNotBlank = function(str) {
  return !this.isBlank(str);
};

export const GMAPS_API_KEY = process.env.GMAPS_API_KEY;
export const IPR_REST_API = process.env.IPR_REST_API;
export const MAPS_URL = 'https://maps.googleapis.com/maps/api';

export default RR;
