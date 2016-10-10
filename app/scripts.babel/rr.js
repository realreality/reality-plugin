var RR = { }; /* RR as Real Reality - this is utility module */

RR.logPrefix = '** Real Reality ** ';

RR.logDebug = function(...args) {
  console.debug.apply(null, [this.logPrefix, ...args]);
};

RR.logInfo = function(...args) {
  console.info.apply(null, [this.logPrefix, ...args]);
};
