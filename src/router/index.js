import Vue from 'vue';
// import Vue from 'vue'
import Router from 'vue-router';

/* ********** 页面 ********** */
const index = () => import(/* webpackChunkName: "page-index" */ '../pages/index'); // 框架页面
const home = () => import(/* webpackChunkName: "page-home" */ '../pages/home'); // 首页
const search = () => import(/* webpackChunkName: "page-search" */ '../pages/search'); // 搜索页面
const song_list = () => import(/* webpackChunkName: "page-song-list" */ '../pages/song-list'); // 歌单的歌曲列表页面
const play = () => import(/* webpackChunkName: "page-play" */ '../pages/play'); // 播放音乐的详细页面

/* ********** 组件 ********** */

Vue.use(Router);

export default new Router({
  // mode: 'history',
  routes: [
    {
      path: '/',
      name: 'index',
      component: index,
      meta: {
        keepAlive: true
      },
      props: true,
      children: [{
        path: 'home', // 默认首页
        name: 'home',
        component: home,
        meta: {
          keepAlive: true
        }
      }, {
        path: 'search',
        name: 'search',
        component: search,
        meta: {
          keepAlive: true
        }
      }, {
        path: 'song-list',
        name: 'song-list',
        component: song_list,
        meta: {
          keepAlive: true
        }
      }]
    },
    {
      path: '/play',
      name: 'play',
      component: play,
      meta: {
        keepAlive: false
      }
    }
  ]
});
