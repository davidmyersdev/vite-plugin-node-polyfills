import { createApp } from 'vue'
import App from './app.vue'

export const app = () => {
  const app = createApp(App)

  app.mount('#vue-app')
}
