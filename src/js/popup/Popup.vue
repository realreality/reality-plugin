<template>
  <div id="app">
    <h1 v-html="$t('app.name')">[Real Reality]</h1>  <!-- [Real Reality] will be replaced, we use v-html because of &nbsp; -->
    <div class="reality-app-popup">
      <div class="reality-app-popup-message">{{ $t('app.desc') }}</div>
      <ul>
        <!-- TODO: mbernhard (03.12.2016) generovat ze sites/index.js -->
        <li>
          <a v-on:click="visit('https://sreality.cz')" href="https://sreality.cz">sreality.cz</a>
        </li>
        <li>
          <a v-on:click="visit('https://bezrealitky.cz')" href="https://bezrealitky.cz">bezrealitky.cz</a>
        </li>
        <li>
          <a v-on:click="visit('http://maxirealitypraha.cz')" href="http://maxirealitypraha.cz">maxirealitypraha.cz</a>
        </li>
        <li>
          <a v-on:click="visit('http://reality.idnes.cz')" href="http://reality.idnes.cz">reality.idnes.cz</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'app',
    methods: {
      visit(page) {
        window.open(page)
      }
    }
  }
</script>

<style>
  #app {
    text-align: left;
    color: #2c3e50;
    margin-top: 60px;
  }

  h1, h2 {
    color: #f45549;
    font-weight: normal;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    display: inline-block;
    margin: 0 10px;
  }

  a {
    color: #f45549;
  }
</style>
