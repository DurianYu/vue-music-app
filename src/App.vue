<template>
<!-- 入口模板 -->
<div id="app">
  <keep-alive>
    <router-view v-if="$route.meta.keepAlive" />
  </keep-alive>
  <router-view v-if="!$route.meta.keepAlive" />
  <!-- 播放器和路由分开 -->
  <player />
</div>
</template>

<script>
import {
  mapState,
  mapGetters,
  mapMutations,
  mapActions
} from "vuex";
export default {
  name: 'App',
  components: {
    player: () =>
      import( /* webpackChunkName: 'player' */ '@/components/player')
  },
  data() {
    return {}
  },
  computed: {
    ...mapState({
      play_info: 'play_info',
      playing: state => state.playing
    }),
  },
  watch: {
    playing: function() {
      console.log('this.play_info', this.play_info);
      console.log('this.playing', this.playing);
    }
  },
  methods: {
    ...mapMutations([
      'setPlaying'
    ]),
    // 响应式布局
    responsiveLayout() {
      let dsgn_w = 414;
      let dsgn_fontSize = 15;
      let win_w = document.documentElement.offsetWidth;
      let ratio = win_w / dsgn_w;
      document.documentElement.style.fontSize = `${ratio * dsgn_fontSize}px`;
    }

  },
  created() {

  },
  mounted() {
    // 响应式布局
    this.responsiveLayout();
    window.addEventListener('beforeunload', e => {
      alert(window.location)
      window.location.href = window.location.origin;

    })

    this.$router.push({name: 'home'});

  }
}
</script>

<style lang="scss">
body,
html {
    margin: 0;
    padding: 0;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    height: 100%;
}

#app {
    height: 100%;
    -webkit-overflow-scrolling: touch;
    > div:nth-of-type(1) {
        height: 100%;
    }
}
</style>
