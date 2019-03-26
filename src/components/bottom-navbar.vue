<template lang="html">
  <div class="nav-box">
    <mu-bottom-nav :value.sync="nav_active" color="purple700">
      <mu-bottom-nav-item :ripple="false" value="home" title="首页" :to="{name: 'home'}" icon="filter_vintage"></mu-bottom-nav-item>

        <a class="mu-bottom-item router-link-active" tabindex="0">
          <router-link :to="{ name: 'play'}">
          <div class="mu-bottom-item-wrapper flex-x-center">
            <div class="mu-ripple-wrapper"></div>
            <div class="animation " ref="cd-animate-box">
              <template>
                <div class="cd-box flex-x-y-center rolling" :style="{
                  'animation-play-state': this.playing?'running':'paused',
                  'background-image': `url(${this.play_info.album.img})`,
                  'background-color': '#ff4081'
                  }">
                  <div class="out-ring"></div>
                  <span class="inner-ring"></span>
                  <span class="dot"></span>
                </div>
              </template>
            </div>
          </div>
        </router-link>
        </a>




      <mu-bottom-nav-item :ripple="false" value="search" title="搜索" :to="{name: 'search'}" icon="youtube_searched_for"></mu-bottom-nav-item>
    </mu-bottom-nav>
  </div>
</template>

<script>
import {
  mapState,
  mapMutations
} from 'vuex';
import {
  animateCSS
} from '@/common/js/animate.js';
export default {
  name: 'bottom-navbar',
  data() {
    return {
      nav_active: this.$route.name, // 默认当前所在页

    }
  },
  computed: {
    ...mapState([
      'playing',
      'play_info'
    ])
  },
  watch: {
    $route: 'chgNavActive',
    playing: function() {
      console.log(this.$refs['cd-animate-box']);
      if (this.playing === true) {
        animateCSS(this.$refs['cd-animate-box'], 'flip', () => console.log('delete?'));
      }
    }
  },
  methods: {
    // 改变激活的导航
    chgNavActive(to, from) {
      /* ********* 底部导航栏状态 ********* */
      switch (to.name) {
        case 'home':
        case 'song-list':
          this.nav_active = 'home';
          break;
        default:
          this.nav_active = to.name;
      }
      console.log(to.name, this.nav_active);
    }
  },
  created() {

  }
}
</script>

<style lang="scss" scoped>
.nav-box {
    .mu-bottom-nav {
        background-color: #fff;
    }

    .cd-box {
        width: 4.14285rem;
        height: 4.14285rem;
        bottom: 2rem;
        border-radius: 50%;
        position: relative;
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;

        .inner-ring,
        .out-ring {
            position: absolute;
            border: 0.1rem solid #fff;
            border-radius: 50%;
        }

        .out-ring {
            width: 4rem;
            height: 4rem;
        }

        .inner-ring {
            width: 1.9rem;
            height: 1.9rem;
        }

        .dot {
            width: 0.7rem;
            height: 0.7rem;
            background: #fff;
            border-radius: 50%;
        }
    }

    // 旋转动画

}
</style>
