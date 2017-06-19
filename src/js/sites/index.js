const textOrNull = textElement => {
  if (textElement === null) {
    return null
  } else {
    return textElement.textContent
  }
}

export const siteHosts = {
  SREALITY: {
    hostString: 'sreality.cz',
  },
  BEZREALITKY: {
    hostString: 'bezrealitky.cz',
  },
  MAXIREALITY: {
    hostString: 'maxirealitypraha.cz',
  },
  REALITY_IDNES: {
    hostString: 'reality.idnes.cz',
  },
}

/**
 *
 * @param {{ hostString: String }} hostId
 * @param {String} host
 * @return {Number|undefined}
 */
export const isCurrentHost = (hostId, host) => host.includes(hostId.hostString)

const priceAreaGuard = (price, area) => (area && !isNaN(area) && (price && !isNaN(price))) && price / area

// TODO add extractor's methods for sites dynamically
export const extractors = {
  getAddress(host) {
    if (isCurrentHost(siteHosts.SREALITY, host)) {
      return textOrNull(document.querySelector('.location-text'))
    }

    if (isCurrentHost(siteHosts.BEZREALITKY, host)) {
      return textOrNull(document.querySelector('header h2'))
    }

    if (isCurrentHost(siteHosts.MAXIREALITY, host)) {
      const addressRow = Array.from(document.querySelectorAll('tr'))
        .filter(node => node.textContent.includes('Adresa'))[0]
      return addressRow && addressRow.querySelector('td').innerHTML.replace(/<br>/g, ' ').trim()
    }

    if (isCurrentHost(siteHosts.REALITY_IDNES, host)) {
      return textOrNull(document.querySelector('.realAddress'))
    }

    RR.logError('cannot parse address on page: ', window.location)
    return null
  },
  getPrices(host) {
    if (isCurrentHost(siteHosts.SREALITY, host)) {
      const propertyParams = Array.from(document.querySelectorAll('.params li'))
      const priceRow = propertyParams.filter(p => p.innerHTML.includes('Celková cena'))[0]
      const areaRow = propertyParams.filter(p => p.innerHTML.includes('Užitná'))[0]

      const price = priceRow && parseInt(priceRow.innerHTML.match(/\d/g).join(''), 10)
      const area = areaRow && parseInt(areaRow.innerHTML.match(/(\d){2,}/g)[0], 10)
      return priceAreaGuard(price, area)
    }

    if (isCurrentHost(siteHosts.BEZREALITKY, host)) {
      const propertyParams = Array.from(document.querySelectorAll('.box-params .row'))
      const areaRow = propertyParams.filter(item => item.innerHTML.includes('plocha'))[0] // returns DOM node
      const priceRow = propertyParams.filter(item => item.innerHTML.includes('cena'))[0] // returns DOM node

      // "1.200.000 Kč" => ["1", "2", "0", "0", "0", "0", "0"] => 1200000
      const innerText = priceRow && priceRow.querySelector('.value').innerHTML
      const price = innerText && parseInt(innerText.match(/\d/g).join(''), 10)

      // DOMNode => "plocha:\n54 m²\n" => 54
      const area = areaRow && parseInt(areaRow.innerHTML.match(/(\d){2,}/g)[0], 10)
      return priceAreaGuard(price, area)
    }

    if (isCurrentHost(siteHosts.MAXIREALITY, host)) {
      const areaRow = Array.from(document.querySelectorAll('#makler_zaklad > table tr'))
        .filter(node => node.innerHTML.includes('Užitná plocha'))[0]
      const priceNode = document.querySelector('.two.price')
      const priceArray = priceNode && priceNode.textContent.match(/\d/g)
      const price = priceArray && parseInt(priceArray.join(''), 10)
      const area = areaRow && areaRow.textContent.match(/(\d){2,}/g)[0]
      return priceAreaGuard(price, area)
    }

    if (isCurrentHost(siteHosts.REALITY_IDNES, host)) {
      const areaText = $('.parameters .leftCol dt:contains("Užitná plocha")').next().text()
      const area = Number.parseInt(areaText) // eg. when text is "34 m2" Number.parseInt can strip text parts and parse it as just 34

      const priceText =  document.querySelectorAll('.priceBox strong')[0].innerHTML
      const price = Number.parseInt(priceText.replace(/&nbsp;/gi,''))

      return priceAreaGuard(price, area)
    }

    return undefined
  },
}
