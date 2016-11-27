import Vue from 'vue';
import VueI18n from 'vue-i18n';

import Popup from './popup/Popup.vue';

Vue.use(VueI18n);

const locales = {
  cs: {
    message: {
      desc: 'Pro aktivování bočního panelu jděte na stránku konkretní nemovitosti na jednom z těchto webů:'
    }
  },
  en: {
    message: {
      desc: 'To activate the panel, visit one of the following web sites and display a specific property'
    }
  }
};

// set lang
Vue.config.lang = 'en';

// set locales
Object.keys(locales).forEach(function (lang) {
  Vue.locale(lang, locales[lang]);
});

new Vue({
  el: '#app',
  render: h => h(Popup)
});
