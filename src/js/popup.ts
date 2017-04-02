import * as Vue from 'vue'
import * as VueI18n from 'vue-i18n'

import Popup from './popup/Popup.vue'
import RR from './rr'

Vue.use(VueI18n)

const locales = {
  cs: {
    app: {
      name: 'Real&nbsp;Reality',
    },
    message: {
      desc: 'Pro aktivování bočního panelu jděte na stránku konkretní nemovitosti na jednom z těchto webů:',
    },
  },
  en: {
    app: {
      name: 'Real&nbsp;Reality',
    },
    message: {
      desc: 'To activate the panel, visit one of the following web sites and display a specific property',
    },
  },
}

// set lang
chrome.i18n.getAcceptLanguages(languages => {
  const [appLanguage] = languages
  RR.logDebug('Detected accepted languages: ', languages)
  RR.logInfo('Selected app language: ', appLanguage)
  Vue.use(VueI18n, {
    lang: appLanguage,
    fallbackLang: 'en',
  })

  // set locales
  Object.keys(locales).forEach(function(lang) {
    (Vue as any).locale(lang, locales[lang])
  })

  new Vue({
    el: '#app',
    render: h => h(Popup),
  })
})
