import 'expose?$!expose?jQuery!jquery/dist/jquery.min.js';
import Vue from 'vue';
import VueI18n from 'vue-i18n';

import RR from './rr';
import RRLocales from './i18n/locales.js';
import { extractors as pageDataExtractor } from './sites/index';
import { streetNamePredicate, addStyles } from './utils';

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
  // html from panelTemplate holds the entry-point `#reality-panel-root`
  $('body').append(panelTemplate);

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

      // vire: instance is stored nowhere
      new Vue({
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
