<template>
<div class="page-play" ref="page-play">
  <header ref="header">
    <!-- 顶部导航栏 -->
    <mu-appbar class="top-nav" color="transparent">
      <mu-button icon slot="left" @click="back">
        <mu-icon value="arrow_back"></mu-icon>
      </mu-button>
      <span v-if="play_info.url">
        {{ play_info.name }} - {{ play_info.artist.name }}
      </span>
    </mu-appbar>
  </header>
  <main ref="main">
    <mu-flex justify-content="center" style="width: 75%;" wrap="wrap">
      <div class="lyric-box">
        <mu-card>
          <mu-avatar class="cover-box">
            <div v-if="!play_info.album.img" class="mask"></div>
            <img v-if="play_info.album.img" :src="play_info.album.img">
          </mu-avatar>

          <div class="lyric" ref="lyric">
            <ul v-if="!play_info.lyric.nolyric">
              <li ref="lyric-li" :class="{highlight: i+1 == cur_highlight}" v-for="v,i of play_info.lyric.lrc_text" :key="i">{{v}}</li>
            </ul>
            <div v-if="play_info.lyric.nolyric">暂无歌词..</div>
          </div>

          <!-- <div class="wave-line" ref="wave-line"></div> -->

        </mu-card>
      </div>

      <!-- 收藏、循环、列表 -->
      <div class="btn-box">

        <mu-row justify-content="center" class="btn-box-1">
          <mu-col :span="4">
            <mu-button fab small color="#ff49a2" @click="this.favorite">
              <mu-icon v-show="!play_info.favorite" value="favorite_border"></mu-icon>
              <mu-icon v-show="play_info.favorite" value="favorite" color="#dc0f00"></mu-icon>
            </mu-button>
          </mu-col>

          <mu-col :span="4">
            <mu-button fab small color="#ff49a2" @click="setLoop">
              <mu-icon v-show="loop_mode == 'loop'" value="repeat"></mu-icon>
              <mu-icon v-show="loop_mode == 'single'" value="repeat_one"></mu-icon>
              <mu-icon v-show="loop_mode == 'random'" value="shuffle"></mu-icon>
            </mu-button>
          </mu-col>
          <mu-col :span="4">

            <mu-button fab small color="#ff49a2" @click="show_song_sheet = true">
              <mu-icon value="playlist_play"></mu-icon>
            </mu-button>
          </mu-col>
        </mu-row>

        <!-- 进度条 -->
        <mu-row justify-content="center" class="speed-bar-box">

          <mu-col :span="12">
            <mu-slider v-if="play_info.url" class="w-100" :display-value="false" color="#fff" track-color="rgba(0,0,0, .1)" :max="song_duration" v-model="cur_speed_time"></mu-slider>
            <mu-slider v-else :disabled="true" class="w-100" :display-value="false" color="#fff" track-color="rgba(0,0,0, .1)" :max="song_duration" v-model="cur_speed_time"></mu-slider>
          </mu-col>

          <mu-col v-if="typeof cur_time === 'number'" class="cur-time" :span="6">
            {{ String(parseInt(cur_time/60)).padStart(2, 0) }} : {{ String(Math.floor(cur_time%60)).padStart(2, 0) }}
          </mu-col>

          <mu-col v-if="typeof cur_time === 'number'" class="duration" align-self="end" :span="6">
            {{ String(parseInt(song_duration/60)).padStart(2, 0) }} : {{ String(Math.floor(song_duration%60)).padStart(2, 0) }}
          </mu-col>

        </mu-row>

        <!-- 播放、暂停等 -->
        <mu-flex justify-content="center" align-items="center" class="btn-box-2 w-100">

          <mu-button class="prev-btn" icon @click="prev">
            <mu-icon value="skip_previous"></mu-icon>
          </mu-button>

          <mu-button :ripple="false" class="play-btn" icon v-show="!playing" @click="player.play('yes')">
            <mu-icon value="play_circle_outline"></mu-icon>
          </mu-button>
          <mu-button :ripple="false" class="pause-btn" icon v-show="playing" @click="player.pause">
            <mu-icon value="pause_circle_outline"></mu-icon>
          </mu-button>

          <mu-button class="next-btn" icon @click="next">
            <mu-icon value="skip_next"></mu-icon>
          </mu-button>

        </mu-flex>
      </div>

    </mu-flex>
  </main>


  <!-- 歌单列表 -->
  <mu-bottom-sheet class="song_list_sheet" :open.sync="show_song_sheet" style="height: 50%; overflow: auto;">
    <mu-list>

      <!-- 顶部播放全部 模板 -->
      <mu-list-item button :ripple="false">
        <mu-list-item-action @click="setLoop">
          <mu-icon v-show="loop_mode == 'loop'" value="repeat"></mu-icon>
          <mu-icon v-show="loop_mode == 'single'" value="repeat_one"></mu-icon>
          <mu-icon v-show="loop_mode == 'random'" value="shuffle"></mu-icon>
        </mu-list-item-action>
        <mu-list-item-title @click="setLoop">
          <span v-show="loop_mode == 'loop'">{{ mode_title[0] }}</span>
          <span v-show="loop_mode == 'single'">{{ mode_title[1] }}</span>
          <span v-show="loop_mode == 'random'">{{ mode_title[2] }}</span>
          <span class="yu-sub-title">(共{{song_list.length}}首)</span>
        </mu-list-item-title>
        <mu-list-item-action @click="delAll()">
          <mu-button icon>
            <mu-icon value="delete_forever"></mu-icon>
          </mu-button>
        </mu-list-item-action>
      </mu-list-item>

      <!-- 每一首歌曲的模板 -->
      <div v-if="song_list.length" v-for="v,i of song_list" :key="i">
        <mu-list-item button :ripple="false">
          <mu-list-item-action>
            <div class="music-beat" v-show="v.id === play_info.id">
              <span class="beat-1"></span>
              <span class="beat-2"></span>
              <span class="beat-3"></span>
            </div>
            <span v-show="v.id !== play_info.id">{{i+1}}</span>
          </mu-list-item-action>

          <mu-list-item-content @click="startPlay(v.id)">
            <mu-list-item-title :class="{'yu-color-purple': v.id === play_info.id}">
              {{v.name}}
              <!-- <span :class="{'yu-color-purple': v.id === play_info.id, 'yu-sub-title': v.id !== play_info.id}">
                {{v.alia.length?`(${v.alia})`:''}}
              </span> -->
            </mu-list-item-title>
            <!-- <mu-list-item-sub-title>{{v.ar[0].name}} - {{v.al.name}}</mu-list-item-sub-title> -->
          </mu-list-item-content>

          <mu-list-item-action @click="del(v.id)">
            <mu-button icon>
              <mu-icon value="clear"></mu-icon>
            </mu-button>
          </mu-list-item-action>
        </mu-list-item>
        <!-- <mu-divider :inset="true"></mu-divider> -->
      </div>
    </mu-list>
  </mu-bottom-sheet>
</div>
</template>

<script>
import {
  mapState,
  mapGetters,
  mapMutations,
  mapActions
} from "vuex";
import {
  animateCSS
} from '@/common/js/animate.js';
export default {
  name: 'page-play',
  beforeRouteLeave(to, from, next) {
    this.player.playerEl.removeEventListener('timeupdate', this.lyricHighlight, false);
    next()
  },
  data() {
    return {
      cur_highlight: 1, // 默认高亮第一行
      cur_time: this.player.playerEl.url ? this.player.playerEl.currentTime : 0, // 当前播放的时间
      song_duration: this.player.playerEl.url ? this.player.playerEl.duration : 0, // 歌曲的时长
      show_song_sheet: false, // 歌曲列表 默认关闭
      mode_title: ['列表循环', '单曲循环', '列表随机'] // 循环模式的名字


    }
  },
  computed: {
    ...mapState([
      'NODE_DOMAIN',
      'play_info',
      'playing',
      'song_list',
      'loop_mode',
      'prevWatch',
      'nextWatch',
      'playWatch',
      'pauseWatch',
      'g_page_home',
      'auto_play_watch'
    ]),
    // 播放的时间进度
    cur_speed_time: {
      get: function() {
        return this.cur_time;
      },
      set: function(newVal, oldVal) {
        this.player.playerEl.currentTime = newVal;
      }
    }
  },
  watch: {
    'auto_play_watch': function() {
      this.$refs.lyric.scrollTop = 0;
      this.cur_highlight = 1;
      this.cur_time = 0;
      this.song_duration = 0; // 歌曲的时长
      this.handleLoadLyric();
    }
  },
  methods: {
    ...mapMutations([
      'play',
      'updatePlayInfo',
      'updateSong',
      'insertSong',
      'updatePageHome',
      'setSongList',
      'setLoopMode',
      'deleteSong'
    ]),
    ...mapActions([
      'loadSongInfo',
      'checkMusic',
      'getPlayList',
      'isContainSong',
      'addSongToList',
      'updateSongList',
      'getSongSheetDetail'
    ]),
    async startPlay(id) {
      this.$refs.lyric.scrollTop = 0;
      this.cur_highlight = 1;
      this.cur_time = 0;
      this.song_duration = 0; // 歌曲的时长
      console.log('重置');
      this.player.clkSong(id).then(res => {
        console.log('歌词加载');
        console.log('url', this.play_info.url);
        this.handleLoadLyric();
      });
    },
    // 删除列表全部歌曲
    delAll() {
      this.$confirm('确定要清空播放列表吗？', {
        type: 'warning'
      }).then(({
        result
      }) => {
        if (result) {
          this.setSongList([]);
        }
      });
    },
    // 删除列表里指定歌曲
    del(song_id) {
      let index = this.getIndex(song_id, 'loop');
      this.deleteSong(index);
    },
    // 设置循环模式
    setLoop() {
      let mode = ['loop', 'single', 'random'];
      let cur_mode = this.loop_mode;
      let cur_index = mode.indexOf(cur_mode);
      let next_index = mode.indexOf(cur_mode) + 1;
      if (cur_index == mode.length - 1) next_index = 0;
      this.setLoopMode(mode[next_index]);
      this.$toast.message(this.mode_title[next_index]);
    },
    // 收藏或取消收藏
    favorite() {
      let index = this.getIndex(this.play_info.id);
      this.updatePlayInfo({
        favorite: !this.play_info.favorite
      });
      this.updateSong({
        index,
        song: this.play_info
      });
      this.$toast.message(this.play_info.favorite ? '收藏成功' : '取消收藏');
    },
    // 初始化歌曲相关时间参数 并处理歌词
    initTime() {
      this.handleLoadLyric();
      if (this.loop_mode === 'single') return;
      if (this.song_list.length === 1) return;
      this.$refs.lyric.scrollTop = 0;
      this.cur_highlight = 1;
      this.cur_time = 0;
      this.song_duration = 0; // 歌曲的时长
    },
    // 上一曲
    prev() {
      this.player.playerEl.removeEventListener('timeupdate', this.lyricHighlight, false);
      this.player.prev().then(res => {
        this.initTime();
      });
    },
    // 下一曲
    next() {
      this.player.playerEl.removeEventListener('timeupdate', this.lyricHighlight, false);
      this.player.next().then(res => {
        this.initTime();
      });
    },
    // 查找歌曲位置
    getIndex(id) {
      let list = this.song_list;
      for (let i = 0, len = list.length; i < len; i++) {
        if (list[i].id == id) return i;
      }
    },
    // 处理歌词格式
    handleLyric(res) {
      if (!res.lrc || !res.lrc.lyric) {
        return {
          nolyric: true,
          loaded: true
        }
      }

      let temp_lyric = res.lrc.lyric;
      // 歌词内容的数组
      let lrc_text = temp_lyric.split(/\[.+\]/);
      lrc_text.shift();

      // 歌词内容对应的时间数组
      let lrc_time = [];
      // 分钟，秒钟
      let m, s;
      // 每一行 包含时间和歌词 的字符串
      let a = temp_lyric.split(/\n/);
      a.pop();
      for (let v of a) {
        m = Math.ceil(v.slice(1, 9).split(/\:/)[0]);
        s = Math.ceil(v.slice(1, 9).split(/\:/)[1]);
        // 换成秒
        s = m * 60 + s;
        lrc_time.push(isNaN(s) ? 0 : s);
      }

      let new_lyric = {
        nolyric: temp_lyric ? false : true,
        loaded: true,
        lrc_text,
        lrc_time
      };
      return new_lyric;
    },
    // 获取歌词
    getLyric(id) {
      return new Promise((resolve, reject) => {
        axios({
          url: `${this.NODE_DOMAIN}/lyric?id=${id}`
        }).then(res => {
          res = res.data;
          if (res.code === 200) {
            resolve(res);
          } else {
            reject(res);
          }
        }).catch(error => console.log(error));
      });
    },
    // 歌词同步
    lyricHighlight() {
      // 当前歌曲播放的时间
      this.cur_time = this.player.playerEl.currentTime;
      this.song_duration = this.player.playerEl.duration;


      if (this.play_info.lyric.nolyric) return;
      // 歌词的container
      let lyric_box = this.$refs.lyric;
      // 歌词时间数组
      let lrc_time = this.play_info.lyric.lrc_time;
      // 根font_size
      let font_size = parseInt(document.documentElement.style.fontSize);

      for (let i = 0, len = lrc_time.length; i < len; i++) {
        // 当前时间大于等于 前一句， 小于 下一句 时候，就高亮前一句
        if (this.cur_time >= lrc_time[i] && this.cur_time < lrc_time[i + 1]) {
          this.cur_highlight = i + 1;
          // 获取当前 歌词 距离容器顶部的距离
          let offset_top = this.$refs['lyric-li'][i + 1].offsetTop;
          lyric_box.scrollTop = offset_top - (lyric_box.offsetHeight * 0.5) - 3 * font_size;
          console.log(offset_top);
          break;
        }
        this.cur_highlight = 1;
      }
    },
    // 返回上一页
    back() {
      this.$router.go(-1);
    },
    // 判断是否需要加载歌词
    handleLoadLyric() {
      if (this.play_info.url && !this.play_info.lyric.loaded) {
        this.getLyric(this.play_info.id).then(res => {
          console.log('lyric', res);
          let data = this.handleLyric(res);
          let index = this.getIndex(this.play_info.id);
          this.updatePlayInfo({
            lyric: data
          });
          this.updateSong({
            index,
            song: this.play_info
          });
          // 歌词同步
          this.player.playerEl.addEventListener('timeupdate', this.lyricHighlight, false);
        });
      } else if (this.play_info.url) {
        // 歌词同步
        this.player.playerEl.addEventListener('timeupdate', this.lyricHighlight, false);
      }
    }
  },
  created: function() {
    // 获取歌词
    this.handleLoadLyric();

  },
  mounted: function() {
    this.$nextTick(() => {
      let header_el = this.$refs.header;
      let main_el = this.$refs.main;
      let page_el = document.querySelector('#app');
      main_el.style.height = (page_el.offsetHeight - header_el.offsetHeight) + 'px';
    });

  }
}
</script>

<style lang="scss">
// @media screen and (max-width: )

.page-play {
    background: linear-gradient(135deg, #9C27B0, #FF4081);

    main {
        display: flex;
        justify-content: center;
    }

    .top-nav {
        box-shadow: none;
    }

    .lyric-box {
        width: 100%;
        height: 55%;
        padding-top: 3rem;
        position: relative;
        border-radius: 50%;
        display: flex;
        justify-content: center;

        .mu-card {
            width: 90%;
            height: 100%;
            border-radius: 5%;
            display: flex;
            justify-content: center;
            flex-wrap: wrap;

            .mu-avatar {
                width: 5.66666rem !important;
                height: 5.66666rem !important;
                padding: 0.5rem;
                transform: translateY(-50%);
                position: absolute;
                box-shadow: 0 0 1rem #9C27B0;
                background: #fff;
            }

            .lyric {
                width: 85%;
                height: 60%;
                line-height: 1.5rem;
                letter-spacing: 2px;
                top: 3.83333rem;
                margin: 1rem 0;
                font-size: 1.1rem;
                color: #8a97a9;
                display: flex;
                justify-content: center;
                align-items: center;
                text-align: center;
                position: relative;
                overflow: auto;

                ul {
                    height: 100%;
                    list-style-type: none;
                    padding: 0;
                    margin: 0;
                    transition: all 0.3s;

                    .highlight {
                        color: #252948;
                        font-weight: 600;
                    }

                    li {
                        padding: 0 2rem;
                        margin: 0 0 1rem;

                    }
                }

            }

            .wave-line {
                width: 100%;
                height: 0;
                position: relative;
                top: 2rem;
                border: 1px dashed #9C27B0;
            }

        }

        .mask {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #FF4081;
        }
    }

    .btn-box {
        width: 100%;
        height: 45%;
        // top: 7.33333rem;
        position: relative;

        > div {
            width: 100%;
            justify-content: center !important;
        }
        // 喜欢、循环、列表 按钮
        .btn-box-1 {
            height: 35%;
            align-items: center !important;
            > .col {
                text-align: center;
            }
        }

        .speed-bar-box {
            height: 20%;
            align-items: center !important;
            // margin: 2rem 0 1rem;

            .cur-time,
            .duration {
                color: #fff;
                font-size: 12px;
            }

            .duration {
                text-align: end;
            }

            .mu-slider {
                margin: 0;
            }
        }

        // 播放、暂停等 按钮
        .btn-box-2 {
            height: 45%;

            .next-btn,
            .prev-btn {
                width: 6.4rem;
                height: 6.4rem;
                color: #fff;

                .mu-icon {
                    font-size: 3.2rem;
                }
            }
            .pause-btn,
            .play-btn {
                width: 9.6rem;
                height: 6.4rem;
                color: #fff;

                .mu-icon {
                    font-size: 4.8rem;
                }
            }
        }

    }

}

.song_list_sheet {
    -webkit-overflow-scrolling: touch;
    .mu-item-action {
        justify-content: center !important;
        align-items: center !important;
    }
}
</style>
