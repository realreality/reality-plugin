<template>
<div id="reality-panel" class="reality-panel yui3-normalized">
  <div class="reality-panel-bg">
    <div class="header">
      <h2 class="button toggle-app-button" v-on:click="toggleWidget"><span class="icon" aria-hidden="true"></span> Real Reality</h2>
    </div>
    <div class="content">

      <!-- let me explain little bit of vue syntax here:
           label/type.. - static props
           :pois - : is shorthard for v-bind:pois which is for dynamic binding to props (we are binding model data)
           @poi-added - @ is shorthand for v-on:poi-added which is for binding to named events
           is - is means that div is component named "availibility-component" -
                when you use just <availibility-component> it won't work because as we use DOM as a source of template
                all unknown elements are stripped (ignored) by browser
      -->
      <div is="availability-component"
           :label="$t('publicTransit.header')"
           type="transit"
           :address-from="address"
           :pois="pois"
           @poi-added="addPoi"
           @poi-removed="removePoi" />

      <div is="availability-component"
           :label="$t('car.header')"
           type="driving"
           :address-from="address"
           :pois="pois"
           @poi-added="addPoi"
           @poi-removed="removePoi" />

      <div class="row-title">
        <h3>{{$t('noise.header')}}</h3>
      </div>
      <div class="row">
        <div class="col">
          <i class="fa fa-sun-o" aria-hidden="true"></i> {{ noiseLevel.day }}
        </div>
        <div class="col text-right">
          <i class="fa fa-moon-o" aria-hidden="true"></i> {{ noiseLevel.night }}
        </div>
      </div>


      <div class="row-title">
        <h3>{{$t('pollution.header')}}</h3>
      </div>
      <div class="row">
        <div class="col">
          {{$t('pollution.subheader')}}
        </div>
        <div class="col text-right">
          {{ airQuality }}
        </div>
      </div>

      <div class="row-title">
        <h3>{{$t('propertyDetails.header')}}</h3>
      </div>
      <div class="row">
        <div class="col">
          {{$t('propertyDetails.pricePerSqM')}}
        </div>
        <div class="col text-right">
          {{ formatPrice(details.price.perSquareMeter) }}
        </div>
      </div>
    </div>


    <div class="footer">
      <div v-html="tags" class="tags">

      </div>

      <div class="contact-us">
        <a href="https://www.facebook.com/realrealityapp/">
          {{ $t('contactUs') }}
          <i class="fa fa-comments" aria-hidden="true"></i>
        </a>

      </div>
    </div>

  </div>
</div>
</template>

<script>
import { ga, formatPrice, initAutoCompleteFields, getNoiseLevelAsText } from '../utils';
import RR from '../rr';
import { GMAPS_API_KEY, MAPS_URL } from '../rr';
import { setPOIs, getPOIs } from '../services/storage';
import AvailabilityComponent from './Availability.vue';
import { extractors as pageDataExtractor } from "../sites/index";
import { loadLocation, loadNoise, loadAirPollution, loadTags, loadParkingZones } from "../services/api";

export default {
  name: 'app',
  props: ['address', 'details'],
  components: {
    AvailabilityComponent
  },
  methods: {
    formatPrice() {
      return this.details.price.perSquareMeter ? `${formatPrice(this.details.price.perSquareMeter)}/m2` : 'N/A';
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
    // this is maybe not best idea - updating data in LS via `view` component that receives data
    // persisting data should be a concert of some data service
    pois: setPOIs,
  },
  mounted() { /* es6 way how to express mounted: function() { */
    RR.logDebug('App mounted (ie. rendered)');

    // populate vueApp here with Data
    getPOIs()
      .then(pois => { this.$data.pois = pois; }) // must be in curly braces because of sideEffect
      .catch(err => console.error('An error occurred during POI load from storage' + err.message));

    loadLocation(this.address)
      .then(({ results }) => {
        const location = results[0].geometry.location;
        RR.logDebug('geocoding api response: ', location);

        loadNoise(location, 'day')
          .then((result) => {
            RR.logDebug('Noise during the day response: ', result);
            this.$data.noiseLevel.day = this.$t(getNoiseLevelAsText(result));
          });

        loadNoise(location, 'night')
          .then((result) => {
            RR.logDebug('Noise during the night response: ', result);
            this.$data.noiseLevel.night = this.$t(getNoiseLevelAsText(result));
          });

        loadAirPollution(location)
          .then((airPollutionApiResult) => {
            RR.logDebug('Air pollution api response: ', airPollutionApiResult);
            // Definice: Klasifikace klimatologické charakteristiky
            // 1 = velmi dobrá 2 = dobrá 3 = přijatelná 4 = zhoršená 5 = špatná
            this.$data.airQuality = this.$t('pollution.value.val' + airPollutionApiResult.value);
          });

        // TODO vire: map to array of promises and resolve at once
        // tags
        loadTags('night_club', location, 500, 2, this);
        loadTags('transit_station', location, 400, 3, this);
        loadTags('park', location, 600, 0, this);
        loadTags('school', location, 1000, 2, this);
        loadTags('restaurant', location, 500, 3, this);

        loadParkingZones(location, 1000)
          .then(zones => {
            if (zones.length > 0) {
              /*
               Description of type values  see on the very end of the page
               http://www.geoportalpraha.cz/cs/fulltext_geoportal?id=BBDE6394B0E14E8BA656DD69CA2EB0F8#.V_Da1HV97eR
               */
              const closeBlueZones = zones.filter(pz => {
                return pz.dist <= 100 /*m*/ && pz.type === 'M';
                /* Modra  blue zone = parking only for residents */
              });
              if (closeBlueZones.length > 0) {
                this.tags += '<span class="tag" title="' + this.$t('tags.resident_parking.desc') + '">' +
                  this.$t('tags.resident_parking.title') + '</span>';

                if (zones.filter(pz => pz.dist < 600 && pz.type !== 'M').length > 0) {
                  this.tags += '<span class="tag" title="' + this.$t('tags.paid_parking.desc') + '">' +
                    this.$t('tags.paid_parking.title') + '</span>';
                }
              }
            }
          }); // parking zones
      });

    initAutoCompleteFields(MAPS_URL, GMAPS_API_KEY);
  }
};
</script>
