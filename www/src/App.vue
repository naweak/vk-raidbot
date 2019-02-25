<template>
  <div id="app">
    {{ msg }}
  </div>
</template>

<script>
export default {
  name: 'app',
  data () {
    return {
      msg: 'Утром доделаю'
    }
  }
}
</script>

<style>
  #app {
    font-family: "Arial", sans-serif;
  }
</style>
