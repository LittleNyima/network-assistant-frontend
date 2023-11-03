import Vue from 'vue'
import App from './App'
import Vuex from 'vuex';

Vue.use(Vuex);
Vue.config.productionTip = false

App.mpType = 'app'
const store = new Vuex.Store();
const app = new Vue({
	store,
	...App
})
app.$mount()
