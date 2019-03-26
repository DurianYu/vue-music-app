<template lang="html">
  <div class="page-search" ref="page-search">
    <!-- 搜索的盒子 -->
    <mu-row class="search-bar-box">
      <mu-col>
        <mu-text-field
        class="search-bar"
        color="purple700"
        v-model="keywords"
        :full-width="true"
        :solo="true"
        max-length="33"
        @keydown="enter"
        @input="suggest"
        >
          <span slot="prepend">
            <mu-icon class="search" value="search"></mu-icon>
          </span>
          <span slot="append" v-show="keywords" @click="off">
            <mu-icon class="off" value="highlight_off"></mu-icon>
          </span>
        </mu-text-field>
      </mu-col>
    </mu-row>

    <!-- 搜索的结果和搜索的建议 -->
    <mu-container class="h-100">
      <!-- 默认面板 -->
      <div v-show="panel === 1" class="default-box">
        <h4 class="yu-sub-title">热门搜索</h4>
        <mu-row>
          <mu-col span="12" v-for="v,i of hot_data" :key="i" style="margin: 0 0 1rem 0;">
            <mu-badge  :content="`${i+1}`" color="pinkA200"></mu-badge>
            <span @click="search(v.first)">{{v.first}}</span>
          </mu-col>
        </mu-row>

        <h4 class="yu-sub-title" v-if="history_data.length" style="margin: 1.5rem 0 0.53rem 0; position: relative;">
          历史搜索
          <mu-icon @click="cleanHistory" class="off yu-sub-title" value="delete_forever" style="position: absolute; right: 16px;"></mu-icon>
        </h4>
        <mu-chip @click="search(v)" v-for="v,i of history_data" :key="i" class="demo-chip" style="margin: .5rem .3rem 0 0;">
          {{v}}
        </mu-chip>
      </div>

      <!-- 建议模板 -->
      <mu-list v-show="panel === 2" class="suggest-box">
        <div @click="search(v.keyword)" v-for="v,i of suggest_keywords" :key="i">
          <mu-list-item>
            <mu-list-item-title>{{v.keyword}}</mu-list-item-title>
          </mu-list-item>
          <mu-divider :shallow-inset="true" />
        </div>
      </mu-list>

      <!-- 搜索结果面板 -->
      <div v-show="panel === 3" class="result-box">
        <mu-load-more :loading="loading" @load="loadMore" :loaded-all="loaded_all">
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
                <!-- <span class="yu-sub-title">(共{{local_song_list.length}}首)</span> -->
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
                          {{v.alias.length?`(${v.alias})`:''}}
                        </span>
                      </mu-list-item-title>
                      <mu-list-item-sub-title>{{v.artists[0].name}} - {{v.album.name}}</mu-list-item-sub-title>
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
          <mu-sub-header v-if="cur_song_info">歌曲: {{cur_song_info.name}}{{cur_song_info.alias.length?`(${cur_song_info.alia})`:''}}</mu-sub-header>
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


    </mu-load-more>
      </div>
    </mu-container>

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
      console.log(vm.scrollTop);
      document.querySelector('.page-search').scrollTop = vm.scrollTop;
    })
  },
  beforeRouteLeave(to, from, next) {
    this.scrollTop = document.querySelector('.page-search').scrollTop;
    next()
  },
  components: {
    // searchBar: () =>
    //   import('@/components/search-navbar')
  },
  data() {
    return {
      keywords: '', // 搜索的关键词
      suggest_keywords: [], // 搜索建议的关键词
      panel: 1, // 1默认面板 2建议面板 3搜索结果面板
      local_song_list: [], // 所有歌曲
      is_more_opearte: false, // 歌曲更多操作面板的显示与否
      cur_song_info: '', // 当前点击的歌曲信息
      loading: false, // 加载更多时 是否显示加载的动画
      loaded_all: false, // 加载更多时 是否全部加载完成
      scrollTop: '', // 页面滚动的位置
      hot_data: [], // 热门搜索的数据
      history_data: [], // 搜索过的历史记录
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
  watch: {
    keywords: function(newVal, oldVal) {
      if (!newVal) this.panel = 1;
    }
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
    // 播放 已经加载显示的 全部歌曲
    playAll() {
      this.player.pause();
      this.setSongList(JSON.parse(JSON.stringify(this.local_song_list)));
      let song_id = this.local_song_list[0].id;
      this.player.specifyPlay(song_id);
    },
    // 清除搜搜的历史记录
    cleanHistory() {
      this.$confirm('确定要清除全部历史记录吗', '').then(res => {
        if (res.result) this.history_data = [];
      });
    },
    // 添加搜索的历史记录
    addHistory(val) {
      let is_contain = this.history_data.indexOf(val);
      if (is_contain !== -1) return;
      this.history_data.unshift(val);
      if (this.history_data.length > 8) {
        this.history_data.pop();
      }
    },
    // 加载更多的歌曲
    loadMore() {
      if (this.panel !== 3) return;
      this.loading = true;
      let offset = this.local_song_list.length;
      this.getResult(this.keywords, offset).then(res => {
        this.loading = false;
        this.local_song_list.push(...res.result.songs);
        if (this.local_song_list.length >= res.result.songCount) this.loaded_all = true;
      }).catch(res => {
        this.$alert(res, '');
      });
    },
    // 获取搜索的结果
    getResult(keywords, offset) {
      return new Promise((resolve, reject) => {
        offset = offset ? offset : '';
        axios({
          url: `${this.NODE_DOMAIN}/search?keywords=${keywords}&limit=10&offset=${offset}`
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
    // 获取搜索建议
    getSuggest(keywords) {
      return new Promise((resolve, reject) => {
        axios({
          url: `${this.NODE_DOMAIN}/search/suggest?keywords=${keywords}&type=mobile`
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
    // 搜索建议
    suggest(val) {
      if (!val) return;
      this.getSuggest(val).then(res => {
        this.suggest_keywords = res.result.allMatch;
        this.panel = 2;
      });
    },
    // 按下enter按键
    enter(e) {
      if (e.keyCode === 13) {
        this.search(this.keywords, 1);
      };
    },
    // 搜索
    search(val) {
      this.keywords = val;
      this.getResult(val).then(res => {
        this.local_song_list = res.result.songs;
        this.panel = 3;
        this.addHistory(val);
      });
    },
    // 清空搜索输入
    off() {
      this.keywords = '';
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
    },
    // 获取热搜
    getHot() {
      return new Promise((resolve, reject) => {
        axios({
          url: `${this.NODE_DOMAIN}/search/hot`
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
    // 获取歌曲列表数据
    this.getHot().then(res => {
      this.hot_data = res.result.hots.slice(0, 6);
    }).catch(res => {
      this.$alert(res, '');
    });

  },
  mounted() {
    // console.log(this.$refs['page-search']);
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
.page-search {
    .search-bar-box {
        margin: 1rem 0 0;
        padding: 0 1rem 0.5rem;
        background: #fff;

        > div {
            background-color: #f4f4f4;
            border-radius: 0.5rem;
        }

        .mu-text-field {
            .off,
            .search {
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .search {
                padding: 0 0.8rem;
            }

            .off {
                padding: 0 0.8rem 0 3.6rem;
                color: rgba(0,0,0,.54) !important;
            }

            .mu-input-help {
                display: none;
            }
        }
    }

    // 歌曲列表部分

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
