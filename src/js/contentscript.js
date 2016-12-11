import 'expose?$!expose?jQuery!jquery/dist/jquery.min.js';
import Vue from 'vue';
import VueI18n from 'vue-i18n';

import RR from './rr';
import RRLocales from './i18n/locales.js';
import { extractors as pageDataExtractor } from './sites/index';
import { streetNamePredicate, addStyles, getNoiseLevelAsText } from './utils';
import { loadParkingZones, loadNoise, loadAirPollution, loadTags, loadLocation } from './services/api';

import '../css/cssnormalize.scss';
import '../css/panel.scss';
import panelTemplate from 'html!../templates/panel.html';

import App from './components/App.vue';

RR.logInfo('contentscript loaded');

chrome.runtime.sendMessage({ 'switchIconOn': true });

const initVueTranslations = () => {
  return new Promise((resolve, reject) => {
    RR.logDebug('Initializing translations');
    chrome.i18n.getAcceptLanguages(languages => {
      const [appLanguage] = languages;
      RR.logDebug('Detected accepted languages: ', languages);
      RR.logInfo('Selected app language: ', appLanguage);
      Vue.use(VueI18n);
      Vue.config.lang = appLanguage;
      Vue.config.fallbackLang = 'en';

      Object.keys(RRLocales).forEach(function (lang) {
        RR.logDebug('RRLocales key: ', lang, '. Localization bundle: ', RRLocales[lang]);
        Vue.locale(lang, RRLocales[lang]);
      });
      resolve();
    });
  });
};

const loadPanel = function(address) {
  RR.logDebug('Injecting panel (template) to page');
  $('body').append(panelTemplate);
  // html from panel.html is just vue.js template so let's render it

  RR.logDebug('Initializing view (replacing values in panel.html template)');

  initVueTranslations()
    .then(() => {
      Vue.config.devtools = true; // does not work in extension
      Vue.config.silent = false;
      Vue.filter('street-name', streetNamePredicate);
      Vue.directive('focus', {
        inserted(element) {
          element.focus();
        },
        update: function(element) {
          element.focus();
        }
      });

      const root = new Vue({
        el: '#reality-panel-root',
        render: h => h(App, {
          props: {
            address,
            details: {
              price: {
                perSquareMeter: pageDataExtractor.getPrices(window.location.host)
              }
            }
          }
        })
      });
      const vueApp = root.$children[0]; // root is a container, and first child is Aapp

      loadLocation(address)
        .then(({ results }) => {
          const location = results[0].geometry.location;
          RR.logDebug('geocoding api response: ', location);

          loadNoise(location, 'day')
            .then((result) => {
              RR.logDebug('Noise during the day response: ', result);
              vueApp.$data.noiseLevel.day = Vue.t(getNoiseLevelAsText(result));
            });

          loadNoise(location, 'night')
            .then((result) => {
              RR.logDebug('Noise during the night response: ', result);
              vueApp.$data.noiseLevel.night = Vue.t(getNoiseLevelAsText(result));
            });

          loadAirPollution(location)
            .then((airPollutionApiResult) => {
              RR.logDebug('Air pollution api response: ', airPollutionApiResult);
              // Definice: Klasifikace klimatologické charakteristiky
              // 1 = velmi dobrá 2 = dobrá 3 = přijatelná 4 = zhoršená 5 = špatná
              vueApp.$data.airQuality = Vue.t('pollution.value.val' + airPollutionApiResult.value);
            });

          // TODO vire: map to array of promises and resolve at once
          // tags
          loadTags('night_club', location, 500, 2, vueApp);
          loadTags('transit_station', location, 400, 3, vueApp);
          loadTags('park', location, 600, 0, vueApp);
          loadTags('school', location, 1000, 2, vueApp);
          loadTags('restaurant', location, 500, 3, vueApp);

          loadParkingZones(location, 1000)
            .then(zones => {
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
                  vueApp.tags += '<span class="tag" title="' + Vue.t('tags.resident_parking.desc') + '">' +
                    Vue.t('tags.resident_parking.title') + '</span>';

                  if (zones.filter(pz => pz.dist < 600 && pz.type !== 'M').length > 0) {
                    vueApp.tags += '<span class="tag" title="' + Vue.t('tags.paid_parking.desc') + '">' +
                      Vue.t('tags.paid_parking.title') + '</span>';
                  }
                }
              }
            }); // parking zones
        }); // geoCode
    });
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
