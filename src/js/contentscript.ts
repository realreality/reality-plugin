import 'expose-loader?$!expose-loader?jQuery!jquery/dist/jquery.min.js'
import * as Vue from 'vue'
import * as VueI18n from 'vue-i18n'

import RRLocales from './i18n/locales'
import RR from './rr'
import { extractors as pageDataExtractor } from './sites/index'
import { addStyles, streetNamePredicate } from './utils'

import * as panelTemplate from 'html-loader!../templates/panel.html'
import '../css/cssnormalize.scss'
import '../css/panel.scss'

import * as App from './components/App.vue'
export const ADDRESS_CHANGED_EVENT = 'rr:addressChanged'

RR.logInfo('contentscript loaded')

chrome.runtime.sendMessage({ 'switchIconOn': true })

const initVueTranslations = () => {
  return new Promise((resolve, reject) => {
    RR.logDebug('Initializing translations')
    chrome.i18n.getAcceptLanguages(languages => {
      const [appLanguage] = languages
      RR.logDebug('Detected accepted languages: ', languages)
      RR.logInfo('Selected app language: ', appLanguage)

      Vue.use(VueI18n, {
        lang: appLanguage,
        fallbackLang: 'en',
      })

      Object.keys(RRLocales).forEach(function(lang) {
        // RR.logDebug('RRLocales key: ', lang, '. Localization bundle: ', RRLocales[lang])
        (Vue as any).locale(lang, RRLocales[lang])
      })
      resolve()
    })
  })
}

const loadPanel = function(address: string) {
  RR.logDebug('Injecting panel (template) to page')
  // html from panelTemplate holds the entry-point `#reality-panel-root`
  $('body').append(panelTemplate)

  RR.logDebug('Initializing view (replacing values in panel.html template)')

  initVueTranslations()
    .then(() => {
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
        render: h => h(App, {
          props: {
            address,
            details: {
              price: {
                perSquareMeter: pageDataExtractor.extractSquarePrice(),
              },
            },
          },
        }),
      })
    })
} // loadPanel

let addressOfProperty: string
function initApp() {
  RR.logInfo('Initializing app widget')
  addressOfProperty = pageDataExtractor.getAddress()
  RR.logDebug('Address parsed: ', addressOfProperty)

  if (addressOfProperty && addressOfProperty.trim()) {
    addStyles()
    loadPanel(addressOfProperty)
  } else {
    RR.logError('Cannot obtain address of property. URL:', window.location)
  }

  pollAddress()
}

let pollAddressTimerId: number
function pollAddress() {
  // RR.logDebug('Polling address...');
  const currentAddressOfProperty = pageDataExtractor.getAddress()
  // RR.logDebug('Polled address:', currentAddressOfProperty);
  if (currentAddressOfProperty !== addressOfProperty) {
    $(document).trigger(ADDRESS_CHANGED_EVENT)
    clearTimeout(pollAddressTimerId)
  }
  pollAddressTimerId = setTimeout(pollAddress, 500)
}

$(document).on(ADDRESS_CHANGED_EVENT, (event) => {
  RR.logDebug('Address change in page detected.')
  RR.logDebug('Removing widget')
  $('.reality-panel').remove() // TODO replace w/ proper teardown & destroy mechanism
  initApp()
})

initApp()
