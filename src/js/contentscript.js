import 'expose-loader?$!expose-loader?jQuery!jquery/dist/jquery.min.js'
import Vue from 'vue'
import VueI18n from 'vue-i18n'

import RR from './rr'
import RRLocales from './i18n/locales.js'
import { extractors as pageDataExtractor } from './sites/index'
import { streetNamePredicate, addStyles } from './utils'

import '../css/cssnormalize.scss'
import '../css/panel.scss'

import App from './components/App.vue'

Vue.use(VueI18n)
RR.logInfo('contentscript loaded')

chrome.runtime.sendMessage({ 'switchIconOn': true })

const initVueTranslations = () => {
  return new Promise((resolve, reject) => {
    RR.logDebug('Initializing translations')
    chrome.i18n.getAcceptLanguages(languages => {
      const [appLanguage] = languages
      RR.logDebug('Detected accepted languages: ', languages)
      RR.logInfo('Selected app language: ', appLanguage)

      const vueI18n = new VueI18n({
        locale: appLanguage,
        fallbackLocale: 'en',
      })

      Object.keys(RRLocales).forEach(function (lang) {
        RR.logDebug('RRLocales key: ', lang, '. Localization bundle: ', RRLocales[lang])
        vueI18n.setLocaleMessage(lang, RRLocales[lang])
      })

      resolve(vueI18n)
    })
  })
}

const loadPanel = function(address) {
  RR.logDebug('Injecting panel (template) to page')
  RR.logDebug('Initializing view (replacing values in panel.html template)')
  $('body').append('<div id="reality-panel-root"></div>')
  chrome.runtime.sendMessage({
    eventType: 'EXTENSION_INIT',
    documentTitle: document.title,
    locationHost: window.location.host,
    locationHref: window.location.href,
    locationPathName: window.location.pathname,
  })
  initVueTranslations()
    .then((i18n) => {
      Vue.config.devtools = true // does not work in extension
      Vue.config.silent = false
      Vue.filter('street-name', streetNamePredicate)
      Vue.directive('focus', {
        inserted(element) {
          element.focus()
        },
        update: function(element) {
          element.focus()
        },
      })

      // vire: instance is stored nowhere
      new Vue({
        el: '#reality-panel-root',
        i18n,
        render: h => h(App, {
          props: {
            address,
            details: {
              price: {
                perSquareMeter: pageDataExtractor.getPrices(window.location.host),
              },
            },
          },
        }),
      })
    })
} // loadPanel

let addressOfProperty
function initApp() {
  RR.logInfo('Initializing app widget')
  addressOfProperty = pageDataExtractor.getAddress(window.location.host)
  RR.logDebug('Address parsed: ', addressOfProperty)

  if (RR.String.isNotBlank(addressOfProperty)) {
    addStyles()
    loadPanel(addressOfProperty)
  } else {
    RR.logError('Cannot obtain address of property. URL:', window.location)
  }

  pollAddress()
}

let pollAddressTimerId
function pollAddress() {
  //RR.logDebug('Polling address...'); // you can filter it out in console with regexp filter ^(?=.*?\b.*\b)((?!Poll).)*$ (match all except lines with 'Poll' match)
  const currentAddressOfProperty = pageDataExtractor.getAddress(window.location.host)
  //RR.logDebug('Polled address:', currentAddressOfProperty);
  if (currentAddressOfProperty !== addressOfProperty) {
    $(document).trigger(RR.ADDRESS_CHANGED_EVENT)
    clearTimeout(pollAddressTimerId)
  }
  pollAddressTimerId = setTimeout(pollAddress, 500)
}

$(document).on(RR.ADDRESS_CHANGED_EVENT, (event) => {
  RR.logDebug('Address change in page detected.')
  RR.logDebug('Removing widget')
  $('.reality-panel').remove() // TODO replace w/ proper teardown & destroy mechanism
  initApp()
})

initApp()
