import {
  bezRealitkyString,
  maxirealityString,
  realityIdnesString,
  srealityString,
} from './fixtures'
import { extractors } from './index'

declare var global: any

describe('extractors', () => {

  afterEach(() => {
    delete window.location.href
  })

  describe('bezrealitky', () => {
    beforeEach(() => {
      global.document.body.innerHTML = bezRealitkyString
      Object.defineProperty(window.location, 'host', {
        writable: true,
        value: 'www.bezrealitky.cz',
      })
    })

    it('should return price per m2', () => {
      expect(extractors.extractSquarePrice()).toEqual(22222.222222222223)
    })

    it('should return address', () => {
      expect(extractors.getAddress()).toEqual('Komenského, Vlašim, Středočeský kraj')
    })
  })

  describe('sreality', () => {
    beforeEach(() => {
      global.document.body.innerHTML = srealityString
      Object.defineProperty(window.location, 'host', {
        writable: true,
        value: 'www.sreality.cz',
      })
    })

    it('should return price per m2', () => {
      expect(extractors.extractSquarePrice()).toEqual(57042.25352112676)
    })

    it('should return address', () => {
      expect(extractors.getAddress()).toEqual('Ortenovo náměstí, Praha 7 - Holešovice')
    })
  })

  describe('maxireality', () => {
    beforeEach(() => {
      global.document.body.innerHTML = maxirealityString
      Object.defineProperty(window.location, 'host', {
        writable: true,
        value: 'www.maxirealitypraha.cz',
      })
    })

    it('should return price per m2', () => {
      expect(extractors.extractSquarePrice()).toEqual(64805.194805194806)
    })

    it('should return address', () => {
      expect(extractors.getAddress()).toEqual('Praha - Smíchov Vrázova')
    })
  })

  describe('reality.idnes', () => {
    beforeEach(() => {
      global.document.body.innerHTML = realityIdnesString
      Object.defineProperty(window.location, 'host', {
        writable: true,
        value: 'reality.idnes.cz',
      })
    })

    it('should return price per m2', () => {
      expect(extractors.extractSquarePrice()).toEqual(31888.88888888889)
    })

    it('should return address', () => {
      expect(extractors.getAddress()).toEqual('Praha 5, Hlubočepy, Machatého')
    })
  })
})
