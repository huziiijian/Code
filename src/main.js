// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css' // Ensure you are using css-loader
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App'
import router from './router'
import VueResource from 'vue-resource';
import store from './store'
// import uploader from 'vue-simple-uploader'

Vue.use(Vuex)
Vue.use(Vuetify)
Vue.use(ElementUI);
Vue.use(VueResource)
// Vue.use(uploader)

Vue.config.productionTip = false


  window.getData = (that, url,callback = undefined) => {

    that.$http.get(url).then(response => {
    // get body data
      if(response.data.code != 0) {
        // this.notify(response.data.error);
        console.log(response.data.error);
        return;
      }
      let data = response.data.data;
      if(callback) {
        callback(data);
      }

    }, error=> {
      // error callback
      console.log(error)
    });
  },

  window.postData = (that, url, data, callback = undefined) => {
    that.$http.post(url, data).then(response => {
      if(response.data.code != 0) {
        // this.notify(response.data.error);
        console.log(response.data.error);
        return;
      }
      let data = response.data.data;
      if(callback) {
        callback(data);
      }
    }, error => {
      // this.notify(error);
      console.log(error);
    });
  },

// const myInformation = this.myInfo();
/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>',
  data(){
    return {

    }
  },
  created(){

  },
  methods:{


  }
})
