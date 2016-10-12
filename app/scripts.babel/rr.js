'use strict';

var RR = { }; /* RR as Real Reality - this is utility module */

// constants
RR.LOG_PREFIX = '** Real Reality ** ';
RR.ADDRESS_CHANGED_EVENT = 'rr:addressChanged';

// functions
RR.logDebug = function(...args) {
    console.debug.apply(null, [this.LOG_PREFIX, ...args]);
};

RR.logInfo = function(...args) {
    console.info.apply(null, [this.LOG_PREFIX, ...args]);
};

RR.logError = function(...args) {
  console.error.apply(null, [this.LOG_PREFIX, ...args]);
};

RR.String = {};
RR.String.isBlank = function(str) {
    return (!str || /^\s*$/.test(str));
};

RR.String.isNotBlank = function(str) {
  return !this.isBlank(str);
}
