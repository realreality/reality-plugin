'use strict';

const API_KEY = 'AIzaSyDP6X1_N95A5pEKOyNgzWNtRK04sL12oek';
const NODE5_LOCATION = {
  lat: 50.0663614,
  lng: 14.4005557
};
const MUZEUM_METRO_STATION_LOCATION = {
  lat: 50.0814746,
  lng: 14.4302696
};

var _init = function() {
  var cssPath = chrome.extension.getURL('/styles/panel.css');
  $('head').append('<link rel="stylesheet" href="' + cssPath + '" type="text/css" />');
  var fontPath = chrome.extension.getURL('bower_components/font-awesome/css/font-awesome.min.css');
  $('head').append('<link rel="stylesheet" href="' + fontPath + '" type="text/css" />');
};

var _loadPlaces = function(type, location, radiusMeters) {
  return $.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + location.lat + ',' + location.lng +
    '&radius=' + radiusMeters + '&type='+ type +'&key=' + API_KEY);
};

var _loadLiftago = function(locationFrom, locationTo) {
  return $.get('http://54.93.66.14:8000/api?t=1468582200&pickup='+ locationFrom.lat + ',' + locationFrom.lng +
  '&dest=' + locationTo.lat + ',' + locationTo.lng);
};

var _loadAvailibility = function(travelMode, address) {
  const DESTINATIONS = 'Muzeum,Praha|Radlická 180/50, Praha'; // Node5 = Radlická 180/50, Praha
  const MAPS_API_BASE_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';

  var distanceMatrixApiUrl = MAPS_API_BASE_URL + '?origins=' + encodeURI(address) + '&destinations=' + encodeURI(DESTINATIONS) + '&mode=' + travelMode + '&language=cs&key=' + API_KEY;
  return $.get(distanceMatrixApiUrl);
};

function _formatPrice(price) {
  return Math.round(price) + ' Kč';
}

var _loadParkingZones = function(location) {
  return $.get('http://10.2.22.117:8080/rest/zones-count?lat=' + location.lat + '&lon=' + location.lng + '&dist=500');
};

var _loadNoise = function(location, night) {
  return $.get('http://10.2.22.117:8080/rest/noise?lat=' + location.lat + '&lon=' + location.lng + '&dist=500' + '&at-night=' + night);
};

var _loadAir = function(location) {
  return $.get('http://10.2.22.117:8080/rest/atmosphere?lat=' + location.lat + '&lon=' + location.lng);
};

var _getAirQuality = function(airQualityNum) {
  var airQuality = 'Very bad';
  if (airQualityNum === 5) {
    airQuality = 'Bad';
  } else if (airQualityNum === 4) {
    airQuality = 'Acceptable';
  } else if (airQualityNum === 3) {
    airQuality = 'Mediocre';
  } else if (airQualityNum === 2) {
    airQuality = 'Good';
  } else if (airQualityNum === 1) {
    airQuality = 'Very Good';
  }

  return airQuality;
}

var _getNoiseLevelAsText = function(noiseLevels) {
  // http://www.converter.cz/tabulky/hluk.htm
  var highValue = noiseLevels['db-high'];

  switch (true) {
    case (highValue >= 70): return 'Very High !!!';
    case (highValue >= 60): return 'High !';
    case (highValue >= 50): return 'Moderate';
    case (highValue >= 30): return 'Low';
    case (highValue < 30): return 'Very Low';
  }
}

var _loadPanel = function(address) {
  $.get(chrome.extension.getURL('/panel.html'), function(html) {

      $.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURI(address) + '&key=' + API_KEY, function(response) {
          var location = response.results[0].geometry.location;
          var liftagoP = _loadLiftago(location, NODE5_LOCATION);
          var liftagoFromMuzeumToP = _loadLiftago(MUZEUM_METRO_STATION_LOCATION, location);
          var transitP = _loadAvailibility('transit', address);
          var drivingP = _loadAvailibility('driving', address);

          var pubsP = _loadPlaces('restaurant', location, 500);
          var nightClubsP = _loadPlaces('night_club', location, 500);
          var stopsP = _loadPlaces('transit_station', location, 400);
          var parkP = _loadPlaces('park', location, 600);
          var schoolP = _loadPlaces('school', location, 1000);

          var zonesP = _loadParkingZones(location, 500);
          var noiseDayP = _loadNoise(location, false);
          var noiseNightP = _loadNoise(location, true);

          var airP = _loadAir(location);

          $.when(
             liftagoP, liftagoFromMuzeumToP, transitP, drivingP, pubsP, nightClubsP, stopsP, parkP,
             schoolP, zonesP, noiseDayP, noiseNightP, airP)
          .done(function(
                    liftago, liftagoFromMuzeumTo, transit, driving, pubs, nightClubs, stops, parks,
                    schools, zones, noiseDay, noiseNight, air) {

            // liftago
            html = html.replace('@@LIFTAGO_NODE5@@', _formatPrice(liftago[0][0].price));
            html = html.replace('@@LIFTAGO_FROM_MUZEUM@@', _formatPrice(liftagoFromMuzeumTo[0][0].price));

            // distances
            var transitDistancesArray = transit[0].rows[0].elements;
            html = html.replace('@@DOJEZD_MUZEUM_MHD@@', transitDistancesArray[0].duration.text);
            html = html.replace('@@DOJEZD_NODE5_MHD@@', transitDistancesArray[1].duration.text);

            var drivingDistancesArray = driving[0].rows[0].elements;
            html = html.replace(/@@MILEAGE_CAR_MUZEUM@@/g, drivingDistancesArray[0].duration.text);
            html = html.replace(/@@MILEAGE_CAR_NODE5@@/g, drivingDistancesArray[1].duration.text);
          
            // noise levels
            var noiseDayLevel = _getNoiseLevelAsText(noiseDay[0]);
            var noiseNightLevel = _getNoiseLevelAsText(noiseNight[0]);

            html = html.replace('@@NOISE_DAY@@', noiseDayLevel + '<br> ' + noiseDay[0]['db-low'] + ' - ' + noiseDay[0]['db-high'] + ' dB');
            html = html.replace('@@NOISE_NIGHT@@', noiseNightLevel + '<br> ' + noiseNight[0]['db-low'] + ' - ' + noiseDay[0]['db-high'] + ' dB');

            // air quality
            var airQualityNum = air[0].value;
            html = html.replace('@@AIR@@', _getAirQuality(airQualityNum));

            // tags
            var tags = ' ';
            if (pubs[0].results.length > 3) {
              tags += '<span class="tag" title="No beer no fun, right? Walk a little bit and choose at least from 3 pubs/restaurants!">PUBS</span>';
            }
            if (nightClubs[0].results.length > 2) {
              tags += '<span class="tag" title="Party time! At least 2 clubs close to property!">PARTY</span>';
            }
            if (stops[0].results.length > 3) {
              tags += '<span class="tag" title="At least 3 stops in close distance.">PUBLIC&nbsp;TRANSIT</span>';
            }
            if (parks[0].results.length > 0) {
              tags += '<span class="tag" title="Greeeeen!! At least 1 park in neighbourhood.">NATURE</span>';
            }
            if (schools[0].results.length > 2) {
              tags += '<span class="tag" title="Lot of kids around. Number of schools > 2 in neighbourhood.">KIDS</span>';
            }

            html = html.replace('@@TAGS@@', tags);

            // INJECT PANEL
            $('body').append(html);

            $('.reality-panel .toggle-app-button').on('click', function() {
                console.debug('toggle app button clicked');
                $('.reality-panel').toggleClass('reality-panel-closed');
            });
          });
        });
  });
};

window.addEventListener('load', function() {
  _init();
  _loadPanel($('h2').first().text());
});
