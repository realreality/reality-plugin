import moment from 'moment';
import { GMAPS_API_KEY, MAPS_URL } from '../rr';
import RR from '../rr';
import { ga } from '../utils';

const loadAvailability = function(travelMode, fromAddress, toAddress) {
  // TODO: nastavit spravny cas, respektive udelat jeste nocni casy
  const DEPARTURE_TIME = moment()
  /* we need this date to be stable at least during a month because of caching,
   1 month in future seems as maximum for transit data */
    .startOf('month').add(1, 'weeks').add(2, 'months')
    .isoWeekday('Monday').startOf('day')
    .hours(8).minutes(0); /* assume that on monday 8:30 will be worst traffic */
  RR.logDebug('departure time: ', DEPARTURE_TIME.toObject());
  const DIST_MATRIX_URL = `${MAPS_URL}/distancematrix/json`;
  const distanceMatrixApiUrl = DIST_MATRIX_URL + '?origins=' + encodeURI(fromAddress) +
    '&destinations=' + encodeURI(toAddress) +
    '&mode=' + travelMode +
    '&departure_time=' + DEPARTURE_TIME.unix() +
    '&language=cs&key=' + GMAPS_API_KEY;

  return fetch(distanceMatrixApiUrl).then(response => response.json());
};

export const AvailabilityComponent = {
  template: '#availability-component',
  props: ['pois', 'label', 'type', 'addressFrom'],
  data: function() {
    return {
      showInput: false,
      newPoiAddress: '',
      enrichedPois: []
    };
  },
  methods: {
    showInputBox: function(event) {
      RR.logDebug('Showing input box');
      this.showInput = true;
    },
    hideInputBox: function(event) {
      RR.logDebug('Hiding input box');
      this.showInput = false;
    },
    cancelInputBox: function(event) {
      RR.logDebug('Cancelling input box');
      ga('rr.send', 'event', 'Availibility-Component', 'cancel-input-box-clicked'); /* TODO: mbernhard - should be propagated as an event and ga called in event handler to decouple GA code and component */
      this.hideInputBox();
      this.newPoiAddress = '';
    },
    addPoi: function(event) {
      const newPoiAddress = event.target.value;
      this.$emit('poi-added', newPoiAddress, this.type);
      this.hideInputBox();
      this.newPoiAddress = '';
    },
    removePoi: function(poi, index) {
      this.$emit('poi-removed', poi, index);
    }
  },
  watch: {
    pois: function(pois) {
      this.enrichedPois = [];
      pois.forEach((element, index, array) => {
        const addressTo = element.address.input;
        const addressFrom = this.addressFrom;

        const poiCopy = $.extend({}, element);
        poiCopy.duration = 'N/A';
        poiCopy.address.interpreted = 'N/A';
        this.enrichedPois.splice(index, 1, poiCopy);

        RR.logDebug('Loading ', this.type, ' data from:', addressFrom, 'to: ', addressTo);
        loadAvailability(this.type, addressFrom, addressTo)
          .then((data) => {
            RR.logDebug(this.type, ' data response: ', data);
            const poiCopy = $.extend({}, element);

            try {
              const distancesArray = data.rows[0].elements;
              const distance = distancesArray[0];
              poiCopy.address.interpreted = data.destination_addresses[0];
              poiCopy.duration = distance.duration.text;
            } catch (ex) {
              RR.logError('Error when parsing availibility data: ', ex);
            }
            this.enrichedPois.splice(index, 1, poiCopy);
          });
      });
    }
  }
};
