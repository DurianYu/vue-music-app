import Vue from 'vue'
import Vuex from 'vuex';
import sayHello from '@/store/modules/say-hello.js';


Vue.use(Vuex);

export default new Vuex.Store({
  strict: true,
  modules: {
    sayHello
  },
  state: {
    NODE_DOMAIN: '127.0.0.1:3000', // node服务器的地址
    /* 播放器 */
    setLoopMode_watch: 1, // 用于监听到 自动播放 功能运行了
    auto_play_watch: 1, // 用于监听到 自动播放 功能运行了
    song_list: [], // 歌曲列表
    loop_mode: 'loop', // 歌曲列表的循环模式, 'loop':列表循环, 'single': 单曲循环, 'random': 随机, 默认'loop'
    playing: false, // 播放的状态 true: 播放中， false: 暂停或没有播放
    play_info: {
      artist: {
        name: '' // 歌手名字
      },
      album: {
        name: '', // 专辑名字
        img: '' // 专辑封面
      },
      name: '', // 歌名
      lyric: {
        nolyric: true // 初始没有歌词
      }, // 歌词
      url: ``, // 歌曲地址
      id: '' // 歌舞的id
    },
    /* 首页 */
    g_page_home: '' // 存储首页相关数据
  },
  // 类似计算属性
  getters: {
    r_name(state, getters) {
      return [...state.name].reverse().join('');
    },
    r_name_length(state, getters) {
      return getters.r_name.length;
    }
  },
  // 类似事件 , 必须是 同步函数
  mutations: {
    /* 播放器 */

    // 自动播放监听
    auto_play_watch(state) {
      state.auto_play_watch = !state.auto_play_watch;
    },
    // 设置播放的状态
    setPlaying(state, val) {
      state.playing = val;
    },
    // 更新指定位置的歌曲信息
    updateSong(state, info) {
      console.log('info', info);
      state.song_list[info.index] = info.song;
    },
    // 更新播放的信息
    updatePlayInfo(state, song) {
      state.play_info = Object.assign({}, state.play_info, song);
    },
    // 从歌曲列表删除歌曲
    deleteSong(state, index) {
      state.song_list.splice(index, 1);
      state.setLoopMode_watch = !state.setLoopMode_watch;
    },
    // 添加歌曲到列表
    insertSong(state, info) {
      console.log(info.song);
      console.log(info.index);
      state.song_list.splice(info.index, 0, info.song);
      state.setLoopMode_watch = !state.setLoopMode_watch;
    },
    // 设置歌曲列表
    setSongList(state, data) {
      state.song_list = data;
      state.setLoopMode_watch = !state.setLoopMode_watch;
    },
    // 设置歌曲循环模式, ['loop':列表循环模式, random: 随机模式，'single': 单曲循环模式]
    setLoopMode(state, val) {
      state.loop_mode = val;
      // 触发实例监听
      state.setLoopMode_watch = !state.setLoopMode_watch;
    },
    // 更新首页信息
    updatePageHome(state, info) {
      state.g_page_home = info;
    }
  },
  // 可以包含异步操作， 用于提交mutation， 不进行直接变更状态
  actions: {
    // 获取歌单详情
    getPlayList({state}, id) {
      console.log('id', id);
      return new Promise((resolve, reject) => {
        axios({
          url: `${state.NODE_DOMAIN}/playlist/detail?id=${id}`
        }).then(res => {
          res = res.data;
          if (res.code === 200) {
            resolve(res);
          }
        }).catch(error => console.log(error));
      });
    },
    // 检查歌曲是否可放
    checkMusic({state}, id) {
      return new Promise((resolve, reject) => {
        axios({
          url: `${state.NODE_DOMAIN}/check/music?id=${id}`
        }).then(res => {
          res = res.data;
          if (res.success) {
            resolve(res);
          } else {
            reject(res);
          }
        }).catch(error => console.log(error));
      });
    },

    // 获取歌单详情
    getSongSheetDetail(id) {
      return new Promise((resolve, reject) => {
        axios({
          url: `${state.NODE_DOMAIN}/playlist/detail?id=${id}`
        }).then(res => {
          res = res.data;
          if (res.code === 200) {
            resolve(res);
          } else {
            reject(res);
          }
        }).catch(error => console.log(error));
      });

    }
  }
});
