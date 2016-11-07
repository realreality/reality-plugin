export const streetNamePredicate = (address) => {
  if (typeof(address) !== 'undefined' && address !== null) {
    return address.indexOf(',') > 0 ? address.split(',')[0] : address;
  }
  return address;
};

export const formatPrice = price => Math.round(price) + ' Kč';