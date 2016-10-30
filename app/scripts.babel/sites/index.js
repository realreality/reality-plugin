export const siteHosts = {
  SREALITY: {
    hostString: 'sreality'
  },
  BEZREALITKY: {
    hostString: 'bezrealitky'
  }
};

/**
 *
 * @param {{ hostString: String }} hostId
 * @param {String} host
 * @return {Number|undefined}
 */
export const isCurrentHost = (hostId, host) => host.includes(hostId.hostString);

// TODO add extractor's methods for sites dynamically
export const extractors = {
  getPrices(host) {
    if (isCurrentHost(siteHosts.SREALITY, host)) {
      const propertyParams = Array.from(document.querySelectorAll('.params li'));

      const priceRow = propertyParams.filter(p => p.innerText.includes('Celková cena'))[0];
      const areaRow = propertyParams.filter(p => p.innerText.includes('Užitná'))[0];

      const price = priceRow && parseInt(priceRow.innerText.match(/\d/g).join(''), 10);
      const area = areaRow && parseInt(areaRow.innerText.match(/(\d){2,}/g)[0], 10);

      return (area && !isNaN(area) && (price && !isNaN(price))) && price / area;
    }

    if (isCurrentHost(siteHosts.BEZREALITKY, host)) {
      const propertyParams = Array.from(document.querySelectorAll('.box-params .row'));
      const areaRow = propertyParams.filter(item => item.innerText.includes('plocha'))[0]; // returns DOM node
      const priceRow = propertyParams.filter(item => item.innerText.includes('cena'))[0]; // returns DOM node

      // "1.200.000 Kč" => ["1", "2", "0", "0", "0", "0", "0"] => 1200000
      const innerText = priceRow && priceRow.querySelector('.value').innerText;
      const price = innerText && parseInt(innerText.match(/\d/g).join(''), 10);

      // DOMNode => "plocha:\n54 m²\n" => 54
      const area = areaRow && parseInt(areaRow.innerText.match(/(\d){2,}/g)[0], 10);
      return (price && !isNaN(price)) && (area && !isNaN(area)) && price / area;
    }

    return undefined;
  }
};