/**
 * Code that detects host page and switches icons in toolbar.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('request', request)
  if (request.switchIconOn) {
    chrome.browserAction.setIcon({
      path: {
        19: 'images/icon-19.png',
        38: 'images/icon-19.png',
      },
      tabId: sender.tab && sender.tab.id,
    })
  }
})
