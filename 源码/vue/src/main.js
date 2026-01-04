import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import '../src/assets/init.css'
import '../src/assets/fonts/fonts.css'
import { getImageUrl, getImageUrls } from './utils/imageUrl'
Vue.use(ElementUI);
Vue.config.productionTip = false;

Vue.prototype.HOST = "/api"
// 添加图片URL处理工具到原型中，使所有组件都能使用
Vue.prototype.$getImageUrl = getImageUrl
Vue.prototype.$getImageUrls = getImageUrls

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount("#app");
