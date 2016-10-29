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

export default RR;