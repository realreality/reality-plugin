<template>
  <div class="availability-panel">
    <div class="row-title">
      <h3>
        {{ label }} <i v-on:click="showInputBox" class="button add-address fa fa-plus-circle" aria-hidden="true" :title="$t('availability.add_address.button_desc')"></i>
      </h3>
    </div>
    <div class="row" v-for="(poi, index) in enrichedPois">
      <div class="col" :title="poi.address.interpreted">
        {{ poi.address.interpreted | street-name }} <!-- TODO: component is coupled with global "street-name" filter ... not good -->
      </div>
      <div class="col text-right">
        {{ poi.duration }}
        <i v-on:click="removePoi(poi, index)" class="button remove-address fa fa-minus-circle" aria-hidden="true" :title="$t('availability.remove_address.button_desc')"></i>
      </div>
    </div>
    <div class="row-title" v-show="showInput">
      <input class="address-input"
             v-focus
             :placeholder="$t('availability.address_input_label')"
             v-model.lazy="newPoiAddress"
             data-comment=".stop below means stop propagation when keyup, keydown..etc. - because otherwise it could interfere with rest of the page"
             v-on:keyup.stop="" v-on:keydown.stop="" v-on:keypress.stop=""
             v-on:keyup.enter.stop="addPoi"
             v-on:keyup.esc.stop="cancelInputBox" /> <!-- keyup.esc doesn't work TODO: solve it, meanwhile we have special close button next to input box -->
      <i v-on:click="cancelInputBox" class="button close-input-button fa fa-times-circle" aria-hidden="true" :title="$t('availability.cancel_input_address_button.desc')"></i>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import { GMAPS_API_KEY, MAPS_URL } from '../rr';
import RR from '../rr';
import { ga } from '../utils';

const loadAvailability = function(travelMode, fromAddress, toAddress) {
  const DEPARTURE_TIME = moment()
  /* we need this date to be stable at least during a month because of caching,
   1 week in future is safe enough */
    .add(1, 'weeks')
    .isoWeekday('Monday').startOf('day')
    .hours(8).minutes(0); /* assume that on monday 8:30 will be worst traffic */
  RR.logDebug('Availability Departure time: ', DEPARTURE_TIME.toObject());

  const DIST_MATRIX_URL = `${MAPS_URL}/distancematrix/json`;
  let distanceMatrixApiUrl = DIST_MATRIX_URL + '?origins=' + encodeURI(fromAddress) +
    '&destinations=' + encodeURI(toAddress) +
    '&mode=' + travelMode +
    '&departure_time=' + DEPARTURE_TIME.unix() +
    '&language=cs&key=' + GMAPS_API_KEY;

  if (travelMode === 'driving') {
    /* this is important for caching - default mode 'best_guess' use live traffic
     so google api always return new response */
    distanceMatrixApiUrl += '&traffic_model=pessimistic';
  }

  return fetch(distanceMatrixApiUrl).then(response => response.json());
};

export default {
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
      this.$track({ componentName: 'Availibility', componentAction: 'cancel-input-box-clicked' });
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
</script>
