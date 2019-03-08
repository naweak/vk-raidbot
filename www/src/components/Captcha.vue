<template>
  <div class="captcha" v-if="captcha">
    <form v-on:submit.prevent="submitCaptcha()">
      <div class="img formColumn"><img v-on:click="updateImg()" :src="captcha.img + random" :alt="captcha.sid"></div>
      <div class="formColumn">Вводите: <input type="text" id="key" v-model="key"></div>
      <div class="formColumn"><button type="submit">YARRR!</button></div>
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
        random: `&${Math.random()}`
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
      },
      updateImg () {
        this.random = `&${Math.random()}`
      }
    }
  }
</script>

<style scoped>
  .captcha {
    border-radius: 3px;
    border: 1px solid #dcdcdc;
    box-shadow: 0 0 10px 0 #dcdcdc;
    display: inline-block;
    margin: 10px;
    padding: 10px;
  }
</style>
