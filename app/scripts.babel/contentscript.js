'use strict';

var API_KEY = 'AIzaSyDP6X1_N95A5pEKOyNgzWNtRK04sL12oek';
var NODE5 = {
  lat: 50.0663614,
  lng: 14.4005557
};

var _init = function() {
  var cssPath = chrome.extension.getURL('/styles/panel.css');
  $('head').append('<link rel="stylesheet" href="' + cssPath + '" type="text/css" />');
  var fontPath = chrome.extension.getURL('bower_components/font-awesome/css/font-awesome.min.css');
  $('head').append('<link rel="stylesheet" href="' + fontPath + '" type="text/css" />');
};

var _loadPlaces = function(type, location) {
  return $.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + location.lat + ',' + location.lng +
    '&radius=500&type='+ type +'&key=' + API_KEY);
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
          var liftagoP = _loadLiftago(location);
          var transitP = _loadTransitAvailibility(address);

          var pubsP = _loadPlaces('restaurant', location);
          var nightclubsP = _loadPlaces('night_club', location);
          var stopsP = _loadPlaces('transit_station', location);
          var parkP = _loadPlaces('park', location);
          var schoolP = _loadPlaces('school', location);

          $.when(liftagoP, transitP, pubsP, nightclubsP, stopsP, parkP, schoolP)
          .done(function(liftago, transit, pubs, nightclubs, stops, parks, schools) {
            html = html.replace('@@HEADER@@', address);
            html = html.replace('@@HOSPOD@@', pubs[0].results.length);
            html = html.replace('@@LIFTAGO_NODE5@@', Math.round(liftago[0][0].price) + ' Kč');

            var distancesArray = transit[0].rows[0].elements;
            html = html.replace('@@DOJEZD_MUZEUM_MHD@@', distancesArray[0].duration.text);
            html = html.replace('@@DOJEZD_NODE5_MHD@@', distancesArray[1].duration.text);

            console.log('pubs', pubs);
            console.log('bar', nightclubs);
            console.log('stops', stops);
            console.log('parks', parks);
            console.log('schools', schools);

            var tags = ' ';
            if (pubs[0].results.length > 10) {
              tags += '<span class="tag">HOSPODA</span>';
            }
            if (nightclubs[0].results.length > 5) {
              tags += '<span class="tag">PARTY</span>';
            }
            if (stops[0].results.length > 5) {
              tags += '<span class="tag">MHD</span>';
            }
            if (parks[0].results.length > 0) {
              tags += '<span class="tag">NATURE</span>';
            }
            if (schools[0].results.length > 2) {
              tags += '<span class="tag">KIDS</span>';
            }

            html = html.replace('@@TAGS@@', tags);

            $('body').append(html);
          });
        });

  });
};

window.addEventListener('load', function() {
  _init();
  _loadPanel($('h2').first().text());
});
