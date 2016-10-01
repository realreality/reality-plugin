'use strict';

window.addEventListener('load', function() {
  var cssPath = chrome.extension.getURL('/styles/panel.css');
  $('head').append('<link rel="stylesheet" href="'+ cssPath + '" type="text/css" />');


  var address = $('h2').first().text();

  $.get(chrome.extension.getURL('/panel.html'), function(data) {
    $('body').append(data);
    //$('h3.address').html(address);
    // Or if you're using jQuery 1.8+:
    // $($.parseHTML(data)).appendTo('body');
  });
});
