<template lang="html">
  <div class="page-song-list">

    <!-- 顶部导航栏 -->
    <mu-appbar class="top-nav" color="#fff">
      <mu-button icon slot="left" @click="back">
          <mu-icon value="arrow_back"></mu-icon>
      </mu-button>
      歌单列表
    </mu-appbar>

    <!-- 歌曲列表 -->
    <mu-flex class="song-list-box">
      <mu-list>
        <!-- 顶部播放全部 模板 -->
        <mu-list-item @click="playAll" button :ripple="false">
          <mu-list-item-action>
            <mu-icon value="play_circle_outline"></mu-icon>
          </mu-list-item-action>
          <mu-list-item-title>
            播放全部
            <span class="yu-sub-title">(共{{local_song_list.length}}首)</span>
          </mu-list-item-title>
        </mu-list-item>

        <!-- 每一首歌曲的模板 -->
        <div v-for="v,i of local_song_list" :key="i">
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
                <span :class="{'yu-color-purple': v.id === play_info.id, 'yu-sub-title': v.id !== play_info.id}">
                  {{v.alia.length?`(${v.alia})`:''}}
                </span>
              </mu-list-item-title>
              <mu-list-item-sub-title>{{v.ar[0].name}} - {{v.al.name}}</mu-list-item-sub-title>
            </mu-list-item-content>

            <mu-list-item-action  @click="moreOperate(v)">
              <mu-button icon>
                <mu-icon value="more_horiz"></mu-icon>
              </mu-button>
            </mu-list-item-action>
          </mu-list-item>
          <mu-divider :inset="true"></mu-divider>
        </div>
      </mu-list>
    </mu-flex>

    <!-- 点击歌曲后面的三个点，底部弹出的更多操作 -->
    <mu-bottom-sheet :open.sync="is_more_opearte">
    <mu-list @item-click="is_more_opearte = false">
      <mu-sub-header v-if="cur_song_info">歌曲: {{cur_song_info.name}}{{cur_song_info.alia.length?`(${cur_song_info.alia})`:''}}</mu-sub-header>
      <mu-list-item button>
        <mu-list-item-action>
          <mu-icon value="chat" color="green"></mu-icon>
        </mu-list-item-action>
        <mu-list-item-title>下一首播放</mu-list-item-title>
      </mu-list-item>
      <mu-list-item button>
        <mu-list-item-action>
          <mu-icon value="grade" color="orange"></mu-icon>
        </mu-list-item-action>
        <mu-list-item-title>收藏</mu-list-item-title>
      </mu-list-item>
      <mu-list-item button>
        <mu-list-item-action>
          <mu-icon value="inbox" color="blue"></mu-icon>
        </mu-list-item-action>
        <mu-list-item-title>分享</mu-list-item-title>
      </mu-list-item>
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
export default {
  name: 'page-song-list',
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // 获取歌曲列表数据
      if (vm.cur_list_id == vm.g_page_home.id) return;
      vm.cur_list_id = vm.g_page_home.id;
      vm.getSongList(vm.g_page_home.id || 2190625773).then(res => {
        vm.local_song_list = res.playlist.tracks;
      }).catch(res => {
        vm.$alert(res, '');
      });
    })
  },
  data() {
    return {
      local_song_list: '', // 所有歌曲
      is_more_opearte: false, // 歌曲更多操作面板的显示与否
      cur_song_info: '', // 当前点击的歌曲信息
      cur_list_id: '', // 当前歌曲列表的id
    }
  },
  computed: {
    ...mapState([
      'NODE_DOMAIN',
      'play_info',
      'song_list',
      'loop_mode',
      'prevWatch',
      'nextWatch',
      'playWatch',
      'pauseWatch',
      'g_page_home'
    ])
  },
  methods: {
    ...mapMutations([
      'play',
      'updatePlayInfo',
      'insertSong',
      'updatePageHome',
      'setSongList'
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
    // 返回上一页
    back() {
      this.$router.go(-1);
    },
    // 播放 已经加载出来的 所有歌曲
    playAll() {
      // this.player.pause();
      this.setSongList(JSON.parse(JSON.stringify(this.local_song_list)));
      let song_id = this.local_song_list[0].id;
      this.player.specifyPlay(song_id);
    },
    // 展开歌曲更多操作面板
    moreOperate(clk_song) {
      this.cur_song_info = clk_song;
      this.is_more_opearte = true;
    },
    // 点击歌曲后，开始播放歌曲
    startPlay(id) {
      this.player.clkSong(id);
    },
    // 获取歌曲列表数据
    getSongList(id) {
      return new Promise((resolve, reject) => {
        axios({
          url: `${this.NODE_DOMAIN}/playlist/detail?id=${id}`
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
  },
  created() {
    // // 获取歌曲列表数据
    // this.getSongList(this.g_page_home.id || 2190625773).then(res => {
    //   this.local_song_list = res.playlist.tracks;
    // }).catch(res => {
    //   this.$alert(res, '');
    // });

  }
}
</script>

<style lang="scss">
@mixin divider {
    height: 1px;
    border: none;
    background-color: rgba(0,0,0,.12);
    width: 100%;
}

.page-song-list {
    .mu-appbar {
        background: linear-gradient(135deg, #ab47bc, #f8bbd0);
    }

    .mu-item-action {
        justify-content: center !important;
        align-items: center !important;
    }

    .mu-list {
        li {
            .mu-divider {
                position: absolute;
                bottom: 0;
                margin: 6px 0 12px;
            }
        }

        .mu-item-wrapper {
            margin: 8px 0;
        }
    }
}
</style>
