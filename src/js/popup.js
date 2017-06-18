import Vue from 'vue'
import VueI18n from 'vue-i18n'

import RR from './rr.js'
import Popup from './popup/Popup.vue'

Vue.use(VueI18n)

const locales = {
  cs: {
    app: {
      name: 'Real&nbsp;Reality',
      desc: 'Pro aktivování bočního panelu jděte na stránku konkretní nemovitosti na jednom z těchto webů:',
    },
  },
  en: {
    app: {
      name: 'Real&nbsp;Reality',
      desc: 'To activate the panel, visit one of the following web sites and display a specific property',
    },
  },
}

// set lang
chrome.i18n.getAcceptLanguages(languages => {
  const [appLanguage] = languages
  RR.logDebug('Detected accepted languages: ', languages)
  RR.logInfo('Selected app language: ', appLanguage)

  const i18n = new VueI18n({
    locale: appLanguage,
    fallbackLocale: 'en',
  })

  Object.keys(locales).forEach(function (lang) {
    RR.logDebug('locales key: ', lang, '. Localization bundle: ', locales[lang])
    i18n.setLocaleMessage(lang, locales[lang])
  })

  // set locales
  new Vue({
    el: '#app',
    i18n,
    render: h => h(Popup),
  })

})
