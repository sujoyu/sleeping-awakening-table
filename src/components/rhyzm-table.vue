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
            <rhyzm-table-row :row="row" :currentRow="currentRow" :modes="modes" :mode="mode" @selectHours="onSelectHours"></rhyzm-table-row>
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
          <a v-if="mode !== 'medicine'" class="waves-effect waves-light btn" @click="addSlider">時間帯を追加</a><br>
          <a v-if="mode !== 'medicine'" class="waves-effect waves-light btn orange" @click="removeSlider">時間帯を削除</a>
        </p>
        <div id="timeSlider"></div>
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
// import infiniteScroll from 'vue-infinite-scroll'
import M from 'materialize-css'
import noUiSlider from 'nouislider'
import $ from 'jquery'

import RhyzmTableRow from './rhyzm-table-row'

moment.locale('ja');

export default {
  props: ['autoSave'],
  data() {
    return {
      rows: [],
      mode: 'none',
      timepicker: null,
      timeslider: null,
      sliderModal: null,
      actionButton: null,
      currentRow: {},
      modes: ['medicine', 'deep', 'shallow', 'lie', 'out'].reverse(),
    }
  },
  mounted() {
    this.rows = this.load30days(moment())
    this.$nextTick(function () {
      let elem = document.querySelector('.fixed-action-btn');
      this.actionButton = M.FloatingActionButton.init(elem, {
        hoverEnabled: false
      });

      elem = document.getElementById('sliderModal');
      this.sliderModal = M.Modal.init(elem, {});

      this.timeslider = document.getElementById('timeSlider');
      this.initSlider(1)
    })
  },
  updated() {
  },
  components: {
    RhyzmTableRow,
    InfiniteLoading,
  },
  // directives: {infiniteScroll},
  watch: {
    mode(val) {
      if (this.mode === 'none') {
      } else if (this.mode === 'medicine') {
        this.initSlider(0.5)
      } else {
        this.initSlider(1)
      }
    },
    rows() {
      if (this.autoSave) {
        this.onSave()
      }
    },
  },
  methods: {
    onSave() {
      const dates = {}
      this.rows.forEach((row) => {
        if (Object.keys(row).length > 1) {
          dates[+row.date] = row
        }
      })
      localStorage.setItem('dates', JSON.stringify(dates))
    },
    onLoad() {
      const dates = JSON.parse(localStorage.getItem('dates')) || {}
      for (let i = 0; i < this.rows.length; i++) {
        const row = this.rows[i]
        const date = dates[+row.date]
        if (date) {
          date.date = moment(date.date)
          this.$set(this.rows, i, dates[+row.date])
        }
      }
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
    initSlider(count) {
      this.timeslider.noUiSlider && this.timeslider.noUiSlider.destroy()

      let connect
      let start
      if (count === 0.5) {
        connect = [false, false]
        start = [12]
      } else {
        connect = [false]
        start = []
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
      const dates = JSON.parse(localStorage.getItem('dates')) || {}
      const rows = []

      for (let i = 0; i < 30; i++) {
        const day = date.clone().subtract(i, 'days')
        let row
        if (dates[+day]) {
          row = dates[+day]
          row.date = day
        } else {
          row = { date: day }
        }
        rows.push(row)
      }
      this.$nextTick(function() {
        if (prevAutoSave) {
          this.$emit('onAutoSave')
        }
      })
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