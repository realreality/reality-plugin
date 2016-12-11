import RR from './rr';

export const streetNamePredicate = (address) => {
  if (typeof(address) !== 'undefined' && address !== null) {
    return address.indexOf(',') > 0 ? address.split(',')[0] : address;
  }
  return address;
};

export const formatPrice = price => Math.round(price) + ' Kč';

/**
 * Call ga (google analytics) in context of current page - we cannot directly call page functions here
 * @param args
 */
export const ga = (...args) => {
  window.location.href= 'javascript:ga(' + args.map(arg => '\'' + arg.toString() + '\'').join(',')  + '); void 0';
};

export const addStyles = function() {
  RR.logDebug('Adding styles and fonts..');
  const stylesRelativePath = [
    'css/panel.css', // this loads the actual compiled scss version
    'css/font-awesome.css',
  ];

  const $head = $('head'); /* it could be in forEach loop, but this is more performant */
  stylesRelativePath
    .map(relativePath => chrome.extension.getURL(relativePath))
    .forEach(uri => {
      const notAlreadyThere = $head.find(`*[href="${uri}"]`).length === 0;
      if (notAlreadyThere) {
        $head.append(`<link rel="stylesheet" href="${uri}" type="text/css" />`);
      }
    });
};

export const getNoiseLevelAsText = function(noiseLevels) {
  // http://www.converter.cz/tabulky/hluk.htm
  const highValue = noiseLevels['db-high'];

  switch (true) {
    case (highValue >= 70):
      return 'noise.value.veryHigh';
    case (highValue >= 60):
      return 'noise.value.high';
    case (highValue >= 50):
      return 'noise.value.moderate';
    case (highValue >= 30):
      return 'noise.value.low';
    case (highValue < 30):
      return 'noise.value.veryLow';
  }
};

export const initAutoCompleteFields = (url, key) => {
  $('head').append(`
    <script>
      function initAutocomplete() {
        const inputs = document.querySelectorAll("input.address-input");
        inputs.forEach(function(input) {
          new google.maps.places.Autocomplete(input, { componentRestrictions: { country: "CZ" } });
        });
      }
      setTimeout(function() {
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          const scriptTag = document.createElement('script');
          scriptTag.type= "text/javascript";
          scriptTag.defer = true;
          scriptTag.async = true;
          scriptTag.src="${url}/js?key=${key}&libraries=places&callback=initAutocomplete"
          document.head.appendChild(scriptTag)
        } else {
          initAutocomplete();
        }
      }, 1000);
    </script>
  `);
};
