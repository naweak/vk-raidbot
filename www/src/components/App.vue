<template>
  <div id="app">
    <status></status>
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app'
}
</script>

<style>
  input[type=password],
  input[type=email],
  input[type=text] {
    border-bottom: 1px solid #dcdcdc;
    border-top: none;
    border-left: none;
    border-right: none;
    padding: 5px;
    font-size: 100px;
    transition: .2s linear;
  }
  button,
  input[type=password],
  input[type=email],
  input[type=text] {
    font-size: 100%;
    font-family: "Arial", sans-serif;
  }
  input[type=password]:focus,
  input[type=email]:focus,
  input[type=text]:focus {
    border-bottom: 1px solid #333;
  }
  input[type=password]:hover,
  input[type=email]:hover,
  input[type=text]:hover {
    border-bottom: 1px solid #a5a5a5;
  }
  #app {
    font-family: "Arial", sans-serif;
  }
  .formColumn {
    margin: 3px;
    padding: 3px;
  }
  button {
    padding: 5px;
    background: white;
    color: #696969;
    border: #dcdcdc 1px solid;
    font-size: 100%;
    font-family: "Arial", sans-serif;
    border-radius: 2px;
    box-shadow: 0 0 2px 0 #dcdcdc;
  }
</style>
