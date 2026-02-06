import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useDark } from '@vueuse/core'
import './index.css'

import App from './App.vue'
import router from './router'

// Initialize dark mode based on system preference
useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: 'light',
})

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
