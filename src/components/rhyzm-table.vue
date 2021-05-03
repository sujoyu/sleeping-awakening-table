<template>
  <div>
    <div class="fixed-action-btn">
      <a class="btn-floating btn-large orange">
        <i class="large material-icons">mode_edit</i>
      </a>
      <ul>
        <li><a class="btn-floating waves-effect waves-light purple" @click="intoEditMode('out')">外出</a></li>
        <li><a class="btn-floating waves-effect waves-light yellow darken-2" @click="intoEditMode('lie')">床寝</a></li>
        <li><a class="btn-floating waves-effect waves-light blue" @click="intoEditMode('shallow')">浅眠</a></li>
        <li><a class="btn-floating waves-effect waves-light green" @click="intoEditMode('deep')">深眠</a></li>
        <li><a class="btn-floating waves-effect waves-light red" @click="intoEditMode('medicine')">飲薬</a></li>
        <li><a class="btn-floating waves-effect waves-light gray" @click="intoEditMode('none')">戻る</a></li>
      </ul>
    </div>
    <!-- <div v-infinite-scroll="loadMore" :infinite-scroll-disabled="busy" infinite-scroll-distance="10"> -->
    <div class="rhyzm-table">

        <transition-group name="rows" tag="ul">
          <li v-for="row in rows" :key="+row.date" class="one-row">
            <rhyzm-table-row :row="row" :currentRow="currentRow" :modes="modes" :mode="mode" @selectHours="onSelectHours" @change="onAutoSave"></rhyzm-table-row>
          </li>
        </transition-group>
        <!-- <div infinite-wrapper>
          <div style="overflow: auto;"> -->
          <!-- </div>
        </div> -->
    <!-- </div> -->
    </div>
    <div class="modal" id="sliderModal">
      <div class="modal-content">
        <h4>時間帯選択</h4>
        <p>{{ showMode() }}時間帯を選択してください。<br>
          <a class="waves-effect waves-light btn" @click="addSlider">時間帯を追加</a><br>
          <a class="waves-effect waves-light btn orange" @click="removeSlider">時間帯を削除</a>
        </p>
        <div v-show="sliderVisible" id="timeSlider"></div>
      </div>
      <div class="modal-footer">
        <a href="#!" class="modal-action modal-close waves-effect waves-green btn-flat" @click="mode = 'none'; currentRow = null">キャンセル</a>
        <a href="#!" class="modal-action modal-close waves-effect waves-green btn-flat" @click="onCompleteSelectHours">決定</a>
      </div>
    </div>
    <infinite-loading @infinite="infiniteHandler"></infinite-loading>
  </div>
</template>

<script type="text/javascript">
import moment from 'moment'
import InfiniteLoading from 'vue-infinite-loading'
import M from 'materialize-css'
import noUiSlider from 'nouislider'

import RhyzmTableRow from './rhyzm-table-row'

moment.locale('ja');

export default {
  props: ['autoSave'],
  data() {
    return {
      rows: [],
      dates: [],
      mode: 'none',
      timepicker: null,
      timeslider: null,
      sliderModal: null,
      actionButton: null,
      currentRow: null,
      sliderVisible: false,
      modes: ['medicine', 'deep', 'shallow', 'lie', 'out'].reverse(),
    }
  },
  mounted() {
    this.onLoad()
    this.$nextTick(function () {
      let elem = document.querySelector('.fixed-action-btn');
      this.actionButton = M.FloatingActionButton.init(elem, {
        hoverEnabled: false
      });

      elem = document.getElementById('sliderModal');
      this.sliderModal = M.Modal.init(elem, {});

      this.timeslider = document.getElementById('timeSlider');
      this.initSlider(true, 1)
    })
  },
  updated() {
  },
  components: {
    RhyzmTableRow,
    InfiniteLoading,
  },
  watch: {
    mode(val) {
      if (this.mode === 'none') {
      } else if (this.mode === 'medicine') {
        this.initSlider(false, 1)
      } else {
        this.initSlider(true, 1)
      }
    },
  },
  methods: {
    onAutoSave() {
      if (this.autoSave) {
        this.onSave()
      }
    },
    onSave() {
      const dates = this.dates
      this.rows.forEach((row) => {
        if (Object.keys(row).length > 1) {
          dates[+row.date] = row
        }
      })
      localStorage.setItem('dates', JSON.stringify(dates))
    },
    onLoad() {
      this.dates = JSON.parse(localStorage.getItem('dates')) || {}
      this.rows = this.load30days(moment())
    },
    assignDates(rows) {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const date = this.dates[+row.date]
        if (date) {
          date.date = moment(date.date)
          rows[i] = date
        }
      }
      return rows
    },
    onSelectHours(row) {
      this.currentRow = row

      if (this.mode === 'none') {
        this.actionButton.destroy()
        let elem = document.querySelector('.fixed-action-btn');
        this.actionButton = M.FloatingActionButton.init(elem, {
          hoverEnabled: false
        });
        this.actionButton.open()
      } else {
        this.sliderModal.open()
      }
    },
    initSlider(connected, count) {
      if (count === 0) {
        this.sliderVisible = false
        return
      } else {
        if (!this.sliderVisible) {
          count = 1
        }
        this.sliderVisible = true
      }

      this.timeslider.noUiSlider && this.timeslider.noUiSlider.destroy()

      let connect
      let start = []
      if (!connected) {
        connect = Array(count + 1).fill(false)
        for (let i = 0; i < count; i++) {
          start.push(Math.floor(i * 24 / count))
        }
      } else {
        connect = [false]
        for (let i = 0; i < count; i++) {
          start.push(Math.floor(i * 2 * 24 / (count * 2)))
          start.push(Math.floor((i * 2 + 1) * 24 / (count * 2)))
          connect.push(true)
          connect.push(false)
        }
      }

      noUiSlider.create(this.timeslider, {
       start: start,
       connect: connect,
       step: 1,
       // behaviour: 'tap',
       tooltips: true,
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
      const connected = this.timeslider.noUiSlider.options.connect.some(b => b)
      console.log(this.timeslider.noUiSlider.options.connect)
      const base = connected ? 2 : 1
      const count = (this.timeslider.noUiSlider.options.connect.length - 1) / base
      if (count < 24 / base - 1) {
        this.initSlider(this.timeslider.noUiSlider.options.connect.some(b => b), count + 1)
      }
    },
    removeSlider() {
      const connected = this.timeslider.noUiSlider.options.connect.some(b => b)
      const base = connected ? 2 : 1
      const count = (this.timeslider.noUiSlider.options.connect.length - 1) / base
      if (count > 0) {
        this.initSlider(this.timeslider.noUiSlider.options.connect.some(b => b), count - 1)
      }
    },
    onCompleteSelectHours() {
      const val = this.timeslider.noUiSlider.get()
      this.$set(this.currentRow, this.mode, [])
      if (typeof val === 'number') {
        this.currentRow[this.mode].push([val])
      } else {
        while (val.length > 0) {
          this.currentRow[this.mode].push([val.shift(), val.shift()])
        }
      }

      this.onAutoSave()

      this.mode = 'none'
      this.currentRow = null
    },
    intoEditMode(mode) {
      this.mode = mode
      if (mode === 'none') {
        this.currentRow = null
      } else {
        this.actionButton.close()
        if (this.currentRow) {
          this.sliderModal.open()
        }
      }
    },
    showMode() {
      const names = {
        medicine: '眠前薬を飲んだ',
        lie: '眠らずに床についていた',
        deep: 'ぐっすり眠った',
        shallow: 'うとうとしていた',
        out: '外出していた'
      }
      return names[this.mode]
    },
    load30days(date) {
      const prevAutoSave = this.autoSave
      this.$emit('offAutoSave')
      date = date.startOf('day')
      let rows = []

      for (let i = 0; i < 30; i++) {
        const day = date.clone().subtract(i, 'days')
        rows.push({ date: day })
      }
      rows = this.assignDates(rows)

      if (prevAutoSave) {
        this.$emit('onAutoSave')
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
              $state.loaded();
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
  #timeSlider {
    margin-top: 4rem;
    margin-bottom: 1rem;
  }
</style>