<template lang="html">
  <div class="page-home">

    <!-- 轮播图模块 -->
    <mu-flex class="rcmd-song-sheet-box" justify-content="center">
      <mu-container style="margin: 2rem 0 3.5rem 0;">
            <mu-carousel transition="fade" hide-controls class="rcmd-song-sheet-carousel">
              <mu-carousel-item  v-for="v,i of banners" :key="i">
                  <mu-row class="h-100" @click="toSongListPage(v.id)">
                    <mu-col class="h-100 banner-box">
                      <img class="h-100 w-100" :src="v.coverImgUrl">
                    </mu-col>
                    <mu-col class="h-100 w-100" style="color: #fff">
                      <mu-row class="name">
                        <span>{{v.name}}</span>
                      </mu-row>
                      <mu-row class="author" align-items="center">
                        <mu-col span="2">
                          <mu-icon value="person_outline" color="white"></mu-icon>
                        </mu-col>
                        <mu-col>
                          <span>
                            {{v.creator.nickname}}
                          </span>
                        </mu-col>
                      </mu-row>
                      <mu-row class="description" ref="description">
                        <span>{{v.description?v.description:'作者还在进行描述的思考..'}}</span>
                      </mu-row>
                    </mu-col>
                  </mu-row>
              </mu-carousel-item>
            </mu-carousel>
      </mu-container>
    </mu-flex>

    <!-- 标题分割 -->
    <mu-container style="margin: 1.6rem 0 1rem;">
      <mu-flex justify-content="center" style="color: #3e2723;">
        <h3 class="mg-0">精品歌单推荐</h3>
      </mu-flex>
    </mu-container>
    <!-- <mu-divider></mu-divider> -->

    <!-- 每一个歌单的面板 -->
    <mu-container>
      <mu-load-more :loading="loading" @load="loadMore" :loaded-all="loaded_all">
      <mu-flex class="quality-song-sheet-box">
        <mu-row class="quality-song-sheet w-100" wrap="wrap">


          <mu-col span="6" v-for="v,i of quality_song_sheet" :key="i">
            <mu-card @click="toSongListPage(v.id)">
              <mu-card-media>
                <mu-flex justify-content="center" aligin-items="center" class="play-count-box">
                  <mu-icon size="16"  value="headset" color="white"></mu-icon>
                  <span>
                    {{parseInt(v.playCount/10000)?parseInt(v.playCount/10000):v.playCount}}
                    {{parseInt(v.playCount/10000)?'万':'人'}}
                  </span>
                </mu-flex>

                <mu-flex justify-content="center" aligin-items="center" class="music-tag-box">
                  <mu-icon class="music_note" size="20"  value="music_note" color="white"></mu-icon>
                </mu-flex>

                <img :src="v.coverImgUrl" style="height: 10.7rem;">
              </mu-card-media>
               <mu-card-title :title="v.name" :sub-title="v.description"></mu-card-title>
            </mu-card>
          </mu-col>


        </mu-row>
      </mu-flex>
    </mu-load-more>
    </mu-container>

    <!-- 到底提示 -->
    <mu-flex style="padding: 16px 0;" justify-content="center" aligin-items="center" v-if="loaded_all">
      没有更多了...
    </mu-flex>


    <!-- <mu-button @click="player.clkSong(v.id)">{{ v.name }}</mu-button> -->
    <!-- <mu-button @click="player.pause()">暂停</mu-button> -->
    <!-- <mu-button @click="player.play()">播放</mu-button> -->



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
  name: 'home',
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (document.querySelector('.page-home')) document.querySelector('.page-home').scrollTop = vm.scrollTop;
    })
  },
  beforeRouteLeave(to, from, next) {
    this.scrollTop = document.querySelector('.page-home').scrollTop;
    next()
  },
  data() {
    return {
      banners: '', // 轮播图
      quality_song_sheet: '', // 精品推荐歌单
      loading: false, // 加载更多时 是否显示加载的动画
      loaded_all: false, // 加载更多时 是否全部加载完成
      scrollTop: '', // 页面滚动的位置

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
      'updatePageHome'
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
    // 点击歌单时
    toSongListPage(id) {
      this.updatePageHome(this.deepCopy({
        id
      }));
      this.$router.push({
        name: 'song-list'
      });
    },
    // 深度拷贝
    deepCopy(data) {
      return JSON.parse(JSON.stringify(data));
    },
    // 更新全局仓库下该页面的数据
    updateStore() {
      let temp_obj = {
        quality_song_sheet: this.quality_song_sheet,
        loading: this.loading,
        loaded_all: this.loaded_all,
        banners: this.banners
      }
      this.updatePageHome(this.deepCopy(temp_obj));
    },
    // 加载更多的精品歌单
    loadMore() {
      this.loading = true;
      let last_update_time = this.quality_song_sheet.slice(-1)[0].updateTime;
      this.getQualitySongSheet(last_update_time).then(res => {
        this.loading = false;
        this.quality_song_sheet.push(...res.playlists);
        if (this.quality_song_sheet.length > 50) this.loaded_all = true;
      }).catch(res => {
        this.$alert(res, '');
      });
    },
    // 获取轮播图片
    getBanner() {
      axios({
        url: `${this.NODE_DOMAIN}/top/playlist?limit=6&order=new`
      }).then(res => {
        res = res.data;
        this.banners = res.playlists;
      }).catch(error => console.log(error));
    },
    //获取精品歌单
    getQualitySongSheet(last_update_time) {
      return new Promise((resolve, reject) => {
        axios({
          url: `${this.NODE_DOMAIN}/top/playlist/highquality?before=${last_update_time}&limit=6`
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
    // 获取轮播数据
    this.getBanner();
    //获取推荐歌单
    this.getQualitySongSheet(1548000431843).then(res => {
      console.log('重复获取？');
      this.quality_song_sheet = res.playlists;
    });


  },
  mounted() {
    this.$nextTick(() => {
      console.log('$router', this.$router);

    })

  }
}
</script>

<style lang="scss">
$title-color: #3e2723;

@mixin line-ellipsis($line-num) {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -moz-webkit-box-orient: vertical;
    -ms-webkit-box-orient: vertical;
    -o-webkit-box-orient: vertical;
    -webkit-line-clamp: $line-num;
    -moz-webkit-line-clamp: $line-num;
    -ms-webkit-line-clamp: $line-num;
    -o-webkit-line-clamp: $line-num;
}

@mixin one-line() {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-home {
    .container {
        padding: 0 16px;
    }

    .mu-carousel-indicator-button {
        margin: 0 2px;
    }

    .rcmd-song-sheet-box {
        background: linear-gradient(135deg, #9C27B0, #FF4081);
    }

    .rcmd-song-sheet-carousel {
        overflow: unset;
        height: 10rem;

        .banner-box {
            box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.3), 0 1px 10px 0 rgba(0,0,0,.12);
            margin: 0 16px 0 0;
        }

        .name {
            span {
                font-size: 1.1rem;
                @include line-ellipsis(2);
            }
        }

        .author {
            // margin: 0.857rem 0 0;
            span {
                @include one-line();
            }
        }

        .description {
            width: 100%;
            height: 50%;
            bottom: 0;
            padding: 13px 8px;
            position: absolute;
            white-space: pre-wrap;
            background: rgba(0, 0, 0, 0.12);
            overflow: hidden;
            span {
                @include line-ellipsis(2);
            }
            @media screen and (max-width: 350px) {
                span {
                    @include line-ellipsis(2);
                }
            }
        }

        .mu-carousel-indicators {
            bottom: -3.4rem;
            // left: 13rem;
        }
    }

    .quality-song-sheet-box {
        .mu-card-title {
            font-size: 1.3rem;
            color: $title-color;
            @include one-line();
        }

        .mu-card-sub-title {
            @include one-line();
        }

        .quality-song-sheet {
            > div:nth-of-type(2n + 1) {
                padding: 0 8px 16px 0;
            }
            > div:nth-of-type(2n) {
                padding: 0 0 16px 8px;
            }

            .mu-card-media {
                .play-count-box {
                    right: 1rem;
                    top: 1rem;
                    padding: 4px 3px 2px;
                    position: absolute;
                    border-radius: 5px 0 5px 0;
                    color: #fff;
                    background: rgba(0, 0, 0, 0.49);

                    span {
                        margin: 0 3px 0 0;
                        font-size: 12px;
                    }
                }

                .music-tag-box {
                    right: 1rem;
                    bottom: -15px;
                    padding: 5px;
                    position: absolute;
                    border-radius: 50px;
                    color: #fff;
                    background: linear-gradient(135deg, #9C27B0, #FF4081);
                    box-shadow: 0 3px 5px -1px rgba(0,0,0,.2), 0 5px 8px 0 rgba(0,0,0,.14), 0 1px 14px 0 rgba(0,0,0,.12);
                    .music_note {}
                }
            }
        }
    }

}
</style>
