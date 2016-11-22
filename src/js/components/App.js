import { ga, formatPrice } from '../utils';
import RR from '../rr';
import { GMAPS_API_KEY, MAPS_URL } from '../rr';
import { setPOIs } from '../services/storage';

const initAutoCompleteFields = () => {
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
          scriptTag.src="${MAPS_URL}/js?key=${GMAPS_API_KEY}&libraries=places&callback=initAutocomplete"
          document.head.appendChild(scriptTag)
        } else {
          initAutocomplete();
        }
      }, 1000);
    </script>
  `);
};

export const App = {
  el: '.reality-panel',
  methods: {
    formatPrice() {
      return this.details.price.perSquareMeter ? `${formatPrice(this.details.price.perSquareMeter )}/m2`: 'N/A';
    },
    toggleWidget(event) {
      $('.reality-panel').toggleClass('reality-panel-closed');
      ga('rr.send', 'event', 'App-Panel', 'toggle-clicked');
    },
    addPoi(newPoi, type) {
      RR.logDebug('Adding POI', newPoi);
      ga('rr.send', 'event', 'Availibility-Component', 'addPoi', type /*[eventLabel]*/);
      this.pois.push({ address: { input: newPoi }, duration: '' });
    },
    removePoi(poi, index) {
      RR.logDebug('Removing poi', poi, 'with index', index, ' from pois:', this.pois);
      ga('rr.send', 'event', 'Availibility-Component', 'removePoi');
      this.pois.splice(index, 1);
    }
  },
  data() { /* es6 way how to express data: function() { */
    return {
      address: '',
      details: {
        price: {
          perSquareMeter: ''
        }
      },
      newTransitPoiAddress: '',
      showInput: false,
      pois: [], /* poi = Point Of Interest */
      noiseLevel: {
        day: '',
        night: ''
      },
      airQuality: '',
      tags: ''
    };
  },
  watch: {
    pois: setPOIs,
  },
  mounted() { /* es6 way how to express mounted: function() { */
    RR.logDebug('App mounted (ie. rendered)');
    initAutoCompleteFields();
  }
};
