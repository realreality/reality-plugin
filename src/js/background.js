
const debugAnalytics = process.env.GA_DEBUG === 'enabled' ? '_debug' : ''
const analyticsURL = `https://www.google-analytics.com/analytics${debugAnalytics}.js`

;(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script', analyticsURL, 'ga')

window.ga('create', process.env.GA_TRACKER_ID, 'auto')
window.ga('set', 'checkProtocolTask', function(){ /* nothing */ })
/**
 * Code that detects host page and switches icons in toolbar.
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.switchIconOn) {
    chrome.browserAction.setIcon({
      path: {
        19: 'images/icon-19.png',
        38: 'images/icon-19.png',
      },
      tabId: sender.tab.id,
    })
  }

  if(request.eventType === 'EXTENSION_INIT') {
    window.ga('send', {
      hitType: 'pageview',
      location: request.locationHref,
      page: request.locationPathName,
      title: request.documentTitle,
    })
  }

  if(request.eventType === 'GA_SEND_EVENT') {
    // see https://developers.google.com/analytics/devguides/collection/analyticsjs/events
    window.ga('send', {
      hitType: 'event',
      eventCategory: request.componentName,
      eventAction: request.componentAction,
    })
  }
})
