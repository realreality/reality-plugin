export const streetNamePredicate = (address) => {
  if (typeof(address) !== 'undefined' && address !== null) {
    return address.indexOf(',') > 0 ? address.split(',')[0] : address;
  }
  return address;
};

export const formatPrice = price => Math.round(price) + ' Kč';

/**
 * Call ga (google analytics) in context of current page - we cannot directly call page functions here
 * @param args
 */
export const ga = (...args) => {
  window.location.href= 'javascript:ga(' + args.map(arg => '\'' + arg.toString() + '\'').join(',')  + '); void 0';
};
