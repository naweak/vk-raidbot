<template>
  <div class="captcha" v-if="captcha">
    <form v-on:submit.prevent="submitCaptcha()">
      <div class="img"><img :src="captcha.img" :alt="captcha.sid"></div>
      <div>Вводите: <input id="key" v-model="key"></div>
      <div><button type="submit">YARRR!</button></div>
    </form>
  </div>
</template>

<script>
  import $ from 'jquery'
  export default {
    name: "captcha",
    props: ['captcha'],
    data () {
      return {
        key: String(),
      }
    },
    methods: {
      submitCaptcha () {
        var that = this
        var vm = that.$root
        $.ajax({
          url: vm.config.apiURL,
          data: {
            method: "submitCaptcha",
            key: that.key,
            sid: that.captcha.sid
          },
          success (data) {
            if (data.success) {
              vm.$emit('info', data.success)
            }
            else {
              vm.$emit('error', data.error)
            }
            vm.$emit('get_captchas')
          }
        })
      }
    }
  }
</script>
