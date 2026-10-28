import { createApp } from 'vue'
import App from './App.vue'
import { installMotion } from './plugins/motion'
import './style.css'

const app = createApp(App)
installMotion(app)
app.mount('#app')
