const RENT = 'rent';
const SALE = 'sale';

const textOrNull = textElement => {
  if (textElement === null) {
    return null;
  } else {
    return textElement.textContent;
  }
};

const sites = {
  SREALITY: {
    id: 'sreality',
  },
  BEZREALITKY: {
    id: 'bezrealitky',
  },
  MAXIREALITY: {
    id: 'maxirealitypraha',
  },
  REALITY_IDNES: {
    id: 'idnes',
  }
};

const priceAreaGuard = (price, area) => (area && !isNaN(area) && (price && !isNaN(price))) && price / area;

const getHostPredicate = (locationHost) => (siteHost) => locationHost.includes(siteHost);

const containsBoxWords = (selector, words) => {
  const containsNodeWord = (node, word) => node.textContent.includes(word);

  const node = document.querySelector(selector);
  if (!node || !words.length) {
    return false;
  }

  const mapWords = (word) => containsNodeWord(node, word);
  // ['foo'] => [true]
  // ['foo', 'bar', 'baz'] => [true, false, true] => false
  return words.map(mapWords).filter(Boolean).length === words.length;
};

// this is business logic, so it may contain site specific settings/params
// underneath it should only call some generic functions
const extractAdType = (locationHost) => {
  const verify = getHostPredicate(locationHost);

  if (verify(sites.REALITY_IDNES.id) || verify(sites.SREALITY.id) || verify(sites.MAXIREALITY.id)) {
    if (/pronajem/i.test(location.pathname)) {
      return RENT;
    }
    return SALE;
  }

  if (verify('bezrealitky')) {
    const selector = '.box-params.col-1';
    return containsBoxWords(selector, ['typ', 'nabídky', 'Pronájem']) ? RENT : SALE;
  }
};

// TODO add extractor's methods for sites dynamically
export const extractors = {
  getAddress() {
    const verify = getHostPredicate(window.location.host);
    if (verify(sites.SREALITY.id)) {
      return textOrNull(document.querySelector('.location-text'));
    }

    if (verify(sites.BEZREALITKY.id)) {
      return textOrNull(document.querySelector('header h2'));
    }

    if (verify(sites.MAXIREALITY.id)) {
      const addressRow = Array.from(document.querySelectorAll('tr'))
        .filter(node => node.textContent.includes('Adresa'))[0];
      return addressRow && addressRow.querySelector('td').innerHTML.replace(/<br>/g, ' ').trim();
    }

    if (verify(sites.REALITY_IDNES.id)) {
      return textOrNull(document.querySelector('.realAddress'));
    }

    RR.logError('cannot parse address on page: ', window.location);
    return null;
  },
  extractSquarePrice() {
    const adType = extractAdType(window.location.host);
    const verify = getHostPredicate(window.location.host);
    if (adType === RENT) {
      return;
    }

    if (verify(sites.SREALITY.id)) {
      const propertyParams = Array.from(document.querySelectorAll('.params li'));
      const priceRow = propertyParams.filter(p => p.innerHTML.includes('Celková cena'))[0];
      const areaRow = propertyParams.filter(p => p.innerHTML.includes('Užitná'))[0];

      const price = priceRow && parseInt(priceRow.innerHTML.match(/\d/g).join(''), 10);
      const area = areaRow && parseInt(areaRow.innerHTML.match(/(\d){2,}/g)[0], 10);
      return priceAreaGuard(price, area);
    }

    if (verify(sites.BEZREALITKY.id)) {
      const propertyParams = Array.from(document.querySelectorAll('.box-params .row'));
      const areaRow = propertyParams.filter(item => item.innerHTML.includes('plocha'))[0]; // returns DOM node
      const priceRow = propertyParams.filter(item => item.innerHTML.includes('cena'))[0]; // returns DOM node

      // "1.200.000 Kč" => ["1", "2", "0", "0", "0", "0", "0"] => 1200000
      const innerText = priceRow && priceRow.querySelector('.value').innerHTML;
      const price = innerText && parseInt(innerText.match(/\d/g).join(''), 10);

      // DOMNode => "plocha:\n54 m²\n" => 54
      const area = areaRow && parseInt(areaRow.innerHTML.match(/(\d){2,}/g)[0], 10);
      return priceAreaGuard(price, area);
    }

    if (verify(sites.MAXIREALITY.id)) {
      const areaRow = Array.from(document.querySelectorAll('#makler_zaklad > table tr'))
        .filter(node => node.innerHTML.includes('Užitná plocha'))[0];
      const priceNode = document.querySelector('.two.price');
      const priceArray = priceNode && priceNode.textContent.match(/\d/g);
      const price = priceArray && parseInt(priceArray.join(''), 10);
      const area = areaRow && areaRow.textContent.match(/(\d){2,}/g)[0];
      return priceAreaGuard(price, area);
    }

    if (verify(sites.REALITY_IDNES.id)) {
      const areaText = $('.parameters .leftCol dt:contains("Užitná plocha")').next().text();
      const area = Number.parseInt(areaText); // eg. when text is "34 m2" Number.parseInt can strip text parts and parse it as just 34

      const priceText = document.querySelectorAll('.priceBox strong')[0].innerHTML;
      const price = Number.parseInt(priceText.replace(/&nbsp;/gi, ''));

      return priceAreaGuard(price, area);
    }

    return undefined;
  }
};
