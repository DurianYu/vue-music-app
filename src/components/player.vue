<template>
<div class="player-box">
  <audio preload="auto" src="http://www.w3school.com.cn/i/song.mp3" ref="player">
  </audio>
</div>
</template>

<script>
import Vue from 'vue';
import {
  mapState,
  mapGetters,
  mapMutations,
  mapActions
} from "vuex";
export default {
  name: 'player',
  components: {},
  data() {
    return {
      audio_src: '', // 歌曲地址
      song_random_list: '', // 随机模式后 打乱顺序的歌曲列表， 只保存了歌曲id
    }
  },
  computed: {
    ...mapState([
      'NODE_DOMAIN',
      'play_info',
      'song_list',
      'loop_mode',
      'playing',
      'setLoopMode_watch'
    ])
  },
  watch: {
    // 监听洗牌动作
    'setLoopMode_watch': function() {
      if (this.loop_mode === 'random') {
        this.shuffle();
        console.log('shuffle');
      }
    }
  },
  methods: {
    ...mapMutations([
      'updatePlayInfo',
      'insertSong',
      'updateSong',
      'setPlaying',
      'auto_play_watch'
    ]),
    ...mapActions([
      'checkMusic',
      'getPlayList',
      'checkMusic'
    ]),
    // 加载歌曲详情
    loadSongInfo(ids) {
      return new Promise((resolve, reject) => {
        axios({
          url: `${this.NODE_DOMAIN}/song/detail?ids=${ids}`
        }).then(res => {
          resolve(res.data);
        }).catch(error => reject(error));
      });
    },
    getPlayer() {
      return this.$refs.player;
    },
    // 将后台数据转换成 需要的歌曲信息
    convertToSongInfo(data) {
      data = data.songs[0];
      let result = Object.assign({}, {
        artist: {
          name: data.ar[0].name // 歌手名字
        },
        album: {
          name: data.al.name, // 专辑名字
          img: data.al.picUrl // 专辑封面
        },
        name: data.name, // 歌名
        lyric: {
          nolyric: true
        }, // 歌词
        url: `https://music.163.com/song/media/outer/url?id=${data.id}.mp3`, // 歌曲地址
        id: data.id, // 歌曲的id
        favorite: false
      });
      return result;
    },
    // 深度拷贝
    deepCopy(data) {
      return JSON.parse(JSON.stringify(data));
    },
    // 处理不同循环模式下的index增减, 并获取增减后对应的id
    getChgId(index, to) {
      let id = '';
      // 列表循环
      if (this.loop_mode === 'loop') {
        console.log('loop index', index);
        if (to === 'next') index = index === this.song_list.length - 1 ? 0 : index + 1;
        if (to === 'prev') index = index === 0 ? this.song_list.length - 1 : index - 1;
        id = this.song_list[index].id;
      }
      // 随机播放
      if (this.loop_mode === 'random') {
        console.log('random index', index);
        if (to === 'next') index = index === this.song_random_list.length - 1 ? 0 : index + 1;
        if (to === 'prev') index = index === 0 ? this.song_random_list.length - 1 : index - 1;
        console.log('next_random_song', this.song_random_list[index]);
        id = this.song_random_list[index].id;
      }
      // 单曲循环
      if (this.loop_mode === 'single') {
        console.log('single index', index);
        id = this.song_list[index].id;
      }
      console.log('this.song_list', this.song_list);
      return id;
    },
    // 更新列表里面的歌曲信息
    updateSongInfo(id, song) {
      let index = this.getIndex(id);
      this.updateSong({
        index: index,
        song: song
      });
    },
    // 插入歌曲到指定位置或默认位置
    handleInsertSong(song, trgt_index) {
      let list = this.song_list;
      // 列表没有歌曲时，插入到起始位置
      if (!list.length) return this.insertSong({
        song: song,
        index: 0
      });
      // 插入到指定的位置
      if (trgt_index) return this.insertSong({
        song: song,
        index: trgt_index
      });
      // 默认插入到当前播放的歌曲后面
      let cur_index = this.getIndex(this.play_info.id, 'loop');
      // 插入数据
      this.insertSong({
        song: song,
        index: cur_index + 1
      });
      // 返回插入的位置
      return cur_index + 1;
    },
    // 检查播放列表里是否包含该歌曲
    isContainSong(id) {
      let list = this.song_list;
      if (!list.length) return false;
      for (let v of list) {
        if (v.id === id) return true;
      }
      return false;
    },
    // 查找歌曲位置
    getIndex(id, mode) {
      console.log('id', id);
      let list = '';
      list = mode === 'random' ? this.song_random_list : this.song_list;
      for (let i = 0, len = list.length; i < len; i++) {
        if (list[i].id === id) return i;
      }
    },
    // 只添加，再次添加则提示
    addNextSong(id) {
      // 检查列表里面是否有该歌曲
      let contain = this.isContainSong(id);
      // 已有该歌曲
      if (contain) return this.$alert('列表里已有该歌曲', '');
      // 没有该歌曲
      if (!contain) {
        this.handleInsertSong({
          id: id
        });
      }
    },
    // 播放 指定 的歌曲
    specifyPlay(id) {
      this.loadSongInfo(id).then(res => {
        let song = this.convertToSongInfo(res);
        this.updatePlayInfo(song);
        this.updateSongInfo(id, this.play_info);
        this.play_action = 1;
      }).catch(res => this.$alert(`${res.message}`, ''));
      this.play();
    },
    // 添加到播放列表并播放，再次点击只进行播放，
    clkSong(id) {
      return new Promise((resolve, reject) => {

        if (this.play_info.id === id) return;
        this.pause();
        // 检查列表里面是否有该歌曲
        let contain = this.isContainSong(id);
        console.log('contain', contain);
        // 已有该歌曲
        if (contain) {
          let index = this.getIndex(id);
          let song = this.song_list[index];
          console.log('加载过?', song);
          // 歌曲是否加载过
          if (song.url) {
            this.updatePlayInfo(song);
            this.play_action = 1;
            resolve('down');
            this.play();
          } else {
            this.loadSongInfo(id).then(res => {
              let song = this.convertToSongInfo(res);
              this.updatePlayInfo(song);
              this.updateSongInfo(id, this.play_info);
              this.play_action = 1;
              resolve('down');
            }).catch(res => this.$alert(`${res.message}`, ''));
            this.play();
          }
          // return;
        }
        // 没有该歌曲
        if (!contain) {
          this.handleInsertSong({
            id: id
          });
          this.loadSongInfo(id).then(res => {
            let song = this.convertToSongInfo(res);
            this.updatePlayInfo(song);
            this.updateSongInfo(id, this.play_info);
            this.play_action = 1;
            resolve('down');
          }).catch(res => this.$alert(`${res.message}`, ''));
          this.play();
        }

      });
    },
    // 随机 歌曲 shuffle洗牌
    shuffle() {
      let mode = this.loop_mode;
      // 单曲循环
      // 列表循环
      // 列表随机
      if (mode === 'random') {
        let new_list = [];
        let list = this.deepCopy(this.song_list);
        // 洗牌算法进行随机列表的生成
        for (let i = 0, len = list.length; i < len; i++) {
          let random_index = Math.random() * (len - i) | 0;
          new_list[i] = {
            id: list[random_index].id
          };
          list.splice(random_index, 1);
        }
        this.song_random_list = new_list;
        console.log('song_random_list', this.song_random_list);
      }
    },
    // 自动播放
    autoPlay() {
      this.nextSong().then(res => {
        this.auto_play_watch();
      });
    },
    // 播放
    play(no_wait) {
      let player = this.$refs.player;
      if (!this.play_action && !no_wait) {
        setTimeout(() => {
          this.play();
        }, 350);
        return;
      }
      // this.$nextTick(() => {
      if (player.src !== this.play_info.url) player.src = this.play_info.url;
      if (!this.play_info.url) return;
      player.play();
      this.play_action = '';
      console.log('player', player);
      console.log('player.paused', player.paused);
      this.setPlaying(true);
      player.onended = () => {
        this.setPlaying(false);
        this.autoPlay();
      }
      // });
    },
    // 暂停
    pause() {
      let player = this.$refs.player;
      this.setPlaying(false);
      player.pause();
    },
    // 上一曲
    prevSong() {
      return new Promise(async (resolve, reject) => {
        if (!this.song_list.length) return;
        // 获取当前播放的歌曲id
        let id = this.play_info.id;
        // 查找歌曲当前在列表的位置
        let index = this.getIndex(id, this.loop_mode);
        // 获取即将播放的歌曲的id
        let play_id = this.getChgId(index, 'prev');
        // 在全局歌曲列表下找到即将播放的歌曲的位置
        let play_index = this.getIndex(play_id, 'loop');
        let song = this.song_list[play_index];
        // 本地没有数据时
        if (!song.url) {
          this.loadSongInfo(song.id).then(res => {
            let _song = this.convertToSongInfo(res);
            this.updatePlayInfo(_song);
            this.updateSongInfo(play_id, this.play_info);
            this.play_action = 1;
            resolve('down');
            if (this.$refs.player.src === this.play_info.url) this.$toast.message(this.loop_mode === 'single' ? '当前单曲循环' : '歌单里只有这首歌哦');
          }).catch(res => this.$alert(`${res.message}`, ''));
          this.play();
        }
        // 本地有数据时
        if (song.url) {
          this.updatePlayInfo(song);
          this.play_action = 1;
          resolve('down');
          if (this.$refs.player.src === this.play_info.url) this.$toast.message(this.loop_mode === 'single' ? '当前单曲循环' : '歌单里只有这首歌哦');
          this.play();
        }
      });
    },
    // 下一曲
    nextSong() {
      return new Promise(async (resolve, reject) => {
        if (!this.song_list.length) return;
        // 获取当前播放的歌曲id
        let id = this.play_info.id;
        // 查找歌曲当前在列表的位置
        let index = this.getIndex(id, this.loop_mode);
        // 获取即将播放的歌曲的id
        let play_id = this.getChgId(index, 'next');
        // 在全局歌曲列表下找到即将播放的歌曲的位置
        let play_index = this.getIndex(play_id, 'loop');
        let song = this.song_list[play_index];
        // 本地没有数据时
        if (!song.url) {
          this.loadSongInfo(song.id).then(res => {
            let _song = this.convertToSongInfo(res);
            this.updatePlayInfo(_song);
            this.updateSongInfo(play_id, this.play_info);
            this.play_action = 1;
            resolve('down');
            if (this.$refs.player.src === this.play_info.url) this.$toast.message(this.loop_mode === 'single' ? '当前单曲循环' : '歌单里只有这首歌哦');
          }).catch(res => this.$alert(`${res.message}`, ''));
          this.play();
        }
        // 本地有数据时
        if (song.url) {
          this.updatePlayInfo(song);
          this.play_action = 1;
          resolve('down');
          if (this.$refs.player.src === this.play_info.url) this.$toast.message(this.loop_mode === 'single' ? '当前单曲循环' : '歌单里只有这首歌哦');
          this.play();
        }
      });
    }
  },
  created() {
    console.log('App created');
    console.log('this', this);
    console.log('this.$store', this.$store);
    console.log('play_info', this.play_info);
    // 第一次渲染进来 是不会触发的


  },
  mounted() {
    // 歌曲 加入列表
    // 替换列表
    // 生成列表
    Vue.prototype.player = {
      // 播放
      play: this.play,
      // 暂停
      pause: this.pause,
      // 上一曲
      prev: this.prevSong,
      // 下一曲
      next: this.nextSong,
      // 设置循环模式
      setLoop: this.setLoopMode,
      // 添加到播放列表中当前播放歌曲的后面并播放，再次点击只进行播放，
      clkSong: this.clkSong,
      // 添加到播放列表中当前播放歌曲的后面，再次添加则提示
      addNextSong: this.addNextSong,
      // 播放 指定 的歌曲
      specifyPlay: this.specifyPlay,
      // 获取播放的时间 进度
      playerEl: this.getPlayer(),
      // 进行 歌曲 洗牌
      shuffle: this.shuffle
    }

  }
}
</script>

<style>
</style>
