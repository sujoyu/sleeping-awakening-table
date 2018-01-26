<template>
<div>
  <div class="row-items">
    <div class="row-item date">{{ row.date.format('M/D (dd)') }}</div>
    <div class="row-item condition">
      <div class="input-field" :class="conditionClass">
      <select v-model="row.condition">
        <option value="" disabled selected>気分</option>
        <option value="2"> 絶好調</option>
        <option value="1"> 好調</option>
        <option value="0"> 普通</option>
        <option value="-1"> 少し悪い</option>
        <option value="-2"> ひどく悪い</option>
      </select>
      </div>
    </div>
    <div class="row-item comment">
      <div class="input-field">
        <input placeholder="日常行動" v-model="row.comment">
      </div>
    </div>
  </div>
  <div class="hours" @click="selectHours" v-bind:class="{ blink: isBlink }">
    <rhyzm-table-row-hour v-for="hour in 24" :key="hour" :hour="hour" :modes="modes" :row="row"></rhyzm-table-row-hour>
  </div>
</div>
</template>

<script>
  import RhyzmTableRowHour from './rhyzm-table-row-hour'
  import $ from 'jquery'

  export default {
    props: ['row', 'currentRow', 'modes', 'mode'],
    data() {
      return {
      }
    },
    mounted() {
      this.$nextTick(function () {
        const elem = $(this.$el).find('select')
        const instance = M.Select.init(elem, {})
      })
    },
    updated() {
      this.$nextTick(function () {
        const elem = $(this.$el).find('select')
        const instance = M.Select.init(elem, {})
      })
    },
    components: {
      RhyzmTableRowHour
    },
    computed: {
      isBlink() {
        return (this.currentRow && this.currentRow === this.row)
          || (!this.currentRow && this.mode !== 'none')
      },
      conditionClass() {
        if (this.row.condition !== undefined && typeof parseInt(this.row.condition) === 'number') {
          const colors = {
            '2': {'orange': true},
            '1': {'lime': true},
            '0': {'green': true},
            '-1': {'cyan': true},
            '-2': {'blue': true},
          }
          const color = colors[parseInt(this.row.condition)]
          color['lighten-4'] = true
          return color
        } else {
          return {}
        }
      },
    },
    methods: {
      selectHours() {
        this.$emit('selectHours', this.row)
      },
    },
  }
</script>

<style lang="scss">
</style>