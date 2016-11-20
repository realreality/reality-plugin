import 'expose?$!expose?jQuery!jquery/dist/jquery.min.js';
import 'expose?Vue!vue/dist/vue.min.js'; // Can't just import Vue from 'vue' because of async dependencies
import VueI18n from 'vue-i18n';

import template from 'html!../templates/panel.html';
import RR from './rr';
import { IPR_REST_API, GMAPS_API_KEY, MAPS_URL} from './rr';
import RRLocales from './i18n/locales.js';
import { extractors as pageDataExtractor } from './sites/index';
import { streetNamePredicate } from './utils';

import '../css/cssnormalize.scss';
import '../css/panel.scss';
import { App } from './components/App';
import { AvailabilityComponent } from './components/Availability';

RR.logInfo('contentscript loaded');

chrome.runtime.sendMessage({ 'switchIconOn': true });

const addStyles = function() {
  RR.logDebug('Adding styles and fonts..');
  const stylesRelativePath = [
    'css/panel.css',
    'css/font-awesome.css',
  ];

  const $head = $('head'); /* it could be in forEach loop, but this is more performant */
  stylesRelativePath
    .map(relativePath => chrome.extension.getURL(relativePath))
    .forEach(uri => {
      const notAlreadyThere = $head.find(`*[href="${uri}"]`).length === 0;
      if (notAlreadyThere) {
        $head.append(`<link rel="stylesheet" href="${uri}" type="text/css" />`);
      }
    });
};

const loadTags = function(type, location, radiusMeters, minCount, app) {
  const baseURL = `${MAPS_URL}/place/nearbysearch`;
  fetch(`${baseURL}/json?location=${location.lat},${location.lng}&radius=${radiusMeters}&type=${type}&key=${GMAPS_API_KEY}`)
    .then(response => response.json())
    .then(response => {
      if (response.results.length > minCount) {
        app.tags += `<span class="tag" title="${Vue.t('tags.' + type + '.desc')}">${Vue.t('tags.' + type + '.title')}</span>`;
      }
    });
};

const loadParkingZones = function(location) {
  return $.get(`${IPR_REST_API}/zones-count?lat=${location.lat}&lon=${location.lng}&dist=500`);
};

const loadNoise = function(location, night) {
  return $.get(`${IPR_REST_API}/noise?lat=${location.lat}&lon=${location.lng}&dist=500&at-night=${night}`);
};

const loadAirPollution = function(location) {
  return $.get(`${IPR_REST_API}/atmosphere?lat=${location.lat}&lon=${location.lng}`);
};

const getAirQuality = function(airQualityNum) {
  /*  Definice: Klasifikace klimatologické charakteristiky 1 = velmi dobrá 2 = dobrá 3 = přijatelná 4 = zhoršená 5 = špatná  */

  return Vue.t('pollution.value.val' + airQualityNum);

};

const getNoiseLevelAsText = function(noiseLevels) {
  // http://www.converter.cz/tabulky/hluk.htm
  const highValue = noiseLevels['db-high'];

  switch (true) {
    case (highValue >= 70):
      return Vue.t('noise.value.veryHigh');
    case (highValue >= 60):
      return Vue.t('noise.value.high');
    case (highValue >= 50):
      return Vue.t('noise.value.moderate');
    case (highValue >= 30):
      return Vue.t('noise.value.low');
    case (highValue < 30):
      return Vue.t('noise.value.veryLow');
  }
};

const initLanguage = function() {
  Vue.use(VueI18n);

  chrome.i18n.getAcceptLanguages(function(languages) {
    RR.logDebug('Detected accepted languages: ', languages);

    const appLanguage = languages[0];
    RR.logInfo('Selected app language: ', appLanguage);
    Vue.config.lang = appLanguage;
    Vue.config.fallbackLang = 'en';

    Object.keys(RRLocales).forEach(function (lang) {
      RR.logDebug('RRLocales key: ', lang, '. Localization bundle: ', RRLocales[lang]);
      Vue.locale(lang, RRLocales[lang]);
    });

  });
};

const loadPanel = function(address) {
  const DEFAULT_DESTINATIONS = 'Muzeum,Praha|Radlická 180/50, Praha'; // Node5 = Radlická 180/50, Praha
  RR.logDebug('Loading template panel');
  RR.logDebug('Panel loaded');
  // INJECT PANEL
  RR.logDebug('Injecting panel (template) to page');
  $('body').append(template);
  // html from panel.html is just vue.js template so let's render it

  RR.logDebug('Initializing view (replacing values in panel.html template)');

  initLanguage();

  Vue.config.devtools = true;
  Vue.config.silent = false;
  Vue.filter('street-name', streetNamePredicate);

  Vue.directive('focus', {
    inserted: function(element) {
      element.focus();
    },
    update: function(element) {
      element.focus();
    }
  });

  Vue.component('availibility-component', AvailabilityComponent);

  const $app = new Vue(App);
  $app.$data.address = address;
  $app.$data.details.price.perSquareMeter = pageDataExtractor.getPrices(window.location.host);

  chrome.storage.local.get('pois', function(items) {
    if (chrome.runtime.lastError) {
      RR.logError('Error during obtaining POIs from local storage. Error:', chrome.runtime.lastError);
    } else {
      if (typeof(items.pois) !== 'undefined' && items.pois !== null) {
        $app.$data.pois = items.pois;
        RR.logInfo('POIs loaded from Chrome Local Storage: ', $app.$data.pois);
      } else {
        /* eslint-disable indent */
        $app.$data.pois = DEFAULT_DESTINATIONS
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
        RR.logInfo('No data found in Chrome Local Storage. Using default data: ', $app.$data.pois);
        /* eslint-enable indent */
      }
    }
  });


  fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(address)}&key=${GMAPS_API_KEY}`)
    .then(response => response.json())
    .then((geocodingResponse) => {
      const location = geocodingResponse.results[0].geometry.location;

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

      // tags
      loadTags('night_club', location, 500, 2, $app);
      loadTags('transit_station', location, 400, 3, $app);
      loadTags('park', location, 600, 0, $app);
      loadTags('school', location, 1000, 2, $app);
      loadTags('restaurant', location, 500, 3, $app);

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
            $app.tags += '<span class="tag" title="' + Vue.t('tags.resident_parking.desc') + '">' +
              Vue.t('tags.resident_parking.title') + '</span>';

            if (zones.filter(pz => pz.dist < 600 && pz.type !== 'M').length > 0) {
              $app.tags += '<span class="tag" title="' + Vue.t('tags.paid_parking.desc') + '">' +
                Vue.t('tags.paid_parking.title') + '</span>';
            }
          }

        }
      }); // parking zones
    }); // geoCode
}; // loadPanel

let addressOfProperty;
function initApp() {
  RR.logInfo('Initializing app widget');
  addressOfProperty = pageDataExtractor.getAddress(window.location.host);
  RR.logDebug('Address parsed: ', addressOfProperty);

  if (RR.String.isNotBlank(addressOfProperty)) {
    addStyles();
    loadPanel(addressOfProperty);
  } else {
    RR.logError('Cannot obtain address of property. URL:', window.location);
  }

  pollAddress();
}

let pollAddressTimerId;
function pollAddress() {
  //RR.logDebug('Polling address...'); // you can filter it out in console with regexp filter ^(?=.*?\b.*\b)((?!Poll).)*$ (match all except lines with 'Poll' match)
  const currentAddressOfProperty = pageDataExtractor.getAddress(window.location.host);
  //RR.logDebug('Polled address:', currentAddressOfProperty);
  if (currentAddressOfProperty !== addressOfProperty) {
    $(document).trigger(RR.ADDRESS_CHANGED_EVENT);
    clearTimeout(pollAddressTimerId);
  }
  pollAddressTimerId = setTimeout(pollAddress, 500);
}

$(document).on(RR.ADDRESS_CHANGED_EVENT, (event) => {
  RR.logDebug('Address change in page detected.');
  RR.logDebug('Removing widget');
  $('.reality-panel').remove(); // TODO replace w/ proper teardown & destroy mechanism
  initApp();
});

initApp();
