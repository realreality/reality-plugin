'use strict';

RR.logInfo('contentscript loaded');

const API_KEY = 'AIzaSyDP6X1_N95A5pEKOyNgzWNtRK04sL12oek';
const IPR_REST_API = 'https://realreality-app.azurewebsites.net/realreality/rest';

const NODE5_LOCATION = {
  lat: 50.0663614,
  lng: 14.4005557
};
const MUZEUM_METRO_STATION_LOCATION = {
  lat: 50.0814746,
  lng: 14.4302696
};

var addStylesAndFonts = function() {
  RR.logDebug('Adding styles and fonts..');

  var normalizeCssPath = chrome.extension.getURL('/styles/cssnormalize-context-min.css');
  $('head').append('<link rel="stylesheet" href="' + normalizeCssPath + '" type="text/css" />');

  var fontPath = chrome.extension.getURL('bower_components/font-awesome/css/font-awesome.min.css');
  $('head').append('<link rel="stylesheet" href="' + fontPath + '" type="text/css" />');

  var cssPath = chrome.extension.getURL('/styles/panel.css');
  $('head').append('<link rel="stylesheet" href="' + cssPath + '" type="text/css" />');

};

var loadPlaces = function(type, location, radiusMeters) {
  return $.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + location.lat + ',' + location.lng +
    '&radius=' + radiusMeters + '&type='+ type +'&key=' + API_KEY);
};

var loadLiftago = function(locationFrom, locationTo) {
  // TODO: najit spravny cas pro data
  return $.get('http://54.93.66.14:8000/api?t=1468582200&pickup='+ locationFrom.lat + ',' + locationFrom.lng +
  '&dest=' + locationTo.lat + ',' + locationTo.lng);
};

var loadAvailability = function(travelMode, address) {
  // TODO: nastavit spravny cas, respektive udelat jeste nocni casy
  const DESTINATIONS = 'Muzeum,Praha|Radlická 180/50, Praha'; // Node5 = Radlická 180/50, Praha
  const MAPS_API_BASE_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';

  var distanceMatrixApiUrl = MAPS_API_BASE_URL + '?origins=' + encodeURI(address) + '&destinations=' + encodeURI(DESTINATIONS) + '&mode=' + travelMode + '&language=cs&key=' + API_KEY;
  return $.get(distanceMatrixApiUrl);
};

function formatPrice(price) {
  return Math.round(price) + ' Kč';
}

var loadParkingZones = function(location) {
  return $.get(IPR_REST_API + '/zones-count?lat=' + location.lat + '&lon=' + location.lng + '&dist=500');
};

var loadNoise = function(location, night) {
  return $.get(IPR_REST_API + '/noise?lat=' + location.lat + '&lon=' + location.lng + '&dist=500' + '&at-night=' + night);
};

var loadAirPollution = function(location) {
  return $.get(IPR_REST_API + '/atmosphere?lat=' + location.lat + '&lon=' + location.lng);
};

var getAirQuality = function(airQualityNum) {
 /*  Definice: Klasifikace klimatologické charakteristiky 1 = velmi dobrá 2 = dobrá 3 = přijatelná 4 = zhoršená 5 = špatná  */

  var airQuality = 'Very bad'; // for case api will add something worse than 5 ;)
  if (airQualityNum === 5) {
    airQuality = 'Bad';
  } else if (airQualityNum === 4) {
    airQuality = 'Not good';
  } else if (airQualityNum === 3) {
    airQuality = 'Acceptable';
  } else if (airQualityNum === 2) {
    airQuality = 'Good';
  } else if (airQualityNum === 1) {
    airQuality = 'Very good';
  }

  return airQuality;
};

var getNoiseLevelAsText = function(noiseLevels) {
  // http://www.converter.cz/tabulky/hluk.htm
  var highValue = noiseLevels['db-high'];

  switch (true) {
    case (highValue >= 70): return 'Very high';
    case (highValue >= 60): return 'High';
    case (highValue >= 50): return 'Moderate';
    case (highValue >= 30): return 'Low';
    case (highValue < 30): return 'Very low';
  }
};

var formatLiftagoDuration = function(liftagoResponseData) {
    var timeInSeconds = liftagoResponseData.duration + Math.abs(liftagoResponseData.eta);
    return formatDuration(timeInSeconds);
};

var formatDuration = function(timeInSeconds) {
  var timeInMinutes = Math.round(timeInSeconds / 60);

  if (timeInMinutes >= 60) {
    var hours = Math.round(timeInMinutes / 60);
    var minutes = timeInMinutes % 60;
    return hours + ' h ' + minutes + ' min';
  } else {
    return timeInMinutes + ' min';
  }
};

var streetName = function(address) {
  return address.indexOf(',') > 0 ? address.split(',')[0] : address;
};

var extractAddressFromPage = function() {
  var currentHost = window.location.host;

  switch (true) {
    case (currentHost.includes('sreality.cz')):
        return $('.location-text').text();
    case (currentHost.includes('bezrealitky.cz')):
        return $('header h2').first().text();
    case (currentHost.includes('maxirealitypraha.cz')):
        return $('tr:contains("Adresa")').find('td').html().replace(/<br>/g,' ').trim();
    default:
        RR.logError('cannot parse address on page: ', window.location);
        return null;
  }

};

var loadPanel = function(address) {
  RR.logDebug('Loading template panel');
  $.get(chrome.extension.getURL('/panel.html'), function(html) {

    RR.logDebug('Panel loaded');

    // INJECT PANEL
    RR.logDebug('Injecting panel (template) to page');
    $('body').append(html);

    // html from panel.html is just vue.js template so let's render it

    RR.logDebug('Initializing view (replacing values in panel.html template)');
    Vue.config.devtools = true;
    Vue.filter('street-name', streetName);

    var $app = new Vue({
      el: '.reality-panel',
      methods: {
        toggleWidget: () => {
          $('.reality-panel').toggleClass('reality-panel-closed');
        }
      },
      data: {
        address: address,
        poi: [],
        distance: {
          transit: {
              muzeum: '',
              node5: ''
          },
          driving: {
            muzeum: '',
            node5: ''
          }
        },
        noiseLevel: {
          day: '',
          night: ''
        },
        airQuality: '',
        liftago: {
           fromMuzeum: {
             price: '',
             duration: ''
           },
           toNode5: {
             price: '',
             duration: ''
           }
        },
        tags: ''
      }
    });

    var geocodeApiPromise = $.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + encodeURI(address) + '&key=' + API_KEY);
    geocodeApiPromise.then((geocodingResponse) => {
        var location = geocodingResponse.results[0].geometry.location;
        RR.logDebug('geocoding api response: ', location);

         loadNoise(location, false).then((result) => {
          RR.logDebug('Noise during the day response: ', result);
          $app.$data.noiseLevel.day = getNoiseLevelAsText(result);
        });

        loadNoise(location, true).then((result) => {
          RR.logDebug('Noise during the night response: ', result);
          $app.$data.noiseLevel.night = getNoiseLevelAsText(result);
        });

        loadAirPollution(location).then((airPollutionApiResult) => {
          RR.logDebug('Air pollution api response: ', airPollutionApiResult);
          var airQualityNum = airPollutionApiResult.value;
          $app.$data.airQuality = getAirQuality(airQualityNum);
        });

        loadLiftago(location, NODE5_LOCATION).then((liftagoApiResult) => {
           RR.logDebug('liftago to_node5 data response:', liftagoApiResult);
           $app.liftago.toNode5.price = formatPrice(liftagoApiResult[0].price);
           $app.liftago.toNode5.duration = formatLiftagoDuration(liftagoApiResult[0]);
        });

        loadLiftago(MUZEUM_METRO_STATION_LOCATION, location).then((liftagoApiResult) => {
           RR.logDebug('liftago from_muzeum data response:', liftagoApiResult);
           $app.liftago.fromMuzeum.price = formatPrice(liftagoApiResult[0].price);
           $app.liftago.fromMuzeum.duration = formatLiftagoDuration(liftagoApiResult[0]);
        });

        // tags

        loadPlaces('night_club', location, 500).then((nightClubsResponse) => {
          if (nightClubsResponse.results.length > 2) {
            $app.tags += '<span class="tag" title="Party time! At least 2 clubs close to the property!">PARTY</span>';
          }
        });

        loadPlaces('transit_station', location, 400).then((publicTransitStopsResponse) => {
          if (publicTransitStopsResponse.results.length > 3) {
            $app.tags += '<span class="tag" title="At least 3 stops in close distance.">PUBLIC&nbsp;TRANSIT</span>';
          }
        });

        loadPlaces('park', location, 600).then((parksResponse) => {
          if (parksResponse.results.length > 0) {
            $app.tags += '<span class="tag" title="Greeeeen!! At least 1 park in the neighbourhood.">NATURE</span>';
          }
        });

        loadPlaces('school', location, 1000).then((schoolsResponse) => {
          if (schoolsResponse.results.length > 2) {
            $app.tags += '<span class="tag" title="Lot of kids around. Number of schools > 2 in neighbourhood.">KIDS</span>';
          }
        });

        loadParkingZones(location, 1000).then((parkingZonesResponse) => {
          var zones = parkingZonesResponse;
          if (zones.length > 0) {

            /*
             Description of type values  see on the very end of the page
             http://www.geoportalpraha.cz/cs/fulltext_geoportal?id=BBDE6394B0E14E8BA656DD69CA2EB0F8#.V_Da1HV97eR
             */

            var closeBlueZones = zones.filter(pz => { return pz.dist <= 100 /*m*/ && pz.type === 'M'; /* Modra  blue zone = parking only for residents */ });
            if (closeBlueZones.length > 0) {
                $app.tags += '<span class="tag" title="There are blue parking zones around the property. It means that only residents can park here.">RESIDENT PARKING</span>';

                if (zones.filter(pz => { return pz.dist < 600 && pz.type !== 'M'; }).length > 0) {
                  $app.tags += '<span class="tag" title="Paid parking available (ie. orange zones or some combined ones) in close distance.">PAID PARKING</span>';
                }
            }

          }
        });

        loadPlaces('restaurant', location, 500).then((pubsApiResult) => {
          if (pubsApiResult.results.length > 3) {
            $app.tags += '<span class="tag" title="No beer no fun, right? Walk a little bit and choose at least from 3 pubs/restaurants!">PUBS</span>';
          }
        });

      });

      loadAvailability('transit', address).then((transit) => {
        RR.logDebug('transit data response:', transit);
        var transitDistancesArray = transit.rows[0].elements;

        var transitDistanceMuzeum = transitDistancesArray[0];
        var transitDistanceNode5 = transitDistancesArray[1];

        $app.$data.distance.transit.muzeum = transitDistanceMuzeum.duration.text;
        $app.$data.distance.transit.node5 = transitDistanceNode5.duration.text;
      });

      loadAvailability('driving', address).then((transit) => {
        RR.logDebug('driving data response:', transit);
        var transitDistancesArray = transit.rows[0].elements;

        var transitDistanceMuzeum = transitDistancesArray[0];
        var transitDistanceNode5 = transitDistancesArray[1];

        $app.$data.distance.driving.muzeum = transitDistanceMuzeum.duration.text;
        $app.$data.distance.driving.node5 = transitDistanceNode5.duration.text;
      });

  });
};

var addressOfProperty;
function initApp() {
    RR.logInfo('Initializing app widget');
    addStylesAndFonts();
    addressOfProperty = extractAddressFromPage();
    RR.logDebug('address parsed: ', addressOfProperty);

    if (RR.String.isNotBlank(addressOfProperty)) {
      loadPanel(addressOfProperty);
    } else {
      RR.logError('Cannot obtain address of property. URL:', window.location);
    }

    pollAddress();
}

var pollAddressTimerId;
function pollAddress() {
    //RR.logDebug('Polling address...'); // you can filter it out in console with regexp filter ^(?=.*?\b.*\b)((?!Poll).)*$ (match all except lines with 'Poll' match)
    var currentAddressOfProperty = extractAddressFromPage();
    //RR.logDebug('Polled address:', currentAddressOfProperty);
    if (currentAddressOfProperty !== addressOfProperty) {
      $(document).trigger(RR.ADDRESS_CHANGED_EVENT);
      clearTimeout(pollAddressTimerId);
    }
    pollAddressTimerId = setTimeout(pollAddress, 500);
}

window.addEventListener('load', function() {
  RR.logInfo('page load event called');
  initApp();
});

$(document).on(RR.ADDRESS_CHANGED_EVENT, () => {
  RR.logDebug('Address change in page detected.');

  RR.logDebug('Removing widget');
  $('.reality-panel').remove();

  initApp();
});
