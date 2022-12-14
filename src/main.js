import Vue from 'vue'
import App from './App.vue'
import './utils/rem'

Vue.config.productionTip = false
Vue.config.ignoredElements = ['wx-open-launch-app'];
new Vue({
    render: h => h(App),
}).$mount('#app')