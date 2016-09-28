'use strict';

window.addEventListener('load', function() {

  var address = $('h2').first().text();

  $.get(chrome.extension.getURL('/panel.html'), function(data) {
    $('.box-owner.col-1').before(data);
    $('h3.address').html(address);
    // Or if you're using jQuery 1.8+:
    // $($.parseHTML(data)).appendTo('body');
  });
});
