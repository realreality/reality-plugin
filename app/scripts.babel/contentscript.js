'use strict';

RR.logInfo('contentscript loaded');

const API_KEY = 'AIzaSyDP6X1_N95A5pEKOyNgzWNtRK04sL12oek';
const IPR_REST_API = 'https://realreality.publicstaticvoidmain.cz/rest';

const NODE5_LOCATION = {
  lat: 50.0663614,
  lng: 14.4005557
};
const MUZEUM_METRO_STATION_LOCATION = {
  lat: 50.0814746,
  lng: 14.4302696
};

const addStylesAndFonts = function() {
  RR.logDebug('Adding styles and fonts..');
  const $head = $('head');
  const normalizeCssPath = chrome.extension.getURL('/styles/cssnormalize-context-min.css');
  $head.append('<link rel="stylesheet" href="' + normalizeCssPath + '" type="text/css" />');

  const fontPath = chrome.extension.getURL('bower_components/font-awesome/css/font-awesome.min.css');
  $head.append('<link rel="stylesheet" href="' + fontPath + '" type="text/css" />');

  const cssPath = chrome.extension.getURL('/styles/panel.css');
  $head.append('<link rel="stylesheet" href="' + cssPath + '" type="text/css" />');

};

const loadPlaces = function(type, location, radiusMeters) {
  return $.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + location.lat + ',' + location.lng +
    '&radius=' + radiusMeters + '&type=' + type + '&key=' + API_KEY);
};

const loadLiftago = function(locationFrom, locationTo) {
  // TODO: najit spravny cas pro data
  return $.get('http://54.93.66.14:8000/api?t=1468582200&pickup=' + locationFrom.lat + ',' + locationFrom.lng +
    '&dest=' + locationTo.lat + ',' + locationTo.lng);
};

const loadAvailability = function(travelMode, fromAddress, toAddress) {

  // TODO: nastavit spravny cas, respektive udelat jeste nocni casy
  const MAPS_API_BASE_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';

  const distanceMatrixApiUrl = MAPS_API_BASE_URL + '?origins=' + encodeURI(fromAddress) +
                          '&destinations=' + encodeURI(toAddress) +
                          '&mode=' + travelMode +
                          '&language=cs&key=' + API_KEY;

  return $.get(distanceMatrixApiUrl);
};

const formatPrice = function formatPrice(price) {
  return Math.round(price) + ' Kč';
};

const loadParkingZones = function(location) {
  return $.get(IPR_REST_API + '/zones-count?lat=' + location.lat + '&lon=' + location.lng + '&dist=500');
};

const loadNoise = function(location, night) {
  return $.get(IPR_REST_API + '/noise?lat=' + location.lat + '&lon=' + location.lng + '&dist=500' + '&at-night=' + night);
};

const loadAirPollution = function(location) {
  return $.get(IPR_REST_API + '/atmosphere?lat=' + location.lat + '&lon=' + location.lng);
};

const getAirQuality = function(airQualityNum) {
  /*  Definice: Klasifikace klimatologické charakteristiky 1 = velmi dobrá 2 = dobrá 3 = přijatelná 4 = zhoršená 5 = špatná  */

  if (airQualityNum === 5) {
    return 'Bad';
  } else if (airQualityNum === 4) {
    return 'Worsened';
  } else if (airQualityNum === 3) {
    return 'Acceptable';
  } else if (airQualityNum === 2) {
    return 'Good';
  } else if (airQualityNum === 1) {
    return 'Very good';
  }

  return 'Very bad'; // for case api will add something worse than 5 ;)
};

const getNoiseLevelAsText = function(noiseLevels) {
  // http://www.converter.cz/tabulky/hluk.htm
  const highValue = noiseLevels['db-high'];

  switch (true) {
    case (highValue >= 70):
      return 'Very high';
    case (highValue >= 60):
      return 'High';
    case (highValue >= 50):
      return 'Moderate';
    case (highValue >= 30):
      return 'Low';
    case (highValue < 30):
      return 'Very low';
  }
};

const formatDuration = function(timeInSeconds) {
  const timeInMinutes = Math.round(timeInSeconds / 60);

  if (timeInMinutes >= 60) {
    const hours = Math.round(timeInMinutes / 60);
    const minutes = timeInMinutes % 60;
    return hours + ' h ' + minutes + ' min';
  } else {
    return timeInMinutes + ' min';
  }
};

const formatLiftagoDuration = function(liftagoResponseData) {
  const timeInSeconds = liftagoResponseData.duration + Math.abs(liftagoResponseData.eta);
  return formatDuration(timeInSeconds);
};

const streetName = function(address) {
  if (typeof(address) !== 'undefined' && address !== null) {
    return address.indexOf(',') > 0 ? address.split(',')[0] : address;
  } else {
    return address;
  }
};

const extractAddressFromPage = function() {
  const currentHost = window.location.host;

  switch (true) {
    case (currentHost.includes('sreality.cz')):
      return $('.location-text').text();
    case (currentHost.includes('bezrealitky.cz')):
      return $('header h2').first().text();
    case (currentHost.includes('maxirealitypraha.cz')):
      return $('tr:contains("Adresa")').find('td').html().replace(/<br>/g, ' ').trim();
    default:
      RR.logError('cannot parse address on page: ', window.location);
      return null;
  }

};

const getPriceBySite = function getPriceBySite() {
  const priceNA = 'N/A';

  if (window.location.host.includes('sreality')) {
    const params = Array.from(document.querySelectorAll('.params li')).map(li => li.innerText);
    const priceString = params.filter(p => p.includes('Celková cena'));
    const price = priceString && priceString.length === 1
      ? priceString[0].split(':')[1].split('Kč')[0].replace(/\s/g, '')
      : priceNA;
    const areaString = params.filter(p => p.includes('Užitná'));
    const livingArea = areaString && areaString.length === 1 ? areaString[0].match(/(\d){2,}/g)[0] : 0;

    return (livingArea && !isNaN(livingArea) && price) ? parseInt(price, 10) / livingArea : priceNA;

  }
};

const loadPanel = function(address) {
  const DESTINATIONS = 'Muzeum,Praha|Radlická 180/50, Praha'; // Node5 = Radlická 180/50, Praha
  RR.logDebug('Loading template panel');
  $.get(chrome.extension.getURL('/panel.html'), function(html) {
    RR.logDebug('Panel loaded');

    // INJECT PANEL
    RR.logDebug('Injecting panel (template) to page');
    $('body').append(html);

    // html from panel.html is just vue.js template so let's render it

    RR.logDebug('Initializing view (replacing values in panel.html template)');
    Vue.config.devtools = true;
    Vue.config.silent = false;
    Vue.filter('street-name', streetName);

    Vue.component('availibility-component', {
      template: '#availability-component',
      props: ['pois', 'label', 'type', 'addressFrom'],
      data: function() {
        return {
          showInput: false,
          newPoiAddress: '',
          m_pois: []
        };
      },
      methods: {
        showInputBox: function(event) {
          RR.logDebug('Showing input box');
          this.showInput = true;
        },
        hideInputBox: function(event) {
          RR.logDebug('Hiding input box');
          this.showInput = false;
        },
        cancelInputBox: function(event) {
          RR.logDebug('Cancelling input box');
          this.hideInputBox();
          this.newPoiAddress = '';
        },
        addPoi: function(event) {
          var newPoiAddress = event.target.value;
          this.$emit('poi-added', newPoiAddress, this.type);
          this.hideInputBox();
          this.newPoiAddress = '';
        }
      },
      watch: {
        pois: function(pois) {
          this.m_pois = [];
          pois.forEach((element, index, array) => {
            var addressTo = element.address.input;
            var addressFrom = this.addressFrom;
            RR.logDebug('Loading ', this.type, ' data from:', addressFrom, 'to: ', addressTo);
            loadAvailability(this.type, addressFrom, addressTo).then((data) => {
              RR.logDebug(this.type, ' data response: ', data);
              var distancesArray = data.rows[0].elements;
              var distance = distancesArray[0];
              var poi2 = $.extend({}, element);
              poi2.duration = distance.duration.text;
              poi2.address.interpreted = data.destination_addresses[0];  // jshint ignore:line
              this.m_pois.push(poi2);
            });
          });
        }
      }
    });

    const $app = new Vue({
      el: '.reality-panel',
      methods: {
        toggleWidget: (event) => {
          $('.reality-panel').toggleClass('reality-panel-closed');
        },
        addPoi: function(newPoi, type) {
          RR.logDebug('Adding POI', newPoi);
          this.pois.push({ address: { input: newPoi }, duration: '' });
        }
      },
      data: {
        address: address,
        details: {
          price: {
            perSquareMeter: ''
          }
        },
        newTransitPoiAddress: '',
        showInput: false,
        pois: [], /* poi = Point Of Interest */
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

    $app.$data.details.price.perSquareMeter = `${formatPrice(getPriceBySite())}/m2`;

    $app.pois = DESTINATIONS
                    .split('|')
                    .map((val) => {
                      return {
                        address: {
                            input: val,
                            interpreted: ''
                        },
                        duration: ''
                      };
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
          const airQualityNum = airPollutionApiResult.value;
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

        loadPlaces('restaurant', location, 500).then((pubsApiResult) => {
          if (pubsApiResult.results.length > 3) {
            $app.tags += '<span class="tag" title="No beer no fun, right? Walk a little bit and choose at least from 3 pubs/restaurants!">PUBS</span>';
          }
        });

        loadParkingZones(location, 1000).then((parkingZonesResponse) => {
          const zones = parkingZonesResponse;
          if (zones.length > 0) {
            /*
             Description of type values  see on the very end of the page
             http://www.geoportalpraha.cz/cs/fulltext_geoportal?id=BBDE6394B0E14E8BA656DD69CA2EB0F8#.V_Da1HV97eR
             */

            const closeBlueZones = zones.filter(pz => {
              return pz.dist <= 100 /*m*/ && pz.type === 'M';
              /* Modra  blue zone = parking only for residents */
            });
            if (closeBlueZones.length > 0) {
              $app.tags += '<span class="tag" title="There are blue parking zones around the property. It means that only residents can park here.">RESIDENT PARKING</span>';

              if (zones.filter(pz => pz.dist < 600 && pz.type !== 'M').length > 0) {
                $app.tags += '<span class="tag" title="Paid parking available (ie. orange zones or some combined ones) in close distance.">PAID PARKING</span>';
              }
            }

          }
        }); // parking zones

      }); // geoCode
    }); // getUrl panel.html
}; // loadPanel

let addressOfProperty;
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

let pollAddressTimerId;
function pollAddress() {
  //RR.logDebug('Polling address...'); // you can filter it out in console with regexp filter ^(?=.*?\b.*\b)((?!Poll).)*$ (match all except lines with 'Poll' match)
  const currentAddressOfProperty = extractAddressFromPage();
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

$(document).on(RR.ADDRESS_CHANGED_EVENT, (event) => {
  RR.logDebug('Address change in page detected.');

  RR.logDebug('Removing widget');
  $('.reality-panel').remove();

  initApp();
});
