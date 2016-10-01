'use strict';

var KEY = 'AIzaSyDP6X1_N95A5pEKOyNgzWNtRK04sL12oek';

var _init = function() {
  var cssPath = chrome.extension.getURL('/styles/panel.css');
  $('head').append('<link rel="stylesheet" href="' + cssPath + '" type="text/css" />');
};

var _loadPubs = function(location) {
  return $.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + location.lat + ',' + location.lng +
    '&radius=500&types=restaurant&key=' + KEY);
};

var _loadPanel = function(address) {
  $.get(chrome.extension.getURL('/panel.html'), function(html) {

    $.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=' + KEY, function(response) {
      console.log(response.results[0].geometry.location);
      var pubs = _loadPubs(response.results[0].geometry.location);
  
      $.when(pubs).done(function(pubsData) {
        html = html.replace('@@HOSPOD@@', pubsData.results.length);
        $('body').append(html);
      });
    });
    //
  });
};

window.addEventListener('load', function() {
  _init();
  _loadPanel($('h2').first().text());
});
