<template>
  <div id="captchas">
    <div class="captchasWrapper" v-if="captchas.length">
      <Captcha
        v-for="captcha in captchas"
        :captcha="captcha"></Captcha>
    </div>
    <div v-else>
      Капч пока нет. Идите нахуй
    </div>
  </div>
</template>

<script>
  import $ from 'jquery'
  import Captcha from './Captcha.vue'
  export default {
    name: 'captchas',
    data () {
      return {
        captchas: []
      }
    },
    components: {
      Captcha
    },
    methods: {
      getCaptchas () {
        var that = this
        var vm = that.$root
        $.ajax({
          url: vm.config.apiURL,
          data: {
            method: "getCaptchas",
          },
          success (data) {
            if (data.success) {
              that.captchas = data.success
            }
            else {
              console.error(data.error)
            }
          }
        })
      }
    },
    created () {
      this.getCaptchas()
      setInterval(() => {
        this.getCaptchas()
      }, 1500)
      this.$root.$on('get_captchas', () => {
        this.getCaptchas()
      })
    }
  }
</script>
