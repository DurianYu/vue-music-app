// 入口文件
import Vue from 'vue';
// 引入路由
import router from './router/index.js';
// 导入vuex的管理仓库
import store from '@/store/index.js';

// import Vconsole from 'vconsole'

import MuseUI from 'muse-ui';
import 'muse-ui/dist/muse-ui.css';
import 'muse-ui-message/dist/muse-ui-message.css';
import Message from 'muse-ui-message';
import Toast from 'muse-ui-toast';
import {
  mapState
} from 'vuex';

// import theme from 'muse-ui/lib/theme';
// import * as colors from 'muse-ui/lib/theme/colors';

// theme.add('custom-theme', {
//   purples: colors.purple500
// });

import App from './App';

import '@/common/css/global.scss';
import '@/common/css/default-theme.scss';

Vue.prototype.mapState = mapState;
Vue.config.productionTip = false;
Vue.use(MuseUI);
Vue.use(Message);
Vue.use(Toast);

// const vConsole = new VConsole();

router.beforeEach((to, from, next) => {
  console.log('to', to);
  console.log('from', from);
  next(() => {
  });
});

router.afterEach((to, from) => {

});

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: {
    App
  },
  template: '<App/>'
});
