declare module '*.vue' {
  import * as Vue from 'vue'
  export default typeof Vue
}

declare module 'vue-i18n'

declare module '*.html'

declare namespace RR {
  function logInfo(s: string): void
}
