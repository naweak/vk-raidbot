import MainPage from '../views/MainPage.vue'

const routes = [
  { path: '/', component: MainPage }
]

var router = {
  routes,
  mode: "history"
}

export default router
