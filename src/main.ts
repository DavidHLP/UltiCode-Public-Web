import {createApp} from 'vue'
import {createPinia} from 'pinia'

import App from './App.vue'
import router from './router'
import {setupRouterGuards} from './router/guards'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
setupRouterGuards(router, pinia)
app.use(router)

app.mount('#app')
