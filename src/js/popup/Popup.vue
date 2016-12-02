<template>
  <div id="app">
    <h1>Real Reality Extension</h1>
    <div class="reality-app-popup">
      <div class="reality-app-popup-message">{{ $t("message.desc") }}</div>
      <ul>
        <li>
          <a v-on:click="visit('https://sreality.cz')" href="https://sreality.cz">sreality.cz</a>
        </li>
        <li>
          <a v-on:click="visit('https://bezrealitky.cz')" href="https://bezrealitky.cz">bezrealitky.cz</a>
        </li>
        <li>
          <a v-on:click="visit('http://maxirealitypraha.cz')" href="http://maxirealitypraha.cz">maxirealitypraha.cz</a>
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
