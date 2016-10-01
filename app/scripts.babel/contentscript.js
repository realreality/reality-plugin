'use strict';

var KEY = 'AIzaSyDP6X1_N95A5pEKOyNgzWNtRK04sL12oek';

var _init = function() {
  var cssPath = chrome.extension.getURL('/styles/panel.css');
  $('head').append('<link rel="stylesheet" href="'+ cssPath + '" type="text/css" />');
};

var _loadPanel = function(address) {
  $.get(chrome.extension.getURL('/panel.html'), function(data) {
    $.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + KEY, function(response) {
      console.log(response.results[0].geometry.location);
    });


    $('body').append(data);
    //
  });
};

window.addEventListener('load', function() {
  _init();
  _loadPanel($('h2').first().text());
});
