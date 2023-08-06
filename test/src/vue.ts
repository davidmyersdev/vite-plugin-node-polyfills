import { createApp } from 'vue'
import App from './app.vue'

export const vue = () => {
  const app = createApp(App)

  app.mount('#vue-app')
}
