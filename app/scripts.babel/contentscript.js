'use strict';

var API_KEY = 'AIzaSyDP6X1_N95A5pEKOyNgzWNtRK04sL12oek';
var NODE5 = {
  lat: 50.0663614,
  lng: 14.4005557
};

var _init = function() {
  var cssPath = chrome.extension.getURL('/styles/panel.css');
  $('head').append('<link rel="stylesheet" href="' + cssPath + '" type="text/css" />');
};

var _loadPubs = function(location) {
  return $.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + location.lat + ',' + location.lng +
    '&radius=500&types=restaurant&key=' + API_KEY);
};

var _loadLiftago = function(location) {
  return $.get('http://54.93.66.14:8000/api?t=1468582200&pickup='+ location.lat + ',' + location.lng +
  '&dest=' + NODE5.lat + ',' + NODE5.lng);
};

var _loadTransitAvailibility = function(address) {
  const DESTINATIONS = 'Muzeum,Praha|Radlická 180/50, Praha'; // Node5 = Radlická 180/50, Praha
  const MAPS_API_BASE_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';

  var distanceMatrixApiUrl = MAPS_API_BASE_URL + '?origins=' + encodeURI(address) + '&destinations=' + encodeURI(DESTINATIONS) + '&mode=transit&language=cs&key=' + API_KEY;
  return $.get(distanceMatrixApiUrl);
};

var _loadPanel = function(address) {
  $.get(chrome.extension.getURL('/panel.html'), function(html) {

      $.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURI(address) + '&key=' + API_KEY, function(response) {
          var location = response.results[0].geometry.location;
          var pubsP = _loadPubs(location);
          var liftagoP = _loadLiftago(location);
          var transitP = _loadTransitAvailibility(address);

          $.when(pubsP, liftagoP, transitP).done(function(pubs, liftago, transit) {
            html = html.replace('@@HOSPOD@@', pubs[0].results.length);
            html = html.replace('@@LIFTAGO_NODE5@@', Math.round(liftago[0][0].price) + ' Kč');

            var distancesArray = transit[0].rows[0].elements;
            html = html.replace('@@DOJEZD_MUZEUM_MHD@@', distancesArray[0].duration.text);
            html = html.replace('@@DOJEZD_NODE5_MHD@@', distancesArray[1].duration.text);

            console.log(liftago);
            $('body').append(html);
          });
        });

  });
};

window.addEventListener('load', function() {
  _init();
  _loadPanel($('h2').first().text());
});
