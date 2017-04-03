import * as $ from 'jquery'
import RR from '../rr'

const RENT = 'rent'
const SALE = 'sale'

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
  },
}

const getTextFromNode = (el: Element | null): string => (el && el.textContent) || ''

const computePricePerSquare = (price: number | string | null = 0, area: number | string | null = 0): number => {
  const castedPrice = Number(price)
  const castedArea = Number(area)
  const result = castedPrice / castedArea

  return !isNaN(result) && Number.isFinite(result) ? result : 0
}

const getHostPredicate = (locationHost: string) => (siteHost: string) => locationHost.includes(siteHost)

const containsBoxWords = (selector: string, words: Array<string>) => {
  const containsNodeWord = (node: Element, word: string) => node.textContent ? node.textContent.includes(word) : false

  const node = document.querySelector(selector)
  if (!node || !words.length) {
    return false
  }

  const mapWords = (word: string) => containsNodeWord(node, word)
  // ['foo'] => [true]
  // ['foo', 'bar', 'baz'] => [true, false, true] => false
  return words.map(mapWords).filter(Boolean).length === words.length
}

// this is business logic, so it may contain site specific settings/params
// underneath it should only call some generic functions
const extractAdType = (locationHost: string) => {
  const verify = getHostPredicate(locationHost)

  if (verify(sites.REALITY_IDNES.id) || verify(sites.SREALITY.id) || verify(sites.MAXIREALITY.id)) {
    if (/pronajem/i.test(location.pathname)) {
      return RENT
    }
    return SALE
  }

  if (verify('bezrealitky')) {

    const selector = '.box-params.col-1'
    return containsBoxWords(selector, ['typ', 'nabídky', 'Pronájem']) ? RENT : SALE
  }
}

// TODO add extractor's methods for sites dynamically
export const extractors = {
  getAddress(): string {
    const verify = getHostPredicate(window.location.host)
    if (verify(sites.SREALITY.id)) {
      return getTextFromNode(document.querySelector('.location-text'))
    }

    if (verify(sites.BEZREALITKY.id)) {
      return getTextFromNode(document.querySelector('header h2'))
    }

    if (verify(sites.MAXIREALITY.id)) {
      const [addressRow] = Array.from(document.querySelectorAll('tr'))
        .filter(node => node.textContent && node.textContent.includes('Adresa'))
      if (addressRow) {
        const tableCell = addressRow.querySelector('td')
        return (tableCell && tableCell.innerHTML && tableCell.innerHTML.replace(/<br>/g, ' ').trim()) || ''
      }
      return ''
    }

    if (verify(sites.REALITY_IDNES.id)) {
      return getTextFromNode(document.querySelector('.realAddress'))
    }

    RR.logError('cannot parse address on page: ', window.location)
    return ''
  },
  extractSquarePrice() {
    const adType = extractAdType(window.location.host)
    const verify = getHostPredicate(window.location.host)
    if (adType === RENT) {
      return
    }

    if (verify(sites.SREALITY.id)) {
      const propertyParams = Array.from(document.querySelectorAll('.params li'))
      const priceRow = propertyParams.filter(p => p.innerHTML.includes('Celková cena'))[0]
      const areaRow = propertyParams.filter(p => p.innerHTML.includes('Užitná'))[0]

      const priceHTML = priceRow && priceRow.innerHTML.match(/\d/g)
      const price = priceHTML && parseInt(priceHTML.join(''), 10)

      const areaHTML = areaRow.innerHTML.match(/(\d){2,}/g)
      const area = areaHTML && areaHTML.length && parseInt(areaHTML[0], 10)

      return computePricePerSquare(price, area)
    }

    if (verify(sites.BEZREALITKY.id)) {
      const propertyParams = Array.from(document.querySelectorAll('.box-params .row'))
      const areaRow = propertyParams.filter(item => item.innerHTML.includes('plocha'))[0] // returns DOM node
      const priceRow = propertyParams.filter(item => item.innerHTML.includes('cena'))[0] // returns DOM node

      // "1.200.000 Kč" => ["1", "2", "0", "0", "0", "0", "0"] => 1200000
      const priceRowValue = priceRow && priceRow.querySelector('.value')
      const innerText = priceRowValue && priceRowValue.innerHTML
      const priceWrapper = innerText && innerText.match(/\d/g)
      const price = priceWrapper && priceWrapper.length && parseInt(priceWrapper.join(''), 10)

      // DOMNode => "plocha:\n54 m²\n" => 54
      const areaRowNode = areaRow && areaRow.innerHTML.match(/(\d){2,}/g)
      const area = areaRowNode && parseInt(areaRowNode[0], 10)
      return computePricePerSquare(price, area)
    }

    if (verify(sites.MAXIREALITY.id)) {
      const areaRow = Array.from(document.querySelectorAll('#makler_zaklad > table tr'))
        .filter(node => node.innerHTML.includes('Užitná plocha'))[0]

      const priceNode = document.querySelector('.two.price')
      const priceNodeContent = priceNode && priceNode.textContent
      const priceArray = priceNodeContent && priceNodeContent.match(/\d/g)
      const price = priceArray && parseInt(priceArray.join(''), 10)

      const areaRowContent = areaRow && areaRow.textContent
      const areaValue = areaRowContent && areaRowContent.match(/(\d){2,}/g)
      const area = areaValue && areaValue[0]

      return computePricePerSquare(price, area)
    }

    if (verify(sites.REALITY_IDNES.id)) {
      const areaText = $('.parameters .leftCol dt:contains("Užitná plocha")').next().text()
      // eg. when text is "34 m2" Number.parseInt can strip text parts and parse it as just 34
      const area = Number.parseInt(areaText)
      const priceText = document.querySelectorAll('.priceBox strong')[0].innerHTML
      const price = Number.parseInt(priceText.replace(/&nbsp;/gi, ''))

      return computePricePerSquare(price, area)
    }

    return undefined
  },
}
