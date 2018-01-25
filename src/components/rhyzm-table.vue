<template>
  <div>
    <div class="fixed-action-btn">
      <a class="btn-floating btn-large orange">
        <i class="large material-icons">mode_edit</i>
      </a>
      <ul>
        <li><a class="btn-floating purple" @click="intoEditMode('out')">外</a></li>
        <li><a class="btn-floating yellow darken-2" @click="intoEditMode('lie')">床</a></li>
        <li><a class="btn-floating blue" @click="intoEditMode('shallow')">浅</a></li>
        <li><a class="btn-floating green" @click="intoEditMode('deep')">深</a></li>
        <li><a class="btn-floating red" @click="intoEditMode('medicine')">薬</a></li>
        <li><a class="btn-floating blue" @click="intoEditMode('none')">無</a></li>
      </ul>
    </div>
    <div class="rhyzm-table">
        <transition-group name="rows" tag="ul">
          <li v-for="row in rows" v-bind:key="+row.date" class="one-row">
            <div class="row-items">
              <div class="row-item date">{{ row.date.format('M/D (dd)') }}</div>
              <div class="row-item condition">
                <div class="input-field">
                <select @change="onSelectChange($event)" v-model="row.condition">
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
            <div class="hours" @click="selectHours(row)">
              <div v-for="h in hours" class="hour white-text" :class="hourClass(row, h)">
                {{ h - 1 }}
              </div>
            </div>
          </li>
        </transition-group>
        <!-- <infinite-loading @infinite="infiniteHandler"></infinite-loading> -->
    </div>
    <input type="text" class="hidden timepicker" id="timePicker">
    <div class="modal" id="sliderModal">
      <div class="modal-content">
        <h4>時間帯選択</h4>
        <p>{{ showMode() }}時間帯を選択してください。<br>
          <a class="waves-effect waves-light btn" @click="addSlider">時間帯を追加</a><br>
          <a class="waves-effect waves-light btn" @click="removeSlider">時間帯を削除</a>
        </p>
        <div id="timeSlider"></div>
      </div>
      <div class="modal-footer">
        <a href="#!" class="modal-action modal-close waves-effect waves-green btn-flat" @click="mode = 'none'">キャンセル</a>
        <a href="#!" class="modal-action modal-close waves-effect waves-green btn-flat" @click="onCompleteSelectHours">決定</a>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
import moment from 'moment'
import InfiniteLoading from 'vue-infinite-loading'
import M from 'materialize-css'
import noUiSlider from 'materialize-css/extras/noUiSlider/nouislider'
import $ from 'jquery'

moment.locale('ja');

export default {
  data() {
    return {
      rows: [],
      hours: 24,
      mode: 'none',
      timepicker: null,
      timeslider: null,
      sliderModal: null,
      currentRow: null,
      modes: ['medicine', 'deep', 'shallow', 'lie', 'out'].reverse()
    }
  },
  mounted() {
    this.rows = this.load30days(moment())
    this.$nextTick(function () {
      let elem = document.querySelector('.fixed-action-btn');
      M.FloatingActionButton.init(elem, {});

      elem = document.getElementById('sliderModal');
      this.sliderModal = M.Modal.init(elem, {});

      this.timeslider = document.getElementById('timeSlider');
      this.initSlider(1)
    })
  },
  updated: function () {
    this.$nextTick(function () {
      this.updateSelects()
    })
  },
  watch: {
    mode(val) {
      console.log(this.mode)
      if (this.mode === 'none') {
        $(this.$el).find('.hours').removeClass('blink')
        this.timepicker && this.timepicker.destroy()
      } else if (this.mode === 'medicine') {
        $(this.$el).find('.hours').addClass('blink')
        const elem = document.getElementById('timePicker')
        this.timepicker = M.Timepicker.init(elem, {
          onSelect(time) {
            console.log(time)
          },
          twelveHour: false,
        })
      } else {
        $(this.$el).find('.hours').addClass('blink')
        this.initSlider(1)
      }
    },
  },
  methods: {
    hourClass(row, h) {
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

      let current = {
        'grey': true,
        'lighten-2': true,
      }
      this.modes.forEach((mode) => {
        row[mode] && row[mode].forEach((hours) => {
          if (hours[0] < h && h <= hours[1])
          current = modeClass[mode]
        })
      })

      if (h - 1 < 10) {
        current['twice-hour'] = true
      }

      return current
    },
    initSlider(count) {
      this.timeslider.noUiSlider && this.timeslider.noUiSlider.destroy()

      const connect = [false]
      const start = []
      for (let i = 0; i < count; i++) {
        start.push(Math.floor(i * 2 * 24 / (count * 2)))
        start.push(Math.floor((i * 2 + 1) * 24 / (count * 2)))
        connect.push(true)
        connect.push(false)
      }

      noUiSlider.create(this.timeslider, {
       start: start,
       connect: connect,
       step: 1,
       orientation: 'horizontal', // 'horizontal' or 'vertical'
       range: {
         'min': 0,
         'max': 24
       },
       format: {
          to(value) {
            return Math.round(value);
          },
          from(value) {
            return value;
          }
        },
        pips: {
          mode: 'steps',
          density: 5
        }
      });
    },
    addSlider() {
      const count = (this.timeslider.noUiSlider.options.connect.length - 1) / 2
      if (count < 24 / 2 - 1) {
        this.initSlider(count + 1)
      }
    },
    removeSlider() {
      const count = (this.timeslider.noUiSlider.options.connect.length - 1) / 2
      if (count > 1) {
        this.initSlider(count - 1)
      }
    },
    selectHours(row) {
      this.currentRow = row

      if (this.mode === 'none') {
      } else if (this.mode === 'medicine') {
        this.timepicker.open()
      } else {
        this.sliderModal.open()
      }
    },
    onCompleteSelectHours() {
      const val = this.timeslider.noUiSlider.get()

      this.currentRow[this.mode] = []
      while (val.length > 1) {
        this.currentRow[this.mode].push([val.shift(), val.shift()])
      }
      this.mode = 'none'
    },
    intoEditMode(mode) {
      this.mode = mode
    },
    showMode() {
      const names = {
        lie: '眠らずに床についていた',
        deep: 'ぐっすり眠った',
        shallow: 'うとうとしていた',
        out: '外出していた'
      }
      return names[this.mode]
    },
    updateSelects() {
      const elem = document.querySelectorAll('select')
      const instance = M.Select.init(elem, {})
    },
    onSelectChange(event) {
      const $target = $(event.currentTarget)
      const val = $target.val()
      const dropdown = $target.parents('.input-field')
      const colors = {
        '2': 'orange',
        '1': 'lime',
        '0': 'green',
        '-1': 'cyan',
        '-2': 'blue'
      }
      dropdown.removeClass().addClass("input-field lighten-4").addClass(colors[val])
    },
    load30days(date) {
      const rows = []
      for (let i = 0; i < 30; i++) {
        const row = {
          date: date.clone().subtract(i, 'days')
        }
        rows.push(row)
      }
      return rows
    },
    infiniteHandler($state) {
      setTimeout(() => {
        const tail = this.rows[this.rows.length - 1].date
        const temp = this.load30days(tail.clone().subtract(1, 'days'))

        for (let i = 0; i < 30; i++) {
          if (i === 29) {
            setTimeout(() => {
              this.rows.push(temp[i])
              $state.loaded()
            }, 100 * i)
          } else {
            setTimeout(() => {
              this.rows.push(temp[i])
            }, 100 * i)
          }
        }
      }, 300)
    },
  },
  components: {
    InfiniteLoading,
  },
}
</script>

<style lang="scss">
  .rhyzm-table {
    width: 100%;
    overflow-x: scroll;
  }
  ul {
    padding-left: 10px;
  }
  .one-row {
    margin-bottom: 0;
  }
  .rows-enter-active {
    transition: all 0.3s;
  }
  .rows-enter {
    opacity: 0;
    transform: translateX(40px);
  }
  .row-items {
    display: flex;
    align-items: center;
    input,
    .select-wrapper input.select-dropdown,
    .dropdown-content li > span {
      font-size: small;
      height: 2rem;
    }
    .input-field {
      margin: 0;
      margin-top: 0.7rem;
    }
    .condition {
      flex-basis: 6em;
      margin-right: 2px;
    }
    .comment {
      flex-grow: 1;
    }
  }
  .date {
    width: 10ex;
    border-left: 4px solid #ff9800;
    padding-left: 0.1rem;
  }
  .hours {
    display: flex;
    width: 100%;
    cursor: default;
    .hour {
      flex-grow: 1;
      font-size: smaller;
    }
    .twice-hour {
      flex-grow: 2;
    }
  }
  .blink {
    animation: blink 1s infinite;
  }
  @keyframes blink {
    0% {opacity: 0.5;}
    50% {opacity: 1;}
    100% {opacity: 0.5;}
  }
  .hidden {
    display: none;
  }
</style>