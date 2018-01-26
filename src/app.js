import 'materialize-css/dist/css/materialize.css'
// import M from 'materialize-css/dist/js/materialize'
import 'noUiSlider/distribute/nouislider.css'
// import 'materialize-css/extras/noUiSlider/nouislider.css'
// import noUiSlider from 'materialize-css/extras/noUiSlider/nouislider'

import 'sass/app.scss'

import Vue from 'vue'
import infiniteScroll from 'vue-infinite-scroll'

import Index from 'components/index.vue'

document.addEventListener("DOMContentLoaded", () => {
  Vue.use(infiniteScroll)

  new Vue({
    el: '#root',
    components: {
      'index-component': Index
    }
  })
})