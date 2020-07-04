import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor'

//导入Nprogress loading条
import Nprogress  from 'nprogress'
import 'nprogress/nprogress.css'

//导入vue-quill-editor富文本样式
import 'quill/dist/quill.core.css';
import 'quill/dist/quill.snow.css';
import 'quill/dist/quill.bubble.css';

//导入全局样式
import './assets/css/global.css'


axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//请求拦截
axios.interceptors.request.use(config =>{
  Nprogress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
//响应拦截器
axios.interceptors.response.use(config=>{
  Nprogress.done()
  return config
})

Vue.prototype.$http = axios

Vue.component('tree-table',TreeTable)

Vue.filter('dateFormat',function(value){
  const dt = new Date(value);
  const y = dt.getFullYear();
  const m = (dt.getMonth()+1 + '').padStart(2,'0');
  const d = (dt.getDate() + '').padStart(2,'0');

  const hh = (dt.getHours() + '').padStart(2,'0');
  const mm = (dt.getMinutes() + '').padStart(2,'0');
  const ss = (dt.getSeconds() + '').padStart(2,'0');

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

Vue.use(ElementUI);

Vue.use(VueQuillEditor)


Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
