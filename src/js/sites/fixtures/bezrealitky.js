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

export default bezRealitkyString;
