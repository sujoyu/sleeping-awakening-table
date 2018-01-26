<template>
  <div class="hour white-text" :class="hourClass">
    {{ hour - 1 }}
  </div>
</template>

<script>
  export default {
    props: ['row', 'hour', 'modes'],
    computed: {
      hourClass() {
      const modeClass = {
        out: {
          'purple': true,
        },
        lie: {
          'yellow': true,
          'darken-2': true
        },
        shallow: {
          'blue': true
        },
        deep: {
          'green': true
        },
        medicine: {
          'red': true
        },
      }

      const row = this.row

      let current = {
        'grey': true,
        'lighten-2': true,
      }
      this.modes.forEach((mode) => {
        row[mode] && row[mode].forEach((hours) => {
          if ((hours[1] === undefined && hours[0] < this.hour && this.hour <= hours[0] + 1)
            || (hours[1] !== undefined && hours[0] < this.hour && this.hour <= hours[1])) {
            current = modeClass[mode]
          }
        })
      })

      if (this.hour - 1 < 10) {
        current['twice-hour'] = true
      }

      return current
    },
    }
  }
</script>

<style lang="scss">

</style>