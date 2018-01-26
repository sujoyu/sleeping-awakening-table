<template>
<div>
  <nav class="light-blue lighten-1" role="navigation">
    <div class="nav-wrapper container"><a id="logo-container" href="#" class="brand-logo">
      <i class="material-icons">brightness_2</i> ねておきて <i class="material-icons">wb_sunny</i>
    </a>

      <ul id="slide-out" class="sidenav">
        <li><a href="#!" @click="onSave"><i class="material-icons">save</i>ブラウザに保存</a></li>
        <li><a href="#!" @click="onLoad"><i class="material-icons">unarchive</i>ブラウザから復元</a></li>
      </ul>
      <a href="#" data-target="slide-out" class="sidenav-trigger"><i class="material-icons">menu</i></a>
    </div>
  </nav>

  <div class="container">
    <div class="section">
      <div class="row">
          <rhyzm-table ref="mainTable"></rhyzm-table>
      </div>
    </div>
  </div>

  <footer class="page-footer light-blue">
    <div class="container">
      <div class="row">
        <div class="col l6 s12">
          <h5 class="white-text">This Site</h5>
          <p class="grey-text text-lighten-4">
            オンラインで使える睡眠・覚醒リズム表です。
            入力された個人情報をサーバーに送ることはありませんので、
            安心してお使いください。
          </p>

        </div>
        <div class="col l3 s12">
          <h5 class="white-text">Connect</h5>
          <ul>
            <li><a href="https://twitter.com/intent/tweet?screen_name=sutsurumu" class="twitter-mention-button" data-related="sutsurumu" data-dnt="true">Tweet to @sutsurumu</a></li>
            <li>
              <!-- Place this tag where you want the button to render. -->
<a class="github-button" href="https://github.com/sujoyu/sleeping-awakening-table" data-style="mega" data-count-href="/sujoyu/sleeping-awakening-table/stargazers" data-count-api="/repos/sujoyu/sleeping-awakening-table#stargazers_count" data-count-aria-label="# stargazers on GitHub" aria-label="Star sujoyu/sleeping-awakening-table on GitHub">Star</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-copyright">
      <div class="container">
      Made by <a class="light-blue-text text-lighten-3" href="https://twitter.com/sutsurumu">すじょうゆ</a>
      </div>
    </div>
  </footer>
</div>
</template>

<script type="text/javascript">
  import RhyzmTable from './rhyzm-table'

  export default {
    data() {
      return {
        sidenav: null,
      }
    },
    mounted() {
      this.$nextTick(function () {
        let elem = document.querySelector('.sidenav');
        this.sidenav = M.Sidenav.init(elem, {});
      })
    },
    components: {
      RhyzmTable
    },
    methods: {
      onSave() {
        this.$refs.mainTable.onSave()
        this.sidenav.close()
      },
      onLoad() {
        this.$refs.mainTable.onLoad()
        this.sidenav.close()
      }
    },
  }
</script>

<style lang="scss">
  * {
    font-family: "Rounded Mplus 1c";
  }

  nav .brand-logo {
    font-family: "Hannari";
    font-weight: bolder;
    letter-spacing: -0.2em;

    i.material-icons {
      vertical-align: -2;
      display: inline-block;
      float: none;
      margin-right: 0;
    }
  }
</style>

