import Vue from 'vue';
import VueI18n from 'vue-i18n';

import RR from './rr.js';
import Popup from './popup/Popup.vue';

Vue.use(VueI18n);

const locales = {
  cs: {
    app: {
      name: 'Real&nbsp;Reality'
    },
    message: {
      desc: 'Pro aktivování bočního panelu jděte na stránku konkretní nemovitosti na jednom z těchto webů:'
    }
  },
  en: {
    app: {
      name: 'Real&nbsp;Reality'
    },
    message: {
      desc: 'To activate the panel, visit one of the following web sites and display a specific property'
    }
  }
};

// set lang
chrome.i18n.getAcceptLanguages(languages => {
  const [appLanguage] = languages;
  RR.logDebug('Detected accepted languages: ', languages);
  RR.logInfo('Selected app language: ', appLanguage);
  Vue.use(VueI18n);
  Vue.config.lang = appLanguage;
  Vue.config.fallbackLang = 'en';

  // set locales
  Object.keys(locales).forEach(function (lang) {
    Vue.locale(lang, locales[lang]);
  });

  new Vue({
    el: '#app',
    render: h => h(Popup)
  });

});
