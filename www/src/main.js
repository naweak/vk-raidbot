import Vue from 'vue'
import App from './components/App.vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)
import Router from './services/Router.js'
import Captchas from './components/Captchas.vue'
Vue.component('captchas', Captchas)
import Status from './components/Status.vue'
Vue.component('status', Status)
import Config from './services/Config.js'
import 'font-awesome/css/font-awesome.css'

const router = new VueRouter(Router)

const app = new Vue({
  el: '#app',
  router,
  data: {
    config: Config
  },
  render: h => h(App)
})

function onresize () {
  var width = window.innerWidth
  var body = document.getElementsByTagName('body')[0]
  if (width <= 1080) {
    body.style.fontSize = "160%"
  }
  else {
    body.style.fontSize = "100%"
  }
}

window.onresize = onresize
window.onresize()
