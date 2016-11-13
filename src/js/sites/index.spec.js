import { expect } from 'chai';
import { extractors } from './index.js';

const bezRealitkyString = `
<html>
<body>
<div>
  <header>
    <h2>Komenského, Vlašim, Středočeský kraj</h2>
  </header>
  <div class="block-params col-1" data-bzr-col="1">
    <div class="box box-params col-1">
      <div class="box-header">
          <h3>Detailní informace</h3>
      </div>
      <div class="row" data-ng-if="upcLink">
          <div class="key">UPC dostupné!:</div>
          <div class="value" data-ng-bind-html="upcLink"></div>
      </div>
      <div class="row" data-ng-if="skyLink">
          <div class="key">dostupnost TV:</div>
          <div class="value" data-ng-bind-html="skyLink"></div>
      </div>
      <div class="row">
          <div class="key">číslo inzerátu:</div>
          <div class="value">446394</div>
      </div>
      <div class="row">
          <div class="key">typ nabídky:</div>
          <div class="value">Prodej</div>
      </div>
      <div class="row">
          <div class="key">typ nemovitosti:</div>
          <div class="value">Byt</div>
      </div>
      <div class="row" data-ng-if="shownInfoItems.disposition">
          <div class="key">dispozice:</div>
          <div class="value">2+1</div>
      </div>
      <div class="row">
          <div class="key">plocha:</div>
          <div class="value">54 m²</div>
      </div>
      <div class="row">
          <div class="key">cena:</div>
          <div class="value">1.200.000 Kč</div>
      </div>
                      <div class="row" data-ng-if="shownInfoItems.ownership">
          <div class="key">typ vlastnictví:</div>
          <div class="value">Osobní</div>
      </div>
                      <div class="row" data-ng-if="shownInfoItems.construction">
          <div class="key">typ budovy:</div>
          <div class="value">Panel</div>
      </div>
      <div class="row" data-ng-if="shownInfoItems.equipped">
          <div class="key">vybavení:</div>
          <div class="value">Částečně</div>
      </div>
      <div class="row" data-ng-if="shownInfoItems.etage || shownInfoItems.etageFrom || shownInfoItems.etageTo">
          <div class="key">podlaží:</div>
          <div class="value">2</div>
      </div>
      <div class="row" data-ng-if="shownInfoItems.balcony">
          <div class="key">balkón:</div>
          <div class="value">Ano</div>
      </div>
      <div class="row" data-ng-if="shownInfoItems.terrace">
          <div class="key">terasa:</div>
          <div class="value">Ne</div>
      </div>
    </div>
  </div>
</body>
</html>
`;

const srealityString = `
<html>
<body>
  <div>
    <span class="location-text ng-binding">Ortenovo náměstí, Praha 7 - Holešovice</span>
    <div class="params">
      <ul>
        <li><label>Celkov&aacute; cena:</label><strong> 4&nbsp;050&nbsp;000 Kč za nemovitost </strong></li>
        <li><label>Hypot&eacute;ka:</label><strong> 8&nbsp;421,91&nbsp;Kč měs&iacute;čně <button>v&iacute;ce&raquo;</button> </strong></li>
        <li><label>Pozn&aacute;mka k ceně:</label><strong> Doporučen&aacute; kupn&iacute; cena </strong></li>
        <li><label>ID zak&aacute;zky:</label><strong> N01401 </strong></li>
        <li><label>Aktualizace:</label><strong> 22.09.2016 </strong></li>
        <li><label>Stavba:</label><strong> Cihlov&aacute; </strong></li>
        <li><label>Stav objektu:</label><strong> Před rekonstrukc&iacute; </strong></li>
        <li><label>Vlastnictv&iacute;:</label><strong> Osobn&iacute; </strong></li>
        <li><label>Um&iacute;stěn&iacute; objektu:</label><strong> Centrum obce </strong></li>
        <li><label>Podlaž&iacute;:</label><strong> 5. podlaž&iacute; z celkem 6 </strong></li>
        <li><label>Užitn&aacute; plocha:</label><strong> 71 m<sup>2</sup> </strong></li>
      </ul>
      <ul>
        <li><label>Plocha podlahov&aacute;:</label><strong> 71 m<sup>2</sup> </strong></li>
        <li><label>Balk&oacute;n:</label><strong> 1 m<sup>2</sup> </strong></li>
        <li><label>Voda:</label><strong> D&aacute;lkov&yacute; vodovod </strong></li>
        <li><label>Topen&iacute;:</label><strong> &Uacute;středn&iacute; d&aacute;lkov&eacute; </strong></li>
        <li><label>Plyn:</label><strong> Plynovod </strong></li>
        <li><label>Odpad:</label><strong> Veřejn&aacute; kanalizace </strong></li>
        <li><label>Elektřina:</label><strong> 230V, 400V </strong></li>
        <li><label>Doprava:</label><strong> Vlak, D&aacute;lnice, Silnice, MHD, Autobus </strong></li>
        <li><label>Energetick&aacute; n&aacute;ročnost budovy:</label><strong> Tř&iacute;da G - Mimoř&aacute;dně nehospod&aacute;rn&aacute; </strong></li>
        <li><label>Bezbari&eacute;rov&yacute;:</label></li>
      </ul>
    </div>
  </div>
</body>
</html>
`;

const maxirealityString =
  `
<html>
<body>
<div>
  <div class="one price">
    <big>Cena: </big>
  </div>
  <div class="two price"><big>4.990.000 Kč</big></div>
  <div class="clear"></div>
  <div id="makler_zaklad">
    <div class="one price"><big>Cena: </big></div>
    <div class="two price"><big>4.990.000 Kč</big></div>
    <div class="clear"></div>
    <table>
      <tr>
        <th class="one pozz">Poznámka k ceně: </th>
        <td class="two pozz">plus provize RK a daň z nabytí nemovitosti </td>
      </tr>
    </table>
    <table>
        <th>Adresa: </th>
        <td>Praha - Smíchov<br />Vrázova  <br /></td>
      </tr>
      <tr>
        <th>Vlastnictvi: </th>
        <td>V soukromém vlastnictví</td>
      </tr>
      <tr>
        <th>Celková plocha: </th>
        <td>77 m<sup>2</sup></td>
      </tr>
      <tr>
        <th>Užitná plocha: </th>
        <td>77 m<sup>2</sup></td>
      </tr>
      <tr>
        <th>Energetická náročnost budovy</th>
        <td>G - mimořádně nehospodárná</td>
      </tr>
    </table>
  </div>
</div>
</body>
</html>
`;

describe('extractors', () => {

  afterEach(() => {
    delete window.location.href;
  });

  describe('bezrealitky', () => {
    beforeEach(() => {
      global.document.body.innerHTML = bezRealitkyString;
      Object.defineProperty(window.location, 'host', {
        writable: true,
        value: 'www.bezrealitky.cz'
      });
    });

    it('should return price per m2', () => {
      expect(extractors.getPrices(window.location.host)).to.equal(22222.222222222223);
    });

    it('should return address', () => {
      expect(extractors.getAddress(window.location.host)).to.equal('Komenského, Vlašim, Středočeský kraj');
    });
  });

  describe('sreality', () => {
    beforeEach(() => {
      global.document.body.innerHTML = srealityString;
      Object.defineProperty(window.location, 'host', {
        writable: true,
        value: 'www.sreality.cz'
      });
    });

    it('should return price per m2', () => {
      expect(extractors.getPrices(window.location.host)).to.equal(57042.25352112676);
    });

    it('should return address', () => {
      expect(extractors.getAddress(window.location.host)).to.equal('Ortenovo náměstí, Praha 7 - Holešovice');
    });
  });

  describe('maxireality', () => {
    beforeEach(() => {
      global.document.body.innerHTML = maxirealityString;
      Object.defineProperty(window.location, 'host', {
        writable: true,
        value: 'www.maxirealitypraha.cz'
      });
    });

    it('should return price per m2', () => {
      expect(extractors.getPrices(window.location.host)).to.equal(64805.194805194806);
    });

    it('should return address', () => {
      expect(extractors.getAddress(window.location.host)).to.equal('Praha - Smíchov Vrázova');
    });
  });
});