<template>
  <div id="status">
    <transition-group name="alerts" tag="div">
    <div v-for="alert in alerts" class="alerts-item" :key="alert" :class="{
      alert: true,
      'info': alert.type == 'info',
      'error': alert.type == 'error',
      'success': alert.type == 'success',
    }">
      <i :class="{
        fa: true,
        'fa-check': alert.type == 'success',
        'fa-ban': alert.type == 'error',
        'fa-info-circle': alert.type == 'info'
      }"></i>
      <span>{{ alert.text }}</span>
    </div>
    </transition-group>
  </div>
</template>

<script>
  export default {
    name: "status",
    data () {
      return {
        alerts: []
      }
    },
    methods: {
      addAlert (text, type) {
        var alert = { text, type }
        this.alerts.unshift(alert);
        setTimeout(() => { this.closeAlert(alert)}, 3000);
      },
      closeAlert (alert) {
        const idx = this.alerts.indexOf(alert);
        if (idx > -1) {
          this.alerts.splice(idx, 1);
        }
      },
      success (text) {
        this.addAlert(text, 'success')
      },
      error (text) {
        this.addAlert(text, 'error')
      },
      info (text) {
        this.addAlert(text, 'info')
      }
    },
    created () {
      this.$root.$on('success', this.success)
      this.$root.$on('info', this.info)
      this.$root.$on('error', this.error)
    }
  }
</script>

<style>
    #status {
      position: fixed;
      z-index: 20;
      top: 10px;
      right: 10px;
    }
    .alert {
        box-shadow: 0 1px 4px grey;
        transition: all 0.2s;
        display: block;
        max-width: 80vw;
    }
    .alerts-enter, .alerts-leave-to {
        opacity: 0;
        transform: translateX(50px);
    }
    .alert {
      margin: 10px;
      padding: 10px;
      border-radius: 3px;
    }
    .success {
      color: #008000;
      background: #9eff86;
      box-shadow: 0 1px 4px #008000;
    }
    .error {
      color: #db2a19;
      box-shadow: 0 1px 4px #db2a19;
      background: #ffb39d;
    }
    .info {
      color: #0071ff;
      background-color: #8ac5ff;
      box-shadow: 0 1px 4px #0071ff;
    }
</style>
